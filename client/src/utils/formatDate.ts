export const formatDate = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  const day = d.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${day}-${month}-${year}`; // Returns the formatted date as dd-MMM-yyyy
};

export const formatDateTime = (date: string) => {

  if (!date) return "";
  const d= new Date(date);
  const day = d.getDate();;
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[day];
  const year = d.getFullYear();

  // Format time in 12-hour format
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  const time = `${hours}:${minutes} ${ampm}`;

  const formattedDate = `${day}-${month}-${year}`; // Format as dd-MMM-yyyy
  

  return `${formattedDate} ${time}`; // Combined date and time format
};

export const timeOnly = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight
  const time = `${hours}:${minutes} ${ampm}`;
  return ` ${time}`; // Combined date and time format
};

