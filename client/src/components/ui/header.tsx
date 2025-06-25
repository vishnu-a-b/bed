'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full shadow-md bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <img
            src="/father.png"
            alt="Shanthibhavan Logo"
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800 ">
              SHANTHIBHAVAN PALLIATIVE HOSPITAL
            </h1>
            <p className="text-sm text-gray-500  leading-tight">
              The first palliative Hospital in INDIA, The No-Bill hospital of KERALA
            </p>
          </div>
        </div>

        {/* Desktop Info */}
        <div className="hidden md:grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600  text-right">
  <span>📍 Thrissur, Thiruvananthapuram</span>
  <span>📅 Established: 2016</span>
  <span>📞 0487 - 66 11 600</span>
  <span>📱 +91 91426 53804</span>
  <span>🌐 shanthibhavan.in</span>
  <span>📧 office@shanthibhavan.in</span>
</div>


        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 "
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 text-sm text-gray-600  space-y-1">
          <div>Thrissur, Thiruvananthapuram</div>
          <div>📞 0487 - 66 11 600</div>
          <div>📱 +91 91426 53804</div>
          <div>🌐 www.shanthibhavan.in</div>
          <div>📧 office@shanthibhavan.in</div>
          <div>Established: 2016</div>
        </div>
      )}
    </header>
  )
}
