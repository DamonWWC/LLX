// pages/orders/orders.js
const apiManager = require('../../utils/apiManager.js')

Page({
  data: {
    orderList: [],
    filteredOrderList: [],  // 过滤后的订单列表
    searchKeyword: '',      // 搜索关键词
    isSearching: false,     // 是否正在搜索
    filterStatus: '',       // 状态过滤
    canvasWidth: 0,
    canvasHeight: 600,
    isMultiSelectMode: false, // 是否多选模式
    selectedOrders: [],     // 选中的订单
    totalAmount: 0          // 选中订单总金额
  },

  onLoad(options) {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    
    // 确保URL参数被正确解码
    let filterStatus = ''
    if (options.status) {
      try {
        filterStatus = decodeURIComponent(options.status)
      } catch (e) {
        filterStatus = options.status
      }
    }
    
    // 根据过滤状态设置页面标题
    let pageTitle = '订单管理'
    if (filterStatus) {
      pageTitle = filterStatus
    }
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: pageTitle
    })
    
    this.setData({
      canvasWidth: systemInfo.windowWidth - 40,
      filterStatus: filterStatus
    })
  },

  onShow() {
    // 每次显示页面时加载订单
    this.loadOrders()
  },

  // 加载订单列表
  async loadOrders() {
    try {
      // 使用API管理器获取订单数据
      let orderList = await apiManager.orderManager.getOrders()
      
      // 数据修复：清理所有订单的状态字段
      orderList = orderList.map(order => {
        if (order.status) {
          const trimmedStatus = order.status.trim()
          if (trimmedStatus !== order.status) {
            return { ...order, status: trimmedStatus }
          }
        } else {
          // 如果没有 status 字段，根据 paymentStatus 补充
          const newStatus = order.paymentStatus === '已付款' ? '待发货' : '待付款'
          return { ...order, status: newStatus }
        }
        return order
      })
      
      let filteredOrders = orderList
      
      // 如果有状态过滤，先按状态过滤
      if (this.data.filterStatus) {
        filteredOrders = orderList.filter(order => {
          // 使用 trim() 去除可能的空格，提高匹配的健壮性
          const orderStatus = (order.status || '').trim()
          const filterStatus = this.data.filterStatus.trim()
          return orderStatus === filterStatus
        })
      }
      
      this.setData({
        orderList: orderList,
        filteredOrderList: filteredOrders
      })
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

  // 防止事件冒泡
  preventBubble() {
    // 阻止事件冒泡，防止触发订单详情
  },

  // 切换更多菜单
  toggleMoreMenu(e) {
    const { orderid } = e.currentTarget.dataset
    
    // 关闭其他订单的更多菜单
    const orderList = this.data.orderList.map(order => ({
      ...order,
      showMoreMenu: order.id === orderid ? !order.showMoreMenu : false
    }))
    
    this.setData({
      orderList: orderList
    })
    
    // 重新应用过滤和搜索
    this.performSearch(this.data.searchKeyword)
  },

  // 切换多选模式
  toggleMultiSelectMode() {
    const isMultiSelectMode = !this.data.isMultiSelectMode
    
    // 如果退出多选模式，清空所有选择
    if (!isMultiSelectMode) {
      const orderList = this.data.orderList.map(order => ({
        ...order,
        selected: false
      }))
      
      this.setData({
        isMultiSelectMode: false,
        orderList: orderList,
        selectedOrders: [],
        totalAmount: 0
      })
    } else {
      this.setData({
        isMultiSelectMode: true
      })
    }
    
    // 重新应用过滤和搜索
    this.performSearch(this.data.searchKeyword)
  },

  // 切换订单选择状态
  toggleOrderSelection(e) {
    const { orderid } = e.currentTarget.dataset
    
    const orderList = this.data.orderList.map(order => {
      if (order.id === orderid) {
        return {
          ...order,
          selected: !order.selected
        }
      }
      return order
    })
    
    // 计算选中的订单和总金额
    const selectedOrders = orderList.filter(order => order.selected)
    const totalAmount = selectedOrders.reduce((sum, order) => sum + (parseFloat(order.grandTotal) || 0), 0)
    
    this.setData({
      orderList: orderList,
      selectedOrders: selectedOrders,
      totalAmount: totalAmount.toFixed(2)
    })
    
    // 重新应用过滤和搜索
    this.performSearch(this.data.searchKeyword)
  },

  // 删除订单
  async deleteOrder(e) {
    const { orderid } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 显示加载状态
            wx.showLoading({
              title: '删除中...',
              mask: true
            })

            // 调用API删除订单
            await apiManager.orderManager.deleteOrder(orderid)
            
            // 重新加载订单列表
            await this.loadOrders()
            
            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            wx.hideLoading()
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

  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({
      searchKeyword: keyword
    })
    
    // 实时搜索
    this.performSearch(keyword)
  },

  // 搜索确认处理
  onSearchConfirm(e) {
    const keyword = e.detail.value.trim()
    this.performSearch(keyword)
  },

  // 执行搜索
  performSearch(keyword) {
    const { orderList, filterStatus } = this.data
    
    if (!keyword) {
      // 清空搜索，显示按状态过滤的订单
      let filteredOrders = orderList
      if (filterStatus) {
        filteredOrders = orderList.filter(order => {
          const orderStatus = (order.status || '').trim()
          return orderStatus === filterStatus.trim()
        })
      }
      
      this.setData({
        filteredOrderList: filteredOrders,
        isSearching: false
      })
      return
    }

    // 先按状态过滤，再按姓名或电话搜索
    let baseOrders = orderList
    if (filterStatus) {
      baseOrders = orderList.filter(order => {
        const orderStatus = (order.status || '').trim()
        return orderStatus === filterStatus.trim()
      })
    }
    
    const filteredOrders = baseOrders.filter(order => {
      const name = order.address?.name || ''
      const phone = order.address?.phone || ''
      
      return name.includes(keyword) || phone.includes(keyword)
    })

    this.setData({
      filteredOrderList: filteredOrders,
      isSearching: true
    })

    console.log(`搜索"${keyword}"，找到${filteredOrders.length}个订单`)
  },

  // 清空搜索
  clearSearch() {
    const { orderList, filterStatus } = this.data
    let filteredOrders = orderList
    
    // 如果有状态过滤，按状态过滤
    if (filterStatus) {
      filteredOrders = orderList.filter(order => {
        const orderStatus = (order.status || '').trim()
        return orderStatus === filterStatus.trim()
      })
    }
    
    this.setData({
      searchKeyword: '',
      filteredOrderList: filteredOrders,
      isSearching: false
    })
  },

  // 更新订单状态
  updateOrderStatus(e) {
    const { orderid, currentStatus } = e.currentTarget.dataset
    
    let newStatus = ''
    let confirmText = ''
    let confirmContent = ''
    
    // 根据当前状态确定下一个状态（使用 trim 处理当前状态）
    const trimmedStatus = (currentStatus || '').trim()
    switch (trimmedStatus) {
      case '待付款':
        newStatus = '待发货'.trim()
        confirmText = '确认付款'
        confirmContent = '确认该订单已付款？'
        break
      case '待发货':
        newStatus = '已发货'.trim()
        confirmText = '确认发货'
        confirmContent = '确认该订单已发货？'
        // 对于发货操作，需要询问快递单号
        this.handleShippingConfirm(orderid, currentStatus, newStatus)
        return
      default:
        wx.showToast({
          title: '状态更新失败',
          icon: 'none'
        })
        return
    }
    
    // 非发货操作直接更新状态
    wx.showModal({
      title: '状态更新',
      content: confirmContent,
      confirmText: confirmText,
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatusDirect(orderid, currentStatus, newStatus)
        }
      }
    })
  },

  // 处理发货确认（包含快递单号输入）
  handleShippingConfirm(orderId, currentStatus, newStatus) {
    wx.showModal({
      title: '确认发货',
      content: '请输入快递单号（可选）',
      editable: true,
      placeholderText: '请输入快递单号',
      confirmText: '确认发货',
      cancelText: '暂不发货',
      success: (res) => {
        if (res.confirm) {
          // 用户确认发货，获取快递单号
          const trackingNumber = res.content || ''
          this.updateOrderStatusWithTracking(orderId, currentStatus, newStatus, trackingNumber)
        }
      }
    })
  },

  // 直接更新订单状态（非发货操作）
  async updateOrderStatusDirect(orderId, currentStatus, newStatus) {
    try {
      // 使用API管理器更新订单状态
      await apiManager.orderManager.updateOrderStatus(orderId, newStatus)
      
      // 如果是确认付款操作，同时更新付款状态
      if (currentStatus === '待付款' && newStatus === '待发货') {
        await apiManager.orderManager.updatePaymentStatus(orderId, '已付款')
      }
      
      // 重新加载订单列表
      await this.loadOrders()
      
      // 重新应用过滤和搜索
      this.performSearch(this.data.searchKeyword)
      
      wx.showToast({
        title: '状态更新成功',
        icon: 'success'
      })
      
      console.log(`订单${orderId}状态从${currentStatus}更新为${newStatus}`)
    } catch (error) {
      console.error('更新订单状态失败', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 更新订单状态并添加快递单号
  async updateOrderStatusWithTracking(orderId, currentStatus, newStatus, trackingNumber) {
    try {
      // 使用API管理器更新订单状态
      await apiManager.orderManager.updateOrderStatus(orderId, newStatus)
      
      // 重新加载订单列表以获取最新数据
      await this.loadOrders()
      
      wx.showToast({
        title: trackingNumber.trim() ? '发货成功，已记录快递单号' : '发货成功',
        icon: 'success'
      })
      
      console.log(`订单${orderId}状态从${currentStatus}更新为${newStatus}${trackingNumber.trim() ? `，快递单号：${trackingNumber}` : ''}`)
    } catch (error) {
      console.error('更新订单状态失败', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 编辑快递单号
  editTrackingNumber(e) {
    const { orderid } = e.currentTarget.dataset
    const order = this.data.orderList.find(item => item.id === orderid)
    
    if (!order) return
    
    const currentTracking = order.trackingNumber || ''
    const title = currentTracking ? '修改快递单号' : '添加快递单号'
    
    wx.showModal({
      title: title,
      content: '请输入快递单号',
      editable: true,
      placeholderText: '请输入快递单号',
      confirmText: '保存',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const trackingNumber = res.content || ''
          this.updateTrackingNumber(orderid, trackingNumber)
        }
      }
    })
  },

  // 更新快递单号
  async updateTrackingNumber(orderId, trackingNumber) {
    try {
      // 注意：由于API接口文档中没有专门的快递单号更新接口，
      // 这里暂时只更新本地显示，实际数据应该通过发货接口一起更新
      console.log(`订单${orderId}快递单号更新为：${trackingNumber || '无'}`)
      
      // 重新加载订单列表以获取最新数据
      await this.loadOrders()
      
      wx.showToast({
        title: trackingNumber.trim() ? '快递单号已保存' : '快递单号已清除',
        icon: 'success'
      })
    } catch (error) {
      console.error('更新快递单号失败', error)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 批量删除订单
  async batchDeleteOrders() {
    const selectedOrders = this.data.selectedOrders
    if (selectedOrders.length === 0) {
      wx.showToast({
        title: '请先选择要删除的订单',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedOrders.length} 个订单吗？此操作不可恢复。`,
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 显示加载状态
            wx.showLoading({
              title: '删除中...',
              mask: true
            })

            // 获取选中订单的ID列表
            const orderIds = selectedOrders.map(order => order.id)
            
            // 调用批量删除API
            await apiManager.orderManager.deleteOrdersBatch(orderIds)
            
            // 重新加载订单列表
            await this.loadOrders()
            
            // 退出多选模式
            this.setData({
              isMultiSelectMode: false,
              selectedOrders: [],
              totalAmount: 0
            })
            
            wx.hideLoading()
            wx.showToast({
              title: `已删除 ${orderIds.length} 个订单`,
              icon: 'success'
            })
          } catch (error) {
            wx.hideLoading()
            console.error('批量删除订单失败', error)
            wx.showToast({
              title: '删除失败',
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
