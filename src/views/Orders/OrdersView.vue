<template>
  <div class="orders-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </el-button>
        <h1 class="page-title">订单管理</h1>
        <div class="header-actions">
          <el-button 
            v-if="!isMultiSelectMode" 
            type="text" 
            @click="toggleMultiSelectMode"
            class="multi-select-btn"
          >
            <el-icon><Check /></el-icon>
            多选
          </el-button>
          <el-button 
            v-else 
            type="text" 
            @click="toggleMultiSelectMode"
            class="multi-select-btn"
          >
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索收货人姓名或电话"
          clearable
          class="search-input"
          @input="onSearchInput"
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="filter-tabs">
        <el-button
          v-for="status in statusOptions"
          :key="status.value"
          :type="filterStatus === status.value ? 'primary' : ''"
          size="small"
          @click="filterByStatus(status.value)"
          class="filter-tab"
        >
          <el-icon><component :is="status.icon" /></el-icon>
          {{ status.label }}
        </el-button>
      </div>
    </div>

    <!-- 多选模式信息栏 -->
    <div v-if="isMultiSelectMode" class="multi-select-info">
      <div class="selected-info">
        <el-icon><Check /></el-icon>
        <span>已选择 {{ selectedOrders.length }} 个订单</span>
      </div>
      <div class="total-amount">
        总金额: ¥{{ totalAmount }}
      </div>
      <el-button 
        type="danger" 
        size="small" 
        :disabled="selectedOrders.length === 0"
        @click="batchDeleteOrders"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 订单列表 -->
    <el-main class="orders-content">
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="filteredOrderList.length === 0" class="empty-state">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="goToHome">
            <el-icon><Shop /></el-icon>
            去购物
          </el-button>
        </el-empty>
      </div>

      <div v-else class="orders-list">
        <el-card
          v-for="order in filteredOrderList"
          :key="order.id"
          class="order-card"
          :class="{ 'selected': order.selected }"
          shadow="hover"
          @click="viewOrderDetail(order.id)"
        >
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <div class="order-no">{{ order.orderNo }}</div>
              <div class="order-time">{{ order.createTime }}</div>
            </div>
            <div class="order-status">
              <el-tag :type="getStatusTagType(order.status)" size="large">
                {{ order.status }}
              </el-tag>
            </div>
            <el-checkbox
              v-if="isMultiSelectMode"
              v-model="order.selected"
              @click.stop="toggleOrderSelection(order.id)"
              class="order-checkbox"
            />
          </div>

          <!-- 收货信息 -->
          <div class="address-section">
            <div class="address-header">
              <el-icon class="address-icon"><Location /></el-icon>
              <span class="address-label">收货信息</span>
            </div>
            <div class="address-content">
              <div class="receiver-info">
                <span class="receiver-name">{{ order.address.name }}</span>
                <span class="receiver-phone">{{ order.address.phone }}</span>
              </div>
              <div class="address-detail">
                {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}
              </div>
            </div>
          </div>

          <!-- 商品信息 -->
          <div class="products-section">
            <div class="products-header">
              <el-icon class="products-icon"><Goods /></el-icon>
              <span class="products-label">商品信息</span>
            </div>
            <div class="products-list">
              <div v-for="(product, index) in order.products.slice(0, 3)" :key="index" class="product-item">
                <el-image
                  :src="product.image"
                  :alt="product.name"
                  class="product-image"
                  fit="cover"
                />
                <div class="product-info">
                  <div class="product-name">{{ product.name }}</div>
                  <div class="product-spec">{{ product.weight }}斤/{{ product.unit }}</div>
                </div>
                <div class="product-quantity">×{{ product.quantity }}</div>
              </div>
              <div v-if="order.products.length > 3" class="more-products">
                等{{ order.products.length }}件商品
              </div>
            </div>
          </div>

          <!-- 价格信息 -->
          <div class="price-section">
            <div class="price-row">
              <span class="price-label">商品总价</span>
              <span class="price-value">¥{{ order.totalRicePrice }}</span>
            </div>
            <div class="price-row">
              <span class="price-label">运费</span>
              <span class="price-value">¥{{ order.totalShipping }}</span>
            </div>
            <el-divider />
            <div class="price-total">
              <span class="total-label">实付金额</span>
              <span class="total-amount">¥{{ order.grandTotal }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="order-actions" @click.stop="preventBubble">
            <div class="action-buttons">
              <el-button
                v-if="order.status === '待付款'"
                type="success"
                size="small"
                @click="updateOrderStatus(order.id, order.status)"
              >
                <el-icon><Check /></el-icon>
                确认付款
              </el-button>
              <el-button
                v-if="order.status === '待发货'"
                type="warning"
                size="small"
                @click="updateOrderStatus(order.id, order.status)"
              >
                <el-icon><Truck /></el-icon>
                确认发货
              </el-button>
              <el-button
                v-if="order.status === '已发货'"
                type="primary"
                size="small"
                @click="editTrackingNumber(order.id)"
              >
                <el-icon><Edit /></el-icon>
                {{ order.trackingNumber ? '修改单号' : '添加单号' }}
              </el-button>
            </div>
            
            <el-dropdown @command="(command) => handleOrderCommand(command, order)" trigger="click">
              <el-button type="text" size="small" class="more-btn">
                <el-icon><MoreFilled /></el-icon>
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="exportOrder">
                    <el-icon><Download /></el-icon>
                    导出订单图片
                  </el-dropdown-item>
                  <el-dropdown-item command="exportShipping">
                    <el-icon><Document /></el-icon>
                    导出发货单
                  </el-dropdown-item>
                  <el-dropdown-item command="shareOrder">
                    <el-icon><Share /></el-icon>
                    分享订单
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除订单
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-card>
      </div>
    </el-main>

    <!-- 隐藏的Canvas用于生成图片 -->
    <canvas ref="orderCanvas" :width="canvasWidth" :height="canvasHeight" style="position: absolute; left: -9999px; top: -9999px;"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { drawOrderContent } from '@/utils/canvasUtils'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const searchKeyword = ref('')
const filterStatus = ref('')
const pageTitle = ref('订单管理')
const isMultiSelectMode = ref(false)
const selectedOrders = ref([])
const totalAmount = ref(0)
const isLoading = ref(false)

const orderCanvas = ref(null)
const canvasWidth = ref(375)
const canvasHeight = ref(600)

// 状态选项
const statusOptions = ref([
  { value: '', label: '全部', icon: 'List' },
  { value: '待付款', label: '待付款', icon: 'Clock' },
  { value: '待发货', label: '待发货', icon: 'Box' },
  { value: '已发货', label: '已发货', icon: 'Truck' }
])

const allOrders = computed(() => orderStore.orders)

const filteredOrderList = computed(() => {
  let list = allOrders.value

  // 按状态过滤
  if (filterStatus.value) {
    list = list.filter(order => (order.status || '').trim() === filterStatus.value.trim())
  }

  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(order => {
      const name = (order.address?.name || '').toLowerCase()
      const phone = (order.address?.phone || '').toLowerCase()
      return name.includes(keyword) || phone.includes(keyword)
    })
  }

  // 为多选模式添加 selected 属性
  return list.map(order => ({
    ...order,
    selected: selectedOrders.value.some(selected => selected.id === order.id)
  }))
})

