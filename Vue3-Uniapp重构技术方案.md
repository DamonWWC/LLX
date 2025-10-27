# 林龍香大米商城 Vue3 + Uni-app 重构技术方案

## 一、项目概述

### 1.1 项目背景
将现有的微信小程序原生项目（林龍香大米商城）使用 Vue3 + Uni-app 框架进行重构，提升项目的可维护性、开发效率和跨平台能力。

### 1.2 重构目标
- **技术栈升级**：从原生小程序升级到 Vue3 + Uni-app
- **代码规范化**：使用 Vue3 Composition API，提升代码可维护性
- **性能优化**：利用 Vue3 的响应式系统优化性能
- **跨平台能力**：支持编译到多端（微信小程序、H5、App等）
- **开发效率**：使用现代化工具链，提升开发体验

### 1.3 项目信息
- **原项目**：微信小程序原生开发
- **目标框架**：Vue3 + Uni-app + JavaScript
- **构建工具**：Vite
- **包管理器**：pnpm
- **UI框架**：Element-Plus

---

## 二、技术架构

### 2.1 技术栈选型

#### 核心框架
```yaml
框架: Uni-app
  版本: 最新稳定版（基于 Vue3）
  说明: 跨平台应用开发框架

前端框架: Vue3
  版本: ^3.3.0
  特性: Composition API, script setup, JavaScript ES2020+

构建工具: Vite
  版本: ^4.0.0
  优势: 快速的开发服务器，高效的生产构建
```

#### 开发语言
```yaml
JavaScript: ES2020+
  - 现代化 JavaScript 特性
  - 解构、箭头函数、Promise/Async
  - 模块化开发
  - 可选类型注释（JSDoc）

样式语言: SCSS (Sass)
  - CSS 预处理器
  - 支持变量、嵌套、混入、函数等高级特性
  - 提升样式代码的可维护性和复用性
```

#### 状态管理
```yaml
Pinia: ^2.1.0
  优势:
    - Vue3 官方推荐
    - JavaScript 友好
    - 更简洁的 API
    - 支持组合式 API
```

#### UI 组件库
```yaml
Element-Plus: ^2.4.0
  说明: 基于 Vue3 的桌面端组件库
  优势:
    - 组件丰富完善
    - 样式美观统一
    - 文档完善详细
    - 社区活跃
    - 高质量、经过充分测试

Note: 
  - 主要用于表单、表格等复杂组件
  - 简单组件可自定义保持现有设计风格
  - 如需移动端组件可配合使用 uView-plus 或自定义
```

#### 工具库
```yaml
工具函数: 
  - @vueuse/core: Vue3 组合式 API 工具集
  - dayjs: 轻量级日期处理库

网络请求:
  - Axios: 基于 Promise 的 HTTP 客户端
  - 支持请求/响应拦截器
  - 自动 JSON 数据转换
  - 错误处理机制
  - 请求取消和超时控制

API 管理:
  - 统一的 API 管理
  - JavaScript 类型注释（JSDoc）
  - 使用 Axios 实例封装

样式处理:
  - SCSS (Sass): CSS 预处理器
  - 支持变量、嵌套、混入、函数
  - 提升代码可维护性和复用性
```

### 2.2 项目结构

```
llx-rice-shop-uniapp/
├── src/
  │   ├── api/                    # API 接口
  │   │   ├── modules/           # 按模块分类
  │   │   │   ├── product.js    # 商品接口
  │   │   │   ├── address.js    # 地址接口
  │   │   │   ├── order.js      # 订单接口
  │   │   │   └── shipping.js   # 运费接口
  │   │   ├── request.js        # 请求封装
  │   │   └── index.js          # 接口入口
│   │
│   ├── components/            # 公共组件
│   │   ├── ProductCard/      # 商品卡片
│   │   ├── AddressCard/      # 地址卡片
│   │   ├── OrderCard/        # 订单卡片
│   │   ├── QuantityControl/  # 数量控制器
│   │   └── Empty/            # 空状态
│   │
  │   ├── composables/          # 组合式函数（Hooks）
  │   │   ├── useProduct.js    # 商品相关逻辑
  │   │   ├── useAddress.js    # 地址相关逻辑
  │   │   ├── useOrder.js      # 订单相关逻辑
  │   │   ├── useShipping.js   # 运费相关逻辑
  │   │   └── useAuth.js       # 认证相关逻辑
  │   │
│   ├── pages/                # 页面
│   │   ├── index/           # 首页（商品列表）
│   │   │   └── index.vue
│   │   ├── address/         # 地址管理
│   │   │   └── index.vue
│   │   ├── checkout/        # 结算页面
│   │   │   └── index.vue
│   │   ├── orders/          # 订单管理
│   │   │   └── index.vue
│   │   ├── order-detail/    # 订单详情
│   │   │   └── index.vue
│   │   ├── shipping/        # 运费查询
│   │   │   └── index.vue
│   │   └── my/              # 个人中心
│   │       └── index.vue
│   │
  │   ├── stores/              # 状态管理（Pinia）
  │   │   ├── modules/
  │   │   │   ├── product.js  # 商品状态
  │   │   │   ├── address.js  # 地址状态
  │   │   │   ├── order.js    # 订单状态
  │   │   │   ├── cart.js     # 购物车状态
  │   │   │   └── user.js     # 用户状态
  │   │   └── index.js        # Store 入口
│   │
  │   ├── types/               # JavaScript 类型定义（JSDoc）
  │   │   ├── product.js
  │   │   ├── address.js
  │   │   ├── order.js
  │   │   ├── api.js
  │   │   └── common.js
  │   │
  │   ├── utils/               # 工具函数
  │   │   ├── request.js      # 网络请求封装
  │   │   ├── storage.js      # 本地存储封装
  │   │   ├── validator.js    # 表单验证
  │   │   ├── formatter.js    # 数据格式化
  │   │   └── constants.js    # 常量定义
│   │
│   ├── static/              # 静态资源
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── styles/              # 全局样式
│   │   ├── variables.scss  # SCSS 变量
│   │   ├── mixins.scss     # SCSS 混合
│   │   ├── common.scss     # 公共样式
│   │   └── theme.scss      # 主题样式
│   │
  │   ├── App.vue             # 应用入口
  │   ├── main.js             # 主入口文件
  │   ├── pages.json          # 页面配置
  │   ├── manifest.json       # 应用配置
  │   └── uni.scss            # uni-app 全局样式变量
│
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .eslintrc.js           # ESLint 配置
├── .prettierrc.js         # Prettier 配置
├── vite.config.js         # Vite 配置
├── package.json           # 项目依赖
├── pnpm-lock.yaml         # 依赖锁定文件
└── README.md              # 项目说明
```

