import React from "react";

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
            Give Comfort, Give Life: Sponsor a Palliative Care Bed Today
          </p>
        </div>

        {/* Services */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 md:p-10 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Free Services Offered:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            {[
              "Hospital Admission",
              "Accommodation",
              "Food for Patients and Bystanders",
              "Doctor's Care",
              "Nursing Care",
              "Physiotherapy",
              "Fluid Tapping",
              "Palliative Medicine",
              "Centralized Oxygen",
              "Bed Sore Care",
              "Bladder Wash",
              "Cannulation",
              "Catheter Care",
              "Catheterization",
              "Ventilator Facility",
              "Bystander Service",
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
          Every Bed Counts and Every Sponsorship Makes a Difference.
        </div>

        {/* Description */}
        <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed space-y-4">
          <p>
            <strong className="text-gray-800 dark:text-white">
              A Bed of Hope: Help Us Bring Dignity to Every Final Breath
            </strong>
            Shanthibhavan Palliative Hospital is India’s first and only
            completely free palliative care hospital, offering unwavering
            support to the bedridden, terminally ill, and those enduring chronic
            suffering. With centers in Thrissur and Thiruvananthapuram,
            Shanthibhavan provides comprehensive care including hospital
            admission, palliative medicine, 24/7 nursing, physiotherapy, bedsore
            management, fluid tapping, dialysis, ventilator support, and even
            free meals and accommodation for both patients and their bystanders.
            At a time when long-term palliative hospital care is a distant dream
            for many, Shanthibhavan stands as a beacon of compassion, pioneering
            a model of dignity-driven care that is accessible to all, regardless
            of financial means.
          </p>
          <p>
            We now invite compassionate individuals and organizations to join
            our mission by
            <strong> sponsoring a bed at Rs. 60,000 per month. </strong>{" "}
            Sponsorships can be made individually or as a group effort, and they
            ensure that a patient receives all services entirely free,
            round-the-clock palliative care, electric beds, emotional and
            psychological support, bystander comfort, and a peaceful, dignified
            environment where no one has to face life’s final journey alone.
            Donors are gratefully acknowledged on bedside monitors, symbolizing
            their role in offering comfort during the most vulnerable moments of
            life. Through your support, we aim to build a global network of
            empathy, uniting hearts that believe in the power of love, dignity,
            and human connection. Together, we can ensure that every breath,
            until the last, is met with kindness, care, and grace.
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <p className="font-semibold text-gray-700 dark:text-white">
            For more information, contact
          </p>
          <p className="text-lg font-bold text-indigo-700 mt-1">
            Rev. Fr. Joy Koothur
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            📞{" "}
            <a
              href="tel:+918075449929"
              className="text-green-600 hover:underline"
            >
              +91 80 75 44 99 29
            </a>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            📧{" "}
            <a
              href="mailto:ceo@shanthibhavan.in"
              className="text-blue-600 hover:underline"
            >
              ceo@shanthibhavan.in
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
