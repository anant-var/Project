import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const USER_STATS = [
  { label: "Tasks Completed", value: "24", color: "bg-green-100 text-green-700" },
  { label: "In Progress", value: "5", color: "bg-yellow-100 text-yellow-700" },
  { label: "Pending", value: "3", color: "bg-red-100 text-red-700" },
];

const ADMIN_STATS = [
  { label: "Total Users", value: "128", color: "bg-indigo-100 text-indigo-700" },
  { label: "Active Sessions", value: "42", color: "bg-green-100 text-green-700" },
  { label: "Pending Reviews", value: "7", color: "bg-yellow-100 text-yellow-700" },
  { label: "System Health", value: "99%", color: "bg-teal-100 text-teal-700" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const stats = isAdmin ? ADMIN_STATS : USER_STATS;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="font-semibold text-gray-800">{user?.username}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isAdmin
                ? "bg-indigo-100 text-indigo-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {user?.role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin/users")}
              className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg transition"
            >
              Manage Users
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "🛡️ Admin Dashboard" : "👋 My Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "You have full administrative access to the system."
              : "Welcome back! Here's a quick overview of your activity."}
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid gap-4 ${isAdmin ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${s.color}`}>
                Live
              </span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            {["Logged in", "Viewed dashboard", isAdmin ? "Reviewed user list" : "Updated profile"].map(
              (item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  {item}
                  <span className="ml-auto text-xs text-gray-400">just now</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
