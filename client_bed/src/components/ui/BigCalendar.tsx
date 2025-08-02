"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"; // Adjust the import as necessary
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isToday,
  getDay,
} from "date-fns";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Day {
  date: Date;
  presents: number;
  leaves: number;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Function to generate days for the calendar view
  const getDaysInMonth = (date: Date): Day[] => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => ({
      date: day,
      presents: Math.floor(Math.random() * 10), // Random number for demo
      leaves: Math.floor(Math.random() * 5), // Random number for demo
    }));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate placeholders for empty days before the start of the month
  const startDayOfWeek = getDay(startOfMonth(currentDate)); // 0 (Sunday) to 6 (Saturday)
  const placeholders = Array(startDayOfWeek).fill(null); // Empty cells to align the first day

  return (
    <div>
      <Drawer>
        <div
          className={cn(
            "flex flex-col m-2 p-2",
            "bg-background text-foreground border rounded-lg"
          )}
        >
          <div className="flex justify-between items-center mb-4">
            <Button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              Previous
            </Button>
            <h2 className="text-lg font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              Next
            </Button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={index === 0 ? "text-red-600" : "text-gray-600"}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days in month with correct alignment */}
          <div className="grid grid-cols-7 gap-2">
            {/* Placeholders for days before the start of the month */}
            {placeholders.map((_, index) => (
              <div key={`placeholder-${index}`} className="p-2"></div>
            ))}

            {/* Actual days in the month */}
            {daysInMonth.map(({ date, presents, leaves }) => (
              <DrawerTrigger key={date.toString()}>
                <div
                  key={date.toString()}
                  className={cn(
                    "p-2 border rounded-md cursor-pointer ",
                    isToday(date)
                      ? "bg-green-100 text-black"
                      : "bg-card text-foreground ",
                    "border-muted "
                  )}
                >
                  <div className="font-bold text-center ">
                    {format(date, "d")}
                  </div>
                  <div className="text-green-600 text-center">
                    Presents: {presents}
                  </div>
                  <div className="text-red-400 text-center">
                    Leaves: {leaves}
                  </div>
                  <div className="text-orange-400 text-center">
                    Off: {leaves}
                  </div>
                </div>
              </DrawerTrigger>
            ))}
          </div>
        </div>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <span className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium border-muted">
                Cancel
              </span>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Calendar;
