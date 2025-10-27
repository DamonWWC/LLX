# 林龍香大米商城 - Vue3 + Uni-app 版本开发需求文档

## 📋 项目概述

### 项目背景
将现有微信小程序原生项目重构为 Vue3 + Uni-app 版本，保持所有功能一致，提升代码可维护性和开发效率。

### 技术栈
- **前端框架**: Vue3 + Uni-app
- **开发语言**: JavaScript (ES2020+)
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **样式语言**: SCSS (Sass)
- **UI 组件**: Element-Plus (H5) / 自定义组件 (小程序)
- **构建工具**: Vite
- **包管理器**: pnpm

### 后端 API
- **基础 URL**: `http://118.126.105.146:8081`
- **接口文档**: 参考 `server/API接口文档.md`
- **数据格式**: JSON
- **响应格式**: 统一的成功/失败响应结构

---

## 🎯 核心功能需求

### 1. 商品管理模块

#### 1.1 商品列表展示
**页面**: `pages/index/index.vue`

**功能需求**:
- 展示所有商品，采用卡片式布局
- 每个商品卡片包含：
  - 商品图片 (默认使用 SVG 占位图)
  - 商品名称
  - 商品价格 (红色大字体显示，如：¥88)
  - 商品单位 (袋/箱)
  - 商品重量 (如：10斤/袋)
  - 数量加减控制器 (+ / - 按钮)
  - 当前选购数量显示

**数据源**: 
```javascript
// API: GET /api/products
// 返回数据格式:
[
  {
    "id": 1,
    "name": "长粒香",
    "price": 88,
    "unit": "袋",
    "weight": 10,
    "image": "https://example.com/image.jpg"
  }
]
```

