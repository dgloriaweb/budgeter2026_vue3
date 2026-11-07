// Format a number to 2 decimal places as a string (no currency symbols).
// Returns null when the value is null or undefined so callers can show a placeholder.
export function formatAmount(value) {
  if (value == null) return null

  return Number(value).toFixed(2)
}

export function getAccountBalances(accounts, balances) {
  const latestByAccountId = new Map()

  for (const balance of balances) {
    const current = latestByAccountId.get(balance.account_id)

    if (!current || new Date(balance.balance_date) > new Date(current.balance_date)) {
      latestByAccountId.set(balance.account_id, balance)
    }
  }

  return accounts.map((account) => ({
    ...account,
    balance: latestByAccountId.get(account.account_id)?.amount ?? null,
  }))
}

export function summarizeBalancesByCurrency(accountBalances) {
  const totalsByCurrency = new Map()

  for (const account of accountBalances) {
    if (account.balance == null) continue

    totalsByCurrency.set(
      account.currency,
      (totalsByCurrency.get(account.currency) ?? 0) + account.balance,
    )
  }

  return Array.from(totalsByCurrency, ([currency, amount]) => ({ currency, amount }))
}
