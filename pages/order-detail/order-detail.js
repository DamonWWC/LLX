// pages/order-detail/order-detail.js
Page({
  data: {
    order: null
  },

  onLoad(options) {
    // 从本地存储获取订单列表
    try {
      const orderList = wx.getStorageSync('orderList') || []
      const orderId = parseInt(options.orderId)
      const order = orderList.find(item => item.id === orderId)
      
      if (order) {
        this.setData({
          order: order
        })
      } else {
        wx.showToast({
          title: '订单不存在',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载订单失败', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }
})

