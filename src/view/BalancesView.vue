<script setup>
import rawAccounts from '../stores/json/account.json'
import rawBalances from '../stores/json/balance.json'
const accounts = Array.isArray(rawAccounts) ? rawAccounts : (rawAccounts?.accounts ?? [])
const balances = Array.isArray(rawBalances) ? rawBalances : (rawBalances?.balances ?? [])

</script>