### 2.3 架构设计图

```
┌─────────────────────────────────────────────────────────┐
│                      Pages 页面层                        │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐  │
│  │ 商品列表 │ 地址管理 │ 结算页面 │ 订单管理 │ 个人中心 │  │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Components 组件层                       │
│  ┌────────┬────────┬────────┬────────┬────────┐        │
│  │商品卡片│地址卡片│订单卡片│数量控制│空状态  │        │
│  └────────┴────────┴────────┴────────┴────────┘        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Composables 组合式函数层                    │
│  ┌───────────┬───────────┬───────────┬───────────┐    │
│  │useProduct │useAddress │useOrder   │useShipping│    │
│  └───────────┴───────────┴───────────┴───────────┘    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────┬──────────────────┐
│   Stores (Pinia) │   API Layer      │
│   状态管理         │   接口层          │
│  ┌────────────┐  │  ┌────────────┐ │
│  │ Product    │  │  │ request    │ │
│  │ Address    │  │  │ modules/   │ │
│  │ Order      │  │  │  - product │ │
│  │ Cart       │  │  │  - address │ │
│  │ User       │  │  │  - order   │ │
│  └────────────┘  │  └────────────┘ │
└──────────────────┴──────────────────┘
                ↓
┌─────────────────────────────────────┐
│        Utils 工具层                  │
│  ┌──────────┬──────────┬─────────┐ │
│  │ request  │ storage  │validator│ │
│  └──────────┴──────────┴─────────┘ │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│         Backend API                 │
│    http://118.126.105.146:8081     │
└─────────────────────────────────────┘
```

---

## 三、核心功能模块重构方案

### 3.1 商品管理模块

#### 3.1.1 数据结构（JavaScript + JSDoc）
```javascript
// types/product.js
/**
 * @typedef {Object} Product
 * @property {number} id - 商品ID
 * @property {string} name - 商品名称
 * @property {number} price - 商品价格
 * @property {number} weight - 商品重量
 * @property {'袋'|'箱'} unit - 商品单位
 * @property {string} image - 商品图片
 * @property {number} quantity - 商品数量
 * @property {number} [subtotal] - 小计
 */

/**
 * @typedef {Object} ProductState
 * @property {Product[]} productList - 商品列表
 * @property {Product[]} selectedProducts - 已选商品
 * @property {boolean} loading - 加载状态
 * @property {string|null} error - 错误信息
 */
```

#### 3.1.2 Store 设计
```javascript
// stores/modules/product.js
import { defineStore } from 'pinia'
import { productAPI } from '@/api/modules/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    productList: [],
    selectedProducts: [],
    loading: false,
    error: null
  }),

  getters: {
    // 计算总价
    totalPrice: (state) => {
      return state.selectedProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    },
    
    // 计算总重量
    totalWeight: (state) => {
      return state.selectedProducts.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      )
    },
    
    // 已选商品数量
    selectedCount: (state) => {
      return state.selectedProducts.filter(p => p.quantity > 0).length
    }
  },

  actions: {
    // 加载商品列表
    async fetchProducts() {
      this.loading = true
      try {
        const data = await productAPI.getProducts()
        this.productList = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // 增加数量
    increaseQuantity(productId) {
      const product = this.productList.find(p => p.id === productId)
      if (product) {
        product.quantity++
        this.updateSelectedProducts()
      }
    },

    // 减少数量
    decreaseQuantity(productId) {
      const product = this.productList.find(p => p.id === productId)
      if (product && product.quantity > 0) {
        product.quantity--
        this.updateSelectedProducts()
      }
    },

    // 更新已选商品
    updateSelectedProducts() {
      this.selectedProducts = this.productList.filter(p => p.quantity > 0)
    },

    // 添加商品
    async addProduct(product) {
      try {
        const newProduct = await productAPI.createProduct(product)
        this.productList.push({ ...newProduct, quantity: 0 })
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    // 删除商品
    async deleteProduct(productId) {
      try {
        await productAPI.deleteProduct(productId)
        const index = this.productList.findIndex(p => p.id === productId)
        if (index > -1) {
          this.productList.splice(index, 1)
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})
```

