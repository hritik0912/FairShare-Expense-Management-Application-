// helpers/debtSimplification.js

/**
 * Simplifies debts within a group.
 * @param {Array} expenses - An array of expense objects from the database.
 * @returns {Array} An array of simplified debt objects, e.g., { from: 'UserA', to: 'UserB', amount: 10 }.
 */
export const simplifyDebts = (expenses) => {
  const balances = new Map();

  // 1. Calculate the net balance for each person
  expenses.forEach(expense => {
    const paidBy = expense.paidBy.toString();
    const totalAmount = expense.amount;

    // The person who paid is owed money
    balances.set(paidBy, (balances.get(paidBy) || 0) + totalAmount);

    // The people who owe money have their balances reduced
    expense.splits.forEach(split => {
      const owedBy = split.user.toString();
      const owedAmount = split.amount;
      balances.set(owedBy, (balances.get(owedBy) || 0) - owedAmount);
    });
  });

  // 2. Separate people into debtors and creditors
  const debtors = [];
  const creditors = [];

  balances.forEach((amount, person) => {
    if (amount > 0) {
      creditors.push({ person, amount });
    } else if (amount < 0) {
      debtors.push({ person, amount: -amount }); // Store as a positive amount
    }
  });

  const settlements = [];

  // 3. Match debtors to creditors to create settlement transactions
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
        settlements.push({
            from: debtor.person,
            to: creditor.person,
            amount: amount,
        });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return settlements;
};
