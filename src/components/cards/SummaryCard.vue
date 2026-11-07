<template>
  <div>
    <!-- Main Header -->
    <div>Summary</div>
    
    <!-- Side-by-Side Flex Layout Row -->
    <div style="display: flex; gap: 20px;">
      
      <!-- Currency Block Column -->
      <div style="display: flex; flex-direction: column; flex: 1;">
        <label>Currency</label>
        <select v-model="selectedCurrencies" multiple size="3">
          <option v-for="currency in currencies" :key="currency" :value="currency">
            {{ currency }}
          </option>
        </select>
      </div>

      <div style="display: flex; flex-direction: column; flex: 1;">
        <CheckboxFilter v-model="selectedBanks" title="Bank" :options="bankOptions" />
      </div>

    </div>

    <!-- Balance Output Section -->
    <div style="display: flex; flex-direction: column; margin-top: 20px;">
      <div>Balance</div>
      
      <table style="width: 100%;">
        <tbody>
          <tr v-for="total in filteredTotals" :key="total.currency">
            <td>{{ total.currency }}:</td>
            <td style="text-align: right;">{{ formatAmount(total.amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>




<script setup>
import { computed, ref } from 'vue'
import CheckboxFilter from '@/components/CheckboxFilter.vue'
import accounts from '@/stores/json/account.json'
import balances from '@/stores/json/balance.json'
import {
  formatAmount,
  getAccountBalances,
  summarizeBalancesByCurrency,
} from '@/utils/shared_utils.js'

const accountBalances = getAccountBalances(accounts, balances)
const currencies = [...new Set(accounts.map((account) => account.currency))]
const banks = [...new Set(accounts.map((account) => account.bank))]
const bankOptions = banks.map((bank) => ({ value: bank, label: bank }))
const selectedCurrencies = ref([...currencies])
const selectedBanks = ref([...banks])
const filteredTotals = computed(() =>
  summarizeBalancesByCurrency(
    accountBalances.filter(
      (account) =>
        selectedCurrencies.value.includes(account.currency) &&
        selectedBanks.value.includes(account.bank),
    ),
  ),
)
</script>