#### 3.1.3 Composable 设计
```javascript
// composables/useProduct.js
import { computed } from 'vue'
import { useProductStore } from '@/stores/modules/product'

export function useProduct() {
  const productStore = useProductStore()

  // 加载商品
  const loadProducts = async () => {
    await productStore.fetchProducts()
  }

  // 增加数量
  const increase = (productId) => {
    productStore.increaseQuantity(productId)
  }

  // 减少数量
  const decrease = (productId) => {
    productStore.decreaseQuantity(productId)
  }

  // 添加商品
  const addProduct = async (product) => {
    try {
      await productStore.addProduct(product)
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      uni.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
  }

  // 删除商品
  const deleteProduct = async (productId) => {
    try {
      await productStore.deleteProduct(productId)
      uni.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      uni.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  }

  return {
    // State
    productList: computed(() => productStore.productList),
    selectedProducts: computed(() => productStore.selectedProducts),
    loading: computed(() => productStore.loading),
    totalPrice: computed(() => productStore.totalPrice),
    totalWeight: computed(() => productStore.totalWeight),
    selectedCount: computed(() => productStore.selectedCount),

    // Actions
    loadProducts,
    increase,
    decrease,
    addProduct,
    deleteProduct
  }
}
```

#### 3.1.4 页面组件
```vue
<!-- pages/index/index.vue -->
<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="top-bar">
      <text class="title">🌾 林龍香大米商城</text>
      <view class="menu-btn" @tap="showMenu = !showMenu">⚙</view>
    </view>

    <!-- 商品列表 -->
    <scroll-view class="product-list" scroll-y>
      <ProductCard
        v-for="product in productList"
        :key="product.id"
        :product="product"
        :edit-mode="isEditMode"
        @increase="increase(product.id)"
        @decrease="decrease(product.id)"
        @delete="handleDelete(product.id)"
      />

      <!-- 空状态 -->
      <Empty v-if="productList.length === 0" text="暂无商品" />
    </scroll-view>

    <!-- 结算栏 -->
    <view v-if="selectedCount > 0" class="checkout-bar">
      <view class="info">
        <text>已选 {{ selectedCount }} 件</text>
        <text class="price">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <button class="checkout-btn" @tap="goCheckout">去结算</button>
    </view>

    <!-- 添加商品弹窗 -->
    <AddProductDialog
      v-model:show="showAddDialog"
      @confirm="handleAddProduct"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useProduct } from '@/composables/useProduct'
import ProductCard from '@/components/ProductCard/index.vue'
import Empty from '@/components/Empty/index.vue'
import AddProductDialog from './components/AddProductDialog.vue'

const showMenu = ref(false)
const isEditMode = ref(false)
const showAddDialog = ref(false)

const {
  productList,
  selectedProducts,
  loading,
  totalPrice,
  totalWeight,
  selectedCount,
  loadProducts,
  increase,
  decrease,
  addProduct,
  deleteProduct
} = useProduct()

// 页面加载
onLoad(() => {
  loadProducts()
})

// 删除商品
const handleDelete = async (productId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个商品吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteProduct(productId)
      }
    }
  })
}

// 添加商品
const handleAddProduct = async (product) => {
  await addProduct(product)
  showAddDialog.value = false
}

// 去结算
const goCheckout = () => {
  if (selectedCount.value === 0) {
    uni.showToast({
      title: '请先选择商品',
      icon: 'none'
    })
    return
  }

  uni.navigateTo({
    url: '/pages/checkout/index'
  })
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .menu-btn {
    font-size: 40rpx;
    padding: 10rpx;
  }
}

.product-list {
  flex: 1;
  padding: 20rpx;
}

.checkout-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);

  .info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .price {
      font-size: 40rpx;
      font-weight: bold;
      color: #ff6034;
    }
  }

  .checkout-btn {
    background: linear-gradient(135deg, #ff6034 0%, #ff8c69 100%);
    color: #fff;
    border: none;
    border-radius: 50rpx;
    padding: 24rpx 60rpx;
    font-size: 32rpx;
    font-weight: 600;
  }
}
</style>
```

### 3.2 地址管理模块

#### 3.2.1 数据结构
```typescript
// types/address.ts
export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export interface AddressState {
  addressList: Address[]
  selectedAddress: Address | null
  loading: boolean
}
```

#### 3.2.2 Store 设计
```typescript
// stores/modules/address.ts
import { defineStore } from 'pinia'
import type { Address, AddressState } from '@/types/address'
import { addressAPI } from '@/api/modules/address'

export const useAddressStore = defineStore('address', {
  state: (): AddressState => ({
    addressList: [],
    selectedAddress: null,
    loading: false
  }),

  getters: {
    defaultAddress: (state) => {
      return state.addressList.find(addr => addr.isDefault) || null
    }
  },

  actions: {
    async fetchAddresses() {
      this.loading = true
      try {
        this.addressList = await addressAPI.getAddresses()
      } finally {
        this.loading = false
      }
    },

    async addAddress(address: Omit<Address, 'id'>) {
      const newAddress = await addressAPI.createAddress(address)
      this.addressList.push(newAddress)
    },

    async updateAddress(id: number, address: Partial<Address>) {
      await addressAPI.updateAddress(id, address)
      const index = this.addressList.findIndex(a => a.id === id)
      if (index > -1) {
        Object.assign(this.addressList[index], address)
      }
    },

    async deleteAddress(id: number) {
      await addressAPI.deleteAddress(id)
      const index = this.addressList.findIndex(a => a.id === id)
      if (index > -1) {
        this.addressList.splice(index, 1)
      }
    },

    selectAddress(address: Address) {
      this.selectedAddress = address
    }
  }
})
```

### 3.3 订单管理模块

#### 3.3.1 数据结构
```typescript
// types/order.ts
export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
  weight: number
  subtotal: number
}

export interface Order {
  id: number
  orderNo: string
  addressId: number
  address?: Address
  items: OrderItem[]
  totalRicePrice: number
  totalWeight: number
  shippingRate: number
  totalShipping: number
  grandTotal: number
  status: '待发货' | '已发货' | '已完成' | '已取消'
  paymentStatus: '未付款' | '已付款' | '已退款'
  trackingNumber?: string
  createTime: string
  paymentTime?: string
  shippingTime?: string
}

export interface OrderState {
  orderList: Order[]
  currentOrder: Order | null
  loading: boolean
}
```

