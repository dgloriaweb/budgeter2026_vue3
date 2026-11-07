<template>
  <div class="card">
    <div class="cardTitle">Log a paid bill</div>
    <form class="form" @submit.prevent="handleAddBill">
      <label class="label">
        Type
        <span>
          <label>
            <input
              v-model="transactionType"
              type="radio"
              value="debit"
              @change="clearTransaction"
            />
            Debit
          </label>
          <label>
            <input
              v-model="transactionType"
              type="radio"
              value="credit"
              @change="clearTransaction"
            />
            Credit
          </label>
        </span>
      </label>

      <label class="label">
        Transaction
        <input
          v-model="transactionSearch"
          class="input"
          list="available-transactions"
          autocomplete="off"
          autofocus
          required
          placeholder="Search transactions"
          @input="handleTransactionInput"
        />
        <datalist id="available-transactions">
          <option
            v-for="transaction in remainingTransactions"
            :key="transaction.transaction_id"
            :value="transactionLabel(transaction)"
          />
        </datalist>
      </label>

      <label class="label">
        Amount
        <input v-model="amount" class="input" type="number" step="any" required />
      </label>

      <label class="label">
        Comment
        <input v-model="comment" class="input" maxlength="100" />
      </label>

      <label class="label">
        Date paid
        <input v-model="paidAt" class="input" type="datetime-local" step="1" required />
      </label>

      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      <button type="submit" class="btn">Log bill</button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import rawTransactions from '@/stores/json/transaction.json'
import tlogSeed from '@/stores/json/tlog.json'

const TLOG_STORAGE_KEY = 'budgeter2026_tlog'
const transactions = Array.isArray(rawTransactions)
  ? rawTransactions
  : (rawTransactions?.transactions ?? [])

const errorMessage = ref('')
const successMessage = ref('')
const transactionType = ref('debit')
const selectedTransactionId = ref('')
const transactionSearch = ref('')
const amount = ref('')
const comment = ref('')
const paidAt = ref(toLocalDatetimeInput(new Date()))
const tlog = ref([])

try {
  const savedTlog = localStorage.getItem(TLOG_STORAGE_KEY)
  tlog.value = savedTlog === null ? [...tlogSeed] : JSON.parse(savedTlog)
  if (!Array.isArray(tlog.value)) throw new Error('Saved transaction log must be an array.')
} catch (error) {
  errorMessage.value = error?.code ? '' : error?.message || 'Could not load the transaction log.'
}

const remainingTransactions = computed(() =>
  transactions.filter((transaction) => {
    const share = Number(transaction.my_share)
    return transactionType.value === 'credit' ? share < 0 : share > 0
  }),
)

function transactionLabel(transaction) {
  return `${transaction.item} (${transaction.currency} ${transaction.my_share}) #${transaction.transaction_id}`
}

function handleTransactionInput() {
  const transaction = remainingTransactions.value.find(
    (item) => transactionLabel(item) === transactionSearch.value,
  )
  selectedTransactionId.value = transaction ? String(transaction.transaction_id) : ''
  amount.value = transaction ? String(transaction.my_share) : ''
}

function clearTransaction() {
  transactionSearch.value = ''
  selectedTransactionId.value = ''
  amount.value = ''
}

function toLocalDatetimeInput(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function toMysqlTimestamp(value) {
  const [date, time] = value.split('T')
  const [hours, minutes, seconds = '00'] = time.split(':')
  return `${date} ${hours}:${minutes}:${seconds}`
}

function handleAddBill() {
  errorMessage.value = ''
  successMessage.value = ''

  const transaction = remainingTransactions.value.find(
    (item) => String(item.transaction_id) === selectedTransactionId.value,
  )
  const parsedAmount = Number(amount.value)

  if (!transaction) {
    errorMessage.value = 'Select an available transaction.'
    return
  }
  if (!Number.isFinite(parsedAmount)) {
    errorMessage.value = 'Enter a valid amount.'
    return
  }
  if (!paidAt.value) {
    errorMessage.value = 'Select the date paid.'
    return
  }

  const entry = {
    tlog_id: Math.max(0, ...tlog.value.map((item) => Number(item.tlog_id) || 0)) + 1,
    transaction_id: transaction.transaction_id,
    amount: parsedAmount,
    datetime: toMysqlTimestamp(paidAt.value),
    comment: comment.value.trim() || null,
  }

  try {
    const updatedTlog = [...tlog.value, entry]
    localStorage.setItem(TLOG_STORAGE_KEY, JSON.stringify(updatedTlog))
    tlog.value = updatedTlog
    successMessage.value = 'Transaction logged.'
    transactionSearch.value = ''
    selectedTransactionId.value = ''
    amount.value = ''
    comment.value = ''
    paidAt.value = toLocalDatetimeInput(new Date())
  } catch (error) {
    errorMessage.value = error?.code ? '' : error?.message || 'Could not save the transaction log.'
  }
}
</script>
