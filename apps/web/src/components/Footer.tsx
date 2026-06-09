"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0d0d12]">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 12.5C7 12.5 1.5 8.833 1.5 5A3.5 3.5 0 0 1 7 2.917 3.5 3.5 0 0 1 12.5 5C12.5 8.833 7 12.5 7 12.5Z" fill="white" />
                </svg>
              </div>
              <span className="font-black text-white text-base tracking-tight">pandicrm</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Customer Relations has never been this easy. AI-powered CRM for modern sales and customer success teams.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product</p>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Changelog</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Roadmap</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Company</p>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a>
                <a href="mailto:hello@pandicrm.com" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Legal</p>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} pandicrm. All rights reserved.</p>
          <p className="text-sm text-gray-400">
            Made with <span className="text-pk-500">&#9829;</span> for sales teams everywhere.
          </p>
        </div>
      </div>
      <div className="overflow-hidden pb-4"></div>
    </footer>
  );
}
