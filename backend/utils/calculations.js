
const calculateRevenue = (quantity, pricePerUnit) => {
  const qty = Number(quantity) || 0;
  const price = Number(pricePerUnit) || 0;

  return Number((qty * price).toFixed(2));
};

const calculateProfit = (totalRevenue, totalExpenses) => {
  const revenue = Number(totalRevenue) || 0;
  const expenses = Number(totalExpenses) || 0;

  return Number((revenue - expenses).toFixed(2));
};

const calculateTotal = (values = []) => {
  return Number(
    values
      .reduce((total, value) => total + (Number(value) || 0), 0)
      .toFixed(2)
  );
};

const calculatePercentage = (value, total) => {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;

  if (numericTotal === 0) {
    return 0;
  }

  return Number(((numericValue / numericTotal) * 100).toFixed(2));
};

module.exports = {
  calculateRevenue,
  calculateProfit,
  calculateTotal,
  calculatePercentage,
};

