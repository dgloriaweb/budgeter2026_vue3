<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import rawTransactions from '../stores/json/transaction.json'
import rawAccounts from '../stores/json/account.json'
import rawRecurrences from '../stores/json/recurrence.json'

const transactions = Array.isArray(rawTransactions)
  ? rawTransactions
  : rawTransactions?.transactions ?? []

const accounts = Array.isArray(rawAccounts) ? rawAccounts : rawAccounts?.accounts ?? []
const accountById = new Map(accounts.map((a) => [a.account_id, a]))

const recurrences = Array.isArray(rawRecurrences)
  ? rawRecurrences
  : rawRecurrences?.recurrences ?? []

const recurrenceById = new Map(recurrences.map((r) => [r.recurrence_id, r]))

const STORAGE_KEY_COLUMNS = 'budgeter2026_main_columns'

const columnDefs = [
  { key: 'item', label: 'Item', thClass: 'colItem', tdClass: 'colItem' },
  { key: 'expense_amount', label: 'Amount', thClass: 'colAmount', tdClass: 'colAmount cellNumber' },
  { key: 'my_share', label: 'My share', thClass: 'colAmount', tdClass: 'colAmount cellNumber' },
  { key: 'currency', label: 'Cur', thClass: 'colCurrency', tdClass: 'colCurrency' },
  { key: 'date', label: 'Date', thClass: 'colDateMain', tdClass: 'colDateMain' },
  { key: 'bank', label: 'Bank', thClass: 'colBank', tdClass: 'colBank' },
  { key: 'account', label: 'Account', thClass: 'colAccount', tdClass: 'colAccount' },
]

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthDiff(a, b) {
  return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
}

function parseDayMonth(raw) {
  if (!raw || typeof raw !== 'string') return null
  const parts = raw.split('/').map((p) => p.trim()).filter(Boolean)
  if (parts.length < 2) return null
  const day = Number(parts[0])
  const month = Number(parts[1])
  const year = parts.length >= 3 ? Number(parts[2]) : null
  if (!Number.isFinite(day) || !Number.isFinite(month) || month < 1 || month > 12) return null
  return { day, month, year }
}

function parseDateFromTemplate(dateStr, rangeStart) {
  const parsed = parseDayMonth(dateStr)
  if (!parsed) return null

  const year = parsed.year ?? rangeStart.getFullYear()
  let date = new Date(year, parsed.month - 1, parsed.day)

  if (parsed.year == null && date < rangeStart) {
    date = new Date(year + 1, parsed.month - 1, parsed.day)
  }

  if (Number.isNaN(date.getTime())) return null
  return date
}

function monthName(date) {
  return date.toLocaleString(undefined, { month: 'short' })
}

function isoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function bankLogo(bankId) {
  if (bankId === 1) return '/images/hsbc_logo.png'
  if (bankId === 3) return '/images/wise_logo.png'
  return null
}

function normalizeAccountType(value) {
  if (value == null) return null
  const s = String(value).trim()
  return s.length ? s : null
}

const rangeStart = startOfDay(new Date())
const rangeEnd = endOfMonth(new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 2, 1))

const rangeLabel = computed(() => {
  const start = rangeStart.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
  const end = rangeEnd.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
  return `${start} → ${end}`
})

const columns = ref({
  item: true,
  expense_amount: true,
  my_share: true,
  currency: true,
  date: true,
  bank: true,
  account: false,
})

if (typeof window !== 'undefined') {
  const saved = window.localStorage.getItem(STORAGE_KEY_COLUMNS)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      columns.value = { ...columns.value, ...parsed }
    } catch {
      // ignore invalid saved state
    }
  }
}

watch(
  columns,
  (val) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(val))
  },
  { deep: true }
)

const visibleColumns = computed(() => columnDefs.filter((c) => !!columns.value[c.key]))
const colSpan = computed(() => visibleColumns.value.length)

const referencedAccountIds = computed(() => {
  const set = new Set()
  for (const t of transactions) {
    const id = t?.account_id
    if (Number.isFinite(id)) set.add(id)
  }
  return set
})

const availableAccounts = computed(() => {
  const ids = referencedAccountIds.value
  return accounts.filter((a) => ids.has(a.account_id))
})

const selectedAccounts = ref(
  Object.fromEntries(availableAccounts.value.map((a) => [String(a.account_id), true])),
)

