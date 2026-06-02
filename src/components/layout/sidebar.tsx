"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Briefcase,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { Button, Avatar, Switch, Tooltip } from "@nextui-org/react";
import { useAuth } from "@/providers/app-providers";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(user?.role === "Founder"
      ? [{ name: "Founder Console", href: "/founder", icon: Briefcase }]
      : []),
    { name: "Contribution Tickets", href: "/tickets", icon: Ticket },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Default mock fallback details if user state is not loaded yet
  const displayName = user?.legalName || "Guest User";
  const displayEmail = user?.email || "guest@startup.hub";
  const displayRole = user?.role || "Contributor";

  return (
    <motion.aside
      initial={{ width: isCollapsed ? 80 : 260 }}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen border-r border-divider bg-background/60 backdrop-blur-md select-none z-30"
    >
      {/* Sidebar Header / Branding */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-divider">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              <Briefcase className="w-6 h-6 text-primary" />
              <span>StartupHub</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center w-full"
            >
              <Briefcase className="w-6 h-6 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 bg-background border border-divider shadow-sm rounded-full z-40 hover:bg-default-100"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // Check active route matches
          const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/founder");
          const Icon = item.icon;

          return (
            <Tooltip
              key={item.href}
              content={item.name}
              placement="right"
              isDisabled={!isCollapsed}
            >
              <button
                onClick={() => handleNavClick(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-default-500 hover:text-foreground hover:bg-default-100"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "" : "text-default-400"}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </Tooltip>
          );
        })}
      </nav>

      {/* Theme Control and User Section */}
      <div className="p-4 border-t border-divider space-y-4">
        {/* Dark/Light mode toggle */}
        {mounted && (
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-2`}>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                Theme
              </span>
            )}
            <Switch
              isSelected={theme === "dark"}
              onValueChange={toggleTheme}
              size="sm"
              color="primary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <Moon className={className} />
                ) : (
                  <Sun className={className} />
                )
              }
            />
          </div>
        )}

        {/* User profile section */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-default-100 transition-all text-left"
          >
            <Avatar
              name={displayName}
              size="sm"
              isBordered
              color="secondary"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-semibold truncate text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-default-400 truncate">
                    {displayEmail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Drawer / Popover absolute to the bottom */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute bottom-16 ${
                    isCollapsed ? "left-2 w-48" : "left-0 right-0"
                  } p-3 bg-content1 border border-divider shadow-xl rounded-xl z-20`}
                >
                  <div className="pb-2 border-b border-divider mb-2">
                    <p className="text-xs text-default-400 uppercase tracking-wider font-semibold">
                      Role
                    </p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400 inline-block mt-1">
                      {displayRole}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-2 p-2 text-sm text-default-600 hover:text-foreground hover:bg-default-100 rounded-lg transition-all">
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-2 p-2 text-sm text-default-600 hover:text-foreground hover:bg-default-100 rounded-lg transition-all">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 text-sm text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-lg transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