#### 3.3.2 Store 设计
```typescript
// stores/modules/order.ts
import { defineStore } from 'pinia'
import type { Order, OrderState } from '@/types/order'
import { orderAPI } from '@/api/modules/order'

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orderList: [],
    currentOrder: null,
    loading: false
  }),

  getters: {
    // 按状态过滤订单
    ordersByStatus: (state) => (status: string) => {
      return state.orderList.filter(order => order.status === status)
    },

    // 待发货订单数
    pendingCount: (state) => {
      return state.orderList.filter(o => o.status === '待发货').length
    }
  },

  actions: {
    async fetchOrders() {
      this.loading = true
      try {
        this.orderList = await orderAPI.getOrders()
      } finally {
        this.loading = false
      }
    },

    async createOrder(orderData: any) {
      const newOrder = await orderAPI.createOrder(orderData)
      this.orderList.unshift(newOrder)
      return newOrder
    },

    async updateOrderStatus(orderId: number, status: string) {
      await orderAPI.updateOrderStatus(orderId, { status })
      const order = this.orderList.find(o => o.id === orderId)
      if (order) {
        order.status = status as any
      }
    },

    async deleteOrders(orderIds: number[]) {
      await orderAPI.deleteOrdersBatch(orderIds)
      this.orderList = this.orderList.filter(
        o => !orderIds.includes(o.id)
      )
    }
  }
})
```

---

## 四、API 接口封装

### 4.1 请求封装 - Axios

#### 4.1.1 安装 Axios
```bash
pnpm add axios
```

#### 4.1.2 Axios 基础配置
```javascript
// utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加时间戳
    config.headers['X-Request-Time'] = Date.now().toString()

    // 添加请求 ID（用于追踪）
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    const { data } = response

    // 业务错误处理
    if (data.success === false) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }

    // 返回数据
    return data.data || data
  },
  (error) => {
    // 错误处理
    if (error.response) {
      // HTTP 错误
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/login/index' })
          ElMessage.error('登录已过期，请重新登录')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败: ${status}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络请求失败，请检查网络连接')
    } else {
      // 其他错误
      ElMessage.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url, data) => apiClient.delete(url, { data })
}

export default apiClient
```

#### 4.1.3 请求取消功能
```javascript
// utils/request.js

// 取消请求控制器
const cancelTokenSources = new Map()

// 添加请求方法
export const addRequest = (url, cancelToken) => {
  if (cancelToken && cancelTokenSources.has(url)) {
    // 取消之前的请求
    cancelTokenSources.get(url).cancel('请求被取消')
  }
  cancelTokenSources.set(url, cancelToken)
}

// 删除请求
export const removeRequest = (url) => {
  if (cancelTokenSources.has(url)) {
    cancelTokenSources.delete(url)
  }
}

// 取消所有请求
export const cancelAllRequests = () => {
  cancelTokenSources.forEach((source) => {
    source.cancel('所有请求被取消')
  })
  cancelTokenSources.clear()
}

// 带取消功能的请求封装
import axios from 'axios'

export const requestWithCancel = (url, method = 'GET', params = {}) => {
  const source = axios.CancelToken.source()
  
  return {
    promise: apiClient({
      url,
      method,
      ...(method === 'GET' ? { params } : { data: params }),
      cancelToken: source.token
    }),
    cancel: source.cancel
  }
}
```

#### 4.1.4 请求重试机制
```javascript
// utils/request.js

// 请求重试配置
export const retryRequest = (requestFunction, retryCount = 3) => {
  return new Promise((resolve, reject) => {
    const attempt = (count) => {
      requestFunction()
        .then(resolve)
        .catch((error) => {
          if (count > 0) {
            console.log(`请求失败，剩余重试次数: ${count}`)
            setTimeout(() => attempt(count - 1), 1000)
          } else {
            reject(error)
          }
        })
    }
    attempt(retryCount)
  })
}
```

#### 4.1.5 并发请求控制
```javascript
// utils/request.js

// 并发请求队列
class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent
    this.queue = []
    this.running = 0
  }

  async add(promiseCreator) {
    return new Promise((resolve, reject) => {
      this.queue.push({ promiseCreator, resolve, reject })
      this.processQueue()
    })
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.running++
    const { promiseCreator, resolve, reject } = this.queue.shift()

    try {
      const result = await promiseCreator()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--
      this.processQueue()
    }
  }
}

export const requestQueue = new RequestQueue(5)
```

### 4.2 API 模块 - 使用 Axios

#### 4.2.1 API 模块示例
```javascript
// api/modules/product.js
import { request } from '@/utils/request'

export const productAPI = {
  // 获取商品列表
  getProducts: () => request.get('/api/products'),

  // 获取单个商品
  getProductById: (id) => request.get(`/api/products/${id}`),

  // 创建商品
  createProduct: (data) => request.post('/api/products', data),

  // 更新商品
  updateProduct: (id, data) => request.put(`/api/products/${id}`, data),

  // 删除商品
  deleteProduct: (id) => request.delete(`/api/products/${id}`)
}
```

```javascript
// api/modules/order.js
import { request } from '@/utils/request'

export const orderAPI = {
  // 获取订单列表
  getOrders: (params) => request.get('/api/orders', params),

  // 获取单个订单
  getOrderById: (id) => request.get(`/api/orders/${id}`),

  // 创建订单
  createOrder: (data) => request.post('/api/orders', data),

  // 更新订单状态
  updateOrderStatus: (id, data) => request.patch(`/api/orders/${id}/status`, data),

  // 更新支付状态
  updatePaymentStatus: (id, data) => request.patch(`/api/orders/${id}/payment-status`, data),

  // 批量删除订单
  deleteOrdersBatch: (ids) => request.delete('/api/orders/batch', { ids }),

  // 计算订单
  calculateOrder: (data) => request.post('/api/orders/calculate', data)
}
```

