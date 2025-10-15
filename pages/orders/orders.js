// pages/orders/orders.js
Page({
  data: {
    orderList: []
  },

  onShow() {
    // 每次显示页面时加载订单
    this.loadOrders()
  },

  // 加载订单列表
  loadOrders() {
    try {
      const orderList = wx.getStorageSync('orderList') || []
      this.setData({
        orderList: orderList
      })
      console.log('加载订单', orderList.length, '个')
    } catch (error) {
      console.error('加载订单失败', error)
    }
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const { orderid } = e.currentTarget.dataset
    const order = this.data.orderList.find(item => item.id === orderid)
    
    if (!order) return

    // 构建详情文本
    let detail = `订单号：${order.orderNo}\n\n`
    detail += `收货人：${order.address.name}\n`
    detail += `电话：${order.address.phone}\n`
    detail += `地址：${order.address.province}${order.address.city}${order.address.district}${order.address.detail}\n\n`
    detail += `商品明细：\n`
    
    order.products.forEach((item, index) => {
      detail += `${index + 1}. ${item.name} × ${item.quantity}\n`
      detail += `   小计：¥${item.subtotal}\n`
    })
    
    detail += `\n商品总价：¥${order.totalRicePrice}\n`
    detail += `运费：¥${order.totalShipping}\n`
    detail += `实付款：¥${order.grandTotal}`

    wx.showModal({
      title: '订单详情',
      content: detail,
      showCancel: false,
      confirmText: '关闭'
    })
  },

  // 删除订单
  deleteOrder(e) {
    const { orderid } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            let orderList = this.data.orderList.filter(item => item.id !== orderid)
            
            // 保存到本地
            wx.setStorageSync('orderList', orderList)
            
            // 更新页面
            this.setData({
              orderList: orderList
            })
            
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('删除订单失败', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 清空所有订单
  clearAllOrders() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有订单吗？此操作不可恢复。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.setStorageSync('orderList', [])
            
            this.setData({
              orderList: []
            })
            
            wx.showToast({
              title: '已清空',
              icon: 'success'
            })
          } catch (error) {
            console.error('清空订单失败', error)
            wx.showToast({
              title: '操作失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