**UI 要求**:
- 电商红橙渐变配色 (#ff6034 → #ee0a24)
- 立体卡片效果 (box-shadow)
- 圆形渐变控制按钮
- 价格超大红色显示 (40rpx)
- 悬停效果和点击缩放反馈

#### 1.2 添加商品功能
**触发**: 点击右上角 "+" 按钮

**功能需求**:
- 弹出对话框，包含表单：
  - 商品名称 (必填)
  - 商品价格 (必填，数字类型)
  - 商品重量 (必填，数字类型)
  - 商品单位 (必填，选择：袋/箱)
  - 商品图片 (可选，支持上传)

**API 调用**:
```javascript
// POST /api/products
{
  "name": "五常稻花香",
  "price": 128,
  "unit": "袋",
  "weight": 10,
  "image": "https://example.com/image.jpg"
}
```

**验证规则**:
- 名称: 2-20 个字符
- 价格: 大于 0 的数字
- 重量: 大于 0 的数字
- 单位: 必须是 "袋" 或 "箱"

#### 1.3 编辑商品功能
**触发**: 长按商品卡片或点击编辑按钮

**功能需求**:
- 弹出编辑对话框，预填充当前商品信息
- 支持修改所有字段
- 保存后更新商品列表

**API 调用**:
```javascript
// PUT /api/products/{id}
{
  "name": "五常稻花香",
  "price": 138,
  "unit": "袋",
  "weight": 10,
  "image": "https://example.com/image.jpg"
}
```

#### 1.4 删除商品功能
**触发**: 点击删除按钮

**功能需求**:
- 弹出确认对话框
- 确认后删除商品
- 更新商品列表

**API 调用**:
```javascript
// DELETE /api/products/{id}
```

#### 1.5 数量控制功能
**功能需求**:
- 点击 "+" 按钮增加数量
- 点击 "-" 按钮减少数量 (最小为 0)
- 实时更新购物车总数
- 数量为 0 时显示灰色，大于 0 时显示红色

**状态管理**: 使用 Pinia Store 管理选购数量

#### 1.6 购物车统计
**显示位置**: 右下角悬浮按钮

**功能需求**:
- 显示购物车图标和徽章
- 徽章显示已选商品的总数量
- 实时更新数量变化
- 点击跳转到结算页面

---

### 2. 结算模块

#### 2.1 结算页面
**页面**: `pages/checkout/index.vue`

**功能需求**:
- 展示已选商品明细：
  - 商品名称、单价、数量、小计
  - 支持多个商品
- 显示收货地址：
  - 未选择时显示 "请选择收货地址"
  - 已选择时显示完整地址信息
  - 点击可跳转地址选择页面
- 显示价格汇总：
  - 商品总价
  - 运费 (根据地址和重量计算)
  - 总计金额

**数据结构**:
```javascript
{
  selectedProducts: [
    {
      id: 1,
      name: "长粒香",
      price: 88,
      quantity: 2,
      weight: 10,
      subtotal: 176
    }
  ],
  selectedAddress: {
    id: 1,
    name: "张三",
    phone: "13800138000",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    detail: "科技园南路1号"
  },
  totalPrice: 176,
  totalWeight: 20,
  shippingRate: 1.4,
  totalShipping: 28,
  grandTotal: 204
}
```

#### 2.2 运费计算
**API 调用**:
```javascript
// POST /api/shipping/calculate
{
  "province": "广东省",
  "weight": 20
}

// 返回:
{
  "province": "广东省",
  "weight": 20,
  "shippingRate": 1.4,
  "totalShipping": 28,
  "region": "华南地区"
}
```

**运费规则**:
- 东北地区（黑吉辽）：1.0元/斤
- 华北地区（京津冀鲁晋蒙豫）：1.2元/斤
- 华东地区（沪苏浙皖闽赣）：1.4元/斤
- 华南地区（粤桂琼）：1.4元/斤
- 华中地区（鄂湘）：1.4元/斤
- 西南地区（渝川黔滇）：1.4元/斤
- 西北地区（陕甘宁）：1.4元/斤
- 偏远地区（藏青新）：5.4元/斤

#### 2.3 提交订单
**触发**: 点击 "确认下单" 按钮

**功能需求**:
- 验证是否选择收货地址
- 验证是否有商品
- 提交订单数据到后端
- 成功后跳转到订单列表

**API 调用**:
```javascript
// POST /api/orders
{
  "products": [
    {
      "id": 1,
      "name": "长粒香",
      "price": 88,
      "quantity": 2,
      "unit": "袋",
      "weight": 10,
      "subtotal": 176
    }
  ],
  "address": {
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园南路1号"
  },
  "totalPrice": 176,
  "totalWeight": 20,
  "shippingRate": 1.4,
  "totalShipping": 28,
  "grandTotal": 204,
  "status": "待发货",
  "paymentStatus": "未付款"
}
```

---

### 3. 地址管理模块

#### 3.1 地址列表页面
**页面**: `pages/address/index.vue`

**功能需求**:
- 展示所有收货地址
- 每个地址卡片包含：
  - 收货人姓名和电话
  - 省市区和详细地址
  - 默认地址标识 (如果是默认地址)
  - 编辑按钮
  - 删除按钮
- 添加新地址按钮 (底部悬浮或顶部)

**数据源**:
```javascript
// API: GET /api/addresses
[
  {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园南路1号",
    "isDefault": true
  }
]
```

#### 3.2 地址选择功能
**场景**: 从结算页面进入地址列表

**功能需求**:
- 展示所有地址，每个地址可点击
- 点击地址后返回结算页面
- 将选中的地址传回结算页面
- 自动计算运费

**实现方式**:
```javascript
// 跳转时携带参数
uni.navigateTo({
  url: '/pages/address/index?from=checkout'
})

// 选择地址后返回
const pages = getCurrentPages()
const prevPage = pages[pages.length - 2]
prevPage.setData({
  selectedAddress: address
})
uni.navigateBack()
```

#### 3.3 添加地址功能
**触发**: 点击 "添加新地址" 按钮

**功能需求**:
- 弹出表单对话框或跳转到新页面
- 表单包含：
  - 收货人姓名 (必填)
  - 手机号码 (必填，11 位数字)
  - 省份选择 (必填，34 个省市自治区)
  - 城市选择 (必填)
  - 区县选择 (必填)
  - 详细地址 (必填)
  - 设为默认地址 (可选，复选框)

**API 调用**:
```javascript
// POST /api/addresses
{
  "name": "张三",
  "phone": "13800138000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "detail": "科技园南路1号",
  "isDefault": false
}
```

**验证规则**:
- 姓名: 2-20 个字符
- 手机号: 11 位数字，以 1 开头
- 详细地址: 5-100 个字符

#### 3.4 智能地址识别
**触发**: 点击 "智能粘贴" 按钮

**功能需求**:
- 读取剪贴板内容
- 使用地址解析算法 (`utils/addressParser.js`) 识别
- 自动填充表单各字段
- 支持多种格式：
  - 格式1: 张三 13800138000 广东省深圳市南山区科技园南路1号
  - 格式2: 13800138000 广东省深圳市南山区科技园南路1号 张三
  - 格式3: 广东省深圳市南山区科技园南路1号 张三 13800138000
  - 格式4: 收件人：张三 电话：13800138000 地址：广东省深圳市南山区科技园南路1号

**地址解析算法特点**:
- 支持任意顺序识别姓名、电话、地址
- 6 种姓名提取策略
- 直辖市优化 (北京、天津、上海、重庆)
- 识别遮蔽号码 (如：138****0000)
- 34 个省市自治区识别

**实现参考**:
```javascript
// utils/addressParser.js
import { parseAddress } from '@/utils/addressParser'

// 使用
const text = "张三 13800138000 广东省深圳市南山区科技园南路1号"
const result = parseAddress(text)

// result:
{
  name: "张三",
  phone: "13800138000",
  province: "广东省",
  city: "深圳市",
  district: "南山区",
  detail: "科技园南路1号"
}
```

#### 3.5 编辑地址功能
**触发**: 点击地址卡片的编辑按钮

**功能需求**:
- 弹出编辑对话框，预填充地址信息
- 支持修改所有字段
- 保存后更新地址列表

**API 调用**:
```javascript
// PUT /api/addresses/{id}
{
  "name": "李四",
  "phone": "13900139000",
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区",
  "detail": "科技园南路2号",
  "isDefault": true
}
```

#### 3.6 删除地址功能
**触发**: 点击删除按钮

**功能需求**:
- 弹出确认对话框
- 确认后删除地址
- 更新地址列表

**API 调用**:
```javascript
// DELETE /api/addresses/{id}
```

#### 3.7 设置默认地址
**触发**: 点击 "设为默认" 或切换开关

**功能需求**:
- 将当前地址设置为默认
- 取消其他地址的默认状态
- 更新列表显示

**API 调用**:
```javascript
// PATCH /api/addresses/{id}/default
```

---

### 4. 订单管理模块

#### 4.1 订单列表页面
**页面**: `pages/orders/index.vue`

**功能需求**:
- 展示所有订单，采用卡片式布局
- 每个订单卡片包含：
  - 订单号 (如：ORD20250122103000)
  - 订单状态 (待付款/待发货/已发货)
  - 支付状态 (未付款/已付款)
  - 收货人信息 (姓名、电话)
  - 收货地址
  - 商品明细 (名称、数量、价格)
  - 订单金额 (商品总价、运费、总计)
  - 创建时间
  - 操作按钮 (查看详情、删除、更多操作)

**数据源**:
```javascript
// API: GET /api/orders
[
  {
    "id": 1,
    "orderNumber": "ORD20250122103000",
    "status": "待发货",
    "paymentStatus": "未付款",
    "products": [
      {
        "id": 1,
        "name": "长粒香",
        "price": 88,
        "quantity": 2,
        "unit": "袋",
        "weight": 10,
        "subtotal": 176
      }
    ],
    "address": {
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南路1号"
    },
    "totalPrice": 176,
    "totalWeight": 20,
    "shippingRate": 1.4,
    "totalShipping": 28,
    "grandTotal": 204,
    "createdAt": "2025-01-22T10:30:00Z",
    "trackingNumber": null
  }
]
```

#### 4.2 订单状态筛选
**触发**: 点击顶部状态标签或下拉选择

**功能需求**:
- 提供状态筛选选项：
  - 全部
  - 待付款
  - 待发货
  - 已发货
- 点击后筛选对应状态的订单
- 高亮显示当前选中状态

**实现方式**:
```javascript
// 客户端筛选
const filteredOrders = computed(() => {
  if (currentStatus.value === '全部') {
    return orders.value
  }
  return orders.value.filter(order => order.status === currentStatus.value)
})
```

#### 4.3 订单搜索功能
**触发**: 在搜索框输入关键字

**功能需求**:
- 支持按收货人姓名搜索
- 支持按收货人电话搜索
- 实时搜索，输入即过滤
- 显示搜索结果数量

**实现方式**:
```javascript
// 搜索过滤
const searchedOrders = computed(() => {
  if (!searchKeyword.value) {
    return filteredOrders.value
  }
  return filteredOrders.value.filter(order => {
    const name = order.address.name.toLowerCase()
    const phone = order.address.phone
    const keyword = searchKeyword.value.toLowerCase()
    return name.includes(keyword) || phone.includes(keyword)
  })
})
```

#### 4.4 订单详情页面
**页面**: `pages/order-detail/index.vue`

**功能需求**:
- 完整展示订单信息：
  - 订单号、状态、支付状态
  - 收货人完整信息
  - 商品明细列表
  - 价格明细 (商品总价、运费、总计)
  - 快递单号 (如果已发货)
  - 创建时间、更新时间
- 操作按钮：
  - 返回列表
  - 确认收货 (已发货状态)
  - 删除订单

**数据源**:
```javascript
// API: GET /api/orders/{id}
// 返回单个订单的完整信息
```

#### 4.5 订单状态更新
**场景**: 更新订单状态和支付状态

**功能需求**:
- 待付款 → 待发货: 点击 "确认付款"
- 待发货 → 已发货: 点击 "确认发货"，可输入快递单号
- 更新订单列表显示

**API 调用**:
```javascript
// PATCH /api/orders/{id}/status
{
  "status": "已发货"
}

// PATCH /api/orders/{id}/payment-status
{
  "paymentStatus": "已付款"
}
```

#### 4.6 快递单号管理
**场景**: 订单发货时添加快递单号

**功能需求**:
- 点击 "确认发货" 时弹出对话框
- 输入快递单号 (可选)
- 保存后更新订单信息
- 已添加快递单号的订单可以编辑

**API 调用**:
```javascript
// PATCH /api/orders/{id}/tracking
{
  "trackingNumber": "SF1234567890"
}
```

**显示要求**:
- 已发货且有快递单号: 显示 "快递单号：SF1234567890"
- 已发货但无快递单号: 显示 "添加快递单号" 按钮
- 未发货: 不显示快递单号相关内容

#### 4.7 多选订单功能
**触发**: 点击 "多选" 按钮或长按订单卡片

**功能需求**:
- 进入多选模式，每个订单卡片左侧显示复选框
- 可选择多个订单
- 底部显示：
  - 已选订单数量
  - 选中订单的总金额
- 操作按钮：
  - 取消选择
  - 批量删除

**实现方式**:
```javascript
// 数据结构
const isMultiSelectMode = ref(false)
const selectedOrders = ref([])

// 计算总金额
const totalAmount = computed(() => {
  return selectedOrders.value.reduce((sum, order) => {
    return sum + order.grandTotal
  }, 0)
})
```

#### 4.8 删除订单功能
**触发**: 点击删除按钮或批量删除

**功能需求**:
- 单个删除: 点击订单的删除按钮
- 批量删除: 多选模式下点击 "批量删除" 按钮
- 弹出确认对话框
- 确认后删除订单
- 更新订单列表

**API 调用**:
```javascript
// 单个删除: DELETE /api/orders/{id}

// 批量删除: DELETE /api/orders/batch
{
  "ids": [1, 2, 3]
}
```

---

### 5. 个人中心模块

#### 5.1 我的页面
**页面**: `pages/my/index.vue`

**功能需求**:
- 用户信息展示 (头像、昵称)
- 统计信息：
  - 订单数量 (总数、待付款、待发货、已发货)
  - 收货地址数量
- 功能入口：
  - 订单管理 (跳转到订单列表)
  - 收货地址 (跳转到地址列表)
  - 运费查询 (跳转到运费标准页面)
  - 设置 (预留)

**数据源**:
```javascript
// 订单统计
const orderStats = await orderAPI.getOrders()
const totalOrders = orderStats.length
const pendingPayment = orderStats.filter(o => o.paymentStatus === '未付款').length
const pendingShipment = orderStats.filter(o => o.status === '待发货').length
const shipped = orderStats.filter(o => o.status === '已发货').length

// 地址统计
const addresses = await addressAPI.getAddresses()
const totalAddresses = addresses.length
```

---

### 6. 运费查询模块

#### 6.1 运费标准页面
**页面**: `pages/shipping/index.vue`

**功能需求**:
- 展示所有省份的运费标准
- 按区域分组显示：
  - 东北地区
  - 华北地区
  - 华东地区
  - 华南地区
  - 华中地区
  - 西南地区
  - 西北地区
  - 偏远地区
- 每个区域显示：
  - 包含的省份
  - 运费单价 (元/斤)
- 支持搜索省份
- 显示运费计算示例

**数据源**:
```javascript
// API: GET /api/shipping/rates
[
  {
    "id": 1,
    "province": "黑龙江省",
    "shippingRate": 1.0,
    "region": "东北地区"
  },
  {
    "id": 2,
    "province": "北京市",
    "shippingRate": 1.2,
    "region": "华北地区"
  }
]
```

**搜索功能**:
```javascript
// 搜索省份
const searchResults = computed(() => {
  if (!searchKeyword.value) {
    return shippingRates.value
  }
  return shippingRates.value.filter(rate => {
    return rate.province.includes(searchKeyword.value) || 
           rate.region.includes(searchKeyword.value)
  })
})
```

---

## 🏗️ 项目结构

```
llx-rice-shop-uniapp/
├── src/
│   ├── api/                      # API 接口管理
│   │   ├── modules/
│   │   │   ├── product.js       # 商品接口
│   │   │   ├── address.js       # 地址接口
│   │   │   ├── order.js         # 订单接口
│   │   │   └── shipping.js      # 运费接口
│   │   ├── request.js           # Axios 请求封装
│   │   └── index.js             # 接口入口
│   │
│   ├── components/               # 公共组件
│   │   ├── ProductCard/         # 商品卡片
│   │   ├── AddressCard/         # 地址卡片
│   │   ├── OrderCard/           # 订单卡片
│   │   ├── QuantityControl/     # 数量控制器
│   │   └── Empty/               # 空状态
│   │
│   ├── composables/              # 组合式函数
│   │   ├── useProduct.js        # 商品相关逻辑
│   │   ├── useAddress.js        # 地址相关逻辑
│   │   ├── useOrder.js          # 订单相关逻辑
│   │   └── useShipping.js       # 运费相关逻辑
│   │
│   ├── stores/                   # Pinia 状态管理
│   │   ├── modules/
│   │   │   ├── product.js       # 商品状态
│   │   │   ├── address.js       # 地址状态
│   │   │   ├── order.js         # 订单状态
│   │   │   ├── cart.js          # 购物车状态
│   │   │   └── user.js          # 用户状态
│   │   └── index.js             # Store 入口
│   │
│   ├── pages/                    # 页面
│   │   ├── index/               # 商品列表
│   │   │   └── index.vue
│   │   ├── checkout/            # 结算页面
│   │   │   └── index.vue
│   │   ├── address/             # 地址管理
│   │   │   └── index.vue
│   │   ├── orders/              # 订单列表
│   │   │   └── index.vue
│   │   ├── order-detail/        # 订单详情
│   │   │   └── index.vue
│   │   ├── shipping/            # 运费查询
│   │   │   └── index.vue
│   │   └── my/                  # 个人中心
│   │       └── index.vue
│   │
│   ├── utils/                    # 工具函数
│   │   ├── addressParser.js     # 地址解析算法
│   │   ├── validator.js         # 表单验证
│   │   ├── formatter.js         # 数据格式化
│   │   └── common.js
│   │
│   ├── styles/                   # 样式文件
│   │   ├── variables.scss       # SCSS 变量
│   │   ├── mixins.scss          # SCSS 混合
│   │   ├── common.scss          # 公共样式
│   │   └── theme.scss           # 主题样式
│   │
│   ├── App.vue                  # 应用入口
│   ├── main.js                  # 主入口文件
│   ├── pages.json               # 页面配置
│   ├── manifest.json            # 应用配置
│   └── uni.scss                 # uni-app 全局样式变量
│
├── .env.development             # 开发环境变量
├── .env.production              # 生产环境变量
├── .eslintrc.js                 # ESLint 配置
├── .prettierrc.js               # Prettier 配置
├── vite.config.js               # Vite 配置
├── package.json                 # 项目依赖
└── README.md                    # 项目说明
```

---

## 📦 依赖配置

### package.json

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
    "@dcloudio/uni-h5": "^3.0.0",
    "@dcloudio/uni-mp-weixin": "^3.0.0",
    "vue": "^3.3.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@dcloudio/types": "^3.0.0",
    "@dcloudio/uni-cli-shared": "^3.0.0",
    "@dcloudio/vite-plugin-uni": "^3.0.0",
    "vite": "^4.4.0",
    "sass": "^1.64.0",
    "eslint": "^8.45.0",
    "eslint-plugin-vue": "^9.15.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 🎨 UI 设计规范

### 颜色系统

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

### 字体系统

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

### 间距系统

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

## 🔧 核心实现

### 1. Axios 请求封装

```javascript
// utils/request.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://118.126.105.146:8081',
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
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(new Error(data.message || '请求失败'))
    }
    
    // 返回数据
    return data.data || data
  },
  (error) => {
    // HTTP 错误处理
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
        default:
          uni.showToast({ title: '请求失败', icon: 'none' })
      }
    } else {
      uni.showToast({ title: '网络请求失败', icon: 'none' })
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

### 2. API 模块封装

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
  
  // 更新快递单号
  updateTrackingNumber: (id, data) => request.patch(`/api/orders/${id}/tracking`, data),
  
  // 删除订单
  deleteOrder: (id) => request.delete(`/api/orders/${id}`),
  
  // 批量删除订单
  deleteOrdersBatch: (ids) => request.delete('/api/orders/batch', { ids })
}
```

```javascript
// api/modules/address.js
import { request } from '@/utils/request'

export const addressAPI = {
  // 获取地址列表
  getAddresses: () => request.get('/api/addresses'),
  
  // 获取单个地址
  getAddressById: (id) => request.get(`/api/addresses/${id}`),
  
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

```javascript
// api/modules/shipping.js
import { request } from '@/utils/request'

export const shippingAPI = {
  // 获取运费标准
  getShippingRates: () => request.get('/api/shipping/rates'),
  
  // 计算运费
  calculateShipping: (data) => request.post('/api/shipping/calculate', data)
}
```

### 3. Pinia Store 实现

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
        this.productList = data.map(p => ({ ...p, quantity: 0 }))
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

### 4. 地址解析工具

```javascript
// utils/addressParser.js

/**
 * 地址解析工具
 * 支持任意顺序识别姓名、电话、地址
 */

// 34 个省市自治区
const provinces = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
  '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区',
  '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区'
]

