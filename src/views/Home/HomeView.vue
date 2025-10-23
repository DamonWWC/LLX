<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <el-icon class="logo-icon"><Shop /></el-icon>
            <span class="logo-text">林龍香大米商城</span>
          </div>
        </div>
        
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索大米品种..."
            class="search-input"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand" trigger="click" placement="bottom-end">
            <el-button type="text" class="tool-btn">
              <el-icon><Setting /></el-icon>
              <span class="btn-text">管理</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  {{ isEditMode ? '完成编辑' : '编辑商品' }}
                </el-dropdown-item>
                <el-dropdown-item command="add">
                  <el-icon><Plus /></el-icon>
                  添加品种
                </el-dropdown-item>
                <el-dropdown-item command="reset" divided>
                  <el-icon><Refresh /></el-icon>
                  恢复默认
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 轮播图区域 -->
    <div class="banner-section">
      <el-carousel height="200px" indicator-position="outside" arrow="hover">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ background: banner.background }">
            <div class="banner-content">
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
              <el-button type="primary" size="large" class="banner-btn">
                {{ banner.buttonText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 快捷功能区 -->
    <div class="quick-actions">
      <div class="action-item" @click="goToOrders">
        <el-icon class="action-icon"><List /></el-icon>
        <span class="action-text">订单管理</span>
      </div>
      <div class="action-item" @click="goToAddress">
        <el-icon class="action-icon"><Location /></el-icon>
        <span class="action-text">收货地址</span>
      </div>
      <div class="action-item" @click="goToShipping">
        <el-icon class="action-icon"><Truck /></el-icon>
        <span class="action-text">运费标准</span>
      </div>
      <div class="action-item" @click="handleCommand('add')">
        <el-icon class="action-icon"><Plus /></el-icon>
        <span class="action-text">添加商品</span>
      </div>
    </div>

    <!-- 商品列表区域 -->
    <el-main class="product-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Goods /></el-icon>
          精选大米
        </h3>
        <div class="section-actions">
          <el-button-group>
            <el-button 
              :type="viewMode === 'grid' ? 'primary' : ''" 
              @click="viewMode = 'grid'"
              size="small"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button 
              :type="viewMode === 'list' ? 'primary' : ''" 
              @click="viewMode = 'list'"
              size="small"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>

      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="isEmpty" class="empty-state">
        <el-empty description="暂无商品">
          <el-button type="primary" @click="handleCommand('add')">
            <el-icon><Plus /></el-icon>
            添加商品
          </el-button>
        </el-empty>
      </div>

      <div v-else class="products-container" :class="`view-${viewMode}`">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :is-edit-mode="isEditMode"
          :view-mode="viewMode"
          @increase="increaseQuantity"
          @decrease="decreaseQuantity"
          @delete="deleteProduct"
        />
      </div>
    </el-main>

    <!-- 底部购物车栏 -->
    <el-footer class="cart-bar">
      <div class="cart-info">
        <el-badge :value="totalQuantity" :hidden="totalQuantity === 0" class="cart-badge">
          <el-icon class="cart-icon"><ShoppingCart /></el-icon>
        </el-badge>
        <div class="cart-text">
          <div class="cart-label">已选商品</div>
          <div class="cart-count">{{ totalQuantity }}件</div>
        </div>
        <div class="cart-total">
          <span class="total-label">合计</span>
          <span class="total-amount">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="cart-actions">
        <el-button 
          v-if="totalQuantity > 0"
          @click="clearCart"
          size="large"
          class="clear-btn"
        >
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        <el-button 
          type="primary"
          :disabled="totalQuantity === 0"
          @click="goCheckout"
          size="large"
          class="checkout-btn"
        >
          <el-icon><ShoppingCart /></el-icon>
          {{ totalQuantity > 0 ? '立即结算' : '去结算' }}
        </el-button>
      </div>
    </el-footer>

    <!-- 添加商品对话框 -->
    <AddProductDialog 
      v-model="showAddDialog"
      @confirm="handleAddProduct"
    />

    <!-- 恢复默认确认对话框 -->
    <el-dialog
      v-model="showResetDialog"
      title="恢复默认商品"
      width="90%"
      :before-close="handleResetClose"
    >
      <p>确定要恢复默认商品吗？这将删除所有自定义商品。</p>
      <template #footer>
        <el-button @click="showResetDialog = false">取消</el-button>
        <el-button type="danger" @click="resetProducts">确定恢复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
import AddProductDialog from '@/components/AddProductDialog/AddProductDialog.vue'

const router = useRouter()
const productStore = useProductStore()

// 响应式数据
const isLoading = ref(false)
const isEditMode = ref(false)
const showAddDialog = ref(false)
const showResetDialog = ref(false)
const searchKeyword = ref('')
const viewMode = ref('grid') // 'grid' 或 'list'

// 轮播图数据
const banners = ref([
  {
    title: '优质大米',
    subtitle: '新鲜直达，品质保证',
    buttonText: '立即购买',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '产地直供',
    subtitle: '源头采购，价格优惠',
    buttonText: '查看详情',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '快速配送',
    subtitle: '24小时内发货，新鲜到家',
    buttonText: '了解配送',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
])

// 计算属性
const products = computed(() => productStore.products)
const totalQuantity = computed(() => productStore.totalQuantity)
const totalPrice = computed(() => productStore.totalPrice)
const isEmpty = computed(() => products.value.length === 0)

// 搜索过滤
const filteredProducts = computed(() => {
  if (!searchKeyword.value) return products.value
  return products.value.filter(product => 
    product.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const handleCommand = (command) => {
  switch (command) {
    case 'edit':
      isEditMode.value = !isEditMode.value
      ElMessage.success(isEditMode.value ? '进入编辑模式' : '退出编辑模式')
      break
    case 'add':
      showAddDialog.value = true
      break
    case 'reset':
      showResetDialog.value = true
      break
  }
}

const handleSearch = (value) => {
  // 搜索逻辑已在计算属性中处理
}

const increaseQuantity = (productId) => {
  productStore.increaseQuantity(productId)
}

const decreaseQuantity = (productId) => {
  productStore.decreaseQuantity(productId)
}

const deleteProduct = async (productId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '确认删除', {
      type: 'warning'
    })
    productStore.deleteProduct(productId)
    ElMessage.success('商品删除成功')
  } catch {
    ElMessage.info('已取消删除')
  }
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '确认清空', {
      type: 'warning'
    })
    productStore.clearCart()
    ElMessage.success('购物车已清空')
  } catch {
    ElMessage.info('已取消清空')
  }
}

const goCheckout = () => {
  if (totalQuantity.value === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  router.push('/checkout')
}

const goToOrders = () => {
  router.push('/orders')
}

const goToAddress = () => {
  router.push('/address')
}

const goToShipping = () => {
  router.push('/shipping')
}

const handleAddProduct = (productData) => {
  productStore.addProduct(productData)
  showAddDialog.value = false
}

const resetProducts = async () => {
  try {
    await ElMessageBox.confirm('确定要恢复默认商品吗？这将删除所有自定义商品。', '确认恢复', {
      type: 'warning'
    })
    productStore.resetToDefault()
    showResetDialog.value = false
    ElMessage.success('已恢复默认商品')
  } catch {
    ElMessage.info('已取消恢复')
  }
}

const handleResetClose = () => {
  showResetDialog.value = false
}

// 生命周期
onMounted(() => {
  productStore.loadProducts()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.home-container {
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

.header-left {
  @include flex-center;
}

.logo {
  @include flex-center;
  gap: $spacing-sm;
  
  .logo-icon {
    font-size: $font-size-xl;
    color: $primary-color;
  }
  
  .logo-text {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
  }
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 $spacing-xl;
  
  @include respond-to(sm) {
    margin: 0 $spacing-md;
    max-width: 200px;
  }
}

.search-input {
  width: 100%;
}

.header-right {
  @include flex-center;
}

.tool-btn {
  @include flex-center;
  gap: $spacing-xs;
  color: $text-primary;
  
  .btn-text {
    @include respond-to(sm) {
      display: none;
    }
  }
}

.banner-section {
  margin: $spacing-lg $spacing-xl;
  border-radius: $border-radius-large;
  overflow: hidden;
  box-shadow: $shadow-base;
  
  @include respond-to(sm) {
    margin: $spacing-md $spacing-lg;
  }
}

.banner-item {
  height: 200px;
  @include flex-center;
  color: white;
  position: relative;
}

.banner-content {
  text-align: center;
  z-index: 2;
}

.banner-title {
  font-size: $font-size-xxl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-sm;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.banner-subtitle {
  font-size: $font-size-lg;
  margin-bottom: $spacing-xl;
  opacity: 0.9;
}

.banner-btn {
  font-size: $font-size-base;
  padding: $spacing-md $spacing-xxl;
  border-radius: $border-radius-large;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  margin: 0 $spacing-xl $spacing-lg;
  
  @include respond-to(sm) {
    margin: 0 $spacing-lg $spacing-md;
    gap: $spacing-sm;
  }
}

.action-item {
  @include flex-column-center;
  padding: $spacing-lg;
  background: $bg-primary;
  border-radius: $border-radius-large;
  cursor: pointer;
  transition: all $transition-base $ease-out;
  box-shadow: $shadow-light;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
  
  .action-icon {
    font-size: $font-size-xxl;
    color: $primary-color;
    margin-bottom: $spacing-sm;
  }
  
  .action-text {
    font-size: $font-size-sm;
    color: $text-regular;
    text-align: center;
  }
}

.product-section {
  flex: 1;
  padding: 0 $spacing-xl $spacing-xl;
  
  @include respond-to(sm) {
    padding: 0 $spacing-lg $spacing-lg;
  }
}

.section-header {
  @include flex-between;
  margin-bottom: $spacing-lg;
  padding: 0 $spacing-sm;
}

.section-title {
  @include flex-center;
  gap: $spacing-sm;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0;
}

.section-actions {
  @include flex-center;
}

.products-container {
  display: grid;
  gap: $spacing-lg;
  
  &.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    
    @include respond-to(sm) {
      grid-template-columns: 1fr;
    }
  }
  
  &.view-list {
    grid-template-columns: 1fr;
  }
}

.loading-container {
  padding: $spacing-xl 0;
}

.empty-state {
  @include flex-center;
  min-height: 300px;
}

.cart-bar {
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

.cart-info {
  @include flex-center;
  gap: $spacing-lg;
  
  @include respond-to(sm) {
    gap: $spacing-md;
  }
}

.cart-badge {
  .cart-icon {
    font-size: $font-size-xxl;
    color: $primary-color;
  }
}

.cart-text {
  @include flex-column;
  
  .cart-label {
    font-size: $font-size-sm;
    color: $text-regular;
  }
  
  .cart-count {
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

.cart-total {
  @include flex-column;
  align-items: flex-end;
  
  .total-label {
    font-size: $font-size-sm;
    color: $text-regular;
  }
  
  .total-amount {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $primary-color;
  }
}

.cart-actions {
  @include flex-center;
  gap: $spacing-md;
  
  @include respond-to(sm) {
    gap: $spacing-sm;
  }
}

.clear-btn {
  @include button-secondary;
}

.checkout-btn {
  @include button-primary;
  min-width: 120px;
}
</style>