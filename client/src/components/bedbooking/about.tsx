import React from "react";

export default function About() {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            About Us
          </h2>
          {/* <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 flex justify-center items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full opacity-70"></div>
              <img
                src="/cms.webp"
                alt="Shanthibhavan Palliative Hospital"
                className="w-96 h-auto rounded-2xl shadow-xl relative z-10 object-cover aspect-square"
              />
              <div className="absolute -bottom-6 -right-10 w-20 h-20 bg-blue-200 rounded-full opacity-50"></div>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col space-y-6">
            <div className="flex items-start">
              <p className="text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">
                  Shanthibhavan Palliative Hospital
                </span>{" "}
                is the first hospital in India for palliative bedridden patients
                without bills and cash counters. Everything is freefor the
                palliative patients including specialized care, all kinds of
                mental and medical support, and food.
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed">
              The Hospital runs on the motto,{" "}
              <span className="italic font-medium">
                by the people, for the people
              </span>
              . This hospital extends its support to many homes where bedridden
              patients need care and love.
            </p>

            <p className="text-gray-600 leading-relaxed">
              This is a unique hospital in India in its nature and by its
              service, providing high-end palliative care and mental support.
              For our patients, Shanthibhavan is not only a Palliative hospital
              but also an abode where they get the warmth of their home.
            </p>

            <div className="pt-4">
              <a
                href="/services"
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
              >
                Our Services
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
