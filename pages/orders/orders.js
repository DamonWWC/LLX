// pages/orders/orders.js
Page({
  data: {
    orderList: [],
    canvasWidth: 0,
    canvasHeight: 600
  },

  onLoad() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      canvasWidth: systemInfo.windowWidth - 40
    })
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
    
    // 跳转到订单详情页面
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderid}`
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
  },

  // 导出订单图片
  exportOrderImage(e) {
    const { orderid } = e.currentTarget.dataset
    const order = this.data.orderList.find(item => item.id === orderid)
    
    if (!order) return

    wx.showLoading({
      title: '生成中...',
      mask: true
    })

    const query = wx.createSelectorQuery()
    query.select('#orderCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res || !res[0]) {
          wx.hideLoading()
          wx.showToast({
            title: '生成失败',
            icon: 'none'
          })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        
        // 先用足够大的临时高度绘制一次以计算实际需要的高度
        // 根据商品数量预估高度：基础500 + 每个商品约100px + 地址等信息300px
        const estimatedHeight = Math.max(3000, 800 + order.products.length * 100)
        canvas.width = this.data.canvasWidth * dpr
        canvas.height = estimatedHeight * dpr
        ctx.scale(dpr, dpr)

        const actualHeight = await this.drawOrderContent(ctx, order, estimatedHeight)
        
        // 用实际高度重新绘制
        canvas.width = this.data.canvasWidth * dpr
        canvas.height = actualHeight * dpr
        ctx.scale(dpr, dpr)
        
        await this.drawOrderContent(ctx, order, actualHeight)

        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => {
            wx.hideLoading()
            this.saveImageToAlbum(res.tempFilePath)
          },
          fail: (err) => {
            console.error('生成图片失败', err)
            wx.hideLoading()
            wx.showToast({
              title: '生成失败',
              icon: 'none'
            })
          }
        })
      })
  },

  // 导出发货单（不含价格和运费信息）
  exportShippingList(e) {
    const { orderid } = e.currentTarget.dataset
    const order = this.data.orderList.find(item => item.id === orderid)
    
    if (!order) return

    wx.showLoading({
      title: '生成发货单...',
      mask: true
    })

    const query = wx.createSelectorQuery()
    query.select('#orderCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res || !res[0]) {
          wx.hideLoading()
          wx.showToast({
            title: '生成失败',
            icon: 'none'
          })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        
        // 先用足够大的临时高度绘制一次以计算实际需要的高度
        // 根据商品数量预估高度：基础500 + 每个商品约120px + 地址等信息400px
        const estimatedHeight = Math.max(3000, 900 + order.products.length * 120)
        canvas.width = this.data.canvasWidth * dpr
        canvas.height = estimatedHeight * dpr
        ctx.scale(dpr, dpr)

        const actualHeight = await this.drawShippingListContent(ctx, order, estimatedHeight)
        
        // 用实际高度重新绘制
        canvas.width = this.data.canvasWidth * dpr
        canvas.height = actualHeight * dpr
        ctx.scale(dpr, dpr)

        // 绘制发货单内容（不含价格）
        await this.drawShippingListContent(ctx, order, actualHeight)

        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => {
            wx.hideLoading()
            this.saveImageToAlbum(res.tempFilePath)
          },
          fail: (err) => {
            console.error('生成发货单失败', err)
            wx.hideLoading()
            wx.showToast({
              title: '生成失败',
              icon: 'none'
            })
          }
        })
      })
  },

  // 分享订单
  shareOrder(e) {
    const { orderid } = e.currentTarget.dataset
    const order = this.data.orderList.find(item => item.id === orderid)
    
    if (!order) return

    wx.showLoading({
      title: '生成中...',
      mask: true
    })

    const query = wx.createSelectorQuery()
    query.select('#orderCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res || !res[0]) {
          wx.hideLoading()
          wx.showToast({
            title: '生成失败',
            icon: 'none'
          })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        
        // 先用足够大的临时高度绘制一次以计算实际需要的高度
        // 根据商品数量预估高度：基础500 + 每个商品约100px + 地址等信息300px
        const estimatedHeight = Math.max(3000, 800 + order.products.length * 100)
        canvas.width = this.data.canvasWidth * dpr
        canvas.height = estimatedHeight * dpr
        ctx.scale(dpr, dpr)

        const actualHeight = await this.drawOrderContent(ctx, order, estimatedHeight)
        
        // 用实际高度重新绘制
        canvas.width = this.data.canvasWidth * dpr
        canvas.height = actualHeight * dpr
        ctx.scale(dpr, dpr)
        
        await this.drawOrderContent(ctx, order, actualHeight)

        wx.canvasToTempFilePath({
          canvas: canvas,
          success: (res) => {
            wx.hideLoading()
            // 分享图片
            wx.showShareImageMenu({
              path: res.tempFilePath,
              success: () => {
                console.log('分享成功')
              },
              fail: (err) => {
                console.error('分享失败', err)
                wx.showToast({
                  title: '分享失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: (err) => {
            console.error('生成图片失败', err)
            wx.hideLoading()
            wx.showToast({
              title: '生成失败',
              icon: 'none'
            })
          }
        })
      })
  },

  // 绘制订单内容
  drawOrderContent(ctx, order, canvasHeight) {
    return new Promise((resolve) => {
      const width = this.data.canvasWidth
      let y = 40

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, canvasHeight)

      ctx.fillStyle = '#333333'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText('订单详情', 20, y)
      y += 40

      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(`订单号: ${order.orderNo}`, 20, y)
      y += 30

      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      ctx.fillStyle = '#333333'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('收货信息', 20, y)
      y += 30

      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(`${order.address.name}  ${order.address.phone}`, 20, y)
      y += 25
      
      const addressText = `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`
      const addressLines = this.wrapText(ctx, addressText, 20, y, width - 40, 22)
      y += addressLines * 22 + 25  // 根据实际行数动态调整

      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      ctx.fillStyle = '#333333'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('商品明细', 20, y)
      y += 30

      order.products.forEach((item, index) => {
        const totalWeight = (item.quantity || 0) * (item.weight || 0)
        const price = item.price || 0
        
        // 商品名称可能需要换行
        ctx.font = '16px sans-serif'
        ctx.fillStyle = '#666666'
        const productName = `${index + 1}.${item.name}（${item.weight || 10}斤/${item.unit || '袋'}）单价：${price}元`
        const nameLines = this.wrapText(ctx, productName, 20, y, width - 40, 22)
        y += nameLines * 22 + 3
        
        ctx.font = '14px sans-serif'
        ctx.fillStyle = '#999999'
        ctx.fillText(`   数量：${item.quantity}${item.unit || '袋'} ，总重：${totalWeight}斤 ，总价：${item.subtotal}元`, 20, y)
        y += 28
      })

      y += 10
      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      // 价格汇总
      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText('商品总价', 20, y)
      ctx.fillText(`${order.totalRicePrice || order.grandTotal}元`, width - 100, y)
      y += 30

      // 运费信息
      if (order.totalWeight && order.shippingRate && order.totalShipping) {
        ctx.fillText('总重量', 20, y)
        ctx.fillText(`${order.totalWeight}斤`, width - 100, y)
        y += 30
        ctx.fillText(`运费 (${order.shippingRate}元/斤)`, 20, y)
        ctx.fillText(`${order.totalShipping}元`, width - 100, y)
        y += 40
      } else {
        y += 10
      }

      // 实付款
      ctx.font = 'bold 20px sans-serif'
      ctx.fillStyle = '#333333'
      ctx.fillText('实付款', 20, y)
      ctx.fillStyle = '#ff6034'
      ctx.fillText(`${order.grandTotal}元`, width - 120, y)
      y += 40

      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText(`下单时间: ${order.createTime}`, 20, y)
      y += 40  // 留出底部空白

      resolve(y)  // 返回实际使用的高度
    })
  },

  // 绘制发货单内容（不含价格和运费）
  drawShippingListContent(ctx, order, canvasHeight) {
    return new Promise((resolve) => {
      const width = this.data.canvasWidth
      let y = 40

      // 背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, canvasHeight)

      // 标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText('发货单', 20, y)
      y += 40

      // 订单号
      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(`订单号: ${order.orderNo}`, 20, y)
      y += 30

      // 分割线
      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      // 收货信息标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText('收货信息', 20, y)
      y += 35

      // 收件人和电话
      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#333333'
      ctx.fillText(`收件人：${order.address.name}`, 20, y)
      y += 30

      ctx.fillText(`联系电话：${order.address.phone}`, 20, y)
      y += 35

      // 收货地址
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('收货地址：', 20, y)
      y += 30

      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#555555'
      const addressText = `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`
      const addressLines = this.wrapText(ctx, addressText, 20, y, width - 40, 25)
      y += addressLines * 25 + 30  // 根据实际行数动态调整

      // 分割线
      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      // 商品明细标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillText('商品明细', 20, y)
      y += 35

      // 商品列表（包含详细数量和种类）
      order.products.forEach((item, index) => {
        const totalWeight = (item.quantity || 0) * (item.weight || 0)
        
        // 商品名称可能需要换行
        ctx.font = 'bold 17px sans-serif'
        ctx.fillStyle = '#333333'
        const productName = `${index + 1}.${item.name}（${item.weight || 10}斤/${item.unit || '袋'}）`
        const nameLines = this.wrapText(ctx, productName, 20, y, width - 40, 24)
        y += nameLines * 24 + 5

        ctx.font = '16px sans-serif'
        ctx.fillStyle = '#666666'
        ctx.fillText(`   数量：${item.quantity}${item.unit || '袋'} ，总重：${totalWeight}斤`, 20, y)
        y += 30  // 增加商品间距
      })

      y += 10

      // 分割线
      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      // 总计信息（只显示数量，不显示价格）
      let totalQuantity = 0
      let totalWeight = 0
      order.products.forEach(item => {
        totalQuantity += item.quantity
        if (item.weight && item.quantity) {
          totalWeight += item.weight * item.quantity
        }
      })

      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#333333'
      ctx.fillText('总计信息', 20, y)
      y += 30

      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(`商品总数：${totalQuantity} 份`, 20, y)
      y += 30

      // 总重量（加粗显示）
      ctx.font = 'bold 18px sans-serif'
      ctx.fillStyle = '#ff6034'
      ctx.fillText(`商品总重：${order.totalWeight || totalWeight} 斤`, 20, y)
      y += 35

      // 分割线
      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      // 发货说明
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText('* 请核对商品数量和收货地址', 20, y)
      y += 25

      ctx.fillText(`下单时间: ${order.createTime}`, 20, y)
      y += 40  // 留出底部空白

      resolve(y)  // 返回实际使用的高度
    })
  },

  // 文字换行（返回实际使用的行数）
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('')
    let line = ''
    let testLine = ''
    let lineCount = 0

    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y + lineCount * lineHeight)
        line = words[n]
        lineCount++
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y + lineCount * lineHeight)
    return lineCount + 1  // 返回实际使用的行数
  },

  // 保存图片到相册
  saveImageToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要授权保存到相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      }
    })
  }
})
