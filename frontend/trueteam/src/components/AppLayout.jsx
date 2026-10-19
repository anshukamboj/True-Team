
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Sprout,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { employeeLinks, hrLinks } from '../navigation'


// Sidebar menu and user information
function SidebarContent({ links, user, collapsed = false, onNavigate, onLogout }) {
  return (
    <>
      {/* Logo */}
      <div className={`flex items-center py-7 text-2xl font-bold ${
        collapsed ? 'justify-center px-2' : 'gap-2 px-8'
      }`}>
        <img src="/Logo1.svg" alt="logo" className={`shrink-0 object-contain ${collapsed ? 'h-8 w-6' : 'h-12 w-auto'}`}/>
      </div>

      {/* Navigation links */}
      <nav className={`flex-1 space-y-1 overflow-y-auto ${
        collapsed ? 'px-2' : 'px-4'
      }`}>
        {links.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) => `
                flex items-center rounded-lg py-2.5 text-lg transition
                ${collapsed ? 'justify-center px-2' : 'gap-4 px-4'}
                ${isActive
                  ? 'bg-[#D9A1A0]/40 font-semibold'
                  : 'hover:bg-[#D9A1A0]/20'
                }
              `}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User information */}
      <div className="border-t border-[#48151C]/15 px-4 py-4">
        <div className={`flex items-center ${
          collapsed ? 'justify-center' : 'gap-3'
        }`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#511820] text-sm font-medium text-[#F7EDDF]">
            {user?.name?.[0] || 'U'}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-medium">{user?.name}</p>
              <p className="text-sm capitalize text-[#48151C]/60">
                {user?.role}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Log out"
          className={`mt-3 flex w-full items-center rounded-lg py-2 hover:bg-[#D9A1A0]/20 ${
            collapsed ? 'justify-center' : 'gap-3 px-2'
          }`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  )
}


// Main layout
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Show the correct menu for the logged-in user
  const links = user?.role === 'hr' ? hrLinks : employeeLinks

  // Logout and go to login page
  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F7EDDF] font-sans text-[#48151C]">

      {/* Desktop sidebar */}
      <aside className={`relative hidden shrink-0 flex-col border-r border-[#48151C]/15 transition-[width] duration-300 lg:flex ${
        collapsed ? 'w-20' : 'w-70'
      }`}>
        <SidebarContent
          links={links}
          user={user}
          collapsed={collapsed}
          onLogout={handleLogout}
        />

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          className="absolute -right-3 top-20 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#48151C]/20 bg-[#F7EDDF] text-[#511820] shadow-sm hover:bg-[#D9A1A0]/30"
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </button>
      </aside>

      {/* Mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 flex w-[270px] max-w-[85%] flex-col bg-[#F7EDDF]">

            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 rounded-lg p-2"
            >
              <X />
            </button>

            <SidebarContent
              links={links}
              user={user}
              onNavigate={() => setMenuOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main page */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-[#48151C]/15 px-4 py-3 lg:hidden">
          <span className="flex items-center gap-2 text-xl font-bold">
            <Sprout className="h-6 w-6 text-[#511820]" />
            Empower HR
          </span>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-2"
          >
            <Menu />
          </button>
        </header>

        {/* Selected page appears here */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
