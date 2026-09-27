<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../api/api.js'
const errorMessage = ref('')
const successMessage = ref('')

const MOCK_STORAGE_KEY = 'budgeter2026_mock_budget_v2'

const mockAccounts = ref([])
const mockBills = ref([])
const mockScheduledPayments = ref([])

const createMockState = () => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    accounts: [
      { id: 'acc_current', name: 'Current Account', balance_pence: 125034, is_savings: false },
      { id: 'acc_savings', name: 'Savings', balance_pence: 820000, is_savings: true },
      { id: 'acc_cash', name: 'Cash', balance_pence: 4500, is_savings: false },
    ],
    bills: [
      {
        id: 'bill_seed_1',
        account_id: 'acc_current',
        amount_pence: 1299,
        category: 'Internet',
        paid_date: today,
      },
    ],
    scheduled_payments: [
      { id: 'sp_rent', name: 'Rent', account_id: 'acc_current', amount_pence: 87500, due_day: 1 },
      { id: 'sp_council_tax', name: 'Council tax', account_id: 'acc_current', amount_pence: 16200, due_day: 3 },
      { id: 'sp_internet', name: 'Internet', account_id: 'acc_current', amount_pence: 3499, due_day: 5 },
      { id: 'sp_gym', name: 'Gym', account_id: 'acc_current', amount_pence: 2599, due_day: 7 },
    ],
  }
}

const safeParse = (json) => {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

const hydrateMock = () => {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(MOCK_STORAGE_KEY)
  const parsed = raw ? safeParse(raw) : null

  const seed =
    parsed &&
    Array.isArray(parsed.accounts) &&
    Array.isArray(parsed.bills) &&
    Array.isArray(parsed.scheduled_payments)
      ? parsed
      : createMockState()

  mockAccounts.value = seed.accounts.map((a) => ({
    id: a.id,
    name: a.name,
    balance_pence: Number(a.balance_pence) || 0,
    is_savings: Boolean(a.is_savings),
  }))
  mockBills.value = seed.bills
  mockScheduledPayments.value = seed.scheduled_payments
}

watch(
  [mockAccounts, mockBills, mockScheduledPayments],
  () => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      MOCK_STORAGE_KEY,
      JSON.stringify({
        accounts: mockAccounts.value,
        bills: mockBills.value,
        scheduled_payments: mockScheduledPayments.value,
      }),
    )
  },
  { deep: true },
)

const formatCurrency = (pence) => {
  const pounds = (Number(pence) || 0) / 100
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(pounds)
}

onMounted(() => {
  hydrateMock()
})

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

const totalBalanceLabel = computed(() => {
  const pence = accounts.value.reduce((sum, account) => sum + (Number(account.balance_pence) || 0), 0)
  return formatCurrency(pence)
})

const scheduledPaymentsTo7th = computed(() => {
  const allowedAccountIds = new Set(accounts.value.map((a) => a.id))
  return (mockScheduledPayments.value || [])
    .filter((p) => allowedAccountIds.has(p.account_id))
    .filter((p) => Number(p.due_day) >= 1 && Number(p.due_day) <= 7)
    .sort((a, b) => Number(a.due_day) - Number(b.due_day))
})

const scheduledOutgoingsLabel = computed(() => {
  const outgoingsPence = scheduledPaymentsTo7th.value.reduce(
    (sum, payment) => sum + (Number(payment.amount_pence) || 0),
    0,
  )
  return formatCurrency(outgoingsPence)
})

const predictedAfter7thLabel = computed(() => {
  const currentPence = accounts.value.reduce((sum, account) => sum + (Number(account.balance_pence) || 0), 0)
  const outgoingsPence = scheduledPaymentsTo7th.value.reduce(
    (sum, payment) => sum + (Number(payment.amount_pence) || 0),
    0,
  )
  return formatCurrency(currentPence - outgoingsPence)
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

<template>
  <div class="page dashboardPage">
    <header class="topbar">
      <div>
        <div class="title">Accounts</div>
        <div class="subtitle">Total: {{ totalBalanceLabel }}</div>
      </div>
    </header>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <section class="grid">
      <div class="card forecast">
        <div class="forecastTop">
          <div>
            <div class="cardTitle">Forecast (after the 7th)</div>
            <div class="forecastLine">
              <span>Current total</span>
              <span class="strong">{{ totalBalanceLabel }}</span>
            </div>
            <div class="forecastLine">
              <span>Scheduled payments (1st–7th)</span>
              <span class="strong">-{{ scheduledOutgoingsLabel }}</span>
            </div>
            <div class="forecastLine">
              <span>Predicted after 7th</span>
              <span class="strong">{{ predictedAfter7thLabel }}</span>
            </div>
          </div>

          <div class="toggles">
            <label class="toggle">
              <input v-model="includeAllAccounts" type="checkbox" />
              Include all accounts
            </label>
            <label class="toggle">
              <input v-model="includeSavings" type="checkbox" />
              Include savings
            </label>
          </div>
        </div>

      </div>

      <div class="card">
        <details class="details">
          <summary class="summary">
            <span class="cardTitle" style="margin: 0;">Account balances</span>
            <span>(tap to expand)</span>
          </summary>

          <div class="accounts" style="margin-top: 12px;">
            <div v-for="account in accounts" :key="account.id" class="accountRow">
              <div class="accountName">{{ account.name }}</div>
              <div class="accountBalance">{{ formatCurrency(account.balance_pence) }}</div>
            </div>
          </div>
        </details>
      </div>

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
            <input v-model="billAmountPounds" class="input" inputmode="decimal" placeholder="e.g. 12.99" />
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
    </section>
  </div>
</template>