#### 4.2.2 在组件中使用 API
```javascript
// components/ProductList.vue
<script setup>
import { ref, onMounted } from 'vue'
import { productAPI } from '@/api/modules/product'
import { ElMessage } from 'element-plus'

const products = ref([])
const loading = ref(false)

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    const data = await productAPI.getProducts()
    products.value = data
  } catch (error) {
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

// 删除商品
const handleDelete = async (id) => {
  try {
    await productAPI.deleteProduct(id)
    ElMessage.success('删除成功')
    await loadProducts()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadProducts()
})
</script>
```

#### 4.2.3 请求加载状态管理
```javascript
// composables/useApi.js
import { ref } from 'vue'

export function useApi(apiFunction) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const execute = async (...args) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await apiFunction(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}

// 使用示例
// components/ProductList.vue
import { productAPI } from '@/api/modules/product'
import { useApi } from '@/composables/useApi'

const { data: products, loading, error, execute: loadProducts } = useApi(productAPI.getProducts)

onMounted(() => {
  loadProducts()
})
```

---

## 五、开发规范

### 5.1 代码规范

#### 命名规范
```javascript
// 文件命名：kebab-case
product-card.vue
use-product.js
order-api.js

// 组件命名：PascalCase
<ProductCard />
<AddressSelector />

// 函数命名：camelCase
const getUserInfo = () => {}
const handleSubmit = () => {}

// 常量命名：UPPER_SNAKE_CASE
const API_BASE_URL = 'http://xxx'
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

// JSDoc 类型注释：PascalCase
/**
 * @typedef {Object} UserInfo
 * @property {string} name - 用户名
 * @property {number} age - 年龄
 */

/**
 * @typedef {'pending'|'completed'} OrderStatus
 */

#### JavaScript 规范
```javascript
// 1. 使用 JSDoc 进行类型注释
/**
 * @typedef {Object} Product
 * @property {number} id - 商品ID
 * @property {string} name - 商品名称
 * @property {number} price - 商品价格
 */

// 2. 使用 JSDoc 定义联合类型
/**
 * @typedef {'pending'|'success'|'error'} Status
 */

// 3. 函数类型定义
/**
 * 获取商品数据
 * @param {number} id - 商品ID
 * @returns {Promise<Product>} 商品信息
 */
const fetchData = async (id) => {
  // 实现逻辑
}

// 4. 使用解构和默认参数
const handleSubmit = ({ name, price = 0 } = {}) => {
  // 处理逻辑
}

// 5. 避免使用 var，使用 const 和 let
const API_BASE_URL = 'http://api.example.com'
let currentUser = null

// 6. 使用模板字符串
const message = `商品 ${product.name} 的价格是 ¥${product.price}`

// 7. 使用箭头函数
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// 8. 使用 async/await
const loadData = async () => {
  try {
    const response = await api.getProducts()
    return response.data
  } catch (error) {
    console.error('获取数据失败:', error)
    throw error
  }
}
```

### 5.2 Vue3 组件规范

#### script setup 规范
```vue
<script setup>
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/modules/product'

// 2. Props 定义
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

// 3. Emits 定义
const emit = defineEmits(['update:modelValue', 'submit'])

// 4. Composables
const productStore = useProductStore()

// 5. 响应式数据
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 6. 方法
const handleClick = () => {
  count.value++
  emit('submit', props.product)
}

// 7. 生命周期
onMounted(() => {
  console.log('Component mounted')
})

// 8. 暴露给父组件（如需要）
defineExpose({
  count,
  handleClick
})
</script>

<template>
  <view class="product-card" @tap="handleClick">
    <text>{{ product.name }}</text>
    <text>Count: {{ count }}</text>
  </view>
</template>

<style lang="scss" scoped>
.product-card {
  // styles
}
</style>
```

### 5.3 Element-Plus 组件规范

#### 5.3.1 基础组件使用
```vue
<template>
  <!-- 按钮组件 -->
  <el-button type="primary" @click="handleSubmit">
    提交订单
  </el-button>
  
  <!-- 表单组件 -->
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="商品名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入商品名称" />
    </el-form-item>
    
    <el-form-item label="商品价格" prop="price">
      <el-input-number v-model="form.price" :min="0" :precision="2" />
    </el-form-item>
  </el-form>
  
  <!-- 表格组件 -->
  <el-table :data="productList" stripe>
    <el-table-column prop="name" label="商品名称" />
    <el-table-column prop="price" label="价格" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button size="small" @click="editProduct(row)">
          编辑
        </el-button>
        <el-button size="small" type="danger" @click="deleteProduct(row.id)">
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  
  <!-- 对话框组件 -->
  <el-dialog v-model="showDialog" title="添加商品" width="500px">
    <el-form :model="newProduct" :rules="rules" ref="productForm">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="newProduct.name" />
      </el-form-item>
      <el-form-item label="商品价格" prop="price">
        <el-input-number v-model="newProduct.price" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="confirmAdd">确定</el-button>
    </template>
  </el-dialog>
</template>
```

#### 5.3.2 表单验证规范
```javascript
// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 表单提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    // 提交逻辑
  } catch (error) {
    console.log('表单验证失败')
  }
}
```

#### 5.3.3 主题定制
```scss
// 自定义主题变量
$--el-color-primary: #ff6034;
$--el-color-success: #52c41a;
$--el-color-warning: #faad14;
$--el-color-danger: #f5222d;

