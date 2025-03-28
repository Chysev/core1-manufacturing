import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, ChevronRight, CalendarIcon as CalendarSync, PackageSearch, ListOrdered, ReceiptText, TrendingUpIcon as TrendingUpDown, CircleUser, LogOut, Bell, Search, Home } from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import axios from 'axios';
import useToken from '../../lib/useToken';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [user, setUser]: any = useState({})
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = async () => {
      const response = await useToken()
      setUser(response)
    }
    userData()
  }, [])

  console.log(user)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen && !(event.target as Element).closest('.user-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
      if (isNotificationsOpen && !(event.target as Element).closest('.notifications-container')) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, isNotificationsOpen]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const toggleDesktopSidebar = () => setIsDesktopCollapsed((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    try {
      await axios.get('https://backend-core1.jjm-manufacturing.com/auth/logout');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      name: 'Demand Forecasting',
      path: '/dashboard/demandforecast',
      icon: TrendingUpDown,
    },
    {
      name: 'Production Schedule',
      path: '/dashboard/production',
      icon: CalendarSync,
    },
    {
      name: 'Products',
      path: '/dashboard/products',
      icon: PackageSearch,
    },
    {
      name: 'Work Orders',
      path: '/dashboard/workorders',
      icon: ListOrdered,
    },
    {
      name: 'Billing',
      path: '/dashboard/billing',
      icon: ReceiptText,
    },
    {
      name: 'Accounts',
      path: '/dashboard/account',
      icon: CircleUser,
    },
  ];


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-50">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none lg:hidden transition-colors"
              aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
            <div className="flex items-center space-x-3">
              <img className="h-10 w-10 rounded-md" src="/Logo.jpg" alt="Logo" />
              <h1 className="text-xl font-bold text-gray-800 hidden sm:block">JJM Manufacturing</h1>
            </div>
          </div>


          <div className="flex items-center space-x-2">
            <div className="relative user-dropdown-container">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg focus:outline-none transition-colors"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  JD
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">{user.name}</span>
                <ChevronRight className={`h-4 w-4 text-gray-500 hidden md:block transition-transform ${isUserDropdownOpen ? 'rotate-90' : ''}`} />
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        <aside
          className={`
            hidden lg:flex flex-col fixed top-16 bottom-0
            transition-all duration-300 ease-in-out
            border-r border-gray-200 bg-white z-30
            ${isDesktopCollapsed ? 'w-20' : 'w-64'}
          `}
        >
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-3 space-y-1">
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                      transition-colors duration-200
                      ${active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${isDesktopCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span
                      className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                    >
                      {item.name}
                    </span>
                    {active && !isDesktopCollapsed && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-600"></span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>


        </aside>

        <aside
          className={`
            lg:hidden fixed inset-y-0 left-0 z-40
            transform transition-transform duration-300 ease-in-out
            w-72 bg-white border-r border-gray-200
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full pt-16">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="px-3 space-y-1">
                {navigationItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className={`
                        flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                        transition-colors duration-200
                        ${active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="ml-3">{item.name}</span>
                      {active && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`
            flex-1 overflow-auto transition-all duration-300 ease-in-out
            pt-6 pb-12
            lg:ml-64 ${isDesktopCollapsed ? 'lg:ml-20' : ''}
          `}
        >
          {children}
        </main>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
