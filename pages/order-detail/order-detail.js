// pages/order-detail/order-detail.js
const api = require('../../utils/api.js')

Page({
  data: {
    order: null
  },

  async onLoad(options) {
    try {
      // 显示加载状态
      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      const orderId = parseInt(options.orderId)
      
      // 从API获取订单详情
      const response = await api.orderAPI.getOrderById(orderId)
      const order = api.dataConverter.convertAPIOrderToLocal(response.data)
      
      this.setData({
        order: order
      })
      
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      console.error('加载订单详情失败', error)
      wx.showToast({
        title: '订单不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  }
})

