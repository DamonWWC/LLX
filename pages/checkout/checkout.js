// pages/checkout/checkout.js
const apiManager = require('../../utils/apiManager.js');

Page({
  data: {
    selectedProducts: [],      // 已选商品列表
    totalRicePrice: 0,         // 商品总价
    totalWeight: 0,            // 总重量（斤）
    shippingRate: 0,           // 运费单价（元/斤）
    totalShipping: 0,          // 运费总计
    grandTotal: 0,             // 总计
    selectedAddress: null,     // 选中的收货地址
    paymentStatus: '未付款',   // 付款状态：已付款/未付款
    
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
    // 但保持已选择的地址不被覆盖
    this.loadCheckoutData()
  },

  // 从API计算运费
  async calculateShippingFromAPI(weight, province) {
    try {
      const result = await apiManager.shippingManager.calculateShipping(province, weight)
      return result
    } catch (error) {
      console.error('API计算运费失败:', error)
      throw error
    }
  },

  // 加载结算数据
  loadCheckoutData() {
    try {
      // 从本地存储获取结算数据（仅用于商品信息）
      const checkoutData = wx.getStorageSync('checkoutData')
      if (checkoutData) {
        // 保持当前选中的地址（如果已选择）
        const selectedAddress = this.data.selectedAddress || checkoutData.selectedAddress || null
        const selectedProducts = checkoutData.selectedProducts || []
        const totalRicePrice = parseFloat(checkoutData.totalRicePrice) || 0
        
        // 计算总重量
        let totalWeight = 0
        selectedProducts.forEach(product => {
          totalWeight += (product.weight || 0) * (product.quantity || 0)
        })
        
        // 计算运费
        let shippingRate = 1.4  // 默认运费单价
        let totalShipping = totalWeight * shippingRate  // 默认运费总计
        
        if (selectedAddress && selectedAddress.province) {
          console.log('开始计算运费:', {
            province: selectedAddress.province,
            weight: totalWeight
          })
          
          // 使用API计算运费
          this.calculateShippingFromAPI(totalWeight, selectedAddress.province)
            .then(shippingInfo => {
              console.log('API计算运费成功:', shippingInfo)
              
              // 检查API返回的数据结构
              if (shippingInfo && typeof shippingInfo.rate === 'number' && typeof shippingInfo.totalShipping === 'number') {
                this.setData({
                  shippingRate: shippingInfo.rate,
                  totalShipping: shippingInfo.totalShipping,
                  grandTotal: (totalRicePrice + shippingInfo.totalShipping).toFixed(2)
                })
              } else {
                console.warn('API返回的运费数据格式不正确:', shippingInfo)
                // 使用默认运费
                const defaultRate = 1.4
                const defaultShipping = totalWeight * defaultRate
                this.setData({
                  shippingRate: defaultRate,
                  totalShipping: defaultShipping,
                  grandTotal: (totalRicePrice + defaultShipping).toFixed(2)
                })
              }
            })
            .catch(error => {
              console.error('计算运费失败:', error)
              // 如果API失败，使用默认运费
              const defaultRate = 1.4
              const defaultShipping = totalWeight * defaultRate
              console.log('使用默认运费:', {
                rate: defaultRate,
                shipping: defaultShipping
              })
              this.setData({
                shippingRate: defaultRate,
                totalShipping: defaultShipping,
                grandTotal: (totalRicePrice + defaultShipping).toFixed(2)
              })
            })
        } else {
          console.log('没有地址信息，使用默认运费:', {
            hasAddress: !!selectedAddress,
            province: selectedAddress?.province
          })
        }
        
        // 计算初始总价
        const initialGrandTotal = totalRicePrice + totalShipping
        
        // 设置基础数据（使用默认运费，API回调时会更新）
        // 只在首次加载或没有选中地址时设置地址
        const updateData = {
          selectedProducts: selectedProducts,
          totalRicePrice: totalRicePrice.toFixed(2),
          totalWeight: totalWeight,
          shippingRate: shippingRate,
          totalShipping: totalShipping,
          grandTotal: initialGrandTotal.toFixed(2)
        }
        
        // 只在没有选中地址时才设置地址
        if (!this.data.selectedAddress) {
          updateData.selectedAddress = selectedAddress
        }
        
        this.setData(updateData)
        
        console.log('加载结算数据:', {
          totalRicePrice,
          totalWeight,
          shippingRate,
          totalShipping,
          grandTotal: initialGrandTotal
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

  // 选择付款状态
  selectPaymentStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      paymentStatus: status
    })
    console.log('选择付款状态:', status)
  },

  // 确认下单
  async confirmOrder() {
    const { selectedAddress, selectedProducts, totalRicePrice, totalWeight, shippingRate, totalShipping, grandTotal, paymentStatus } = this.data

    if (!selectedAddress) {
      wx.showToast({
        title: '请先选择收货地址',
        icon: 'none'
      })
      return
    }

    // 显示加载状态
    wx.showLoading({
      title: '下单中...',
      mask: true
    })

    try {
      // 根据付款状态确定订单状态（确保没有空格）
      let orderStatus = ''
      if (paymentStatus === '已付款') {
        orderStatus = '待发货'.trim()
      } else {
        orderStatus = '待付款'.trim()
      }

      // 准备订单数据
      const orderData = {
        products: selectedProducts,
        address: selectedAddress,
        totalRicePrice: totalRicePrice,      // 商品总价
        totalWeight: totalWeight,            // 总重量
        shippingRate: shippingRate,          // 运费单价
        totalShipping: totalShipping,        // 运费总计
        grandTotal: grandTotal,              // 总计
        paymentStatus: paymentStatus,        // 付款状态
        status: orderStatus,                 // 订单状态
        createTime: this.formatDateTime(new Date())
      }

      // 使用API管理器创建订单
      const order = await apiManager.orderManager.createOrder(orderData)
      
      console.log('订单已保存:', order)

      wx.hideLoading()

      // 显示下单成功提示
      wx.showToast({
        title: '下单成功！',
        icon: 'success',
        duration: 1500
      })

      // 1.5秒后直接返回首页
      setTimeout(() => {
        this.returnToHome()
      }, 1500)
    } catch (error) {
      wx.hideLoading()
      console.error('下单失败', error)
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
          
          // 绘制订单内容
          await this.drawOrderContent(ctx, order, actualHeight)

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
  drawOrderContent(ctx, order, canvasHeight) {
    return new Promise((resolve) => {
      const width = this.data.canvasWidth
      let y = 40

      // 设置背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, canvasHeight)

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
      const addressLines = this.wrapText(ctx, addressText, 20, y, width - 40, 22)
      y += addressLines * 22 + 25  // 根据实际行数动态调整

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
      ctx.fillText(`${order.totalRicePrice}元`, width - 100, y)
      y += 30

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

      // 订单时间
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
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
    // 数据已通过API管理，无需清空本地存储
    
    // 返回首页
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})