onMounted(() => {
  if (route.query.status) {
    filterStatus.value = decodeURIComponent(route.query.status)
    pageTitle.value = filterStatus.value
  }
  orderStore.loadOrders()
})

watch(selectedOrders, (newVal) => {
  totalAmount.value = newVal.reduce((sum, order) => sum + (parseFloat(order.grandTotal) || 0), 0).toFixed(2)
}, { deep: true })

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/')
}

const getStatusTagType = (status) => {
  switch ((status || '').trim()) {
    case '待付款': return 'danger'
    case '待发货': return 'warning'
    case '已发货': return 'success'
    default: return 'info'
  }
}

const viewOrderDetail = (orderId) => {
  if (!isMultiSelectMode.value) {
    router.push(`/order-detail/${orderId}`)
  }
}

const preventBubble = () => {
  // 阻止事件冒泡
}

const toggleMultiSelectMode = () => {
  isMultiSelectMode.value = !isMultiSelectMode.value
  if (!isMultiSelectMode.value) {
    selectedOrders.value = []
  }
}

const toggleOrderSelection = (orderId) => {
  const index = selectedOrders.value.findIndex(order => order.id === orderId)
  const order = allOrders.value.find(o => o.id === orderId)
  if (order) {
    if (index === -1) {
      selectedOrders.value.push(order)
    } else {
      selectedOrders.value.splice(index, 1)
    }
  }
}

const onSearchInput = (value) => {
  searchKeyword.value = value
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const filterByStatus = (status) => {
  filterStatus.value = status
}

const updateOrderStatus = async (orderId, currentStatus) => {
  let newStatus = ''
  let confirmContent = ''
  let paymentStatus = null
  let trackingNumber = null
  let shippingTime = null

  switch ((currentStatus || '').trim()) {
    case '待付款':
      newStatus = '待发货'
      confirmContent = '确认该订单已付款？'
      paymentStatus = '已付款'
      break
    case '待发货':
      newStatus = '已发货'
      confirmContent = '请输入快递单号（可选）'
      try {
        const { value } = await ElMessageBox.prompt(confirmContent, '确认发货', {
          confirmButtonText: '确认发货',
          cancelButtonText: '暂不发货',
          inputPlaceholder: '请输入快递单号',
          showClose: false,
        })
        trackingNumber = value || ''
        shippingTime = new Date().toLocaleString('zh-CN', { hour12: false })
      } catch (action) {
        ElMessage.info('已取消发货')
        return
      }
      break
    default:
      ElMessage.warning('当前状态无法更新')
      return
  }

  if (currentStatus !== '待发货') {
    try {
      await ElMessageBox.confirm(confirmContent, '状态更新', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      })
    } catch (action) {
      ElMessage.info('已取消操作')
      return
    }
  }

  orderStore.updateOrderStatus(orderId, newStatus, paymentStatus, trackingNumber, shippingTime)
  ElMessage.success('订单状态更新成功')
}

