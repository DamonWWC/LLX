# 林龍香大米商城 API 接口文档

## 📋 文档信息

- **API 版本**: v1.0
- **基础 URL**: `https://api.llxrice.com/api`
- **文档更新**: 2025年10月17日
- **技术栈**: .NET 8 Minimal API + PostgreSQL + Redis

---

## 🔧 通用说明

### 统一响应格式

所有 API 接口都遵循统一的响应格式：

#### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "timestamp": "2025-10-17T10:30:00Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "errors": ["详细错误1", "详细错误2"],
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 请求头

所有请求都需要包含以下请求头：

```http
Content-Type: application/json
```

---

## 🛍️ 商品管理 API

### 1. 获取所有商品

**接口地址**: `GET /products`

**接口描述**: 获取所有商品列表

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "稻花香",
      "price": 15.50,
      "unit": "袋",
      "weight": 5.0,
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      "quantity": 100,
      "createdAt": "2025-10-17T10:30:00Z",
      "updatedAt": "2025-10-17T10:30:00Z"
    }
  ],
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 2. 获取单个商品

**接口地址**: `GET /products/{id}`

**接口描述**: 根据商品ID获取商品详情

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 商品ID |

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "稻花香",
    "price": 15.50,
    "unit": "袋",
    "weight": 5.0,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "quantity": 100,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T10:30:00Z"
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 3. 创建商品

**接口地址**: `POST /products`

**接口描述**: 创建新商品

**请求体**:
```json
{
  "name": "长粒香",
  "price": 18.00,
  "unit": "袋",
  "weight": 5.0,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "quantity": 50
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 商品名称，最大100字符 |
| price | decimal | 是 | 单价，最多2位小数 |
| unit | string | 是 | 单位，最大20字符 |
| weight | decimal | 是 | 单位重量（斤），最多2位小数 |
| image | string | 否 | 商品图片（Base64编码） |
| quantity | int | 否 | 库存数量，默认0 |

**响应示例**:
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 2,
    "name": "长粒香",
    "price": 18.00,
    "unit": "袋",
    "weight": 5.0,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "quantity": 50,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T10:30:00Z"
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 4. 更新商品

**接口地址**: `PUT /products/{id}`

**接口描述**: 更新商品信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 商品ID |

**请求体**:
```json
{
  "name": "长粒香（更新）",
  "price": 20.00,
  "unit": "袋",
  "weight": 5.0,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "quantity": 80
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 2,
    "name": "长粒香（更新）",
    "price": 20.00,
    "unit": "袋",
    "weight": 5.0,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "quantity": 80,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T11:00:00Z"
  },
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 5. 删除商品

**接口地址**: `DELETE /products/{id}`

**接口描述**: 删除商品

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 商品ID |

