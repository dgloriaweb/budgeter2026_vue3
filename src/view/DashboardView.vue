<template>
  <div class="page dashboardPage">
    <header class="topbar">
      <div>Header here</div>
    </header>
    <hr />
    <SummaryCard />
    <hr />
    <!-- Embedded Component Card -->
    <AccountBalancesCard />
    <hr />
    <!-- Log a paid bill Card -->
    <PayBillCard />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../api/api.js'
import AccountBalancesCard from '@/components/AccountBalancesCard.vue'
import PayBillCard from '@/components/PayBillCard.vue'
import SummaryCard from '@/components/SummaryCard.vue'
</script>