// 直辖市
const municipalities = ['北京', '天津', '上海', '重庆']

/**
 * 解析地址文本
 * @param {string} text - 地址文本
 * @returns {object} 解析结果
 */
export function parseAddress(text) {
  if (!text || typeof text !== 'string') {
    return null
  }

  // 清理文本
  text = text.trim().replace(/\s+/g, ' ')

  // 提取姓名
  const name = extractName(text)

  // 提取电话
  const phone = extractPhone(text)

  // 提取地址
  const address = extractAddress(text, name, phone)

  return {
    name: name || '',
    phone: phone || '',
    province: address.province || '',
    city: address.city || '',
    district: address.district || '',
    detail: address.detail || ''
  }
}

/**
 * 提取姓名（6 种策略）
 */
function extractName(text) {
  // 策略1: 收件人：xxx
  let match = text.match(/(?:收件人|姓名|联系人)[：:]\s*([^\s，,。.]{2,4})/)
  if (match) return match[1]

  // 策略2: 开头的中文姓名
  match = text.match(/^([^\s\d]{2,4})\s/)
  if (match) return match[1]

  // 策略3: 电话前的姓名
  match = text.match(/([^\s\d]{2,4})\s*1[3-9]\d{9}/)
  if (match) return match[1]

  // 策略4: 地址前的姓名
  const provinceMatch = provinces.find(p => text.includes(p))
  if (provinceMatch) {
    const index = text.indexOf(provinceMatch)
    const beforeProvince = text.substring(0, index)
    match = beforeProvince.match(/([^\s\d]{2,4})$/)
    if (match) return match[1]
  }

  // 策略5: 电话后的姓名
  match = text.match(/1[3-9]\d{9}\s*([^\s\d]{2,4})/)
  if (match) return match[1]

  // 策略6: 结尾的姓名
  match = text.match(/([^\s\d]{2,4})$/)
  if (match) return match[1]

  return null
}

