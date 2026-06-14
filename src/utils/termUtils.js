/**
 * Returns the current SA school term and year based on the system clock.
 * Jan–Mar = T1, Apr–Jun = T2, Jul–Sep = T3, Oct–Dec = T4
 */
export function getCurrentTermAndYear() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const year = String(now.getFullYear());
  let term;
  if (month <= 3) term = 'T1';
  else if (month <= 6) term = 'T2';
  else if (month <= 9) term = 'T3';
  else term = 'T4';
  return { term, year };
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
