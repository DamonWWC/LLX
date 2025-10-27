# 林龍香大米商城 - Vue3 + Uni-app 完整技术方案

## 📋 目录

1. [项目概述](#项目概述)
2. [技术架构](#技术架构)
3. [项目结构](#项目结构)
4. [核心功能实现](#核心功能实现)
5. [API 接口封装](#api接口封装)
6. [状态管理 (Pinia)](#状态管理-pinia)
7. [开发规范](#开发规范)
8. [UI 设计规范](#ui设计规范)
9. [构建配置](#构建配置)
10. [开发流程](#开发流程)
11. [测试与部署](#测试与部署)

---

## 项目概述

### 1.1 项目背景

将现有微信小程序原生项目（林龍香大米商城）使用 Vue3 + Uni-app 框架进行重构，保持所有功能一致，提升项目的可维护性、开发效率和跨平台能力。

**项目定位**: 大米电商小程序，支持商品管理、购物车、订单管理、地址识别、运费计算等功能。

### 1.2 技术栈选型

| 技术 | 版本 | 说明 |
|------|------|------|
| **Vue3** | ^3.3.0 | 前端框架 |
| **Uni-app** | 最新版 | 跨平台框架 |
| **Pinia** | ^2.1.0 | 状态管理 |
| **Axios** | ^1.6.0 | HTTP 客户端 |
| **SCSS** | ^1.64.0 | CSS 预处理器 |
| **Element-Plus** | ^2.4.0 | UI 组件库（H5端） |
| **Vite** | ^4.4.0 | 构建工具 |
| **VSCode** | - | 开发工具 |

### 1.3 后端 API

- **基础 URL**: `http://118.126.105.146:8081`
- **接口文档**: `server/API接口文档.md`
- **响应格式**: 统一的成功/失败响应结构

### 1.4 项目目标

✅ **功能一致性**: 所有功能与原项目完全一致  
✅ **技术现代化**: 使用 Vue3 + Uni-app 技术栈  
✅ **代码规范性**: 统一的代码风格和规范  
✅ **性能优化**: 利用 Vue3 响应式系统优化性能  
✅ **跨平台支持**: 支持小程序、H5、App 等多端  

---

## 技术架构

### 2.1 架构设计

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (Pages & Components - Vue3 SFC)        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│          State Management Layer         │
│         (Pinia Stores)                  │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│           API Layer (Axios)             │
│   (Request/Response Interceptors)        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│          Utility Layer                   │
│   (Utils, Validators, Formatters)       │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│          Backend API                    │
│   (RESTful API - http://118.126.105.146:8081)
└─────────────────────────────────────────┘
```

### 2.2 核心设计原则

1. **组件化**: 可复用的 Vue 组件
2. **模块化**: 按功能模块组织代码
3. **响应式**: 使用 Vue3 响应式系统
4. **类型安全**: 使用 JSDoc 进行类型注释
5. **规范统一**: ESLint + Prettier 代码规范

---

## 项目结构

### 3.1 目录结构

```
llx-rice-shop-uniapp/
├── src/
│   ├── api/                      # API 接口管理
│   │   ├── modules/
│   │   │   ├── product.js       # 商品接口
│   │   │   ├── address.js       # 地址接口
│   │   │   ├── order.js         # 订单接口
│   │   │   └── shipping.js     # 运费接口
│   │   ├── request.js           # Axios 封装
│   │   └── index.js             # 导出入口
│   │
│   ├── components/               # 公共组件
│   │   ├── ProductCard/         # 商品卡片
│   │   │   ├── index.vue
│   │   │   └── index.scss
│   │   ├── AddressCard/         # 地址卡片
│   │   ├── OrderCard/           # 订单卡片
│   │   ├── QuantityControl/     # 数量控制器
│   │   └── Empty/               # 空状态
│   │
│   ├── composables/             # 组合式函数
│   │   ├── useProduct.js       # 商品逻辑
│   │   ├── useAddress.js       # 地址逻辑
│   │   ├── useOrder.js         # 订单逻辑
│   │   └── useShipping.js     # 运费逻辑
│   │
│   ├── stores/                   # Pinia 状态管理
│   │   ├── modules/
│   │   │   ├── product.js       # 商品状态
│   │   │   ├── address.js       # 地址状态
│   │   │   ├── order.js        # 订单状态
│   │   │   ├── cart.js         # 购物车状态
│   │   │   └── user.js         # 用户状态
│   │   └── index.js             # Store 入口
│   │
│   ├── pages/                    # 页面
│   │   ├── index/               # 商品列表
│   │   │   └── index.vue
│   │   ├── checkout/            # 结算页面
│   │   │   └── index.vue
│   │   ├── address/            # 地址管理
│   │   │   └── index.vue
│   │   ├── orders/             # 订单列表
│   │   │   └── index.vue
│   │   ├── order-detail/       # 订单详情
│   │   │   └── index.vue
│   │   ├── shipping/           # 运费查询
│   │   │   └── index.vue
│   │   └── my/                 # 个人中心
│   │       └── index.vue
│   │
│   ├── utils/                   # 工具函数
│   │   ├── addressParser.js    # 地址解析
│   │   ├── validator.js        # 表单验证
│   │   ├── formatter.js        # 数据格式化
│   │   └── common.js           # 通用工具
│   │
│   ├── styles/                  # 样式文件
│   │   ├── variables.scss      # SCSS 变量
│   │   ├── mixins.scss         # SCSS 混合
│   │   ├── common.scss          # 公共样式
│   │   └── theme.scss           # 主题样式
│   │
│   ├── App.vue                  # 应用入口
│   ├── main.js                  # 主入口
│   ├── pages.json              # 页面配置
│   ├── manifest.json           # 应用配置
│   └── uni.scss                # 全局样式
│
├── .env.development             # 开发环境变量
├── .env.production              # 生产环境变量
├── .eslintrc.js                 # ESLint 配置
├── .prettierrc.js              # Prettier 配置
├── vite.config.js              # Vite 配置
├── package.json                # 项目依赖
└── README.md                   # 项目说明
```

### 3.2 文件命名规范

- **组件文件**: PascalCase，如 `ProductCard.vue`
- **页面文件**: kebab-case，如 `order-detail.vue`
- **工具文件**: camelCase，如 `addressParser.js`
- **样式文件**: kebab-case，如 `product-card.scss`

---

## 核心功能实现

### 4.1 商品管理模块

#### 页面实现
**文件**: `src/pages/index/index.vue`

```vue
<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="header">
      <view class="title">商品列表</view>
      <button class="add-btn" @click="showAddDialog = true">
        <text>+</text> 添加商品
      </button>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <ProductCard
        v-for="product in productList"
        :key="product.id"
        :product="product"
        @increase="handleIncrease"
        @decrease="handleDecrease"
        @delete="handleDelete"
      />
      
      <Empty v-if="productList.length === 0" message="暂无商品" />
    </view>

    <!-- 底部结算栏 -->
    <view class="bottom-bar" v-if="selectedCount > 0">
      <view class="cart-info">
        <view class="total">
          <text>合计:</text>
          <text class="price">¥{{ totalPrice }}</text>
        </view>
        <view class="count">已选 {{ selectedCount }} 件商品</view>
      </view>
      <button class="checkout-btn" @click="goCheckout">
        去结算
      </button>
    </view>

    <!-- 添加商品对话框 -->
    <AddProductDialog
      v-model="showAddDialog"
      @confirm="handleAddProduct"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/modules/product'
import { useCartStore } from '@/stores/modules/cart'
import ProductCard from '@/components/ProductCard/index.vue'
import AddProductDialog from './components/AddProductDialog.vue'
import Empty from '@/components/Empty/index.vue'

const productStore = useProductStore()
const cartStore = useCartStore()

const showAddDialog = ref(false)

// 计算属性
const productList = computed(() => productStore.productList)
const selectedCount = computed(() => cartStore.selectedCount)
const totalPrice = computed(() => cartStore.totalPrice)

// 方法
const handleIncrease = (productId) => {
  cartStore.increaseQuantity(productId)
}

const handleDecrease = (productId) => {
  cartStore.decreaseQuantity(productId)
}

const handleDelete = async (productId) => {
  try {
    await productStore.deleteProduct(productId)
    uni.showToast({ title: '删除成功', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

const handleAddProduct = async (productData) => {
  try {
    await productStore.addProduct(productData)
    uni.showToast({ title: '添加成功', icon: 'success' })
    showAddDialog.value = false
  } catch (error) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const goCheckout = () => {
  if (selectedCount.value === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }
  
  uni.navigateTo({
    url: '/pages/checkout/index'
  })
}

// 生命周期
onMounted(() => {
  productStore.fetchProducts()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 120rpx;
}

.header {
  @include flex-center-v;
  justify-content: space-between;
  padding: $spacing-base;
  background: $primary-gradient;
  color: #ffffff;
}

.product-list {
  padding: $spacing-base;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  @include flex-center-v;
  justify-content: space-between;
  padding: $spacing-base;
  background: #ffffff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);
}
</style>
```

#### Store 实现
**文件**: `src/stores/modules/product.js`

```javascript
import { defineStore } from 'pinia'
import { productAPI } from '@/api/modules/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    productList: [],
    loading: false,
    error: null
  }),

  getters: {
    // 根据 ID 获取商品
    getProductById: (state) => (id) => {
      return state.productList.find(p => p.id === id)
    }
  },

  actions: {
    // 获取商品列表
    async fetchProducts() {
      this.loading = true
      try {
        const data = await productAPI.getProducts()
        this.productList = data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 添加商品
    async addProduct(productData) {
      const newProduct = await productAPI.createProduct(productData)
      this.productList.push(newProduct)
    },

    // 更新商品
    async updateProduct(id, productData) {
      const updated = await productAPI.updateProduct(id, productData)
      const index = this.productList.findIndex(p => p.id === id)
      if (index > -1) {
        this.productList[index] = updated
      }
    },

    // 删除商品
    async deleteProduct(id) {
      await productAPI.deleteProduct(id)
      this.productList = this.productList.filter(p => p.id !== id)
    }
  }
})
```

---

## API 接口封装

### 5.1 Axios 请求封装

**文件**: `src/api/request.js`

```javascript
import axios from 'axios'

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
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['X-Request-Time'] = Date.now().toString()
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.success === false) {
      uni.showToast({ title: data.message || '请求失败', icon: 'none' })
      return Promise.reject(new Error(data.message))
    }
    return data.data || data
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          uni.showToast({ title: '登录已过期', icon: 'none' })
          break
        case 403:
          uni.showToast({ title: '没有权限', icon: 'none' })
          break
        case 404:
          uni.showToast({ title: '资源不存在', icon: 'none' })
          break
        case 500:
          uni.showToast({ title: '服务器错误', icon: 'none' })
          break
      }
    }
    return Promise.reject(error)
  }
)

export const request = {
  get: (url, params) => apiClient.get(url, { params }),
  post: (url, data) => apiClient.post(url, data),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url, data) => apiClient.delete(url, { data })
}

export default apiClient
```

### 5.2 商品 API 模块

**文件**: `src/api/modules/product.js`

```javascript
import { request } from '../request'

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

### 5.3 订单 API 模块

**文件**: `src/api/modules/order.js`

```javascript
import { request } from '../request'

export const orderAPI = {
  // 获取订单列表
  getOrders: (params) => request.get('/api/orders', params),
  
  // 获取单个订单
  getOrderById: (id) => request.get(`/api/orders/${id}`),
  
  // 创建订单
  createOrder: (data) => request.post('/api/orders', data),
  
  // 更新订单状态
  updateOrderStatus: (id, data) => 
    request.patch(`/api/orders/${id}/status`, data),
  
  // 更新支付状态
  updatePaymentStatus: (id, data) =>
    request.patch(`/api/orders/${id}/payment-status`, data),
  
  // 更新快递单号
  updateTrackingNumber: (id, data) =>
    request.patch(`/api/orders/${id}/tracking`, data),
  
  // 删除订单
  deleteOrder: (id) => request.delete(`/api/orders/${id}`),
  
  // 批量删除订单
  deleteOrdersBatch: (ids) => request.delete('/api/orders/batch', { ids })
}
```

### 5.4 地址 API 模块

**文件**: `src/api/modules/address.js`

```javascript
import { request } from '../request'

export const addressAPI = {
  // 获取地址列表
  getAddresses: () => request.get('/api/addresses'),
  
  // 创建地址
  createAddress: (data) => request.post('/api/addresses', data),
  
  // 更新地址
  updateAddress: (id, data) => request.put(`/api/addresses/${id}`, data),
  
  // 删除地址
  deleteAddress: (id) => request.delete(`/api/addresses/${id}`),
  
  // 设置默认地址
  setDefaultAddress: (id) => request.patch(`/api/addresses/${id}/default`)
}
```

### 5.5 运费 API 模块

**文件**: `src/api/modules/shipping.js`

```javascript
import { request } from '../request'

export const shippingAPI = {
  // 获取运费标准
  getShippingRates: () => request.get('/api/shipping/rates'),
  
  // 计算运费
  calculateShipping: (data) => request.post('/api/shipping/calculate', data)
}
```

---

## 状态管理 (Pinia)

### 6.1 购物车 Store

**文件**: `src/stores/modules/cart.js`

```javascript
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    selectedProducts: [],
    quantities: {}
  }),

  getters: {
    // 已选商品数量
    selectedCount: (state) => {
      return Object.values(state.quantities)
        .reduce((sum, qty) => sum + qty, 0)
    },

    // 商品总价
    totalPrice: (state) => {
      return state.selectedProducts.reduce((sum, product) => {
        const qty = state.quantities[product.id] || 0
        return sum + product.price * qty
      }, 0)
    },

    // 商品总重量
    totalWeight: (state) => {
      return state.selectedProducts.reduce((sum, product) => {
        const qty = state.quantities[product.id] || 0
        return sum + product.weight * qty
      }, 0)
    }
  },

  actions: {
    // 增加数量
    increaseQuantity(productId) {
      this.quantities[productId] = (this.quantities[productId] || 0) + 1
      this.updateSelectedProducts()
    },

    // 减少数量
    decreaseQuantity(productId) {
      if (this.quantities[productId] > 0) {
        this.quantities[productId]--
        this.updateSelectedProducts()
      }
    },

    // 更新已选商品
    updateSelectedProducts() {
      this.selectedProducts = Object.keys(this.quantities)
        .filter(id => this.quantities[id] > 0)
        .map(id => {
          const product = this.$state.productStore?.getProductById?.(id)
          return product && { ...product, quantity: this.quantities[id] }
        })
        .filter(Boolean)
    },

    // 清空购物车
    clearCart() {
      this.selectedProducts = []
      this.quantities = {}
    }
  }
})
```

---

## 开发规范

### 7.1 命名规范

```javascript
// 变量: camelCase
const userName = '张三'
const totalAmount = 100

// 常量: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://118.126.105.146:8081'
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

// 函数: camelCase
const getUserInfo = () => {}
const handleSubmit = () => {}

// 组件: PascalCase
<ProductCard />
<AddressSelector />

// 文件: kebab-case
product-card.vue
address-parser.js
```

### 7.2 组件规范

```vue
<template>
  <!-- Template 内容 -->
</template>

<script setup>
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'

// 2. Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// 3. Emits
const emit = defineEmits(['update', 'delete'])

// 4. Stores
const store = useStore()

// 5. 响应式数据
const loading = ref(false)

// 6. 计算属性
const totalPrice = computed(() => {
  return props.product.price * props.product.quantity
})

// 7. 方法
const handleClick = () => {
  emit('update', props.product)
}

// 8. 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>

<style lang="scss" scoped>
// 样式内容
</style>
```

---

## UI 设计规范

### 8.1 颜色系统

```scss
// styles/variables.scss

// 主题色
$primary-color: #ff6034;       // 主色（橙红色）
$primary-gradient: linear-gradient(135deg, #ff6034 0%, #ee0a24 100%);

// 功能色
$success-color: #52c41a;       // 成功
$warning-color: #faad14;       // 警告
$error-color: #f5222d;         // 错误
$info-color: #1890ff;          // 信息

// 文字色
$text-color-primary: #212121;  // 主要文字
$text-color-secondary: #757575; // 次要文字
$text-color-disabled: #bdbdbd; // 禁用文字

// 背景色
$bg-color: #f5f5f5;            // 页面背景
$bg-color-white: #ffffff;      // 卡片背景

// 边框色
$border-color: #e0e0e0;

// 阴影
$box-shadow-base: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
$box-shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
```

### 8.2 字体系统

```scss
// 字号
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-base: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;
$font-size-xxl: 40rpx;

// 字重
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 8.3 间距系统

```scss
// 间距
$spacing-xs: 8rpx;
$spacing-sm: 16rpx;
$spacing-base: 24rpx;
$spacing-lg: 32rpx;
$spacing-xl: 48rpx;

// 圆角
$border-radius-sm: 8rpx;
$border-radius-base: 16rpx;
$border-radius-lg: 24rpx;
$border-radius-full: 9999rpx;
```

---

## 构建配置

### 9.1 package.json

```json
{
  "name": "llx-rice-shop-uniapp",
  "version": "1.0.0",
  "description": "林龍香大米商城 Uni-app 版本",
  "scripts": {
    "dev:mp-weixin": "uni -p mp-weixin",
    "dev:h5": "uni",
    "build:mp-weixin": "uni build -p mp-weixin",
    "build:h5": "uni build",
    "lint": "eslint --ext .vue,.js src",
    "lint:fix": "eslint --ext .vue,.js src --fix"
  },
  "dependencies": {
    "@dcloudio/uni-app": "^3.0.0",
    "vue": "^3.3.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.0.0",
    "@dcloudio/vite-plugin-uni": "^3.0.0",
    "vite": "^4.4.0",
    "sass": "^1.64.0",
    "eslint": "^8.45.0",
    "eslint-plugin-vue": "^9.15.0",
    "prettier": "^3.0.0"
  }
}
```

### 9.2 环境变量

**`.env.development`**
```
VITE_API_BASE_URL=http://118.126.105.146:8081
VITE_ENABLE_DEBUG=true
```

**`.env.production`**
```
VITE_API_BASE_URL=http://118.126.105.146:8081
VITE_ENABLE_DEBUG=false
```

---

## 开发流程

### 10.1 初始化项目

```bash
# 1. 创建 Uni-app 项目
npx degit dcloudio/uni-preset-vue#vite-ts my-project

# 2. 安装依赖
pnpm install

# 3. 安装额外依赖
pnpm add pinia axios element-plus sass

# 4. 启动开发服务器
pnpm dev:mp-weixin
```

### 10.2 开发步骤

1. **创建项目结构**
   - 创建 API 目录和模块
   - 创建 Store 目录和模块
   - 创建 components 目录和组件
   - 创建 pages 目录和页面

2. **实现核心功能**
   - 商品管理模块
   - 地址管理模块
   - 订单管理模块
   - 个人中心模块

3. **UI 优化**
   - 统一样式
   - 添加动画效果
   - 优化交互体验

4. **测试和部署**
   - 功能测试
   - 性能优化
   - 打包发布

---

## 测试与部署

### 11.1 功能测试清单

- [ ] 商品列表展示
- [ ] 商品添加/编辑/删除
- [ ] 购物车功能
- [ ] 结算流程
- [ ] 地址管理
- [ ] 智能地址识别
- [ ] 订单列表
- [ ] 订单详情
- [ ] 订单状态更新
- [ ] 快递单号管理
- [ ] 运费计算
- [ ] 多选批量删除

### 11.2 部署步骤

```bash
# 1. 构建生产版本
pnpm build:mp-weixin

# 2. 使用微信开发者工具打开
dist/dev/mp-weixin

# 3. 上传代码
# 在微信开发者工具中点击"上传"
```

---

## 📖 参考文档

1. **林龍香大米商城-Vue3版本开发需求文档.md** - 功能需求
2. **【林龍香大米商城完整文档】v2.4.md** - 业务逻辑
3. **server/API接口文档.md** - API 接口定义
4. **server/后端服务设计方案.md** - 后端架构

---

## ✅ 项目特点

✨ **现代化技术栈** - Vue3 + Uni-app + Pinia + Axios + SCSS  
🎨 **精美 UI 设计** - 电商红橙渐变配色，立体卡片效果  
📱 **跨平台支持** - 小程序、H5、App 多端统一  
🚀 **高性能** - 利用 Vue3 响应式系统优化  
💪 **易维护** - 组件化、模块化、规范化  
🛡️ **类型安全** - JSDoc 类型注释  
🔧 **开发友好** - Vite 热更新，Axios 拦截器  

---

**文档版本**: v1.0  
**创建日期**: 2025-01-27  
**维护状态**: ✅ 活跃开发中

© 2025 林龍香大米商城 All Rights Reserved.

