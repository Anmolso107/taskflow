import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, LogOut, CheckSquare, Sun, Moon, FolderKanban, ClipboardList } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare size={22} className="text-brand-600" />
              <h1 className="text-xl font-bold text-brand-600">TaskFlow</h1>
            </div>
            <button onClick={toggle}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">Welcome, {user?.name}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider px-3 mb-2">
            Main
          </p>

          <NavLink to="/" end className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink to="/projects" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            <FolderKanban size={18} /> Projects
          </NavLink>

          <NavLink to="/my-tasks" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            <ClipboardList size={18} /> My Tasks
          </NavLink>
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 text-sm font-bold flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
        <Outlet />
      </main>
    </div>
  );
}