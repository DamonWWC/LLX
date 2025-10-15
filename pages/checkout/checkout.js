// pages/checkout/checkout.js
const shippingConfig = require('../../utils/shippingConfig.js');

Page({
  data: {
    selectedProducts: [],      // 已选商品列表
    totalRicePrice: 0,         // 商品总价
    totalWeight: 0,            // 总重量（斤）
    shippingRate: 0,           // 运费单价（元/斤）
    totalShipping: 0,          // 运费总计
    grandTotal: 0,             // 总计
    selectedAddress: null,     // 选中的收货地址
    
    // Canvas相关
    canvasWidth: 0,
    canvasHeight: 0,
  },

  onLoad(options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      canvasWidth: systemInfo.windowWidth - 40,
      canvasHeight: 600
    })

    // 从本地存储加载数据
    this.loadCheckoutData()
  },

  onShow() {
    // 每次显示页面时重新加载数据（从地址页面返回时更新地址）
    this.loadCheckoutData()
  },

  // 加载结算数据
  loadCheckoutData() {
    try {
      // 从本地存储获取结算数据
      const checkoutData = wx.getStorageSync('checkoutData')
      if (checkoutData) {
        const selectedAddress = checkoutData.selectedAddress || null
        const selectedProducts = checkoutData.selectedProducts || []
        const totalRicePrice = parseFloat(checkoutData.totalRicePrice) || 0
        
        // 计算总重量
        let totalWeight = 0
        selectedProducts.forEach(product => {
          totalWeight += (product.weight || 0) * (product.quantity || 0)
        })
        
        // 计算运费
        let shippingRate = 0
        let totalShipping = 0
        
        if (selectedAddress && selectedAddress.province) {
          const shippingInfo = shippingConfig.calculateShipping(totalWeight, selectedAddress.province)
          shippingRate = shippingInfo.rate
          totalShipping = shippingInfo.shipping
        }
        
        // 计算总价
        const grandTotal = (totalRicePrice + totalShipping).toFixed(2)
        
        this.setData({
          selectedProducts: selectedProducts,
          totalRicePrice: totalRicePrice.toFixed(2),
          totalWeight: totalWeight,
          shippingRate: shippingRate,
          totalShipping: totalShipping,
          grandTotal: grandTotal,
          selectedAddress: selectedAddress
        })
        
        console.log('加载结算数据:', {
          totalRicePrice,
          totalWeight,
          shippingRate,
          totalShipping,
          grandTotal
        })
      } else {
        wx.showToast({
          title: '结算数据加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载结算数据失败', error)
    }
  },

  // 选择收货地址
  selectAddress() {
    wx.navigateTo({
      url: '/pages/address/address?from=checkout'
    })
  },

  // 确认下单
  confirmOrder() {
    const { selectedAddress, selectedProducts, totalRicePrice, totalWeight, shippingRate, totalShipping, grandTotal } = this.data

    if (!selectedAddress) {
      wx.showToast({
        title: '请先选择收货地址',
        icon: 'none'
      })
      return
    }

    // 生成订单
    const order = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
      products: selectedProducts,
      address: selectedAddress,
      totalRicePrice: totalRicePrice,      // 商品总价
      totalWeight: totalWeight,            // 总重量
      shippingRate: shippingRate,          // 运费单价
      totalShipping: totalShipping,        // 运费总计
      grandTotal: grandTotal,              // 总计
      status: '待发货',
      createTime: this.formatDateTime(new Date())
    }

    // 保存订单到本地存储
    try {
      const orderList = wx.getStorageSync('orderList') || []
      orderList.unshift(order)  // 添加到开头
      wx.setStorageSync('orderList', orderList)  // 保存整个订单列表
      
      console.log('订单已保存:', order)

      // 先显示下单成功提示
      wx.showToast({
        title: '下单成功！',
        icon: 'success',
        duration: 1500
      })

      // 1.5秒后显示操作选项
      setTimeout(() => {
        wx.showActionSheet({
          itemList: ['生成并保存订单图片', '分享订单到微信', '直接返回首页'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 生成并保存订单图片
              this.generateOrderImage(order, 'save')
            } else if (res.tapIndex === 1) {
              // 分享订单
              this.generateOrderImage(order, 'share')
            } else if (res.tapIndex === 2) {
              // 直接返回首页
              this.returnToHome()
            }
          },
          fail: () => {
            // 用户取消，直接返回首页
            this.returnToHome()
          }
        })
      }, 1500)
    } catch (error) {
      console.error('保存订单失败', error)
      wx.showToast({
        title: '下单失败，请重试',
        icon: 'none'
      })
    }
  },

  // 格式化日期时间
  formatDateTime(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  },

  // 生成订单图片
  async generateOrderImage(order, action = 'save') {
    wx.showLoading({
      title: '生成中...',
      mask: true
    })

    try {
      const query = wx.createSelectorQuery()
      query.select('#resultCanvas')
        .fields({ node: true, size: true })
        .exec(async (res) => {
          if (!res || !res[0]) {
            wx.hideLoading()
            wx.showToast({
              title: '生成失败',
              icon: 'none'
            })
            this.returnToHome()
            return
          }

          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = wx.getSystemInfoSync().pixelRatio
          
          // 设置canvas尺寸
          canvas.width = this.data.canvasWidth * dpr
          canvas.height = this.data.canvasHeight * dpr
          ctx.scale(dpr, dpr)

          // 绘制订单内容
          await this.drawOrderContent(ctx, order)

          // 生成图片
          wx.canvasToTempFilePath({
            canvas: canvas,
            success: (res) => {
              wx.hideLoading()
              if (action === 'save') {
                // 保存到相册
                this.saveImageToAlbum(res.tempFilePath)
              } else if (action === 'share') {
                // 分享订单
                this.shareOrderImage(res.tempFilePath)
              }
            },
            fail: (err) => {
              console.error('生成图片失败', err)
              wx.hideLoading()
              wx.showToast({
                title: '生成失败',
                icon: 'none'
              })
              this.returnToHome()
            }
          })
        })
    } catch (error) {
      console.error('生成订单图片失败', error)
      wx.hideLoading()
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      })
      this.returnToHome()
    }
  },

  // 绘制订单内容到Canvas
  drawOrderContent(ctx, order) {
    return new Promise((resolve) => {
      const width = this.data.canvasWidth
      let y = 40

      // 设置背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, this.data.canvasHeight)

      // 标题
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText('订单详情', 20, y)
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

      // 收货地址
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('收货信息', 20, y)
      y += 30

      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(`${order.address.name}  ${order.address.phone}`, 20, y)
      y += 25
      
      const addressText = `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`
      this.wrapText(ctx, addressText, 20, y, width - 40, 22)
      y += 50

      // 分割线
      ctx.strokeStyle = '#eeeeee'
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
      y += 30

      // 商品列表
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('商品明细', 20, y)
      y += 30

      order.products.forEach((item, index) => {
        ctx.font = '16px sans-serif'
        ctx.fillStyle = '#666666'
        ctx.fillText(`${index + 1}. ${item.name} × ${item.quantity}`, 20, y)
        ctx.fillStyle = '#ff6034'
        ctx.fillText(`¥${item.subtotal}`, width - 100, y)
        y += 30
      })

      // 分割线
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
      ctx.fillText(`¥${order.totalRicePrice}`, width - 100, y)
      y += 30

      if (order.totalWeight && order.shippingRate && order.totalShipping) {
        ctx.fillText(`总重量 (${order.totalWeight}斤)`, 20, y)
        y += 30
        ctx.fillText(`运费 (${order.shippingRate}元/斤)`, 20, y)
        ctx.fillText(`¥${order.totalShipping}`, width - 100, y)
        y += 40
      } else {
        y += 10
      }

      // 实付款
      ctx.font = 'bold 20px sans-serif'
      ctx.fillStyle = '#333333'
      ctx.fillText('实付款', 20, y)
      ctx.fillStyle = '#ff6034'
      ctx.fillText(`¥${order.grandTotal}`, width - 120, y)
      y += 40

      // 订单时间
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText(`下单时间: ${order.createTime}`, 20, y)

      resolve()
    })
  },

  // 文字换行
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
  },

  // 保存图片到相册
  saveImageToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.showModal({
          title: '保存成功',
          content: '订单图片已保存到相册',
          showCancel: false,
          confirmText: '好的',
          success: () => {
            this.returnToHome()
          }
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
              this.returnToHome()
            }
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
          this.returnToHome()
        }
      }
    })
  },

  // 分享订单图片
  shareOrderImage(filePath) {
    wx.showShareImageMenu({
      path: filePath,
      success: () => {
        console.log('分享成功')
        // 分享后返回首页
        setTimeout(() => {
          this.returnToHome()
        }, 1000)
      },
      fail: (err) => {
        console.error('分享失败', err)
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
        this.returnToHome()
      }
    })
  },

  // 返回首页
  returnToHome() {
    // 清空临时数据
    wx.removeStorageSync('checkoutData')
    
    // 清空购物车
    const riceProducts = wx.getStorageSync('riceProducts') || []
    const clearedProducts = riceProducts.map(product => ({
      ...product,
      quantity: 0
    }))
    wx.setStorageSync('riceProducts', clearedProducts)
    
    // 返回首页
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})

