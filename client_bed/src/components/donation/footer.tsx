const Footer = ({ bed }: any) => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            {bed?.organization?.name === "Shanthibhavan Palliative Hospital" ? (
            <a href="/" className="mb-4 bg-white rounded-full">
              <img
                src="father.png"
                alt="Shanthibhavan Logo"
                className="h-16"
              />
            </a>):
            (
            <a href="/" className="mb-4">
              <img
                src="assets/images/logo-2.png"
                alt="Shanthibhavan Logo"
                className="h-16"
              />
            </a>)}
            {/* Social Icons can be added here */}
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Address Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Our Location
            </h3>
            {bed?.organization?.name === "Shanthibhavan Palliative Hospital" ? (
              <div className="space-y-3">
                <div className="flex items-start justify-center md:justify-start">
                  <span className="text-blue-600 mt-1 mr-3">
                    <i className="fas fa-map-marker-alt"></i>
                  </span>
                  <p>
                    Shanthibhavan Palliative Hospital,
                    <br />
                    Mountain of Mercy, Pallissery, Arattupuzha.P.O,
                    <br />
                    Thrissur - 680562
                  </p>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="text-blue-600 mr-3">
                    <i className="fas fa-phone-alt"></i>
                  </span>
                  <a
                    href="tel:+61391112473"
                    className="hover:text-blue-600 transition"
                  >
                    04876611600
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-center md:justify-start">
                  <span className="text-blue-600 mt-1 mr-3">
                    <i className="fas fa-map-marker-alt"></i>
                  </span>
                  <p>
                    SHANTHIBHAVAN PALLIATIVE INTERNATIONAL LTD,
                    <br />
                    Office 3261, Ground Floor, 470 St Kilda Rd,
                    <br />
                    MELBOURNE VIC 3004,
                    <br />
                    Australia
                  </p>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="text-blue-600 mr-3">
                    <i className="fas fa-phone-alt"></i>
                  </span>
                  <a
                    href="tel:+61391112473"
                    className="hover:text-blue-600 transition"
                  >
                    +61 391112473
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links Section */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-600 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="hover:text-blue-600 transition">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Copyright Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            ©2025{" "}
            <a href="#" className="text-blue-600 hover:text-white">
              Shanthibhavan
            </a>{" "}
            All Rights Reserved
          </p>
          <div className="flex space-x-6">
            <a href="/privacy-policy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="/terms-of-use" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
