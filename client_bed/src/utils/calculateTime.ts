export function calculateTimeDifference(startDate: any, endDate: any) {
    if (!startDate || !endDate) {
      return "Invalid date";
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date";
    }
    const timeDifference = end.getTime() - start.getTime();
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    return `${hoursDifference}:${minutesDifference.toString().padStart(2, '0')} Hours`;
  }

  export function calculateTimeDiff(startDate: any, endDate: any) {
    if (!startDate || !endDate) {
      return "Invalid date";
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date";
    }
    const timeDifference = end.getTime() - start.getTime();
    return timeDifference;
  }

  export function totalTime(totalTime:any){
    const hoursDifference = Math.floor(totalTime / (1000 * 60 * 60));
    const minutesDifference = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hoursDifference}:${minutesDifference.toString().padStart(2, '0')} Hours`;
  }

  export const calculateTimeDifference1 = (startTime: number, endTime: number): string => {
    const timeDifferenceInSeconds = Math.abs(endTime - startTime) / 1000; // Convert milliseconds to seconds
    const hours = Math.floor(timeDifferenceInSeconds / 3600); // Calculate hours
    const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60); // Calculate remaining minutes
    const seconds = Math.floor(timeDifferenceInSeconds % 60); // Calculate remaining seconds
  
    // Format the time difference
    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${hours}h `;
    }
    if (minutes > 0) {
      formattedTime += `${minutes}m `;
    }
    if (seconds > 0 && hours === 0) {
      formattedTime += `${seconds}s`;
    }
  
    return formattedTime.trim(); // Remove trailing space
  };