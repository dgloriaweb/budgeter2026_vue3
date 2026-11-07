<template>
  <div class="card">
    <div class="cardTitle">Log a paid bill</div>
    <form class="form" @submit.prevent="handleAddBill">
      <label class="label">
        Account used
        <select v-model="billAccountId" class="input">
          <option value="" disabled>Select…</option>
          <option v-for="account in accounts" :key="account.id" :value="account.id">
            {{ account.name }}
          </option>
        </select>
      </label>

      <label class="label">
        Amount (GBP)
        <input
          v-model="billAmountPounds"
          class="input"
          inputmode="decimal"
          placeholder="e.g. 12.99"
        />
      </label>

      <label class="label">
        Category
        <input v-model="billCategory" class="input" placeholder="e.g. Internet" />
      </label>

      <label class="label">
        Date paid
        <input v-model="billPaidDate" class="input" type="date" />
      </label>

      <button type="submit" class="btn">Log bill</button>
    </form>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'

const errorMessage = ref('')
const successMessage = ref('')



const mockAccounts = ref([])
const mockBills = ref([])



const billAccountId = ref('')
const billAmountPounds = ref('')
const billCategory = ref('')
const billPaidDate = ref(new Date().toISOString().slice(0, 10))

const includeSavings = ref(true)
const includeAllAccounts = ref(true)

const primaryAccountId = computed(() => {
  const firstNonSavings = (mockAccounts.value || []).find((a) => !a.is_savings)
  const first = (mockAccounts.value || [])[0]
  return (firstNonSavings || first)?.id || ''
})

const accounts = computed(() => {
  const base = mockAccounts.value || []
  const scoped = includeAllAccounts.value
    ? base
    : base.filter((a) => a.id === primaryAccountId.value)
  return includeSavings.value ? scoped : scoped.filter((a) => !a.is_savings)
})


const handleAddBill = () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (!billAccountId.value) throw new Error('Pick an account.')
    const pence = Math.round(Number(billAmountPounds.value) * 100)
    if (!Number.isFinite(pence) || pence <= 0) throw new Error('Enter a valid amount.')
    if (!billPaidDate.value) throw new Error('Pick a date.')

    const account = mockAccounts.value.find((a) => a.id === billAccountId.value)
    if (!account) throw new Error('Account not found.')

    mockBills.value.unshift({
      id: `bill_${Date.now()}`,
      account_id: billAccountId.value,
      amount_pence: pence,
      category: String(billCategory.value || '').trim() || 'Uncategorized',
      paid_date: billPaidDate.value,
    })

    successMessage.value = 'Bill logged.'
    billAmountPounds.value = ''
    billCategory.value = ''
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to log bill.'
  }
}
</script>
