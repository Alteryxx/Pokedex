import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Users, Swords, ClipboardList, Menu, X, Star } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-400';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">PokéDex</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className={`inline-flex items-center px-1 pt-1 ${isActive('/')}`}>
              <Zap className="h-5 w-5 mr-1" />
              <span>Browse</span>
            </Link>
            <Link to="/team" className={`inline-flex items-center px-1 pt-1 ${isActive('/team')}`}>
              <Users className="h-5 w-5 mr-1" />
              <span>My Team</span>
            </Link>
            <Link to="/battle" className={`inline-flex items-center px-1 pt-1 ${isActive('/battle')}`}>
              <Swords className="h-5 w-5 mr-1" />
              <span>Battle</span>
            </Link>
            <Link to="/history" className={`inline-flex items-center px-1 pt-1 ${isActive('/history')}`}>
              <ClipboardList className="h-5 w-5 mr-1" />
              <span>History</span>
            </Link>
            <Link to="/favorites" className={`inline-flex items-center px-1 pt-1 ${isActive('/favorites')}`}>
              <Star className="h-5 w-5 mr-1" />
              <span>Favorites</span>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-gray-500 hover:text-blue-500 focus:outline-none">
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md ${location.pathname === '/' ? 'bg-blue-50 text-blue-500' : 'text-gray-500'}`}
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                <span>Browse</span>
              </div>
            </Link>
            <Link 
              to="/team" 
              className={`block px-3 py-2 rounded-md ${location.pathname === '/team' ? 'bg-blue-50 text-blue-500' : 'text-gray-500'}`}
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>My Team</span>
              </div>
            </Link>
            <Link 
              to="/battle" 
              className={`block px-3 py-2 rounded-md ${location.pathname === '/battle' ? 'bg-blue-50 text-blue-500' : 'text-gray-500'}`}
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Swords className="h-5 w-5 mr-2" />
                <span>Battle</span>
              </div>
            </Link>
            <Link 
              to="/history" 
              className={`block px-3 py-2 rounded-md ${location.pathname === '/history' ? 'bg-blue-50 text-blue-500' : 'text-gray-500'}`}
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 mr-2" />
                <span>History</span>
              </div>
            </Link>
            <Link 
              to="/favorites" 
              className={`block px-3 py-2 rounded-md ${location.pathname === '/favorites' ? 'bg-blue-50 text-blue-500' : 'text-gray-500'}`}
              onClick={toggleMenu}
            >
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                <span>Favorites</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
