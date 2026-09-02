"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 38);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
        pathname === href ? "text-pk-700" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.055)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-[66px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLink("/", "Home")}
            <Link href="/#features" className="text-sm font-medium px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-full text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="btn-p text-sm px-5 py-2.5 ml-2">
              Log in
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-gray-700"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[60] bg-white flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-[66px] flex items-center justify-between px-6 border-b border-gray-100">
          <Logo className="h-8 w-auto" />
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center gap-6 p-6">
          <Link href="/" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-gray-800 hover:text-pk-700 transition-colors">
            Home
          </Link>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-gray-800 hover:text-pk-700 transition-colors">
            Dashboard
          </Link>
          <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-p text-base px-7 py-3.5 mt-4 w-full justify-center">
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}
