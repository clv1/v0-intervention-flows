/**
 * Returns the current cycle date in the format YYYY-MM-DD
 * @param {number} offset - The number of days to offset from the current date (e.g., -1 for yesterday)
 * @returns {string} The current cycle date
 */

export const getCurrentCycleDate = (offset: number = 0): string => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + offset); // Apply the offset
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};
