import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, Users, MessageCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout();
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Logo />

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <NavLink to="/" active={isActive('/')} onClick={closeMenu}>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat
                </NavLink>
                <NavLink to="/friends" active={isActive('/friends')} onClick={closeMenu}>
                  <Users className="w-5 h-5 mr-2" />
                  Friends
                </NavLink>
                <NavLink to="/profile" active={isActive('/profile')} onClick={closeMenu}>
                  <UserCircle className="w-5 h-5 mr-2" />
                  Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              {user && (
                <>
                  <NavLink to="/" active={isActive('/')} onClick={closeMenu}>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat
                  </NavLink>
                  <NavLink to="/friends" active={isActive('/friends')} onClick={closeMenu}>
                    <Users className="w-5 h-5 mr-2" />
                    Friends
                  </NavLink>
                  <NavLink to="/profile" active={isActive('/profile')} onClick={closeMenu}>
                    <UserCircle className="w-5 h-5 mr-2" />
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center ${
        active
          ? 'text-purple-400 font-medium'
          : 'text-gray-300 hover:text-white'
      } transition-colors`}
    >
      {children}
    </Link>
  );
};

export default Header;