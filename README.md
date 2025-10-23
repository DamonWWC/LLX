# 林龍香大米商城 - Vue3版本

基于Vue3框架重新构建的林龍香大米商城，保留了原微信小程序的所有核心功能，并提供了更好的开发体验和扩展性。

## 🚀 功能特性

### 核心功能
- ✅ **商品管理** - 支持添加、编辑、删除商品，自定义图片
- ✅ **智能购物车** - 便捷的加减数量操作，实时保存
- ✅ **地址智能识别** - 增强算法，支持任意顺序地址识别
- ✅ **订单管理系统** - 完整的订单生命周期，支持状态筛选和搜索
- ✅ **快递单号管理** - 发货时记录快递单号，支持编辑
- ✅ **发货单导出** - 两种导出方式（完整订单/发货单）
- ✅ **运费智能计算** - 基于省份和重量的运费配置系统
- ✅ **本地存储** - 数据持久化保存，自动修复旧数据
- ✅ **订单详情页** - 独立页面显示完整订单信息
- ✅ **多选订单功能** - 批量计算订单总金额

### 技术特性
- 🎯 **Vue3 Composition API** - 现代化的组合式API
- 📦 **Pinia状态管理** - 轻量级状态管理
- 🎨 **Element Plus UI** - 企业级UI组件库
- 📱 **响应式设计** - 支持桌面端和移动端
- 🔧 **TypeScript支持** - 类型安全的开发体验
- ⚡ **Vite构建** - 快速的开发构建体验

## 🛠️ 技术栈

- **框架**: Vue 3.4+
- **构建工具**: Vite 5.0+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **UI组件库**: Element Plus 2.4+
- **工具库**: @vueuse/core, dayjs, lodash-es
- **Canvas处理**: html2canvas
- **开发工具**: ESLint, Prettier

## 📦 安装和运行

### 环境要求
- Node.js 16.0+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # 通用组件
│   ├── ProductCard/     # 商品卡片
│   └── AddProductDialog/ # 添加商品对话框
├── views/              # 页面组件
│   ├── Home/           # 商品首页
│   ├── Checkout/       # 结算页面
│   ├── Orders/         # 订单管理
│   ├── OrderDetail/    # 订单详情
│   ├── Address/        # 地址管理
│   └── Shipping/       # 运费标准
├── stores/             # Pinia状态管理
│   ├── product.js      # 商品状态
│   ├── order.js        # 订单状态
│   └── address.js      # 地址状态
├── utils/              # 工具函数
│   ├── addressParser.js # 地址智能识别
│   ├── shippingConfig.js # 运费配置
│   └── canvasUtils.js   # Canvas工具
├── composables/        # 组合式函数
│   ├── useCart.js      # 购物车逻辑
│   └── useShipping.js  # 运费计算
└── router/             # 路由配置
```

## 🎯 核心功能说明

### 1. 商品管理
- 支持添加自定义商品
- 商品图片上传（支持相册选择）
- 商品编辑和删除
- 恢复默认商品功能

### 2. 购物车系统
- 实时数量调整
- 自动计算总价和总重量
- 购物车数据持久化

### 3. 地址智能识别
- 支持多种地址格式
- 自动识别姓名、电话、地址
- 支持标签格式和紧凑格式
- 直辖市特殊处理

### 4. 订单管理
- 订单状态流转（待付款→待发货→已发货）
- 订单搜索和筛选
- 多选订单功能
- 快递单号管理

### 5. 运费计算
- 基于省份的运费配置
- 实时运费计算
- 运费标准查询

### 6. Canvas导出
- 订单图片导出
- 发货单导出（不含价格）
- 动态高度计算
- 智能文字换行

## 🔧 开发指南

### 添加新功能
1. 在对应的store中添加状态管理
2. 创建相关的组合式函数
3. 开发UI组件
4. 更新路由配置

### 状态管理
使用Pinia进行状态管理，每个功能模块都有独立的store：

```javascript
// 示例：商品状态管理
import { useProductStore } from '@/stores/product'

const productStore = useProductStore()
productStore.loadProducts()
```

### 组合式函数
使用组合式函数封装可复用的逻辑：

```javascript
// 示例：购物车逻辑
import { useCart } from '@/composables/useCart'

const { cartItems, totalPrice, increaseQuantity } = useCart()
```

## 📱 响应式设计

项目采用响应式设计，支持：
- 桌面端（1200px+）
- 平板端（768px-1199px）
- 移动端（<768px）

## 🔄 数据迁移

从微信小程序版本迁移数据：
1. 商品数据自动兼容
2. 订单数据格式升级
3. 地址数据保持兼容
4. 自动修复旧数据格式

## 🚀 部署

### 静态部署
构建后的文件可以部署到任何静态文件服务器：

```bash
npm run build
# 将 dist 目录部署到服务器
```

### 环境变量
创建 `.env` 文件配置环境变量：

```env
VITE_APP_TITLE=林龍香大米商城
VITE_APP_VERSION=1.0.0
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目仅供学习和参考使用。

## 🙏 致谢

感谢原微信小程序版本提供的功能基础，Vue3版本在此基础上进行了现代化重构。

---

**版本**: Vue3 v1.0.0  
**最后更新**: 2025年1月  
**维护状态**: ✅ 活跃维护中
