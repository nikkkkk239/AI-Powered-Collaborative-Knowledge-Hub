import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useTheme } from '../context/ThemeContext';
import {
  LogOut,
  Settings,
  Search,
  FileText,
  Users,
  Handshake,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import BubbleMenu from '../components/BubbleMenu';

const items = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    ariaLabel: 'Home',
    rotation: -8,
    hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
  },
  {
    label: 'Search',
    href: '/search',
    ariaLabel: 'About',
    rotation: 8,
    hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
  },
  {
    label: 'Q&A',
    href: '/qa',
    ariaLabel: 'Projects',
    rotation: 8,
    hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
  },
  {
    label: 'Team',
    href: '/team',
    ariaLabel: 'Blog',
    rotation: 8,
    hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
  }
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const dark = theme === "dark";

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FileText },
    { name: "Search", href: "/search", icon: Search },
    { name: "Q&A", href: "/qa", icon: Users },
    { name: "Team", href: "/team", icon: Handshake },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-black text-gray-200" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`shadow-sm border-b md:p-4 p-2 transition-colors duration-300 ${dark ? "bg-[#0a0a0a] border-black/70 shadow-white/20" : "bg-white border-gray-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo + Desktop Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <img src="logo.jpg" alt="Logo" className="w-10 h-15 object-cover"/>
                <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-blue-700"}`}>HiveMind</h1>
              </Link>

              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? dark
                          ? "bg-white/10 text-white"
                          : "bg-blue-100 text-blue-700"
                        : dark
                          ? "text-gray-300 hover:text-white hover:bg-white/5"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* User + Actions */}
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline text-sm">
                <span>{user?.name}</span>
                {user?.hasGeminiKey ? (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${dark ? "bg-green-800 text-green-100" : "bg-green-100 text-green-800"}`}>
                    AI Ready
                  </span>
                ) : (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${dark ? "bg-yellow-800 text-yellow-100" : "bg-yellow-100 text-yellow-800"}`}>
                    No AI Key
                  </span>
                )}
              </span>

              <Link
                to="/profile"
                className={`p-2 rounded-full transition-colors ${dark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
              >
                <Settings className="h-5 w-5" />
              </Link>

              <button
                onClick={logout}
                className={`p-2 rounded-full transition-colors ${dark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
              >
                <LogOut className="h-5 w-5" />
              </button>

              {/* Hamburger */}
              <div className="md:hidden block">
                <BubbleMenu
                  logo={<span style={{ fontWeight: 700 }}>RB</span>}
                  items={items}
                  menuAriaLabel="Toggle navigation"
                  menuBg={dark ? "#111111" : "#ffffff"}
                  menuContentColor={dark ? "#ffffff" : "#111111"}
                  useFixedPosition={false}
                  animationEase="back.out(1.5)"
                  animationDuration={0.5}
                  staggerDelay={0.12}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`md:hidden border-t overflow-hidden shadow-lg transition-colors duration-300 ${dark ? "bg-[#0a0a0a] border-black/60" : "bg-white border-gray-200"}`}
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.href
                        ? dark
                          ? "bg-white/10 text-white"
                          : "bg-blue-100 text-blue-700"
                        : dark
                          ? "text-gray-300 hover:text-white hover:bg-white/5"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
