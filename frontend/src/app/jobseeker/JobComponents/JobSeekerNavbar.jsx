'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Briefcase, Home, Building2, FileText } from 'lucide-react';

export default function JobSeekerNavbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('email');
    if (userData) {
      try {
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setActivePath(window.location.pathname);
  }, []);

  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    
    // Clear all cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Redirect to home
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { 
      href: '/jobseeker/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Overview & Analytics'
    },
    // { 
    //   href: '/jobseeker/company', 
    //   label: 'Company', 
    //   icon: Building2,
    //   description: 'Company Profile'
    // },
    { 
      href: '/jobseeker/jobs', 
      label: 'Jobs', 
      icon: FileText,
      description: 'Manage Job Postings'
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-lg font-bold text-gray-900">TalentBridge</span>
              <span className="text-xs text-gray-500 ml-1">JobSeeker</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium text-sm">{link.label}</span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-px left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user}</p>
                    <p className="text-xs text-gray-500">JobSeeker</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <span className="font-medium text-sm">{link.label}</span>
                    <p className="text-xs text-gray-500">{link.description}</p>
                  </div>
                </Link>
              );
            })}
            
            {user && (
              <div className="pt-3 border-t border-gray-200">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user}</p>
                      <p className="text-xs text-gray-500">JobSeeker Account</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}