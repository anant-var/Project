import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  is_active: boolean;
}

interface EditState {
  username: string;
  email: string;
  role: "admin" | "user";
  is_active: boolean;
}

interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  pages: number;
}

export default function AdminUserEdit() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({
    username: "",
    email: "",
    role: "user",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      const skip = (page - 1) * limit;
      let url = `/users/?skip=${skip}&limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await api.get<PaginatedUsers>(url);
      setUsers(res.data.items);
      setTotalPages(res.data.pages);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditState({
      username: u.username,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
    });
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/users/${editingId}`, editState);
      setSuccess("User updated successfully!");
      setEditingId(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${userId}`);
      setSuccess("User deleted.");
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          ← Dashboard
        </button>
        <h1 className="text-xl font-bold text-gray-800">User Management</h1>
        <span className="ml-auto text-sm text-gray-400">
          Logged in as: <span className="font-medium text-indigo-600">{currentUser?.username}</span>
        </span>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search by username or email..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading users…</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">ID</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Username</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Email</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Role</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    {editingId === u.id ? (
                      <>
                        <td className="px-5 py-3 text-gray-400">{u.id}</td>
                        <td className="px-5 py-3">
                          <input
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            value={editState.username}
                            onChange={(e) =>
                              setEditState((s) => ({ ...s, username: e.target.value }))
                            }
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            value={editState.email}
                            onChange={(e) =>
                              setEditState((s) => ({ ...s, email: e.target.value }))
                            }
                          />
                        </td>
                        <td className="px-5 py-3">
                          <select
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            value={editState.role}
                            onChange={(e) =>
                              setEditState((s) => ({
                                ...s,
                                role: e.target.value as "admin" | "user",
                              }))
                            }
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={editState.is_active}
                            onChange={(e) =>
                              setEditState((s) => ({ ...s, is_active: e.target.checked }))
                            }
                            className="accent-indigo-600 w-4 h-4"
                          />
                        </td>
                        <td className="px-5 py-3 flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded transition disabled:opacity-60"
                          >
                            {saving ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-200 rounded transition"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-gray-400">{u.id}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{u.username}</td>
                        <td className="px-5 py-3 text-gray-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              u.role === "admin"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              u.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3 flex gap-2">
                          <button
                            onClick={() => startEdit(u)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {currentUser?.id !== u.id && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex justify-between flex-1 sm:hidden">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
