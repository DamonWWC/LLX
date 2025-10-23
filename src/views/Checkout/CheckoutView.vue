<template>
  <div class="checkout-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </el-button>
        <h1 class="page-title">确认订单</h1>
        <div class="placeholder"></div>
      </div>
    </el-header>

    <!-- 收货地址卡片 -->
    <el-card class="address-card" shadow="hover" @click="selectAddress">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Location /></el-icon>
            <span class="header-title">收货地址</span>
          </div>
          <el-button type="text" class="change-btn">
            <el-icon><Edit /></el-icon>
            {{ selectedAddress ? '更换' : '选择' }}
          </el-button>
        </div>
      </template>
      
      <div v-if="selectedAddress" class="address-content">
        <div class="address-main">
          <div class="receiver-info">
            <span class="receiver-name">{{ selectedAddress.name }}</span>
            <span class="receiver-phone">{{ selectedAddress.phone }}</span>
          </div>
          <div class="address-detail">
            {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}
          </div>
        </div>
        <div class="address-actions">
          <el-tag type="success" size="small">默认地址</el-tag>
        </div>
      </div>
      
      <div v-else class="address-empty">
        <el-icon class="empty-icon"><Location /></el-icon>
        <span class="empty-text">请选择收货地址</span>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </el-card>

    <!-- 商品清单卡片 -->
    <el-card class="products-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Goods /></el-icon>
            <span class="header-title">商品清单</span>
            <el-tag size="small" type="info">{{ cartItems.length }}件商品</el-tag>
          </div>
        </div>
      </template>
      
      <div class="products-list">
        <div v-for="item in cartItems" :key="item.id" class="product-item">
          <el-image
            :src="item.image"
            :alt="item.name"
            class="product-image"
            fit="cover"
          />
          <div class="product-info">
            <h4 class="product-name">{{ item.name }}</h4>
            <div class="product-spec">{{ item.weight }}斤/{{ item.unit }}</div>
            <div class="product-price">¥{{ item.price }}/{{ item.unit }}</div>
          </div>
          <div class="product-quantity">
            <el-tag size="large" type="primary">×{{ item.quantity }}</el-tag>
          </div>
          <div class="product-subtotal">
            <span class="subtotal-label">小计</span>
            <span class="subtotal-amount">¥{{ item.subtotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 费用明细卡片 -->
    <el-card class="cost-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Money /></el-icon>
            <span class="header-title">费用明细</span>
          </div>
        </div>
      </template>
      
      <div class="cost-details">
        <div class="cost-item">
          <span class="cost-label">商品总价</span>
          <span class="cost-value">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">商品重量</span>
          <span class="cost-value">{{ totalWeight.toFixed(2) }}斤</span>
        </div>
        <div class="cost-item">
          <span class="cost-label">运费 ({{ currentShippingRate }}元/斤)</span>
          <span class="cost-value">¥{{ currentTotalShipping.toFixed(2) }}</span>
        </div>
        <el-divider />
        <div class="cost-total">
          <span class="total-label">应付总额</span>
          <span class="total-amount">¥{{ grandTotal }}</span>
        </div>
      </div>
    </el-card>

    <!-- 付款方式卡片 -->
    <el-card class="payment-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><CreditCard /></el-icon>
            <span class="header-title">付款方式</span>
          </div>
        </div>
      </template>
      
      <div class="payment-options">
        <el-radio-group v-model="paymentStatus" class="payment-group">
          <el-radio-button label="已付款" class="payment-option">
            <el-icon><Check /></el-icon>
            <span>已付款</span>
          </el-radio-button>
          <el-radio-button label="未付款" class="payment-option">
            <el-icon><Clock /></el-icon>
            <span>货到付款</span>
          </el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 底部操作栏 -->
    <el-footer class="action-bar">
      <div class="total-info">
        <div class="total-summary">
          <span class="total-label">应付总额</span>
          <span class="total-amount">¥{{ grandTotal }}</span>
        </div>
        <div class="total-detail">
          <span>共{{ totalQuantity }}件商品</span>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button 
          size="large" 
          class="save-btn"
          @click="saveOrderImage"
        >
          <el-icon><Download /></el-icon>
          保存订单
        </el-button>
        <el-button 
          type="primary" 
          size="large" 
          class="confirm-btn"
          @click="confirmOrder"
        >
          <el-icon><Check /></el-icon>
          确认下单
        </el-button>
      </div>
    </el-footer>

    <!-- 隐藏的Canvas用于生成图片 -->
    <canvas ref="orderCanvas" :width="canvasWidth" :height="canvasHeight" style="position: absolute; left: -9999px; top: -9999px;"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useAddressStore } from '@/stores/address'
import { useShipping } from '@/composables/useShipping'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { drawOrderContent } from '@/utils/canvasUtils'

const router = useRouter()
const addressStore = useAddressStore()
const orderStore = useOrderStore()
const { cartItems, totalPrice, totalWeight, clearCart } = useCart()
const { currentShippingRate, currentTotalShipping, updateShipping } = useShipping()

const paymentStatus = ref('未付款')
const orderCanvas = ref(null)
const canvasWidth = ref(375)
const canvasHeight = ref(600)

const selectedAddress = computed(() => addressStore.selectedAddress)
const totalQuantity = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

const grandTotal = computed(() => {
  return (totalPrice.value + currentTotalShipping.value).toFixed(2)
})

// 监听地址和总重量变化，更新运费
watch([selectedAddress, totalWeight], ([newAddress, newWeight]) => {
  if (newAddress && newAddress.province) {
    updateShipping(newWeight, newAddress.province)
  } else {
    updateShipping(newWeight, '')
  }
}, { immediate: true })

onMounted(() => {
  addressStore.loadAddresses()
  if (selectedAddress.value && selectedAddress.value.province) {
    updateShipping(totalWeight.value, selectedAddress.value.province)
  }
})

const goBack = () => {
  router.back()
}

const selectAddress = () => {
  router.push('/address?from=checkout')
}

const confirmOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请先选择收货地址')
    return
  }

  await ElMessageBox.confirm(
    `收货人：${selectedAddress.value.name}\n电话：${selectedAddress.value.phone}\n总金额：¥${grandTotal.value}`,
    '订单确认',
    {
      confirmButtonText: '确认下单',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      const orderStatus = paymentStatus.value === '已付款' ? '待发货' : '待付款'
      const newOrder = {
        id: Date.now(),
        orderNo: 'ORD' + Date.now(),
        products: cartItems.value.map(item => ({ ...item })),
        address: { ...selectedAddress.value },
        totalRicePrice: totalPrice.value.toFixed(2),
        totalWeight: totalWeight.value.toFixed(2),
        shippingRate: currentShippingRate.value.toFixed(2),
        totalShipping: currentTotalShipping.value.toFixed(2),
        grandTotal: grandTotal.value,
        paymentStatus: paymentStatus.value,
        status: orderStatus,
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      }

      orderStore.addOrder(newOrder)
      ElMessage.success('下单成功！')
      clearCart()

      await ElMessageBox.alert('订单已生成，可在"订单管理"页面查看', '提示', {
        confirmButtonText: '好的',
        type: 'success',
      })
      router.replace('/orders')
    })
    .catch(() => {
      ElMessage.info('已取消下单')
    })
}

