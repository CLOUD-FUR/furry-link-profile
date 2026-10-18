/**
 * Calculate birthday countdown (D-day)
 * Returns D-365 to D-DAY to D+1, then resets to D-365
 */
export function calculateBirthdayDday(birthday: Date | string | null): string | null {
  if (!birthday) return null;

  const birthDate = typeof birthday === "string" ? new Date(birthday) : birthday;
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get this year's birthday
  let nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  nextBirthday.setHours(0, 0, 0, 0);

  // If birthday already passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday = new Date(
      today.getFullYear() + 1,
      birthDate.getMonth(),
      birthDate.getDate()
    );
    nextBirthday.setHours(0, 0, 0, 0);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "D-DAY";
  } else if (diffDays > 0) {
    return `D-${diffDays}`;
  } else {
    // Birthday passed (should not happen due to logic above)
    return `D+${Math.abs(diffDays)}`;
  }
}
