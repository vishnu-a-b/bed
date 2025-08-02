import React, { useState, useRef } from "react";

interface DatePickerProps {
  onDateChange: (date: Date) => void; // Callback function to pass the selected date
  propDate: Date; // Date to initialize the component
}

const DatePicker: React.FC<DatePickerProps> = ({ onDateChange, propDate }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(propDate)); // Initialize with today's date
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Function to update the selected date
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = new Date(event.target.value);
    setCurrentDate(newDate);
    onDateChange(newDate); // Pass the new date to the parent
  };

  // Function to move to the previous day
  const handlePrevDate = (): void => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      onDateChange(newDate); // Pass the new date to the parent
      return newDate;
    });
  };

  // Function to move to the next day
  const handleNextDate = (): void => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      onDateChange(newDate); // Pass the new date to the parent
      return newDate;
    });
  };

  // Format the date to display in the component
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="w-min flex items-center justify-between border border-gray-300 px-4 py-2 rounded-lg bg-white shadow-sm">
      <button
        onClick={handlePrevDate}
        className="text-gray-500 hover:text-blue-500 focus:outline-none"
        aria-label="Previous Date"
      >
        &lt;
      </button>
      <div className="flex justify-center mx-4 text-gray-800 min-w-40" aria-live="polite">
        {formatDate(currentDate)}
      </div>
      <button
        onClick={handleNextDate}
        className="text-gray-500 hover:text-blue-500 focus:outline-none"
        aria-label="Next Date"
      >
        &gt;
      </button>
      <input
        type="date"
        ref={dateInputRef}
        value={currentDate.toISOString().slice(0, 10)} // Format as YYYY-MM-DD
        onChange={handleDateChange}
        className="ml-2 w-5" // Hide the date input
      />
    </div>
  );
};

export default DatePicker;