**响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": true,
  "timestamp": "2025-10-17T11:00:00Z"
}
```

---

## 📍 地址管理 API

### 1. 获取所有地址

**接口地址**: `GET /addresses`

**接口描述**: 获取所有收货地址列表

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区深南大道10000号",
      "isDefault": true,
      "createdAt": "2025-10-17T10:30:00Z",
      "updatedAt": "2025-10-17T10:30:00Z"
    }
  ],
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 2. 获取单个地址

**接口地址**: `GET /addresses/{id}`

**接口描述**: 根据地址ID获取地址详情

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 地址ID |

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园南区深南大道10000号",
    "isDefault": true,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T10:30:00Z"
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 3. 创建地址

**接口地址**: `POST /addresses`

**接口描述**: 创建新收货地址

**请求体**:
```json
{
  "name": "李四",
  "phone": "13900139000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detail": "三里屯街道工体北路8号",
  "isDefault": false
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 收货人姓名，最大50字符 |
| phone | string | 是 | 手机号码，最大20字符 |
| province | string | 是 | 省份，最大50字符 |
| city | string | 是 | 城市，最大50字符 |
| district | string | 否 | 区县，最大50字符 |
| detail | string | 是 | 详细地址，最大200字符 |
| isDefault | boolean | 否 | 是否默认地址，默认false |

**响应示例**:
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 2,
    "name": "李四",
    "phone": "13900139000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "三里屯街道工体北路8号",
    "isDefault": false,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T10:30:00Z"
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 4. 更新地址

**接口地址**: `PUT /addresses/{id}`

**接口描述**: 更新地址信息

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 地址ID |

**请求体**:
```json
{
  "name": "李四（更新）",
  "phone": "13900139000",
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detail": "三里屯街道工体北路8号（更新）",
  "isDefault": true
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 2,
    "name": "李四（更新）",
    "phone": "13900139000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "三里屯街道工体北路8号（更新）",
    "isDefault": true,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T11:00:00Z"
  },
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 5. 删除地址

**接口地址**: `DELETE /addresses/{id}`

**接口描述**: 删除地址

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 地址ID |

**响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": true,
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 6. 设置默认地址

**接口地址**: `PUT /addresses/{id}/set-default`

**接口描述**: 设置指定地址为默认地址

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 地址ID |

**响应示例**:
```json
{
  "success": true,
  "message": "设置成功",
  "data": true,
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 7. 智能识别地址

**接口地址**: `POST /addresses/parse`

**接口描述**: 智能解析地址文本，提取姓名、电话、地址信息

**请求体**:
```json
{
  "text": "张三 13800138000 广东省深圳市南山区科技园南区深南大道10000号"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| text | string | 是 | 地址文本 |

**响应示例**:
```json
{
  "success": true,
  "message": "解析成功",
  "data": {
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园南区深南大道10000号"
  },
  "timestamp": "2025-10-17T11:00:00Z"
}
```

---

## 📦 订单管理 API

### 1. 获取订单列表

**接口地址**: `GET /orders`

**接口描述**: 获取订单列表（支持分页和状态筛选）

**查询参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认10 |
| status | string | 否 | 订单状态筛选 |

**订单状态说明**:
- `待付款`: 订单已创建，等待付款
- `待发货`: 已付款，等待发货
- `已发货`: 已发货，运输中
- `已完成`: 订单完成
- `已取消`: 订单已取消

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "items": [
      {
        "id": 1,
        "orderNo": "ORD202510171030001",
        "addressId": 1,
        "totalRicePrice": 31.00,
        "totalWeight": 10.0,
        "shippingRate": 1.5,
        "totalShipping": 15.00,
        "grandTotal": 46.00,
        "paymentStatus": "已付款",
        "status": "待发货",
        "createdAt": "2025-10-17T10:30:00Z",
        "updatedAt": "2025-10-17T10:30:00Z"
      }
    ],
    "totalCount": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 2. 获取订单详情

**接口地址**: `GET /orders/{id}`

**接口描述**: 获取订单详细信息（包含订单明细）

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    "id": 1,
    "orderNo": "ORD202510171030001",
    "address": {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园南区深南大道10000号"
    },
    "totalRicePrice": 31.00,
    "totalWeight": 10.0,
    "shippingRate": 1.5,
    "totalShipping": 15.00,
    "grandTotal": 46.00,
    "paymentStatus": "已付款",
    "status": "待发货",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "productName": "稻花香",
        "productPrice": 15.50,
        "productUnit": "袋",
        "productWeight": 5.0,
        "quantity": 2,
        "subtotal": 31.00
      }
    ],
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T10:30:00Z"
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 3. 创建订单

**接口地址**: `POST /orders`

**接口描述**: 创建新订单

**请求体**:
```json
{
  "addressId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| addressId | int | 是 | 收货地址ID |
| items | array | 是 | 订单商品列表 |
| items[].productId | int | 是 | 商品ID |
| items[].quantity | int | 是 | 购买数量 |

**响应示例**:
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 1,
    "orderNo": "ORD202510171030001",
    "addressId": 1,
    "totalRicePrice": 31.00,
    "totalWeight": 10.0,
    "shippingRate": 1.5,
    "totalShipping": 15.00,
    "grandTotal": 46.00,
    "paymentStatus": "未付款",
    "status": "待付款",
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T10:30:00Z"
  },
  "timestamp": "2025-10-17T10:30:00Z"
}
```

### 4. 更新订单状态

**接口地址**: `PUT /orders/{id}/status`

**接口描述**: 更新订单状态

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**请求体**:
```json
{
  "status": "已发货"
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 是 | 订单状态 |

**响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": true,
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 5. 删除订单

**接口地址**: `DELETE /orders/{id}`

**接口描述**: 删除订单

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int | 是 | 订单ID |

**响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": true,
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 6. 批量删除订单

**接口地址**: `DELETE /orders/batch`

**接口描述**: 批量删除订单

**请求体**:
```json
{
  "orderIds": [1, 2, 3]
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderIds | array | 是 | 订单ID列表 |

**响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": true,
  "timestamp": "2025-10-17T11:00:00Z"
}
```

---

## 🚚 运费管理 API

### 1. 计算运费

**接口地址**: `POST /shipping/calculate`

**接口描述**: 根据省份和重量计算运费

**请求体**:
```json
{
  "province": "广东省",
  "weight": 20.0
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| province | string | 是 | 省份名称 |
| weight | decimal | 是 | 重量（斤） |

**响应示例**:
```json
{
  "success": true,
  "message": "计算成功",
  "data": {
    "province": "广东省",
    "weight": 20.0,
    "rate": 1.5,
    "totalShipping": 30.00
  },
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 2. 获取运费配置

**接口地址**: `GET /shipping/rates`

**接口描述**: 获取所有省份的运费配置

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "province": "广东省",
      "rate": 1.5,
      "createdAt": "2025-10-17T10:30:00Z",
      "updatedAt": "2025-10-17T10:30:00Z"
    },
    {
      "id": 2,
      "province": "北京市",
      "rate": 2.0,
      "createdAt": "2025-10-17T10:30:00Z",
      "updatedAt": "2025-10-17T10:30:00Z"
    }
  ],
  "timestamp": "2025-10-17T11:00:00Z"
}
```

### 3. 更新运费配置

**接口地址**: `PUT /shipping/rates/{province}`

**接口描述**: 更新指定省份的运费单价

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| province | string | 是 | 省份名称 |

**请求体**:
```json
{
  "rate": 1.8
}
```

**请求参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| rate | decimal | 是 | 运费单价（元/斤） |

**响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "province": "广东省",
    "rate": 1.8,
    "createdAt": "2025-10-17T10:30:00Z",
    "updatedAt": "2025-10-17T11:00:00Z"
  },
  "timestamp": "2025-10-17T11:00:00Z"
}
```

