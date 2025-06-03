import React from 'react';

export default function SponsorshipSection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-12 px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Support Santhibhavan Palliative Hospital
          </h2>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            Help us sponsor compassionate care for the bedridden.
          </p>
        </div>

        {/* Services */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 md:p-10 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">Free Services Offered:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            {[
              "Hospital Admission", "Accommodation", "Food for Patients and Bystanders", "Doctor's Care",
              "Nursing Care", "Physiotherapy", "Fluid Tapping", "Palliative Medicine", "Centralized Oxygen",
              "Bed Sore Care", "Bladder Wash", "Cannulation", "Catheter Care", "Catheterization",
              "Ventilator Facility", "Bystander Service"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-indigo-700 mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlighted Message */}
        <div className="text-center bg-blue-100 text-indigo-700 p-5 rounded-lg text-lg font-medium shadow">
          Let's provide compassionate care for the bedridden — every bed can be sponsored.
        </div>

        {/* Description */}
        <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed space-y-4">
          <p>
            <strong className="text-gray-800 dark:text-white">Santhibhavan Palliative Hospital</strong>, a free palliative hospital located in Pallissery, Thrissur,
            has <strong>100 beds</strong> for bedridden patients. Due to financial constraints, only 70 beds are currently in use.
            Despite high demand, the hospital is unable to provide the remaining 30 beds to bedridden patients.
          </p>
          <p>
            There is an opportunity to sponsor each bed, either individually or collectively, to achieve this goal.
            The cost of one bed — including hospital admission, accommodation, food for patients and bystanders, doctor’s care,
            nursing care, physiotherapy, palliative medicine, fluid tapping, centralized oxygen, bed sore care,
            ventilator facility, and bystander services — is approximately <strong>₹60,000 (sixty thousand)</strong> per month.
          </p>
          <p>Anyone can sponsor one or more beds, either individually or collectively.</p>
        </div>

        {/* Contact Card */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <p className="font-semibold text-gray-700 dark:text-white">
            For more information, contact
          </p>
          <p className="text-lg font-bold text-indigo-700 mt-1">Rev. Fr. Joy Koothur</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            📞 <a href="tel:+918075449929" className="text-green-600 hover:underline">+91 80 75 44 99 29</a>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            📧 <a href="mailto:ceo@shanthibhavan.in" className="text-blue-600 hover:underline">ceo@shanthibhavan.in</a>
          </p>
        </div>
      </div>
    </section>
  );
}
