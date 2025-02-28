import React, { useState } from 'react';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarSync,
  PackageSearch,
  ListOrdered,
  ReceiptText,
  TrendingUpDown,
  CircleUser,
  LogOut,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
  const toggleDesktopSidebar = () => setIsDesktopCollapsed((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    await axios.get('backend-core1.jjm-manufacturing.com/auth/logout');
    navigate({ to: '/auth/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-50">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none lg:hidden"
              aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <img className="h-12 w-12" src="/Logo.jpg" alt="Logo" />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
          </div>
          {/* User icon with dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen((prev) => !prev)}
              className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none"
              aria-label="User menu"
            >
              <CircleUser className="h-6 w-6" />
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        <aside
          className={`
            hidden lg:flex flex-col fixed top-16 bottom-0
            transition-all duration-300 ease-in-out
            border-r border-gray-200 bg-white
            ${isDesktopCollapsed ? 'w-20' : 'w-64'}
          `}
        >
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-2">
              <div className={`${isDesktopCollapsed ? 'hidden' : 'block'}`}>
                <h2 className="text-lg font-medium text-gray-900 mb-4"></h2>
              </div>

              <a
                href="/dashboard/production"
                className={`
                  flex items-center px-4 py-2 text-gray-700
                  hover:bg-gray-100 rounded-lg
                  ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
              >
                <TrendingUpDown className="h-5 w-5" />
                <span
                  className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                >
                  Demand Forecasting
                </span>
              </a>

              <a
                href="/dashboard/demandforecast"
                className={`
                  flex items-center px-4 py-2 text-gray-700
                  hover:bg-gray-100 rounded-lg
                  ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
              >
                <CalendarSync className="h-5 w-5" />
                <span
                  className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                >
                  Production Schedule
                </span>
              </a>

              <a
                href="/dashboard/products"
                className={`
                  flex items-center px-4 py-2 text-gray-700
                  hover:bg-gray-100 rounded-lg
                  ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
              >
                <PackageSearch className="h-5 w-5" />
                <span
                  className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                >
                  Products
                </span>
              </a>

              <a
                href="/dashboard/workorders"
                className={`
                  flex items-center px-4 py-2 text-gray-700
                  hover:bg-gray-100 rounded-lg
                  ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
              >
                <ListOrdered className="h-5 w-5" />
                <span
                  className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                >
                  Work Orders
                </span>
              </a>

              <a
                href="/dashboard/billing"
                className={`
                  flex items-center px-4 py-2 text-gray-700
                  hover:bg-gray-100 rounded-lg
                  ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
              >
                <ReceiptText className="h-5 w-5" />
                <span
                  className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                >
                  Billing
                </span>
              </a>

              <a
                href="/dashboard/account"
                className={`
                  flex items-center px-4 py-2 text-gray-700
                  hover:bg-gray-100 rounded-lg
                  ${isDesktopCollapsed ? 'justify-center' : ''}
                `}
              >
                <CircleUser className="h-5 w-5" />
                <span
                  className={`ml-3 ${isDesktopCollapsed ? 'hidden' : 'block'}`}
                >
                  Accounts
                </span>
              </a>
            </nav>
          </div>
          {/* Collapse button */}
          <button
            onClick={toggleDesktopSidebar}
            className="p-4 hover:bg-gray-100 flex items-center justify-center border-t"
          >
            {isDesktopCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={`
            lg:hidden fixed inset-y-0 left-0 z-40
            transform transition-transform duration-300 ease-in-out
            w-64 bg-white border-r border-gray-200
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full pt-16">
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Navigation
              </h2>
              <a
                href="#"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5 mr-3" />
                Home
              </a>
              {/* Add more nav items as needed */}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`
            flex-1 p-6 transition-all duration-300 ease-in-out
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
