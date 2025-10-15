# TabBar 导航栏配置说明

## 功能说明

底部导航栏包含两个页面：

### 1. 商品页面 (pages/index/index)
- 显示大米商品列表
- 支持加减数量
- 添加商品到购物车
- 结算功能

### 2. 我的页面 (pages/my/my)
- 查看订单列表
- 管理收货地址
- 删除订单、清空订单

## TabBar 图标说明

由于 tabBar 需要本地图标文件，但项目中暂时没有图标，系统会使用默认占位符。

**临时解决方案：**
在微信开发者工具中，即使没有图标文件，文字导航依然可以正常使用。

**永久解决方案：**
1. 从图标网站下载图标：
   - iconfont.cn
   - iconpark.bytedance.com
   - flaticon.com

2. 图标规格：
   - 尺寸：81px × 81px
   - 格式：PNG
   - 背景：透明

3. 需要的图标文件：
   - `images/tab-shop.png` (商品-未选中，灰色)
   - `images/tab-shop-active.png` (商品-选中，红色)
   - `images/tab-my.png` (我的-未选中，灰色)
   - `images/tab-my-active.png` (我的-选中，红色)

## 数据存储

所有数据使用本地存储（localStorage）：

| 存储键名 | 说明 | 数据结构 |
|---------|------|---------|
| `riceProducts` | 商品数据 | Array |
| `orderList` | 订单列表 | Array |
| `shippingAddresses` | 收货地址 | Array |

## 订单数据结构

```javascript
{
  id: 1634567890000,           // 订单ID（时间戳）
  orderNo: 'ORD1634567890000', // 订单号
  status: '待发货',             // 订单状态
  products: [...],             // 商品列表
  address: {...},              // 收货地址
  totalRicePrice: '150.00',    // 商品总价
  totalShipping: '15.00',      // 运费
  grandTotal: '165.00',        // 总金额
  createTime: '2025-10-15 12:30:00' // 创建时间
}
```

## 使用流程

1. **商品页面** → 选择商品 → 调整数量 → 去结算
2. **选择地址** → 确认信息 → 确认下单
3. **订单生成** → 自动保存到本地 → 可在"我的"页面查看
4. **我的页面** → 查看订单 → 管理地址 → 删除订单

## 注意事项

- 这是单机版本，所有数据保存在本地
- 小程序卸载后数据会丢失
- 建议定期备份重要订单信息
- TabBar 页面不能使用 `wx.redirectTo`，只能使用 `wx.switchTab` 切换