/**
 * 提取电话
 */
function extractPhone(text) {
  // 标准 11 位手机号
  let match = text.match(/1[3-9]\d{9}/)
  if (match) return match[0]

  // 带空格的手机号: 138 0013 8000
  match = text.match(/1[3-9]\d\s*\d{4}\s*\d{4}/)
  if (match) return match[0].replace(/\s/g, '')

  // 带横线的手机号: 138-0013-8000
  match = text.match(/1[3-9]\d[-]\d{4}[-]\d{4}/)
  if (match) return match[0].replace(/-/g, '')

  // 带括号的手机号: (138)0013-8000
  match = text.match(/\(1[3-9]\d\)\d{4}[-]\d{4}/)
  if (match) return match[0].replace(/[()-]/g, '')

  return null
}

/**
 * 提取地址
 */
function extractAddress(text, name, phone) {
  // 移除姓名和电话
  let addressText = text
  if (name) {
    addressText = addressText.replace(new RegExp(name, 'g'), '')
  }
  if (phone) {
    addressText = addressText.replace(new RegExp(phone, 'g'), '')
  }

  // 移除标签
  addressText = addressText.replace(/(?:收件人|姓名|联系人|电话|地址)[：:]/g, '')
  addressText = addressText.trim()

  // 提取省份
  let province = null
  for (const p of provinces) {
    if (addressText.includes(p)) {
      province = p
      break
    }
  }

  // 如果没有找到省份，尝试简称
  if (!province) {
    for (const p of provinces) {
      const shortName = p.replace(/[省市自治区]/g, '')
      if (addressText.includes(shortName)) {
        province = p
        break
      }
    }
  }

  if (!province) {
    return { province: '', city: '', district: '', detail: addressText }
  }

  // 提取城市和区县
  const provinceIndex = addressText.indexOf(province)
  const afterProvince = addressText.substring(provinceIndex + province.length)

  // 城市正则
  const cityMatch = afterProvince.match(/^([^市县区]+[市州盟])/)
  const city = cityMatch ? cityMatch[1] : ''

  // 区县正则
  let district = ''
  let detail = afterProvince
  if (city) {
    const afterCity = afterProvince.substring(city.length)
    const districtMatch = afterCity.match(/^([^县区]+[县区])/)
    district = districtMatch ? districtMatch[1] : ''
    detail = districtMatch ? afterCity.substring(district.length) : afterCity
  }

  // 处理直辖市
  if (municipalities.some(m => province.includes(m))) {
    if (!city) {
      const districtMatch = afterProvince.match(/^([^县区]+[县区])/)
      district = districtMatch ? districtMatch[1] : ''
      detail = districtMatch ? afterProvince.substring(district.length) : afterProvince
    }
  }

  return {
    province,
    city,
    district,
    detail: detail.trim()
  }
}
```

### 5. 页面实现示例

```vue
<!-- pages/index/index.vue -->
<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="header">
      <view class="title">商品列表</view>
      <view class="actions">
        <button class="add-btn" @click="showAddDialog = true">
          <text class="icon">+</text>
          添加商品
        </button>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view
        v-for="product in productList"
        :key="product.id"
        class="product-card"
      >
        <!-- 商品图片 -->
        <image
          class="product-image"
          :src="product.image"
          mode="aspectFill"
        />

        <!-- 商品信息 -->
        <view class="product-info">
          <view class="product-name">{{ product.name }}</view>
          <view class="product-price">¥{{ product.price }}</view>
          <view class="product-spec">
            {{ product.weight }}斤/{{ product.unit }}
          </view>
        </view>

        <!-- 数量控制 -->
        <view class="quantity-control">
          <button
            class="btn-minus"
            :disabled="product.quantity === 0"
            @click="decrease(product.id)"
          >
            -
          </button>
          <text class="quantity">{{ product.quantity }}</text>
          <button class="btn-plus" @click="increase(product.id)">
            +
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="productList.length === 0" class="empty">
        <text>暂无商品</text>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="bottom-bar" v-if="selectedCount > 0">
      <view class="cart-info">
        <view class="total">
          <text class="label">合计:</text>
          <text class="price">¥{{ totalPrice }}</text>
        </view>
        <view class="count">已选 {{ selectedCount }} 件商品</view>
      </view>
      <button class="checkout-btn" @click="goCheckout">
        去结算
      </button>
    </view>

    <!-- 添加商品对话框 -->
    <uni-popup ref="addPopup" type="dialog">
      <view class="dialog">
        <view class="dialog-title">添加商品</view>
        <view class="dialog-content">
          <view class="form-item">
            <text class="label">商品名称</text>
            <input
              v-model="newProduct.name"
              placeholder="请输入商品名称"
            />
          </view>
          <view class="form-item">
            <text class="label">商品价格</text>
            <input
              v-model="newProduct.price"
              type="digit"
              placeholder="请输入价格"
            />
          </view>
          <view class="form-item">
            <text class="label">商品重量</text>
            <input
              v-model="newProduct.weight"
              type="digit"
              placeholder="请输入重量"
            />
          </view>
          <view class="form-item">
            <text class="label">商品单位</text>
            <picker
              :range="['袋', '箱']"
              @change="onUnitChange"
            >
              <view class="picker">
                {{ newProduct.unit || '请选择单位' }}
              </view>
            </picker>
          </view>
        </view>
        <view class="dialog-footer">
          <button @click="closeAddDialog">取消</button>
          <button type="primary" @click="confirmAdd">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/modules/product'