const saveOrderImage = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请先选择收货地址')
    return
  }

  ElMessage.info('正在生成订单图片...')
  const orderToDraw = {
    id: Date.now(),
    orderNo: 'PREVIEW' + Date.now(),
    products: cartItems.value.map(item => ({ ...item })),
    address: { ...selectedAddress.value },
    totalRicePrice: totalPrice.value.toFixed(2),
    totalWeight: totalWeight.value.toFixed(2),
    shippingRate: currentShippingRate.value.toFixed(2),
    totalShipping: currentTotalShipping.value.toFixed(2),
    grandTotal: grandTotal.value,
    paymentStatus: paymentStatus.value,
    status: paymentStatus.value === '已付款' ? '待发货' : '待付款',
    createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
  }

  try {
    const canvas = orderCanvas.value
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    let estimatedHeight = Math.max(600, 800 + orderToDraw.products.length * 100)
    canvas.width = canvasWidth.value * dpr
    canvas.height = estimatedHeight * dpr
    ctx.scale(dpr, dpr)
    const actualHeight = await drawOrderContent(ctx, orderToDraw, canvasWidth.value, estimatedHeight)

    canvas.height = actualHeight * dpr
    ctx.scale(dpr, dpr)
    await drawOrderContent(ctx, orderToDraw, canvasWidth.value, actualHeight)

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `订单_${orderToDraw.orderNo}.png`
    link.click()
    ElMessage.success('订单图片已保存到本地')
  } catch (error) {
    console.error('生成订单图片失败', error)
    ElMessage.error('生成订单图片失败')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.checkout-container {
  min-height: 100vh;
  @include flex-column;
  background-color: $bg-secondary;
}

.header {
  background: $bg-primary;
  border-bottom: 1px solid $border-light;
  padding: 0;
  height: 60px;
  @include flex-center;
  box-shadow: $shadow-light;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  @include flex-between;
  padding: 0 $spacing-xl;
  
  @include respond-to(sm) {
    padding: 0 $spacing-lg;
  }
}

.back-btn {
  @include flex-center;
  gap: $spacing-xs;
  color: $text-primary;
  
  .back-text {
    @include respond-to(sm) {
      display: none;
    }
  }
}

.page-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $text-primary;
}

