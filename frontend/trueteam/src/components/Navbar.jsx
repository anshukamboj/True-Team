import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar({ onLoginClick, onGetStartedClick }) {
  // Manages the open/closed state of the mobile navigation menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Array of navigation links to keep the JSX clean and scalable
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Employees', href: '#employees' },
    { name: 'HR & Admin', href: '#admin' },
    { name: 'About', href: '#about' },
  ];

  return (
    // Main header wrapper with sticky positioning to stay at the top during scroll
    <header className="sticky top-0 z-50 border-b border-[#4B101B]/10 bg-[#F8F1E6]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        
        {/* Brand Logo - Uses h-14 to constrain navbar height and w-auto to maintain aspect ratio */}
        <Link to="/">
          <img src="/Logo1.svg" alt="logo" className="h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation - Hidden on screens smaller than 901px */}
        <nav className="hidden items-center gap-10 min-[901px]:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[0.95rem] font-medium text-[#321719] transition-colors duration-200 hover:text-[#9C6268]"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Call-to-Action Buttons - Hidden on screens smaller than 901px */}
        <div className="hidden items-center gap-4 min-[901px]:flex">
          <Link to="/login" className="cursor-pointer border-none bg-transparent px-4 py-2 text-[0.95rem] font-semibold text-[#4B101B] transition-colors hover:text-[#9C6268]">
            Login
          </Link>

          <button
            onClick={onGetStartedClick}
            className="flex cursor-pointer items-center gap-2 rounded-full border-none bg-[#D9A1A0] px-5 py-[0.65rem] text-[0.95rem] font-semibold text-[#321719] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#CE8D8C]"
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Menu Toggle Button - Visible only on screens smaller than 901px */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex cursor-pointer items-center justify-center border-none bg-transparent min-[901px]:hidden"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {/* Toggles between Lucide Menu and X icons based on state */}
          {mobileMenuOpen ? (
            <X size={26} color="#4B101B" />
          ) : (
            <Menu size={26} color="#4B101B" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="flex flex-col gap-4 border-b border-[#4B101B]/15 bg-[#F8F1E6] px-6 pb-8 pt-6 min-[901px]:hidden sm:px-8"
        >
          {/* Mobile Navigation Links */}
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)} // Auto-close menu on link click
              className="py-1 text-base font-medium text-[#321719] transition-colors hover:text-[#9C6268]"
            >
              {link.name}
            </a>
          ))}

          {/* Mobile Call-to-Action Buttons */}
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false); // Close menu when action is taken
                onLoginClick?.();
              }}
              className="w-full cursor-pointer rounded-lg border border-[#4B101B] bg-transparent p-3 font-semibold text-[#4B101B] transition-colors hover:bg-[#4B101B]/5"
            >
              Login
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false); // Close menu when action is taken
                onGetStartedClick?.();
              }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-[#D9A1A0] p-3 font-semibold text-[#321719] transition-colors hover:bg-[#CE8D8C]"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;