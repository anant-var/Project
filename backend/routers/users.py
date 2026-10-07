from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
import schemas
from auth import get_current_user, require_admin
from database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=schemas.UserPaginatedOut)
def list_users(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Admin only: list all users."""
    query = db.query(models.User)
    
    if search:
        query = query.filter(
            or_(
                models.User.username.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%")
            )
        )
        
    total_users = query.count()
    users = query.offset(skip).limit(limit).all()
    
    total_pages = (total_users + limit - 1) // limit
    current_page = (skip // limit) + 1
    
    return {
        "items": users,
        "total": total_users,
        "page": current_page,
        "pages": total_pages
    }


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Admins can view any user; regular users can only view themselves."""
    if current_user.role != models.RoleEnum.admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    update_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Admin only: update a user's details (username, email, role, is_active)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_dict = update_data.model_dump(exclude_unset=True)

    # Check uniqueness if email/username is being changed
    if "email" in update_dict:
        existing = db.query(models.User).filter(
            models.User.email == update_dict["email"],
            models.User.id != user_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    if "username" in update_dict:
        existing = db.query(models.User).filter(
            models.User.username == update_dict["username"],
            models.User.id != user_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")

    for field, value in update_dict.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin only: delete a user."""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