---

## 🔍 系统监控 API

### 1. 健康检查

**接口地址**: `GET /health`

**接口描述**: 检查系统健康状态

**请求参数**: 无

**响应示例**:
```json
{
  "status": "Healthy",
  "checks": {
    "database": "Healthy",
    "redis": "Healthy"
  },
  "timestamp": "2025-10-17T11:00:00Z"
}
```

---

## 📊 数据模型

### Product（商品）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 商品ID（主键） |
| name | string | 商品名称 |
| price | decimal | 单价（元） |
| unit | string | 单位 |
| weight | decimal | 单位重量（斤） |
| image | string | 商品图片（Base64） |
| quantity | int | 库存数量 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### Address（地址）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 地址ID（主键） |
| name | string | 收货人姓名 |
| phone | string | 手机号码 |
| province | string | 省份 |
| city | string | 城市 |
| district | string | 区县 |
| detail | string | 详细地址 |
| isDefault | boolean | 是否默认地址 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### Order（订单）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 订单ID（主键） |
| orderNo | string | 订单号 |
| addressId | int | 收货地址ID（外键） |
| totalRicePrice | decimal | 商品总价 |
| totalWeight | decimal | 总重量（斤） |
| shippingRate | decimal | 运费单价（元/斤） |
| totalShipping | decimal | 运费总计 |
| grandTotal | decimal | 订单总金额 |
| paymentStatus | string | 付款状态 |
| status | string | 订单状态 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### OrderItem（订单明细）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 明细ID（主键） |
| orderId | int | 订单ID（外键） |
| productId | int | 商品ID（外键） |
| productName | string | 商品名称（冗余） |
| productPrice | decimal | 商品单价（冗余） |
| productUnit | string | 商品单位（冗余） |
| productWeight | decimal | 商品重量（冗余） |
| quantity | int | 购买数量 |
| subtotal | decimal | 小计 |

### ShippingRate（运费配置）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 配置ID（主键） |
| province | string | 省份名称 |
| rate | decimal | 运费单价（元/斤） |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

---

## 🚀 小程序对接示例

### HTTP 客户端封装

```javascript
const BASE_URL = 'https://api.llxrice.com/api'

class HttpClient {
  static async request(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      wx.showLoading({ title: '加载中...', mask: true })
      
      wx.request({
        url: `${BASE_URL}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          wx.hideLoading()
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data.data)
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        },
        fail: (err) => {
          wx.hideLoading()
          wx.showToast({ title: '网络请求失败', icon: 'none' })
          reject(err)
        }
      })
    })
  }

  static get(url) {
    return this.request(url, 'GET')
  }

  static post(url, data) {
    return this.request(url, 'POST', data)
  }

  static put(url, data) {
    return this.request(url, 'PUT', data)
  }

  static delete(url) {
    return this.request(url, 'DELETE')
  }
}
```

### API 服务封装

```javascript
class ApiService {
  // 商品相关
  static getProducts() {
    return HttpClient.get('/products')
  }

  // 地址相关
  static getAddresses() {
    return HttpClient.get('/addresses')
  }

  static createAddress(data) {
    return HttpClient.post('/addresses', data)
  }

  static parseAddress(text) {
    return HttpClient.post('/addresses/parse', { text })
  }

  // 订单相关
  static getOrders(page = 1, pageSize = 10, status = null) {
    let url = `/orders?page=${page}&pageSize=${pageSize}`
    if (status) url += `&status=${status}`
    return HttpClient.get(url)
  }

  static createOrder(data) {
    return HttpClient.post('/orders', data)
  }

  // 运费相关
  static calculateShipping(province, weight) {
    return HttpClient.post('/shipping/calculate', { province, weight })
  }
}
```

### 页面使用示例

```javascript
// pages/index/index.js
const ApiService = require('../../utils/apiService.js')

Page({
  data: {
    riceProducts: []
  },

  async onLoad() {
    await this.loadProducts()
  },

  async loadProducts() {
    try {
      const products = await ApiService.getProducts()
      this.setData({
        riceProducts: products,
        isEmpty: products.length === 0
      })
    } catch (error) {
      console.error('加载商品失败', error)
      // 降级到本地存储
      this.loadLocalData()
    }
  }
})
```

---

## ⚠️ 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 500 | 服务器内部错误 | 联系技术支持 |

---

## 📝 更新日志

### v1.0 (2025-10-17)
- 初始版本发布
- 完成商品、地址、订单、运费管理 API
- 支持智能地址识别
- 支持订单批量操作
- 提供完整的小程序对接示例

---

## 📞 技术支持

如有问题，请联系技术支持团队：

- **邮箱**: support@llxrice.com
- **电话**: 400-123-4567
- **工作时间**: 周一至周五 9:00-18:00

---

© 2025 林龍香大米商城 API 接口文档