const productStore = useProductStore()

// 数据
const showAddDialog = ref(false)
const newProduct = ref({
  name: '',
  price: '',
  weight: '',
  unit: '袋'
})

// 计算属性
const productList = computed(() => productStore.productList)
const selectedCount = computed(() => productStore.selectedCount)
const totalPrice = computed(() => productStore.totalPrice)

// 方法
const increase = (productId) => {
  productStore.increaseQuantity(productId)
}

const decrease = (productId) => {
  productStore.decreaseQuantity(productId)
}

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

const onUnitChange = (e) => {
  newProduct.value.unit = ['袋', '箱'][e.detail.value]
}

const confirmAdd = async () => {
  // 验证表单
  if (!newProduct.value.name) {
    uni.showToast({ title: '请输入商品名称', icon: 'none' })
    return
  }
  if (!newProduct.value.price || newProduct.value.price <= 0) {
    uni.showToast({ title: '请输入正确的价格', icon: 'none' })
    return
  }
  if (!newProduct.value.weight || newProduct.value.weight <= 0) {
    uni.showToast({ title: '请输入正确的重量', icon: 'none' })
    return
  }

  try {
    await productStore.addProduct(newProduct.value)
    uni.showToast({ title: '添加成功', icon: 'success' })
    closeAddDialog()
  } catch (error) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const closeAddDialog = () => {
  showAddDialog.value = false
  newProduct.value = {
    name: '',
    price: '',
    weight: '',
    unit: '袋'
  }
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

  .title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
  }

  .add-btn {
    @include button-gradient;
    padding: $spacing-sm $spacing-base;
    border-radius: $border-radius-full;
    font-size: $font-size-sm;
  }
}