// 组件样式覆盖
.el-button--primary {
  background-color: $--el-color-primary;
  border-color: $--el-color-primary;
}

.el-input__inner {
  border-radius: 8px;
}
```

### 5.4 样式规范 - SCSS (Sass) 使用指南

#### 5.4.1 SCSS 简介
SCSS 是 Sass (Syntactically Awesome Style Sheets) 的增强版语法，提供以下优势：
- ✅ **变量 (Variables)**: 统一管理颜色、尺寸等常用值
- ✅ **嵌套 (Nesting)**: 让 CSS 选择器嵌套更清晰
- ✅ **混入 (Mixins)**: 可复用的样式片段
- ✅ **函数 (Functions)**: 处理颜色、计算等逻辑
- ✅ **继承 (Extend)**: 样式的继承和扩展

#### 5.4.2 变量定义
```scss
// styles/variables.scss

// ===== 颜色系统 =====
$primary-color: #ff6034;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #f5222d;
$info-color: #1890ff;

// 灰度色系
$gray-50: #fafafa;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-800: #424242;
$gray-900: #212121;

// 文字颜色
$text-color-primary: #212121;
$text-color-secondary: #757575;
$text-color-disabled: #bdbdbd;

// ===== 字体系统 =====
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-base: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;
$font-size-xxl: 40rpx;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;

// ===== 间距系统 =====
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-base: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;

// ===== 圆角系统 =====
$border-radius-sm: 8rpx;
$border-radius-base: 16rpx;
$border-radius-lg: 24rpx;
$border-radius-xl: 32rpx;
$border-radius-full: 9999rpx;

// ===== 阴影系统 =====
$box-shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
$box-shadow-base: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
$box-shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);

// ===== 边框 =====
$border-width: 2rpx;
$border-color: #e0e0e0;
$border-style: solid;
```

#### 5.4.3 混入 (Mixins)
```scss
// styles/mixins.scss

// 弹性布局居中
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 弹性布局 - 垂直居中
@mixin flex-center-v {
  display: flex;
  align-items: center;
}

// 弹性布局 - 水平居中
@mixin flex-center-h {
  display: flex;
  justify-content: center;
}

// 文本省略（单行）
@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 文本省略（多行）
@mixin text-ellipsis-multi($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 清除浮动
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 绝对定位居中
@mixin absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// 1px 边框（解决移动端边框问题）
@mixin border-1px($color: $border-color) {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 1rpx;
    background-color: $color;
  }
}

// 按钮渐变背景
@mixin button-gradient($start-color: $primary-color, $end-color: darken($primary-color, 10%)) {
  background: linear-gradient(135deg, $start-color 0%, $end-color 100%);
  border: none;
  color: #ffffff;
}

// 卡片样式
@mixin card-style {
  background: #ffffff;
  border-radius: $border-radius-base;
  box-shadow: $box-shadow-base;
  padding: $spacing-base;
}

// 过渡动画
@mixin transition($property: all, $duration: 0.3s, $timing: ease) {
  transition: $property $duration $timing;
}
```

#### 5.4.4 函数 (Functions)
```scss
// styles/functions.scss

// 计算颜色亮度
@function luminance($color) {
  $rgb: (red($color), green($color), blue($color));
  @return (0.2126 * nth($rgb, 1) + 0.7152 * nth($rgb, 2) + 0.0722 * nth($rgb, 3)) / 255;
}

// 根据背景色自动选择文字颜色（白或黑）
@function text-color($background) {
  @if luminance($background) > 0.5 {
    @return #000000;
  } @else {
    @return #ffffff;
  }
}
```

#### 5.4.5 实际使用示例
```vue
<style lang="scss" scoped>
// 导入变量和混入
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  @include flex-center;
  padding: $spacing-base;
  background-color: $gray-50;
  border-radius: $border-radius-base;

  .title {
    @include text-ellipsis-multi(2);
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $text-color-primary;
    margin-bottom: $spacing-base;
  }

  .button {
    @include button-gradient($primary-color, darken($primary-color, 10%));
    @include transition(all, 0.3s, ease);
    border-radius: $border-radius-base;
    padding: $spacing-base $spacing-xl;
    
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  .card {
    @include card-style;
    border: $border-width $border-style $border-color;
    
    &:hover {
      box-shadow: $box-shadow-lg;
      @include transition(box-shadow, 0.3s, ease);
    }
  }
}

