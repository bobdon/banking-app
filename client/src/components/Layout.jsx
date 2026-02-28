import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/dashboard">
                <Logo size="sm" />
              </Link>
              <div className="hidden sm:flex gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/belev" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                    <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#ng)" />
                    <path d="M14 34L36 13L24 22L14 34Z" fill="white" />
                    <path d="M24 22L36 13L16.5 25.5L24 22Z" fill="rgba(255,255,255,0.85)" />
                    <path d="M14 34L16.5 25.5L24 22L14 34Z" fill="rgba(255,255,255,0.5)" />
                    <path d="M24 22L27 30L36 13L24 22Z" fill="rgba(255,255,255,0.65)" />
                    <defs><linearGradient id="ng" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#ec4899"/></linearGradient></defs>
                  </svg>
                  BeLev
                </Link>
                <Link to="/transfer" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Transfer
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