.product-list {
  padding: $spacing-base;
}

.product-card {
  @include card-style;
  @include flex-center-v;
  gap: $spacing-base;
  margin-bottom: $spacing-base;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  .product-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: $border-radius-base;
  }

  .product-info {
    flex: 1;

    .product-name {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-color-primary;
      margin-bottom: $spacing-xs;
    }

    .product-price {
      font-size: $font-size-xxl;
      font-weight: $font-weight-bold;
      color: $primary-color;
      margin-bottom: $spacing-xs;
    }

    .product-spec {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }

  .quantity-control {
    @include flex-center-v;
    gap: $spacing-sm;

    .btn-minus,
    .btn-plus {
      @include flex-center;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: $primary-gradient;
      color: #ffffff;
      font-size: $font-size-xl;
      border: none;

      &:disabled {
        background: $bg-color;
        color: $text-color-disabled;
      }
    }

    .quantity {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-color-primary;
      min-width: 60rpx;
      text-align: center;
    }
  }
}

.empty {
  @include flex-center;
  padding: 200rpx 0;
  font-size: $font-size-base;
  color: $text-color-secondary;
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

  .cart-info {
    flex: 1;

    .total {
      @include flex-center-v;
      gap: $spacing-xs;
      margin-bottom: $spacing-xs;

      .label {
        font-size: $font-size-base;
        color: $text-color-secondary;
      }

      .price {
        font-size: $font-size-xxl;
        font-weight: $font-weight-bold;
        color: $primary-color;
      }
    }

    .count {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }

  .checkout-btn {
    @include button-gradient;
    padding: $spacing-base $spacing-xl;
    border-radius: $border-radius-full;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
  }
}
</style>
```

---

## 📝 开发任务清单

### 阶段一：项目初始化 (1-2天)
- [ ] 创建 Uni-app 项目
- [ ] 配置 Vite 和依赖
- [ ] 配置 ESLint 和 Prettier
- [ ] 搭建项目目录结构
- [ ] 配置 pages.json 和 manifest.json
- [ ] 配置环境变量
- [ ] 封装 Axios 请求工具
- [ ] 测试 API 连通性

### 阶段二：商品管理模块 (2-3天)
- [ ] 创建商品 Store (Pinia)
- [ ] 实现商品列表页面
- [ ] 实现商品卡片组件
- [ ] 实现数量控制功能
- [ ] 实现添加商品功能
- [ ] 实现编辑商品功能
- [ ] 实现删除商品功能
- [ ] 实现购物车统计
- [ ] 测试商品管理功能

### 阶段三：地址管理模块 (2-3天)
- [ ] 创建地址 Store (Pinia)
- [ ] 实现地址列表页面
- [ ] 实现地址卡片组件
- [ ] 实现添加地址功能
- [ ] 集成地址解析工具
- [ ] 实现智能粘贴功能
- [ ] 实现编辑地址功能
- [ ] 实现删除地址功能
- [ ] 实现设置默认地址
- [ ] 实现地址选择功能
- [ ] 测试地址管理功能

### 阶段四：订单管理模块 (3-4天)
- [ ] 创建订单 Store (Pinia)
- [ ] 实现结算页面
- [ ] 实现运费计算
- [ ] 实现提交订单功能
- [ ] 实现订单列表页面
- [ ] 实现订单卡片组件
- [ ] 实现订单状态筛选
- [ ] 实现订单搜索功能
- [ ] 实现订单详情页面
- [ ] 实现订单状态更新
- [ ] 实现快递单号管理
- [ ] 实现多选订单功能
- [ ] 实现批量删除功能
- [ ] 测试订单管理功能

### 阶段五：其他模块 (1-2天)
- [ ] 实现个人中心页面
- [ ] 实现运费查询页面
- [ ] 实现底部 TabBar
- [ ] 优化页面跳转和参数传递

### 阶段六：UI 优化和测试 (2-3天)
- [ ] 统一样式和主题
- [ ] 添加加载和错误状态
- [ ] 优化交互动画
- [ ] 处理边界情况
- [ ] 完整流程测试
- [ ] 性能优化
- [ ] Bug 修复

---

## 🚀 启动项目

### 1. 安装依赖
```bash
pnpm install
```

### 2. 运行开发服务器

**小程序端**:
```bash
pnpm dev:mp-weixin
```

**H5 端**:
```bash
pnpm dev:h5
```

### 3. 构建生产版本

**小程序端**:
```bash
pnpm build:mp-weixin
```

**H5 端**:
```bash
pnpm build:h5
```

---

## 📖 参考文档

1. **【林龍香大米商城完整文档】v2.4.md** - 功能需求和业务逻辑
2. **API接口文档.md** - 后端接口定义
3. **Vue3-Uniapp重构技术方案.md** - 技术架构和实现方案
4. **后端服务设计方案.md** - 后端服务架构

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有页面和功能与原项目一致
- [ ] 所有 API 接口正常调用
- [ ] 数据展示和操作正确无误

### 用户体验
- [ ] 页面加载流畅，无卡顿
- [ ] 交互反馈及时，操作顺畅
- [ ] 错误提示清晰，引导合理

### 代码质量
- [ ] 代码结构清晰，易于维护
- [ ] 组件复用性高
- [ ] 符合 ESLint 规范
- [ ] 无明显性能问题

### 兼容性
- [ ] 微信小程序端正常运行
- [ ] H5 端正常运行
- [ ] 主要功能在各端一致

---

**文档版本**: v1.0  
**创建日期**: 2025-01-27  
**维护状态**: ✅ 活跃开发中

---

© 2025 林龍香大米商城 All Rights Reserved.

