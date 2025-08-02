export function calculateAge(dateOfBirth:any) {
    if (!dateOfBirth) {
      return "Invalid date";
    }
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return "Invalid date";
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if (!hasBirthdayPassed) {
      age -= 1;
    }
    return age;
  }
  