const editTrackingNumber = async (orderId) => {
  const order = allOrders.value.find(o => o.id === orderId)
  if (!order) return

  const currentTracking = order.trackingNumber || ''
  const title = currentTracking ? '修改快递单号' : '添加快递单号'

  try {
    const { value } = await ElMessageBox.prompt('请输入快递单号', title, {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValue: currentTracking,
      inputPlaceholder: '请输入快递单号',
      showClose: false,
    })
    orderStore.updateOrderStatus(orderId, order.status, order.paymentStatus, value || '', order.shippingTime || new Date().toLocaleString('zh-CN', { hour12: false }))
    ElMessage.success('快递单号已保存')
  } catch (action) {
    ElMessage.info('已取消操作')
  }
}

const handleOrderCommand = (command, order) => {
  switch (command) {
    case 'exportOrder':
      exportOrderImage(order)
      break
    case 'exportShipping':
      exportShippingList(order)
      break
    case 'shareOrder':
      shareOrder(order)
      break
    case 'delete':
      deleteOrder(order.id)
      break
  }
}

const deleteOrder = async (orderId) => {
  await ElMessageBox.confirm('确定要删除这个订单吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      orderStore.deleteOrder(orderId)
      ElMessage.success('订单删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

const batchDeleteOrders = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要删除的订单')
    return
  }
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedOrders.value.length} 个订单吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      selectedOrders.value.forEach(order => orderStore.deleteOrder(order.id))
      selectedOrders.value = []
      isMultiSelectMode.value = false
      ElMessage.success('批量删除成功')
    })
    .catch(() => {
      ElMessage.info('已取消批量删除')
    })
}

const exportOrderImage = async (order) => {
  ElMessage.info('正在生成订单图片...')
  try {
    const canvas = orderCanvas.value
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    let estimatedHeight = Math.max(600, 800 + order.products.length * 100)
    canvas.width = canvasWidth.value * dpr
    canvas.height = estimatedHeight * dpr
    ctx.scale(dpr, dpr)
    const actualHeight = await drawOrderContent(ctx, order, canvasWidth.value, estimatedHeight, true)

    canvas.height = actualHeight * dpr
    ctx.scale(dpr, dpr)
    await drawOrderContent(ctx, order, canvasWidth.value, actualHeight, true)

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `订单_${order.orderNo}.png`
    link.click()
    ElMessage.success('订单图片已保存到本地')
  } catch (error) {
    console.error('生成订单图片失败', error)
    ElMessage.error('生成订单图片失败')
  }
}

const exportShippingList = async (order) => {
  ElMessage.info('正在生成发货单...')
  try {
    const canvas = orderCanvas.value
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    let estimatedHeight = Math.max(600, 900 + order.products.length * 120)
    canvas.width = canvasWidth.value * dpr
    canvas.height = estimatedHeight * dpr
    ctx.scale(dpr, dpr)
    const actualHeight = await drawOrderContent(ctx, order, canvasWidth.value, estimatedHeight, false)

    canvas.height = actualHeight * dpr
    ctx.scale(dpr, dpr)
    await drawOrderContent(ctx, order, canvasWidth.value, actualHeight, false)

    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = image
    link.download = `发货单_${order.orderNo}.png`
    link.click()
    ElMessage.success('发货单已保存到本地')
  } catch (error) {
    console.error('生成发货单失败', error)
    ElMessage.error('生成发货单失败')
  }
}