// 响应式设计（使用媒体查询）
@media screen and (max-width: 750rpx) {
  .container {
    padding: $spacing-sm;
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .container {
    background-color: $gray-900;
    color: $gray-50;
  }
}
</style>
```

#### 5.4.6 SCSS 项目结构
```
styles/
├── variables.scss     # 变量定义
├── mixins.scss        # 混入定义
├── functions.scss     # 函数定义
├── common.scss        # 公共样式
├── theme.scss         # 主题样式
└── components/        # 组件样式
    ├── button.scss
    ├── card.scss
    └── form.scss
```

#### 5.4.7 SCSS 最佳实践
1. **统一变量管理**: 所有颜色、尺寸、间距都使用变量
2. **使用混入**: 对于重复的样式模式，使用 mixin 封装
3. **嵌套层级**: 建议不超过 3 层嵌套，保持代码可读性
4. **命名规范**: 使用 BEM 命名方式（Block-Element-Modifier）
5. **避免重复**: 使用 `@extend` 替代重复样式
6. **性能优化**: 避免过深的嵌套和复杂的计算

```scss
// ❌ 不好的做法
.container .wrapper .content .item .text {
  color: red;
}

// ✅ 好的做法
.container {
  &__wrapper {
    &__content {
      &__item {
        color: $text-color-primary;
      }
    }
  }
}
```

---

## 六、性能优化方案

### 6.1 代码层面优化

```typescript
// 1. 使用 computed 缓存计算结果
const totalPrice = computed(() => {
  return products.value.reduce((sum, p) => sum + p.price, 0)
})

// 2. 使用 watchEffect 自动追踪依赖
watchEffect(() => {
  if (selectedAddress.value) {
    calculateShipping(selectedAddress.value.province)
  }
})

// 3. 使用 shallowRef 优化大型对象
const largeData = shallowRef<Product[]>([])

// 4. 使用虚拟列表（长列表场景）
// 使用 uni-ui 的 virtual-list 组件

// 5. 图片懒加载
<image 
  :src="product.image" 
  lazy-load 
  mode="aspectFill"
/>

// 6. 防抖节流
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const handleSearch = useDebounceFn((keyword: string) => {
  // 搜索逻辑
}, 300)

const handleScroll = useThrottleFn(() => {
  // 滚动逻辑
}, 100)
```

### 6.2 打包优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'api': ['./src/api/modules/product', './src/api/modules/order']
        }
      }
    },
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // CSS 代码分割
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

---

## 七、测试方案

### 7.1 单元测试
```typescript
// 使用 Vitest
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '@/components/ProductCard/index.vue'

describe('ProductCard', () => {
  it('renders product name', () => {
    const wrapper = mount(ProductCard, {
      props: {
        product: {
          id: 1,
          name: '五常稻花香',
          price: 88,
          weight: 10,
          unit: '袋'
        }
      }
    })
    
    expect(wrapper.text()).toContain('五常稻花香')
  })

  it('emits increase event when plus button clicked', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })
    
    await wrapper.find('.plus-btn').trigger('tap')
    expect(wrapper.emitted('increase')).toBeTruthy()
  })
})
```

### 7.2 E2E 测试
```typescript
// 使用 Playwright
import { test, expect } from '@playwright/test'

test('购买流程', async ({ page }) => {
  // 进入首页
  await page.goto('/')
  
  // 选择商品
  await page.click('.product-item:first-child .plus-btn')
  
  // 点击结算
  await page.click('.checkout-btn')
  
  // 选择地址
  await page.click('.address-selector')
  await page.click('.address-item:first-child')
  
  // 确认订单
  await page.click('.confirm-btn')
  
  // 验证订单创建成功
  await expect(page).toHaveURL('/pages/order-detail/index')
})
```

---

## 八、部署方案

### 8.1 环境配置

```bash
# .env.development
VITE_APP_TITLE=林龍香大米商城-开发
VITE_API_BASE_URL=http://localhost:8081
VITE_ENABLE_DEBUG=true