function expandMonthly(recurrence, template) {
  if (!recurrence?.by_month_day) return []

  const anchor = recurrence.start_date ? monthStart(new Date(recurrence.start_date)) : monthStart(rangeStart)
  const interval = Number(recurrence.interval) || 1

  const out = []
  const cursor = monthStart(rangeStart)
  const lastMonth = monthStart(rangeEnd)

  for (
    let m = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    m <= lastMonth;
    m = new Date(m.getFullYear(), m.getMonth() + 1, 1)
  ) {
    const diff = monthDiff(m, anchor)
    if (diff < 0 || diff % interval !== 0) continue

    const day = Number(recurrence.by_month_day)
    const candidate = new Date(m.getFullYear(), m.getMonth(), day)
    if (candidate.getMonth() !== m.getMonth()) continue
    if (candidate < rangeStart || candidate > rangeEnd) continue

    out.push({ template, date: candidate })
  }

  return out
}

function expandYearly(recurrence, template) {
  const months = Array.isArray(recurrence?.by_month) ? recurrence.by_month : null
  const day = Number(recurrence?.by_month_day)
  if (!months?.length || !day) return []

  const anchorYear = recurrence.start_date ? new Date(recurrence.start_date).getFullYear() : rangeStart.getFullYear()
  const interval = Number(recurrence.interval) || 1

  const out = []
  for (let y = rangeStart.getFullYear(); y <= rangeEnd.getFullYear(); y += 1) {
    const yearDiff = y - anchorYear
    if (yearDiff < 0 || yearDiff % interval !== 0) continue

    for (const month of months) {
      const candidate = new Date(y, Number(month) - 1, day)
      if (candidate.getMonth() !== Number(month) - 1) continue
      if (candidate < rangeStart || candidate > rangeEnd) continue
      out.push({ template, date: candidate })
    }
  }
  return out
}

function expandTemplate(template) {
  const account_id = template.account_id ?? null
  const recurrence_id = template.recurrence_id ?? null

  if (template.is_recurring && recurrence_id != null) {
    const recurrence = recurrenceById.get(recurrence_id)
    if (!recurrence) return []

    if (recurrence.freq === 'MONTHLY') return expandMonthly(recurrence, template)
    if (recurrence.freq === 'YEARLY') return expandYearly(recurrence, template)
    return []
  }

  const date = parseDateFromTemplate(template.date, rangeStart)
  if (!date) return []
  if (date < rangeStart || date > rangeEnd) return []
  return [{ template: { ...template, account_id }, date }]
}

const allRows = computed(() => {
  const expanded = transactions.flatMap((t) => expandTemplate(t))

  expanded.sort((a, b) => a.date.getTime() - b.date.getTime())

  return expanded.map(({ template, date }) => {
    const details = template.details && String(template.details).trim().length ? String(template.details) : null
    const expenseAmount = Number(template.expense_amount)
    const myShare = Number(template.my_share)

    const myShareAbs = Number.isFinite(myShare) ? Math.abs(myShare) : null
    const myShareSigned =
      myShareAbs == null ? null : template.type === 'debit' ? -myShareAbs : myShareAbs

    return {
      id: `${template.transaction_id}-${isoDate(date)}`,
      transaction_id: template.transaction_id,
      type: template.type,
      item: template.item,
      details,
      expense_amount: Number.isFinite(expenseAmount) ? expenseAmount : null,
      my_share: myShareSigned,
      currency: template.currency,
      // Keep account_name in UI consistent with account.json "type"
      account_name:
        normalizeAccountType(accountById.get(template.account_id ?? null)?.type) ??
        normalizeAccountType(template.account_name) ??
        '',
      account_id: template.account_id ?? null,
      date,
      dayLabel: String(date.getDate()),
      monthLabel: monthName(date),
      dateKey: isoDate(date),
    }
  })
})

const rows = computed(() => {
  const allowed = selectedAccounts.value
  const knownIds = referencedAccountIds.value

  return allRows.value.filter((r) => {
    const id = r.account_id
    if (!Number.isFinite(id)) return true
    // Only filter accounts we actually expose in the checkbox list.
    if (!knownIds.has(id)) return true
    return allowed[String(id)] !== false
  })
})

