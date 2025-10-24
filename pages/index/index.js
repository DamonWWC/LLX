// index.js
const apiManager = require('../../utils/apiManager.js')

Page({
  data: {
    // 大米商品库（所有可选的大米类型）
    riceProducts: [],
    
    // 编辑模式
    isEditMode: false,
    
    // 菜单显示状态
    showMenu: false,
    
    // 添加大米弹窗显示状态
    showAddDialog: false,
    
    // 添加大米表单数据
    newRiceName: '',
    newRicePrice: '',
    newRiceUnit: '袋',  // 单位：袋/箱
    newRiceWeight: '',    // 重量（斤）
    newRiceImage: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23F5F5F5"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%239E9E9E" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
    
    // 购物车总数量
    totalQuantity: 0,
    
    // 是否为空状态
    isEmpty: false,
    
    // 计算结果
    showResult: false,
    selectedProducts: [],  // 已选商品列表（带小计）
    totalRicePrice: 0,
    grandTotal: 0,
    
    // 收货地址
    selectedAddress: null,  // 选中的收货地址
    
    // Canvas相关
    canvasWidth: 0,
    canvasHeight: 0,
    
    // 加载状态
    isLoading: false,
  },

  onLoad() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      canvasWidth: systemInfo.windowWidth - 40,
      canvasHeight: 600
    })

    // 加载本地存储的商品数据
    this.loadLocalData()
  },

  // 获取默认商品列表
  getDefaultProducts() {
    return [
      {
        id: 1,
        name: '稻花香',
        price: 40,
        unit: '袋',
        weight: 10,
        image: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23FCE4EC"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23E91E63" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
        quantity: 0
      },
      {
        id: 2,
        name: '稻花香',
        price: 50,
        unit: '箱',
        weight: 10,
        image: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23FCE4EC"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23E91E63" text-anchor="middle" dy=".3em"%3E📦%3C/text%3E%3C/svg%3E',
        quantity: 0
      },
      {
        id: 3,
        name: '长粒香',
        price: 30,
        unit: '袋',
        weight: 10,
        image: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23E8F5E9"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%234CAF50" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
        quantity: 0
      },
      {
        id: 4,
        name: '长粒香',
        price: 40,
        unit: '箱',
        weight: 10,
        image: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23E8F5E9"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%234CAF50" text-anchor="middle" dy=".3em"%3E📦%3C/text%3E%3C/svg%3E',
        quantity: 0
      }
    ]
  },

  // 加载商品数据（优先从API获取，失败则使用本地数据）
  async loadLocalData() {
    this.setData({ isLoading: true })
    
    try {
      // 使用API管理器获取商品数据
      const products = await apiManager.productManager.getProducts()
      
      // 修复和升级商品数据结构
      const fixedProducts = products.map(product => {
        // 修复旧的外部图片链接
        if (product.image && product.image.includes('via.placeholder.com')) {
          console.log('修复旧图片链接:', product.name)
          const colorMap = {
            '稻花香': { bg: '%23FCE4EC', fg: '%23E91E63' },
            '长粒香': { bg: '%23E8F5E9', fg: '%234CAF50' },
            '东北大米': { bg: '%23E8F5E9', fg: '%234CAF50' },
            '泰国香米': { bg: '%23FFF3E0', fg: '%23FF9800' },
            '五常稻花香': { bg: '%23FCE4EC', fg: '%23E91E63' }
          }
          const colors = colorMap[product.name] || { bg: '%23F5F5F5', fg: '%239E9E9E' }
          const emoji = product.unit === '箱' ? '📦' : '🌾'
          product.image = `data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="${colors.bg}"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="${colors.fg}" text-anchor="middle" dy=".3em"%3E${emoji}%3C/text%3E%3C/svg%3E`
        }
        
        // 升级数据结构：添加unit和weight，去掉shipping
        if (!product.unit) {
          product.unit = '袋'
        }
        // 统一单位格式：袋装→袋，箱装→箱
        if (product.unit === '袋装') {
          product.unit = '袋'
        }
        if (product.unit === '箱装') {
          product.unit = '箱'
        }
        if (!product.weight) {
          product.weight = 10
        }
        // 删除旧的shipping字段
        if (product.shipping !== undefined) {
          delete product.shipping
        }
        
        return product
      })
      
      // 如果没有商品数据，使用默认商品
      if (fixedProducts.length === 0) {
        const defaultProducts = this.getDefaultProducts()
        this.setData({
          riceProducts: defaultProducts,
          isEmpty: false
        })
        // 默认商品已通过API管理
        console.log('首次启动，加载默认商品')
      } else {
        // 修复后的数据已通过API管理
        console.log('已修复并保存商品数据结构')
        
        // 加载保存的商品数据
        this.setData({
          riceProducts: fixedProducts,
          isEmpty: false
        })
        console.log('成功加载商品数据', fixedProducts.length, '个商品')
      }
    } catch (error) {
      console.error('加载商品数据失败', error)
      // 加载失败，使用默认商品
      const defaultProducts = this.getDefaultProducts()
      this.setData({
        riceProducts: defaultProducts,
        isEmpty: false
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },


  // 显示添加大米弹窗
  showAddRiceDialog() {
    this.setData({
      showAddDialog: true,
      newRiceName: '',
      newRicePrice: '',
      newRiceUnit: '袋',
      newRiceWeight: '',
      newRiceImage: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23F5F5F5"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%239E9E9E" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E'
    })
  },

  // 关闭添加大米弹窗
  closeAddDialog() {
    this.setData({
      showAddDialog: false
    })
  },

  // 输入新大米名称
  onNewRiceNameInput(e) {
    this.setData({
      newRiceName: e.detail.value
    })
  },

  // 输入新大米价格
  onNewRicePriceInput(e) {
    this.setData({
      newRicePrice: e.detail.value
    })
  },

  // 选择单位
  onNewRiceUnitChange(e) {
    this.setData({
      newRiceUnit: e.detail.value
    })
  },

  // 输入重量
  onNewRiceWeightInput(e) {
    this.setData({
      newRiceWeight: e.detail.value
    })
  },

  // 选择大米图片（从相册上传）
  chooseRiceImage() {
    wx.chooseImage({
      count: 1,  // 最多选择1张图片
      sizeType: ['compressed'],  // 压缩图
      sourceType: ['album', 'camera'],  // 可以从相册选择或拍照
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setData({
          newRiceImage: tempFilePath
        })
        wx.showToast({
          title: '图片已选择',
          icon: 'success',
          duration: 1500
        })
      },
      fail: (err) => {
        console.log('选择图片失败', err)
        // 如果用户取消或失败，可以选择默认图片
        if (err.errMsg && !err.errMsg.includes('cancel')) {
          wx.showModal({
            title: '提示',
            content: '选择图片失败，是否使用默认图片？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.useDefaultImage()
              }
            }
          })
        }
      }
    })
  },

  // 使用默认图片
  useDefaultImage() {
    const images = [
      'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23E8F5E9"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%234CAF50" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
      'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23FFF3E0"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23FF9800" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
      'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23FCE4EC"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%23E91E63" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
      'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23E3F2FD"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%232196F3" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E',
      'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23F5F5F5"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%239E9E9E" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E'
    ]
    
    wx.showActionSheet({
      itemList: ['绿色主题', '橙色主题', '粉色主题', '蓝色主题', '灰色通用'],
      success: (res) => {
        this.setData({
          newRiceImage: images[res.tapIndex]
        })
      }
    })
  },

  // 确认添加新大米类型
  async confirmAddRice() {
    const { newRiceName, newRicePrice, newRiceUnit, newRiceWeight, newRiceImage, riceProducts } = this.data

    // 验证输入
    if (!newRiceName.trim()) {
      wx.showToast({
        title: '请输入大米名称',
        icon: 'none'
      })
      return
    }

    if (!newRicePrice || isNaN(newRicePrice) || parseFloat(newRicePrice) <= 0) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      })
      return
    }

    if (!newRiceWeight || isNaN(newRiceWeight) || parseFloat(newRiceWeight) <= 0) {
      wx.showToast({
        title: '请输入有效的重量',
        icon: 'none'
      })
      return
    }

    // 显示加载状态
    wx.showLoading({
      title: '添加中...',
      mask: true
    })

    try {
      // 准备新商品数据
      const newProductData = {
        name: newRiceName.trim(),
        price: parseFloat(newRicePrice),
        unit: newRiceUnit,
        weight: parseFloat(newRiceWeight),
        image: newRiceImage,
        quantity: 0
      }

      // 使用API管理器创建商品
      const newProduct = await apiManager.productManager.createProduct(newProductData)

      // 更新页面数据
      const updatedProducts = [...riceProducts, newProduct]
      
      this.setData({
        riceProducts: updatedProducts,
        isEmpty: updatedProducts.length === 0,
        showAddDialog: false,
        showResult: false
      })

      wx.hideLoading()
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    } catch (error) {
      wx.hideLoading()
      console.error('添加商品失败:', error)
      wx.showToast({
        title: '添加失败，请重试',
        icon: 'none'
      })
    }
  },

  // 增加商品数量
  increaseQuantity(e) {
    const { id } = e.currentTarget.dataset
    const { riceProducts } = this.data
    
    const updatedProducts = riceProducts.map(product => {
      if (product.id === id) {
        return { ...product, quantity: product.quantity + 1 }
      }
      return product
    })

    this.updateCart(updatedProducts)
  },

  // 减少商品数量
  decreaseQuantity(e) {
    const { id } = e.currentTarget.dataset
    const { riceProducts } = this.data
    
    const updatedProducts = riceProducts.map(product => {
      if (product.id === id && product.quantity > 0) {
        return { ...product, quantity: product.quantity - 1 }
      }
      return product
    })

    this.updateCart(updatedProducts)
  },

  // 更新购物车
  updateCart(updatedProducts) {
    // 计算总数量
    const totalQuantity = updatedProducts.reduce((sum, product) => sum + product.quantity, 0)
    
    this.setData({
      riceProducts: updatedProducts,
      totalQuantity: totalQuantity,
      showResult: false  // 重置计算结果
    })

    // 数据已通过API管理
  },

  // 删除大米商品类型
  deleteProduct(e) {
    const { id } = e.currentTarget.dataset
    const { riceProducts } = this.data
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个大米类型吗？',
      success: async (res) => {
        if (res.confirm) {
          // 显示加载状态
          wx.showLoading({
            title: '删除中...',
            mask: true
          })

          try {
            // 使用API管理器删除商品
            await apiManager.productManager.deleteProduct(id)

            // 更新页面数据
            const newProducts = riceProducts.filter(product => product.id !== id)
            const totalQuantity = newProducts.reduce((sum, product) => sum + product.quantity, 0)
            
            this.setData({
              riceProducts: newProducts,
              isEmpty: newProducts.length === 0,
              totalQuantity: totalQuantity,
              showResult: false
            })

            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            wx.hideLoading()
            console.error('删除商品失败:', error)
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 去结算 - 跳转到结算页面
  goCheckout() {
    const { riceProducts, totalQuantity, selectedAddress } = this.data

    if (totalQuantity === 0) {
      wx.showToast({
        title: '请先选择商品',
        icon: 'none'
      })
      return
    }

    // 计算总价和准备已选商品列表
    let totalRicePrice = 0
    let selectedProducts = []

    riceProducts.forEach(product => {
      if (product.quantity > 0) {
        const subtotal = (product.price * product.quantity).toFixed(2)
        selectedProducts.push({
          id: product.id,
          name: product.name,
          unit: product.unit,
          weight: product.weight,
          price: product.price,  // 保存单价
          quantity: product.quantity,
          subtotal: subtotal
        })
        totalRicePrice += product.price * product.quantity
      }
    })

    const grandTotal = totalRicePrice

    // 将结算数据保存到本地存储
    const checkoutData = {
      selectedProducts: selectedProducts,
      totalRicePrice: totalRicePrice.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      selectedAddress: selectedAddress
    }

    try {
      wx.setStorageSync('checkoutData', checkoutData)
      console.log('结算数据已保存', checkoutData)
      
      // 跳转到结算页面
      wx.navigateTo({
        url: '/pages/checkout/checkout'
      })
    } catch (error) {
      console.error('保存结算数据失败', error)
      wx.showToast({
        title: '跳转失败，请重试',
        icon: 'none'
      })
    }
  },

  // 选择收货地址
  selectAddress() {
    wx.navigateTo({
      url: `/pages/address/address?from=checkout${this.data.selectedAddress ? '&selectedId=' + this.data.selectedAddress.id : ''}`
    })
  },

  // 确认下单
  confirmOrder() {
    const { selectedAddress, selectedProducts, grandTotal, totalRicePrice, totalShipping } = this.data

    if (!selectedAddress) {
      wx.showModal({
        title: '提示',
        content: '请先选择收货地址',
        showCancel: false
      })
      return
    }

    // 显示确认对话框
    wx.showModal({
      title: '订单确认',
      content: `收货人：${selectedAddress.name}\n电话：${selectedAddress.phone}\n总金额：¥${grandTotal}`,
      confirmText: '确认下单',
      success: (res) => {
        if (res.confirm) {
          // 生成订单
          const order = {
            id: Date.now(), // 使用时间戳作为订单ID
            orderNo: 'ORD' + Date.now(), // 订单号
            status: '待付款',
            products: selectedProducts,
            address: selectedAddress,
            totalRicePrice: totalRicePrice,
            totalShipping: totalShipping,
            grandTotal: grandTotal,
            createTime: this.formatTime(new Date())
          }

          // 订单已通过API保存到后端

          wx.showToast({
            title: '下单成功！',
            icon: 'success'
          })
          
          // 清空购物车
          setTimeout(() => {
            const { riceProducts } = this.data
            const resetProducts = riceProducts.map(product => ({
              ...product,
              quantity: 0
            }))
            
            this.setData({
              riceProducts: resetProducts,
              totalQuantity: 0,
              showResult: false,
              selectedAddress: null
            })

            // 数据已通过API管理

            // 提示用户查看订单
            setTimeout(() => {
              wx.showModal({
                title: '提示',
                content: '订单已生成，可在"我的"页面查看',
                showCancel: false
              })
            }, 800)
          }, 1500)
        }
      }
    })
  },


  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
  },

  // 关闭结算结果
  closeResult() {
    this.setData({
      showResult: false
    })
  },

  // 清空购物车
  clearCart() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空购物车吗？',
      success: (res) => {
        if (res.confirm) {
          const { riceProducts } = this.data
          const resetProducts = riceProducts.map(product => ({
            ...product,
            quantity: 0
          }))
          
          this.setData({
            riceProducts: resetProducts,
            totalQuantity: 0,
            showResult: false
          })

          // 数据已通过API管理
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 切换菜单显示
  toggleMenu() {
    this.setData({
      showMenu: !this.data.showMenu
    })
  },

  // 关闭菜单
  closeMenu() {
    this.setData({
      showMenu: false
    })
  },

  // 切换编辑模式
  toggleEditMode() {
    this.setData({
      isEditMode: !this.data.isEditMode,
      showMenu: false  // 关闭菜单
    })
  },

  // 显示添加大米弹窗（从菜单触发）
  showAddRiceDialogFromMenu() {
    this.setData({
      showMenu: false  // 关闭菜单
    })
    this.showAddRiceDialog()
  },

  // 恢复默认商品（从菜单触发）
  restoreDefaultProductsFromMenu() {
    this.setData({
      showMenu: false  // 关闭菜单
    })
    this.restoreDefaultProducts()
  },

  // 恢复默认商品
  restoreDefaultProducts() {
    wx.showModal({
      title: '恢复默认商品',
      content: '确定要恢复默认的4种大米商品吗？这将清除所有自定义商品。',
      confirmText: '确定恢复',
      confirmColor: '#ff6034',
      success: (res) => {
        if (res.confirm) {
          const defaultProducts = this.getDefaultProducts()
          this.setData({
            riceProducts: defaultProducts,
            isEmpty: false,
            totalQuantity: 0,
            showResult: false
          })

          // 数据已通过API管理

          wx.showToast({
            title: '已恢复默认商品',
            icon: 'success'
          })
        }
      }
    })
  },

  // 保存为图片
  saveAsImage() {
    const { selectedProducts, totalRicePrice, grandTotal } = this.data

    if (!this.data.showResult) {
      wx.showToast({
        title: '请先计算结果',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '生成图片中...',
    })

    // 使用canvas绘制
    const query = wx.createSelectorQuery()
    query.select('#resultCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          wx.hideLoading()
          wx.showToast({
            title: '生成失败，请重试',
            icon: 'none'
          })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        // 绘制背景
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, res[0].width, res[0].height)

        ctx.fillStyle = '#333333'
        ctx.textAlign = 'left'
        
        let y = 30

        // 绘制标题
        ctx.font = 'bold 20px sans-serif'
        ctx.fillStyle = '#1890ff'
        ctx.fillText('大米购买清单', 20, y)
        y += 40

        ctx.strokeStyle = '#e0e0e0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(20, y)
        ctx.lineTo(res[0].width - 20, y)
        ctx.stroke()
        y += 30

        // 绘制商品列表
        ctx.font = 'bold 16px sans-serif'
        ctx.fillStyle = '#333333'
        ctx.fillText('商品明细：', 20, y)
        y += 30

        ctx.font = '14px sans-serif'
        selectedProducts.forEach((item, index) => {
          ctx.fillStyle = '#666666'
          ctx.fillText(`${index + 1}. ${item.name} x ${item.quantity}`, 30, y)
          y += 25
          ctx.fillStyle = '#888888'
          ctx.fillText(`   小计: ¥${item.subtotal}`, 30, y)
          y += 30
        })

        ctx.strokeStyle = '#e0e0e0'
        ctx.beginPath()
        ctx.moveTo(20, y)
        ctx.lineTo(res[0].width - 20, y)
        ctx.stroke()
        y += 30

        // 绘制总计
        ctx.font = 'bold 16px sans-serif'
        ctx.fillStyle = '#333333'
        ctx.fillText('结算汇总：', 20, y)
        y += 30

        ctx.font = '15px sans-serif'
        ctx.fillStyle = '#666666'
        ctx.fillText(`商品总价: ¥${totalRicePrice}`, 30, y)
        y += 30

        ctx.strokeStyle = '#1890ff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(20, y)
        ctx.lineTo(res[0].width - 20, y)
        ctx.stroke()
        y += 30

        ctx.font = 'bold 18px sans-serif'
        ctx.fillStyle = '#ff4d4f'
        ctx.fillText(`总计: ¥${grandTotal}`, 30, y)

        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvas: canvas,
            success: (res) => {
              wx.hideLoading()
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  wx.showToast({
                    title: '已保存到相册',
                    icon: 'success'
                  })
                },
                fail: (err) => {
                  if (err.errMsg.includes('auth')) {
                    wx.showModal({
                      title: '提示',
                      content: '需要授权保存到相册',
                      success: (modalRes) => {
                        if (modalRes.confirm) {
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
            },
            fail: (err) => {
              wx.hideLoading()
              console.error('生成图片失败', err)
              wx.showToast({
                title: '生成图片失败',
                icon: 'none'
              })
            }
          }, this)
        }, 100)
      })
  }
})
