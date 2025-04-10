import React from 'react';
import { Menu, X, Sun, Moon, ShoppingBag, Settings } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import CartButton from './cart/CartButton';
import useAuth from '../hooks/useAuth';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/#products' },
  { label: 'About', href: '/#about' },
  { label: 'Events', href: '/#events' }
];

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    darkMode, 
    isMenuOpen,
    setDarkMode, 
    openAuthModal,
    toggleMenu,
    closeMenu,
  } = useStore();
  const { logout } = useAuth();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (!href) return;
    
    if (href === '/') {
      navigate('/');
    } else if (location.pathname !== '/') {
      navigate('/', { replace: true });
      setTimeout(() => {
        const element = document.querySelector(href.replace('/', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.querySelector(href.replace('/', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeMenu();
  };

  const handleAuthClick = async () => {
    if (user) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      openAuthModal('signin');
    }
    closeMenu();
  };

  const handleCockpitClick = () => {
    if (user) {
      navigate('/cockpit');
    } else {
      openAuthModal('signin');
    }
    closeMenu();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  };

  return (
    <nav className="fixed w-full z-50">
      <div className="glass px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <a 
            href="/"
            onClick={handleLogoClick}
            className="flex items-center space-x-2"
          >
            <img 
              src="/logo.png" 
              alt="Midtown Skyclub" 
              className="h-8"
            />
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={handleNavClick}
                className="text-white/80 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-white/10"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <CartButton />

            {user && (
              <button
                onClick={handleCockpitClick}
                className={`text-white/80 hover:text-white transition-colors ${
                  location.pathname === '/cockpit' ? 'text-purple-400' : ''
                }`}
              >
                Cockpit
              </button>
            )}

            {user && location.pathname === '/cockpit' && (
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={handleAuthClick}
              className="button-primary"
            >
              {user ? 'Sign Out' : 'Sign In'}
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <CartButton />
            <button
              className="text-white"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/95 md:hidden pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col space-y-6">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={handleNavClick}
                  className="text-2xl text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
              
              {user && (
                <button
                  onClick={handleCockpitClick}
                  className={`text-2xl text-left text-white/80 hover:text-white transition-colors ${
                    location.pathname === '/cockpit' ? 'text-purple-400' : ''
                  }`}
                >
                  Cockpit
                </button>
              )}

              <button 
                onClick={handleAuthClick}
                className="button-primary mt-4"
              >
                {user ? 'Sign Out' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;