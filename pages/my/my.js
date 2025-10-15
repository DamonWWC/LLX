// pages/my/my.js
Page({
  data: {
    orderCount: 0,       // 订单数量
    addressCount: 0,     // 地址数量
  },

  onShow() {
    // 每次显示页面时加载数据
    this.loadData()
  },

  // 加载数据
  loadData() {
    try {
      // 加载订单数量
      const orderList = wx.getStorageSync('orderList') || []
      
      // 加载地址数量
      const addressList = wx.getStorageSync('shippingAddresses') || []
      
      this.setData({
        orderCount: orderList.length,
        addressCount: addressList.length
      })
      
      console.log('订单数量', orderList.length, '个')
      console.log('地址数量', addressList.length, '个')
    } catch (error) {
      console.error('加载数据失败', error)
    }
  },

  // 跳转到订单列表
  goToOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  },

  // 跳转到地址管理
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/address'
    })
  }
})

