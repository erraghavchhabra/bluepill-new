import React, { useState } from "react";
import {
  LogOut,
  ChevronDown,
  Shield,
  LogIn,
  Settings,
  Bell,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    setMobileNavOpen(false);
    navigate("/auth");
  };

  const navTabs = [
    { label: "Build Audience", path: "/build-audience" },
    { label: "Simulate", path: "/simulate" },
    { label: "Chat", path: "/chat-with-persona" },
    { label: "History", path: "/analysis" },
    ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
  ];
  return (
    <header className="sticky top-0 z-50 bg-white py-[15px]">
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => (window.location.href = "/")}
          className="cursor-pointer bg-gray_light px-6 rounded-full"
        >
          <img
            src={`${import.meta.env.VITE_PUBLIC_URL}/logo.png`}
            alt="Bluepill Logo"
            className="w-auto h-[60px]"
          />
        </div>

        {/* Desktop Nav */}
        <div className="flex items-center gap-3 ">
          {isAuthenticated && (
            <nav className="hidden md:flex items-center bg-gray_light rounded-full h-[50px]">
              {navTabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={({ isActive }) =>
                    `px-5 py-3 rounded-full text-base  transition-all h-[50px]  duration-300 ${
                      isActive
                        ? "bg-primary text-white font-semibold"
                        : "text-black hover:bg-primary_light font-normal"
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right section */}
          <div className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                {/* Settings + Notifications */}
                <button className="p-3 h-[50px] w-[50px] rounded-full hover:bg-primary bg-gray_light hidden md:block">
                  <Settings className="h-6 w-6 text-gray-600" />
                </button>
                <button className="p-3 rounded-full h-[50px] w-[50px] hover:bg-primary bg-gray_light hidden md:block">
                  <Bell className="h-6 w-6 text-gray-600" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2  group  rounded-full `}
                  >
                    <div
                      className={`p-3 rounded-full h-[50px] w-[50px] group-hover:bg-primary bg-gray_light ${
                        profileMenuOpen && "bg-primary"
                      }`}
                    >
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt="User"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div className="text-left text-sm hidden sm:block">
                      <p className="font-semibold text-lg text-black">
                        {user?.name || "User"}
                      </p>
                      <p className="text-primary2 text-sm font-normal">
                        {user?.email || ""}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-0"
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-10">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            Signed in as
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        {isAdmin && (
                          <NavLink
                            to="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Shield className="h-4 w-4 mr-2 text-indigo-600" />
                            Admin Dashboard
                          </NavLink>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <NavLink
                to="/auth"
                className="flex items-center text-sm font-medium text-primary hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Log in
              </NavLink>
            )}

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="block md:hidden p-2"
              >
                {mobileNavOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileNavOpen && (
        <div className="md:hidden mt-4 space-y-2 px-4">
          {navTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