const shareOrder = async (order) => {
  ElMessage.info('正在生成分享图片...')
  try {
    const canvas = orderCanvas.value
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    let estimatedHeight = Math.max(600, 800 + order.products.length * 100)
    canvas.width = canvasWidth.value * dpr
    canvas.height = estimatedHeight * dpr
    ctx.scale(dpr, dpr)
    const actualHeight = await drawOrderContent(ctx, order, canvasWidth.value, estimatedHeight, true)

    canvas.height = actualHeight * dpr
    ctx.scale(dpr, dpr)
    await drawOrderContent(ctx, order, canvasWidth.value, actualHeight, true)

    const image = canvas.toDataURL('image/png')
    ElMessageBox.alert(`<img src="${image}" style="width: 100%; max-width: 300px;"/>`, '分享订单图片 (模拟)', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭',
    })
    ElMessage.success('分享图片已生成 (模拟)')
  } catch (error) {
    console.error('生成分享图片失败', error)
    ElMessage.error('生成分享图片失败')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.orders-container {
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

.header-actions {
  @include flex-center;
}

.multi-select-btn {
  @include flex-center;
  gap: $spacing-xs;
  color: $text-primary;
}

.search-section {
  background: $bg-primary;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $border-light;
  
  @include respond-to(sm) {
    padding: $spacing-md $spacing-lg;
  }
}

.search-container {
  margin-bottom: $spacing-lg;
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.filter-tabs {
  @include flex-center;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.filter-tab {
  @include flex-center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-large;
  transition: all $transition-base $ease-out;
  
  &:hover {
    background: $bg-tertiary;
  }
}

.multi-select-info {
  background: #e6f7ff;
  padding: $spacing-md $spacing-xl;
  @include flex-between;
  border-bottom: 1px solid #91d5ff;
  
  @include respond-to(sm) {
    padding: $spacing-sm $spacing-lg;
  }
}

.selected-info {
  @include flex-center;
  gap: $spacing-sm;
  color: #1890ff;
  font-weight: $font-weight-semibold;
}

.total-amount {
  font-size: $font-size-base;
  color: $primary-color;
  font-weight: $font-weight-bold;
}

.orders-content {
  flex: 1;
  padding: $spacing-xl;
  overflow-y: auto;
  
  @include respond-to(sm) {
    padding: $spacing-lg;
  }
}

.loading-container {
  padding: $spacing-xl 0;
}

.empty-state {
  @include flex-center;
  min-height: 300px;
}

.orders-list {
  @include flex-column;
  gap: $spacing-lg;
}

.order-card {
  transition: all $transition-base $ease-out;
  cursor: pointer;
  border-radius: $border-radius-large;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
  
  &.selected {
    border: 2px solid #1890ff;
    background-color: #f6ffed;
  }
}

.order-header {
  @include flex-between;
  align-items: flex-start;
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-md;
  border-bottom: 1px solid $border-light;
}

.order-info {
  flex: 1;
}

.order-no {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.order-time {
  font-size: $font-size-sm;
  color: $text-regular;
}

.order-status {
  flex-shrink: 0;
  margin-left: $spacing-lg;
}

.order-checkbox {
  margin-left: $spacing-md;
}

.address-section,
.products-section {
  margin-bottom: $spacing-lg;
}

.address-header,
.products-header {
  @include flex-center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
  
  .address-icon,
  .products-icon {
    font-size: $font-size-base;
    color: $primary-color;
  }
  
  .address-label,
  .products-label {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $text-regular;
  }
}

.address-content {
  padding-left: $spacing-lg;
}

.receiver-info {
  @include flex-center;
  gap: $spacing-lg;
  margin-bottom: $spacing-xs;
}

.receiver-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.receiver-phone {
  font-size: $font-size-base;
  color: $text-regular;
}

.address-detail {
  font-size: $font-size-sm;
  color: $text-regular;
  line-height: $line-height-base;
}

.products-list {
  padding-left: $spacing-lg;
  @include flex-column;
  gap: $spacing-md;
}

.product-item {
  @include flex-center;
  gap: $spacing-md;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $border-light;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: $border-radius-small;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  @include flex-column;
  gap: 2px;
}

.product-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  @include text-ellipsis;
}

.product-spec {
  font-size: $font-size-xs;
  color: $text-regular;
}

.product-quantity {
  font-size: $font-size-sm;
  color: $text-regular;
  font-weight: $font-weight-semibold;
}

.more-products {
  font-size: $font-size-xs;
  color: $text-secondary;
  text-align: center;
  padding: $spacing-sm 0;
}

.price-section {
  background: $bg-tertiary;
  padding: $spacing-md;
  border-radius: $border-radius-base;
  margin-bottom: $spacing-lg;
}

.price-row {
  @include flex-between;
  font-size: $font-size-sm;
  color: $text-regular;
  margin-bottom: $spacing-xs;
}

.price-total {
  @include flex-between;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.total-amount {
  color: $primary-color;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
}

.order-actions {
  @include flex-between;
  align-items: center;
  padding-top: $spacing-md;
  border-top: 1px solid $border-light;
}

.action-buttons {
  @include flex-center;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.more-btn {
  color: $text-regular;
  
  &:hover {
    color: $primary-color;
  }
}

@include respond-to(sm) {
  .order-header {
    @include flex-column;
    gap: $spacing-sm;
    align-items: flex-start;
  }
  
  .order-status {
    margin-left: 0;
  }
  
  .order-actions {
    @include flex-column;
    gap: $spacing-md;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>