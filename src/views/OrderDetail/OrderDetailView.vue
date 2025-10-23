<template>
  <div class="order-detail-container">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-content">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">订单详情</h1>
        <div class="placeholder"></div>
      </div>
    </el-header>

    <el-main class="order-detail-content" v-if="order">
      <!-- 订单基本信息 -->
      <el-card class="order-info-card">
        <template #header>
          <span>订单信息</span>
        </template>
        
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ order.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(order.status)">
              {{ order.status }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">付款状态：</span>
            <span class="value">{{ order.paymentStatus }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span class="value">{{ order.createTime }}</span>
          </div>
          <div v-if="order.trackingNumber" class="info-item">
            <span class="label">快递单号：</span>
            <span class="value">{{ order.trackingNumber }}</span>
          </div>
          <div v-if="order.shippingTime" class="info-item">
            <span class="label">发货时间：</span>
            <span class="value">{{ order.shippingTime }}</span>
          </div>
        </div>
      </el-card>

      <!-- 收货信息 -->
      <el-card class="address-card">
        <template #header>
          <span>收货信息</span>
        </template>
        
        <div class="address-info">
          <div class="address-header">
            <span class="name">{{ order.address.name }}</span>
            <span class="phone">{{ order.address.phone }}</span>
          </div>
          <div class="address-detail">
            {{ order.address.province }} {{ order.address.city }} {{ order.address.district }} {{ order.address.detail }}
          </div>
        </div>
      </el-card>

      <!-- 商品明细 -->
      <el-card class="products-card">
        <template #header>
          <span>商品明细</span>
        </template>
        
        <div class="product-item" v-for="(item, index) in order.products" :key="item.id">
          <div class="product-info">
            <div class="product-name">{{ index + 1 }}. {{ item.name }}</div>
            <div class="product-spec">（{{ item.weight }}斤/{{ item.unit }}）单价：{{ item.price }}元</div>
            <div class="product-detail">
              数量：{{ item.quantity }}{{ item.unit }} ，总重：{{ item.quantity * item.weight }}斤 ，总价：{{ item.subtotal }}元
            </div>
          </div>
        </div>
      </el-card>

      <!-- 费用明细 -->
      <el-card class="cost-card">
        <template #header>
          <span>费用明细</span>
        </template>
        
        <div class="cost-item">
          <span>商品总价</span>
          <span>¥{{ order.totalRicePrice }}</span>
        </div>
        
        <div v-if="order.totalWeight" class="cost-item">
          <span>总重量</span>
          <span>{{ order.totalWeight }}斤</span>
        </div>
        
        <div v-if="order.shippingRate && order.totalShipping" class="cost-item">
          <span>运费 ({{ order.shippingRate }}元/斤)</span>
          <span>¥{{ order.totalShipping }}</span>
        </div>
        
        <el-divider />
        
        <div class="cost-total">
          <span>实付款</span>
          <span class="total-amount">¥{{ order.grandTotal }}</span>
        </div>
      </el-card>
    </el-main>

    <!-- 底部操作栏 -->
    <el-footer class="action-bar" v-if="order">
      <div class="action-buttons">
        <el-button @click="exportOrder" type="primary">
          <el-icon><Download /></el-icon>
          导出订单
        </el-button>
        
        <el-button @click="exportShippingList" type="success">
          <el-icon><Document /></el-icon>
          导出发货单
        </el-button>
        
        <el-button @click="shareOrder" type="info">
          <el-icon><Share /></el-icon>
          分享订单
        </el-button>
      </div>
    </el-footer>

    <!-- 加载状态 -->
    <div v-if="!order" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { generateOrderImage, downloadImage } from '@/utils/canvasUtils'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

const order = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待付款': 'warning',
    '待发货': 'primary',
    '已发货': 'success'
  }
  return typeMap[status] || 'info'
}

// 导出订单
const exportOrder = async () => {
  if (!order.value) return

  try {
    ElMessage.info('正在生成订单图片...')
    const dataURL = await generateOrderImage(order.value, 'order')
    const filename = `订单_${order.value.orderNo}_${new Date().toISOString().slice(0, 10)}.png`
    downloadImage(dataURL, filename)
    ElMessage.success('订单图片已下载')
  } catch (error) {
    console.error('导出订单失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导出发货单
const exportShippingList = async () => {
  if (!order.value) return

  try {
    ElMessage.info('正在生成发货单...')
    const dataURL = await generateOrderImage(order.value, 'shipping')
    const filename = `发货单_${order.value.orderNo}_${new Date().toISOString().slice(0, 10)}.png`
    downloadImage(dataURL, filename)
    ElMessage.success('发货单已下载')
  } catch (error) {
    console.error('导出发货单失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 分享订单
const shareOrder = async () => {
  if (!order.value) return

  try {
    ElMessage.info('正在生成分享图片...')
    const dataURL = await generateOrderImage(order.value, 'order')
    
    // 创建分享链接
    const shareUrl = `${window.location.origin}/order-detail/${order.value.id}`
    
    // 如果支持Web Share API
    if (navigator.share) {
      await navigator.share({
        title: `订单详情 - ${order.value.orderNo}`,
        text: `查看我的订单详情`,
        url: shareUrl
      })
    } else {
      // 复制链接到剪贴板
      await navigator.clipboard.writeText(shareUrl)
      ElMessage.success('订单链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('分享订单失败:', error)
    ElMessage.error('分享失败，请重试')
  }
}

onMounted(() => {
  const orderId = parseInt(route.params.id)
  if (orderId) {
    order.value = orderStore.orderList.find(o => o.id === orderId)
    if (!order.value) {
      ElMessage.error('订单不存在')
      router.back()
    }
  }
})
</script>

<style scoped>
.order-detail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  background: white;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
  height: 60px;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.back-btn {
  font-size: 20px;
  color: #333;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.placeholder {
  width: 40px;
}

.order-detail-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.order-info-card,
.address-card,
.products-card,
.cost-card {
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.value {
  font-size: 14px;
  color: #333;
}

.address-info {
  padding: 12px 0;
}

.address-header {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.phone {
  font-size: 16px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.product-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.product-spec {
  font-size: 14px;
  color: #666;
}

.product-detail {
  font-size: 14px;
  color: #999;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.total-amount {
  color: #ff6034;
  font-size: 18px;
}

.action-bar {
  background: white;
  border-top: 1px solid #e8e8e8;
  padding: 16px 20px;
  height: auto;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.loading-container {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .order-detail-content {
    padding: 16px;
  }
  
  .action-bar {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