function sameMonth(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function isMonthEndRow(index) {
  const current = rows.value[index]
  const next = rows.value[index + 1]
  if (!current) return false
  if (!next) return true
  return !sameMonth(current.date, next.date)
}

function formatMoney(value) {
  if (value == null || !Number.isFinite(value)) return ''
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const openRowId = ref(null)
function toggleDetails(row) {
  if (!row.details) return
  openRowId.value = openRowId.value === row.id ? null : row.id
}

const headerMenu = ref({ open: false, x: 0, y: 0 })

function openHeaderMenu(e) {
  headerMenu.value = { open: true, x: e.clientX, y: e.clientY }
}

function openHeaderMenuNear(el) {
  if (!el?.getBoundingClientRect) return
  const rect = el.getBoundingClientRect()
  headerMenu.value = { open: true, x: rect.right - 10, y: rect.bottom + 8 }
}

function closeHeaderMenu() {
  headerMenu.value = { ...headerMenu.value, open: false }
}

function onGlobalKeydown(e) {
  if (e.key === 'Escape') closeHeaderMenu()
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <div class="expensesPage mainPage">
    <div class="sheetTop">
      <div class="sheetTopLeft">
        <div class="sheetTopLabel mainTitleRow">
          <span>Upcoming</span>
          <button
            type="button"
            class="columnsBtn"
            @click="openHeaderMenuNear($event.currentTarget)"
            aria-label="Columns"
            title="Columns"
          >
            ⋯
          </button>
        </div>
        <div>{{ rangeLabel }}</div>
      </div>
    </div>

    <div v-if="availableAccounts.length" class="accountFilters">
      <label v-for="acc in availableAccounts" :key="acc.account_id" class="accountFilter">
        <input v-model="selectedAccounts[String(acc.account_id)]" type="checkbox" />
        <span>{{ acc.name }}</span>
      </label>
    </div>

    <div class="tableWrap">
      <table class="sheetTable mainTable">
        <colgroup>
          <col v-for="col in visibleColumns" :key="col.key" :class="`col-${col.key}`" />
        </colgroup>
        <thead>
          <tr @contextmenu.prevent="openHeaderMenu">
            <th v-for="col in visibleColumns" :key="col.key" :class="col.thClass">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, idx) in rows" :key="row.id">
            <tr class="mainRow" @click="toggleDetails(row)">
              <td v-for="col in visibleColumns" :key="col.key" :class="col.tdClass">
                <template v-if="col.key === 'item'">
                  <div class="itemCell">
                    <span class="cellName">{{ row.item }}</span>
                    <button
                      v-if="row.details"
                      type="button"
                      class="detailsBtn"
                      :class="{ open: openRowId === row.id }"
                      @click.stop="toggleDetails(row)"
                      aria-label="Toggle details"
                      title="Details"
                    >
                      <svg
                        class="detailsIcon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 10l5 5 5-5"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </template>

                <template v-else-if="col.key === 'expense_amount'">
                  {{ formatMoney(row.expense_amount) }}
                </template>

                <template v-else-if="col.key === 'my_share'">
                  <span :class="{ neg: row.my_share < 0, pos: row.my_share > 0 }">
                    <span v-if="row.my_share != null">{{ formatMoney(row.my_share) }}</span>
                  </span>
                </template>

                <template v-else-if="col.key === 'currency'">
                  {{ row.currency }}
                </template>

                <template v-else-if="col.key === 'date'">
                  <div class="dateCell">
                    <div class="dateDay">{{ row.dayLabel }}</div>
                    <div class="dateMonth">{{ row.monthLabel }}</div>
                  </div>
                </template>

                <template v-else-if="col.key === 'bank'">
                  <img
                    v-if="bankLogo(row.account_id)"
                    class="bankLogo"
                    :src="bankLogo(row.account_id)"
                    :alt="`bank ${row.account_id}`"
                  />
                </template>

                <template v-else-if="col.key === 'account'">
                  {{ row.account_name }}
                </template>
              </td>
            </tr>

            <tr v-if="openRowId === row.id" class="detailsRow">
              <td :colspan="colSpan">
                <div class="detailsBox">{{ row.details }}</div>
              </td>
            </tr>

            <tr v-if="isMonthEndRow(idx)" class="monthEndRow">
              <td :colspan="colSpan">
                <div class="monthEndLine" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="headerMenu.open" class="ctxBackdrop" @click="closeHeaderMenu">
      <div
        class="ctxMenu"
        :style="{ left: `${headerMenu.x}px`, top: `${headerMenu.y}px` }"
        @click.stop
      >
        <div class="ctxTitle">Columns</div>
        <label v-for="col in columnDefs" :key="col.key" class="ctxItem">
          <input v-model="columns[col.key]" type="checkbox" />
          {{ col.label }}
        </label>
      </div>
    </div>
  </div>
</template>