# .env.production
VITE_APP_TITLE=林龍香大米商城
VITE_API_BASE_URL=http://118.126.105.146:8081
VITE_ENABLE_DEBUG=false
```

### 8.2 构建命令

```json
{
  "scripts": {
    "dev:mp-weixin": "uni -p mp-weixin",
    "dev:h5": "uni",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:h5": "uni build",
    "lint": "eslint --ext .vue,.js src",
    "lint:fix": "eslint --ext .vue,.js src --fix",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### 8.3 CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm run build:mp-weixin
      
      - name: Upload to WeChat
        run: |
          # 使用微信开发者工具 CLI 上传
          cli upload --project ./dist/build/mp-weixin
```

---

## 九、迁移计划

### 9.1 迁移步骤

#### 第一阶段：准备工作（1-2天）
1. 创建 Uni-app 项目
2. 配置开发环境
3. 搭建项目结构
4. 配置 ESLint、Prettier、TypeScript
5. 封装基础工具（request、storage等）

#### 第二阶段：核心功能迁移（5-7天）
1. **Day 1-2**: 商品管理模块
   - Product Store
   - 商品列表页面
   - 商品卡片组件
   - 添加/编辑商品

2. **Day 3-4**: 地址管理模块
   - Address Store
   - 地址列表页面
   - 地址卡片组件
   - 地址智能识别

3. **Day 5-6**: 订单管理模块
   - Order Store
   - 结算页面
   - 订单列表页面
   - 订单详情页面

4. **Day 7**: 其他模块
   - 运费查询
   - 个人中心
   - 公共组件

#### 第三阶段：测试优化（3-4天）
1. **Day 1**: 功能测试
   - 单元测试
   - 集成测试
   - 页面流程测试

2. **Day 2**: 性能优化
   - 代码分割
   - 图片优化
   - 请求优化

3. **Day 3**: UI/UX 优化
   - 样式细节调整
   - 交互优化
   - 动画效果

4. **Day 4**: Bug 修复
   - 修复测试中发现的问题
   - 兼容性测试

#### 第四阶段：上线部署（1-2天）
1. 生产环境配置
2. 打包构建
3. 微信小程序审核提交
4. 监控上线

### 9.2 风险评估

| 风险项 | 影响程度 | 应对措施 |
|--------|----------|----------|
| API 接口不兼容 | 高 | 提前与后端确认接口，做好接口适配 |
| 原生功能迁移困难 | 中 | 使用 uni-app 条件编译，保留必要的原生代码 |
| 性能下降 | 中 | 做好性能测试，优化关键路径 |
| 用户体验差异 | 低 | 保持原有交互逻辑，渐进式优化 |
| 第三方库不兼容 | 低 | 选择 uni-app 生态内的替代方案 |

---

## 十、预期收益

### 10.1 开发效率提升
- **组件复用**: Vue 组件化开发，提升代码复用率 50%+
- **类型安全**: TypeScript 减少 70% 的类型错误
- **开发工具**: Vite 热更新，开发效率提升 30%+
- **状态管理**: Pinia 统一状态管理，减少状态同步问题

### 10.2 代码质量提升
- **可维护性**: 模块化架构，降低维护成本 40%
- **可测试性**: 支持单元测试，代码覆盖率可达 80%+
- **规范性**: ESLint + Prettier，统一代码风格
- **文档完善**: TypeScript 类型即文档

### 10.3 性能优化
- **首屏加载**: 代码分割，首屏加载时间减少 20%
- **运行性能**: Vue3 响应式系统，性能提升 30%+
- **包体积**: Tree-shaking，打包体积减少 15%

### 10.4 扩展能力
- **跨平台**: 一套代码多端运行（微信、H5、App）
- **快速迭代**: 组件化开发，新功能开发周期缩短 40%
- **团队协作**: 统一技术栈，降低团队协作成本

---

## 十一、附录

### 11.1 技术栈对比

| 方面 | 原生小程序 | Vue3 + Uni-app |
|------|-----------|----------------|
| 开发语言 | WXML + WXSS + JS | Vue3 + SCSS (Sass) + JavaScript |
| 状态管理 | 页面级 data | Pinia 全局状态 |
| 组件化 | Component | Vue 组件 |
| UI 框架 | 自定义 | Element-Plus |
| 类型检查 | 无 | JSDoc 类型注释 |
| 开发工具 | 微信开发者工具 | VSCode + Vite |
| 调试体验 | 一般 | 优秀 |
| 热更新 | 不支持 | 支持 |
| 跨平台 | 仅微信 | 多端支持 |

### 11.2 学习资源

- **Vue3 官方文档**: https://cn.vuejs.org/
- **Uni-app 官方文档**: https://uniapp.dcloud.net.cn/
- **Pinia 官方文档**: https://pinia.vuejs.org/zh/
- **Element-Plus 官方文档**: https://element-plus.org/zh-CN/
- **Axios 官方文档**: https://axios-http.com/zh/docs/
- **JavaScript ES2020+ 规范**: https://tc39.es/ecma262/
- **JSDoc 文档**: https://jsdoc.app/
- **SCSS/Sass 文档**: https://sass-lang.com/
- **Vite 官方文档**: https://cn.vitejs.dev/

### 11.3 常见问题

**Q1: 为什么选择 Uni-app 而不是 Taro？**
A: Uni-app 对 Vue 生态支持更好，社区更活跃，文档更完善，且对微信小程序的兼容性更好。

**Q2: 是否需要完全重写？**
A: 不需要。可以采用渐进式迁移策略，先迁移核心模块，逐步替换其他模块。

**Q3: 为什么不使用 TypeScript？**
A: 考虑到团队技术栈和项目复杂度，使用 JavaScript + JSDoc 可以提供足够的类型提示，同时降低学习成本。

**Q4: Element-Plus 在小程序中如何使用？**
A: Element-Plus 主要用于 H5 版本，小程序版本需要使用 uni-app 的组件或自定义组件，但可以保持设计风格一致。

**Q5: 性能会不会下降？**
A: 不会。Vue3 的性能优化加上合理的代码组织，性能只会更好。

**Q6: 学习成本如何？**
A: 如果团队熟悉 Vue，学习成本很低。Uni-app 的 API 与小程序原生 API 类似，上手快。

**Q7: 是否支持原有的所有功能？**
A: 是的。Uni-app 支持条件编译，可以在必要时使用原生代码。

**Q8: 为什么选择 SCSS 而不是 CSS？**
A: SCSS 提供变量、嵌套、混入、函数等高级特性，可以有效提升样式代码的可维护性、复用性和可读性，特别适合中大型项目。

**Q9: SCSS 兼容性如何？**
A: SCSS 通过构建工具（如 Vite）编译为标准的 CSS，具有良好的浏览器兼容性，uni-app 完美支持 SCSS 语法。

**Q10: 为什么选择 Axios 而不是 uni.request？**
A: Axios 功能更强大，支持请求/响应拦截器、请求取消、并发控制、自动 JSON 转换等高级特性，提供更好的开发体验和错误处理机制。

**Q11: Axios 在 uni-app 中的兼容性如何？**
A: Axios 可以在 uni-app 中使用，需要配置适配器（adapter），uni-app 会自动处理跨平台兼容性，确保在小程序、H5、App 等平台正常工作。

---

## 十二、总结

本技术方案详细规划了将林龍香大米商城从微信小程序原生开发迁移到 Vue3 + Uni-app 框架的完整流程。通过采用现代化的技术栈和架构设计，将显著提升项目的开发效率、代码质量和可维护性。

### 核心优势
1. **技术先进**: Vue3 + JavaScript + Pinia + Axios + SCSS 现代化技术栈
2. **架构清晰**: 分层架构，职责明确
3. **开发高效**: 组件化开发，代码复用率高
4. **网络请求**: Axios 提供强大的 HTTP 客户端能力
5. **样式规范**: SCSS 预处理器，统一的样式管理
6. **质量保证**: JSDoc 类型注释，单元测试覆盖
7. **性能优异**: Vue3 性能优化，打包体积优化
8. **扩展性强**: 支持多端编译，快速迁移到其他平台
9. **UI 统一**: Element-Plus 提供一致的用户体验

### 实施建议
1. 分阶段实施，降低风险
2. 保持与后端密切沟通
3. 做好测试覆盖
4. 关注用户反馈，持续优化

**项目预计周期**: 10-15 个工作日
**团队配置**: 1-2 名前端开发工程师
**技术难度**: 中等

---

**文档版本**: v1.0
**创建日期**: 2025-01-22
**最后更新**: 2025-01-22
**文档作者**: AI Assistant