.placeholder {
  width: 40px;
}

.checkout-content {
  flex: 1;
  padding: $spacing-xl;
  overflow-y: auto;
  
  @include respond-to(sm) {
    padding: $spacing-lg;
  }
}

.address-card,
.products-card,
.cost-card,
.payment-card {
  margin-bottom: $spacing-lg;
  border-radius: $border-radius-large;
  overflow: hidden;
}

.card-header {
  @include flex-between;
  align-items: center;
}

.header-left {
  @include flex-center;
  gap: $spacing-sm;
}

.header-icon {
  font-size: $font-size-lg;
  color: $primary-color;
}

.header-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.change-btn {
  @include flex-center;
  gap: $spacing-xs;
  color: $primary-color;
}

.address-content {
  @include flex-between;
  align-items: flex-start;
}

.address-main {
  flex: 1;
}

.receiver-info {
  @include flex-center;
  gap: $spacing-lg;
  margin-bottom: $spacing-sm;
}

.receiver-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.receiver-phone {
  font-size: $font-size-base;
  color: $text-regular;
}

.address-detail {
  font-size: $font-size-base;
  color: $text-regular;
  line-height: $line-height-base;
}

.address-empty {
  @include flex-center;
  gap: $spacing-md;
  padding: $spacing-xl 0;
  color: $text-secondary;
  cursor: pointer;
  
  .empty-icon {
    font-size: $font-size-xxl;
  }
  
  .empty-text {
    font-size: $font-size-base;
  }
  
  .arrow-icon {
    margin-left: auto;
  }
}

.products-list {
  @include flex-column;
  gap: $spacing-lg;
}

.product-item {
  @include flex-center;
  gap: $spacing-lg;
  padding: $spacing-md 0;
  border-bottom: 1px solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: $border-radius-base;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  @include flex-column;
  gap: $spacing-xs;
}

.product-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0;
  @include text-ellipsis;
}

.product-spec {
  font-size: $font-size-sm;
  color: $text-regular;
}

.product-price {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: $font-weight-semibold;
}

.product-quantity {
  @include flex-center;
}

.product-subtotal {
  @include flex-column;
  align-items: flex-end;
  min-width: 80px;
  
  .subtotal-label {
    font-size: $font-size-xs;
    color: $text-regular;
  }
  
  .subtotal-amount {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $primary-color;
  }
}

.cost-details {
  @include flex-column;
  gap: $spacing-md;
}

.cost-item {
  @include flex-between;
  font-size: $font-size-base;
  color: $text-regular;
}

.cost-total {
  @include flex-between;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.total-amount {
  color: $primary-color;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
}

.payment-options {
  padding: $spacing-md 0;
}

.payment-group {
  width: 100%;
  @include flex-center;
  gap: $spacing-lg;
}

.payment-option {
  flex: 1;
  @include flex-center;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border-radius: $border-radius-base;
  border: 2px solid $border-light;
  transition: all $transition-base $ease-out;
  
  &:hover {
    border-color: $primary-color;
  }
  
  &.is-active {
    border-color: $primary-color;
    background: rgba(255, 96, 52, 0.05);
  }
}

.action-bar {
  background: $bg-primary;
  border-top: 1px solid $border-light;
  padding: $spacing-lg $spacing-xl;
  height: auto;
  @include flex-between;
  box-shadow: $shadow-light;
  
  @include respond-to(sm) {
    padding: $spacing-md $spacing-lg;
  }
}

.total-info {
  @include flex-column;
  gap: $spacing-xs;
}

.total-summary {
  @include flex-center;
  gap: $spacing-md;
  justify-content: flex-start;
  
  .total-label {
    font-size: $font-size-base;
    color: $text-regular;
  }
  
  .total-amount {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $primary-color;
  }
}

.total-detail {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.action-buttons {
  @include flex-center;
  gap: $spacing-md;
  
  @include respond-to(sm) {
    gap: $spacing-sm;
  }
}

.save-btn {
  @include button-secondary;
  padding: $spacing-md $spacing-xl;
  
  @include respond-to(sm) {
    padding: $spacing-sm $spacing-lg;
  }
}

.confirm-btn {
  @include button-primary;
  padding: $spacing-md $spacing-xxl;
  min-width: 120px;
  
  @include respond-to(sm) {
    padding: $spacing-sm $spacing-xl;
    min-width: 100px;
  }
}
</style>