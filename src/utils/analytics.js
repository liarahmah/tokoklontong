/**
 * Groups transactions by a specific period (daily, weekly, monthly) 
 * within a given date range and calculates total revenue and profit.
 * 
 * @param {Array} transactions Array of transaction objects
 * @param {String} startDate ISO Date string (YYYY-MM-DD)
 * @param {String} endDate ISO Date string (YYYY-MM-DD)
 * @param {String} period 'daily', 'weekly', or 'monthly'
 * @returns {Array} Array of data points formatted for Recharts
 */
export function groupTransactionsByPeriod(transactions, startDate, endDate, period) {
  if (!transactions || transactions.length === 0) return [];

  // 1. Filter by date range
  const start = startDate ? new Date(startDate) : new Date(0);
  start.setHours(0, 0, 0, 0);
  
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const filtered = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate >= start && txDate <= end;
  });

  // 2. Group by period
  const groups = {};

  filtered.forEach(tx => {
    const d = new Date(tx.date);
    let key = '';

    if (period === 'daily') {
      // Key: YYYY-MM-DD
      key = d.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      // Key: YYYY-MM
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === 'weekly') {
      // Key: YYYY-Www (e.g., ISO week)
      // For simplicity, we can use the date of the Monday of that week
      const day = d.getDay() || 7; // Get current day number, converting Sun. to 7
      d.setHours(-24 * (day - 1)); // Set to previous Monday
      key = d.toISOString().split('T')[0]; // Use Monday's date as the label
    }

    if (!groups[key]) {
      groups[key] = { revenue: 0, profit: 0 };
    }
    
    groups[key].revenue += tx.total || 0;
    groups[key].profit += tx.profit || 0;
  });

  // 3. Format for Recharts (array of objects sorted by date)
  return Object.keys(groups)
    .sort() // Sort keys chronologically
    .map(key => ({
      date: key, // Recharts X-axis label
      revenue: groups[key].revenue,
      profit: groups[key].profit,
    }));
}
