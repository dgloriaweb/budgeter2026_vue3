<template>
  <div class="card">
    <div class="cardTitle">Account balances</div>
    <table>
      <thead>
        <tr>
          <th>Account</th>
          <th>Currency</th>
          <th class="cellNumber">Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in account_balances" :key="account.account_id">
          <td>{{ account.name }}</td>
          <td>{{ account.currency }}</td>
          <td class="cellNumber">
            {{ account.balance == null ? '—' : formatAmount(account.balance) }}
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
import { formatAmount, getAccountBalances } from '@/utils/shared_utils.js'

const account_balances = computed(() => getAccountBalances(accounts, balances))
</script>