<template>
  <div class="card">
    <div class="cardTitle">Account balances</div>
    <table>
      <thead>
        <tr>
          <th>Account</th>
          <th>Currency</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in account_balances" :key="account.account_id">
          <td>{{ account.name }}</td>
          <td>{{ account.currency }}</td>
          <td class="cellNumber">
            {{ account.balance == null ? '—' : account.balance }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import accounts from '@/stores/json/account.json'
import balances from '@/stores/json/balance.json'
import { formatAmount } from '@/utils/shared_utils.js'

// --- computed ---
const account_balances = computed(() => mergeAccountsWithLatestBalances(accounts, balances))

// --- functions ---

// For each account, keep only the newest balance row (latest balance_date).
// This is a simple "sort by date and take the first" done in a single pass.
function mergeAccountsWithLatestBalances(accounts, balances) {
  const latestByAccountId = new Map()

  for (const balance of balances) {
    const current = latestByAccountId.get(balance.account_id)

    if (!current || new Date(balance.balance_date) > new Date(current.balance_date)) {
      latestByAccountId.set(balance.account_id, balance)
    }
  }

  return accounts.map((account) => {
    const amount = latestByAccountId.get(account.account_id)?.amount ?? null

    return {
      ...account,
      balance: formatAmount(amount),
    }
  })
}

</script>
