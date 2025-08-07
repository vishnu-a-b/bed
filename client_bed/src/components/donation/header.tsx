import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Hamburger Button (mobile only) */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex-shrink-0">
              <a href="/">
                <img
                  src="assets/images/logo-1.png"
                  alt="Shanthibhavan Logo"
                  className="h-12 w-auto"
                />
              </a>
            </div>

            {/* Hamburger Button - Mobile Only */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Contact Info - Hidden on mobile unless menu is open, visible on desktop */}
          <div
            className={`${isMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-1/2 transition-all duration-300 ease-in-out`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 md:mt-0">
              {/* Address */}
              <div className="flex items-start p-2 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600">Address</p>
                  <p className="text-xs text-gray-600 text-wrap">
                    Office 3261, Ground Floor, 470 St Kilda Rd., MELBOURNE VIC
                    3004, Australia.
                  </p>
                </div>
              </div>

              {/* Combined Contact */}
              <div className="flex items-start p-2 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-600">Contact</p>
                  <a
                    href="tel:061391112473"
                    className="block text-xs text-gray-600 hover:text-blue-600"
                  >
                    +61 391112473
                  </a>
                  <a
                    href="mailto:operationssbau@palliativeinternational.com"
                    className="block text-xs text-gray-600 hover:text-blue-600 truncate text-wrap"
                  >
                    operationssbau@palliativeinternational.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;