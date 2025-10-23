<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useAddressStore } from '@/stores/address'

const productStore = useProductStore()
const orderStore = useOrderStore()
const addressStore = useAddressStore()

onMounted(() => {
  // 初始化数据
  productStore.loadProducts()
  orderStore.loadOrders()
  addressStore.loadAddresses()
})
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: $bg-secondary;
  color: $text-primary;
  line-height: $line-height-base;
}

#app {
  min-height: 100vh;
}

// 全局样式
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-xl;
  
  @include respond-to(sm) {
    padding: 0 $spacing-lg;
  }
}

.card {
  @include card;
}

.btn-primary {
  @include button-primary;
}

.btn-secondary {
  @include button-secondary;
}

// 全局动画类
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-base $ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all $transition-base $ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 工具类
.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-ellipsis {
  @include text-ellipsis;
}

.flex-center {
  @include flex-center;
}

.flex-between {
  @include flex-between;
}

.flex-column {
  @include flex-column;
}

// 间距工具类
@for $i from 0 through 5 {
  .m-#{$i} {
    margin: #{$i * $spacing-sm};
  }
  
  .p-#{$i} {
    padding: #{$i * $spacing-sm};
  }
  
  .mt-#{$i} {
    margin-top: #{$i * $spacing-sm};
  }
  
  .mb-#{$i} {
    margin-bottom: #{$i * $spacing-sm};
  }
  
  .ml-#{$i} {
    margin-left: #{$i * $spacing-sm};
  }
  
  .mr-#{$i} {
    margin-right: #{$i * $spacing-sm};
  }
  
  .pt-#{$i} {
    padding-top: #{$i * $spacing-sm};
  }
  
  .pb-#{$i} {
    padding-bottom: #{$i * $spacing-sm};
  }
  
  .pl-#{$i} {
    padding-left: #{$i * $spacing-sm};
  }
  
  .pr-#{$i} {
    padding-right: #{$i * $spacing-sm};
  }
}
</style>
