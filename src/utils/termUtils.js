export function getCurrentTermAndYear() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Determine current SA school term
  let currentTerm;
  if (month <= 3) currentTerm = 1;
  else if (month <= 6) currentTerm = 2;
  else if (month <= 9) currentTerm = 3;
  else currentTerm = 4;

  // Default to PREVIOUS term (what has results)
  let prevTermNum = currentTerm - 1;
  let prevYear = year;

  if (prevTermNum < 1) {
    prevTermNum = 4;
    prevYear = year - 1;
  }

  return {
    term: `T${prevTermNum}`,
    year: String(prevYear),
  };
}

/**
 * Returns an array of year options from 2025 to current year.
 */
export function getYearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  for (let y = 2025; y <= current; y++) years.push(String(y));
  return years;
}
