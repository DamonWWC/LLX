// pages/my/my.js
Page({
  data: {
    // 订单状态统计
    pendingPaymentCount: 0,    // 待付款数量
    pendingShippingCount: 0,     // 待发货数量
    shippedCount: 0,             // 已发货数量
    totalOrderCount: 0,         // 总订单数量
    
    // 其他数据
    addressCount: 0,             // 地址数量
  },

  onShow() {
    // 每次显示页面时加载数据
    this.loadData()
  },

  // 加载数据
  loadData() {
    try {
      // 加载订单数据
      const orderList = wx.getStorageSync('orderList') || []
      
      // 统计各状态订单数量
      let pendingPaymentCount = 0
      let pendingShippingCount = 0
      let shippedCount = 0
      
      orderList.forEach(order => {
        switch (order.status) {
          case '待付款':
            pendingPaymentCount++
            break
          case '待发货':
            pendingShippingCount++
            break
          case '已发货':
            shippedCount++
            break
        }
      })
      
      // 加载地址数量
      const addressList = wx.getStorageSync('shippingAddresses') || []
      
      this.setData({
        pendingPaymentCount: pendingPaymentCount,
        pendingShippingCount: pendingShippingCount,
        shippedCount: shippedCount,
        totalOrderCount: orderList.length,
        addressCount: addressList.length
      })
      
      console.log('订单统计:', {
        待付款: pendingPaymentCount,
        待发货: pendingShippingCount,
        已发货: shippedCount,
        总计: orderList.length
      })
      console.log('地址数量', addressList.length, '个')
    } catch (error) {
      console.error('加载数据失败', error)
    }
  },

  // 跳转到订单列表
  goToOrders(e) {
    const status = e.currentTarget.dataset.status
    let url = '/pages/orders/orders'
    
    // 如果有指定状态，添加参数
    if (status && status !== '全部') {
      url += `?status=${encodeURIComponent(status)}`
    }
    
    wx.navigateTo({
      url: url
    })
  },

  // 跳转到地址管理
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  },

  // 跳转到运费标准
  goToShipping() {
    wx.navigateTo({
      url: '/pages/shipping/shipping'
    })
  }
})

