/**
 * API服务管理器
 * 管理本地数据与远程API的同步
 */

const api = require('./api.js')

/**
 * API服务管理器
 */
class APIManager {
  constructor() {
    this.isOnline = false // 是否在线
    this.isInitialized = false
  }

  /**
   * 初始化API管理器
   */
  async init() {
    if (this.isInitialized) return

    try {
      // 检查网络连接
      await this.checkConnection()
      this.isInitialized = true
      console.log('[API管理器] 初始化完成')
    } catch (error) {
      console.warn('[API管理器] 初始化失败，将使用离线模式:', error.message)
      this.isOnline = false
      this.isInitialized = true
    }
  }

  /**
   * 检查网络连接
   */
  async checkConnection() {
    try {
      await api.systemAPI.healthCheck()
      this.isOnline = true
      console.log('[API管理器] 网络连接正常')
    } catch (error) {
      this.isOnline = false
      console.warn('[API管理器] 网络连接失败:', error.message)
      throw error
    }
  }

  /**
   * 商品管理
   */
  productManager = {
    // 获取商品列表
    async getProducts() {
      try {
        const response = await api.productAPI.getAllProducts()
        const apiProducts = response.data.map(api.dataConverter.convertAPIProductToLocal)
        console.log('[商品管理] 从API获取商品列表成功')
        return apiProducts
      } catch (error) {
        console.error('[商品管理] 从API获取商品列表失败:', error.message)
        throw error
      }
    },

    // 创建商品
    async createProduct(productData) {
      const localProduct = api.dataConverter.convertLocalProductToAPI(productData)
      
      try {
        if (apiManager.isOnline) {
          const response = await api.productAPI.createProduct(localProduct)
          const newProduct = api.dataConverter.convertAPIProductToLocal(response.data)
          
          // 更新本地存储
          const localProducts = wx.getStorageSync('riceProducts') || []
          localProducts.push(newProduct)
          wx.setStorageSync('riceProducts', localProducts)
          
          console.log('[商品管理] 创建商品成功')
          return newProduct
        }
      } catch (error) {
        console.warn('[商品管理] API创建商品失败，仅保存到本地:', error.message)
      }

      // 仅保存到本地
      const newProduct = {
        id: Date.now(),
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const localProducts = wx.getStorageSync('riceProducts') || []
      localProducts.push(newProduct)
      wx.setStorageSync('riceProducts', localProducts)
      
      // 添加到同步队列
      apiManager.addToSyncQueue('createProduct', newProduct)
      
      console.log('[商品管理] 商品已保存到本地')
      return newProduct
    },

    // 更新商品
    async updateProduct(id, productData) {
      const localProduct = api.dataConverter.convertLocalProductToAPI(productData)
      
      try {
        if (apiManager.isOnline) {
          const response = await api.productAPI.updateProduct(id, localProduct)
          const updatedProduct = api.dataConverter.convertAPIProductToLocal(response.data)
          
          // 更新本地存储
          const localProducts = wx.getStorageSync('riceProducts') || []
          const index = localProducts.findIndex(p => p.id === id)
          if (index !== -1) {
            localProducts[index] = updatedProduct
            wx.setStorageSync('riceProducts', localProducts)
          }
          
          console.log('[商品管理] 更新商品成功')
          return updatedProduct
        }
      } catch (error) {
        console.warn('[商品管理] API更新商品失败，仅更新本地:', error.message)
      }

      // 仅更新本地
      const localProducts = wx.getStorageSync('riceProducts') || []
      const index = localProducts.findIndex(p => p.id === id)
      if (index !== -1) {
        localProducts[index] = {
          ...localProducts[index],
          ...productData,
          updatedAt: new Date().toISOString()
        }
        wx.setStorageSync('riceProducts', localProducts)
        
        // 添加到同步队列
        apiManager.addToSyncQueue('updateProduct', { id, ...productData })
        
        console.log('[商品管理] 商品已更新到本地')
        return localProducts[index]
      }
      
      throw new Error('商品不存在')
    },

    // 删除商品
    async deleteProduct(id) {
      try {
        if (apiManager.isOnline) {
          await api.productAPI.deleteProduct(id)
          console.log('[商品管理] API删除商品成功')
        }
      } catch (error) {
        console.warn('[商品管理] API删除商品失败，仅删除本地:', error.message)
      }

      // 删除本地数据
      const localProducts = wx.getStorageSync('riceProducts') || []
      const filteredProducts = localProducts.filter(p => p.id !== id)
      wx.setStorageSync('riceProducts', filteredProducts)
      
      // 添加到同步队列
      apiManager.addToSyncQueue('deleteProduct', { id })
      
      console.log('[商品管理] 商品已从本地删除')
      return true
    }
  }

  /**
   * 地址管理
   */
  addressManager = {
    // 获取地址列表
    async getAddresses() {
      try {
        if (apiManager.isOnline) {
          console.log('[地址管理] 尝试从API获取地址列表...')
          const response = await api.addressAPI.getAllAddresses()
          const apiAddresses = response.data.map(api.dataConverter.convertAPIAddressToLocal)
          
          // 保存到本地存储
          wx.setStorageSync('addressList', apiAddresses)
          console.log('[地址管理] 从API获取地址列表成功，共', apiAddresses.length, '个地址')
          return apiAddresses
        } else {
          console.log('[地址管理] 当前离线，使用本地数据')
        }
      } catch (error) {
        console.warn('[地址管理] 从API获取地址列表失败，使用本地数据:', error.message)
      }

      // 使用本地数据
      const localAddresses = wx.getStorageSync('addressList') || []
      console.log('[地址管理] 使用本地地址数据，共', localAddresses.length, '个地址')
      return localAddresses
    },

    // 创建地址
    async createAddress(addressData) {
      const localAddress = api.dataConverter.convertLocalAddressToAPI(addressData)
      
      try {
        if (apiManager.isOnline) {
          const response = await api.addressAPI.createAddress(localAddress)
          const newAddress = api.dataConverter.convertAPIAddressToLocal(response.data)
          
          // 更新本地存储
          const localAddresses = wx.getStorageSync('addressList') || []
          localAddresses.push(newAddress)
          wx.setStorageSync('addressList', localAddresses)
          
          console.log('[地址管理] 创建地址成功')
          return newAddress
        }
      } catch (error) {
        console.warn('[地址管理] API创建地址失败，仅保存到本地:', error.message)
      }

      // 仅保存到本地
      const newAddress = {
        id: Date.now(),
        ...addressData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const localAddresses = wx.getStorageSync('addressList') || []
      localAddresses.push(newAddress)
      wx.setStorageSync('addressList', localAddresses)
      
      // 添加到同步队列
      apiManager.addToSyncQueue('createAddress', newAddress)
      
      console.log('[地址管理] 地址已保存到本地')
      return newAddress
    },

    // 更新地址
    async updateAddress(id, addressData) {
      const localAddress = api.dataConverter.convertLocalAddressToAPI(addressData)
      
      try {
        if (apiManager.isOnline) {
          const response = await api.addressAPI.updateAddress(id, localAddress)
          const updatedAddress = api.dataConverter.convertAPIAddressToLocal(response.data)
          
          // 更新本地存储
          const localAddresses = wx.getStorageSync('addressList') || []
          const index = localAddresses.findIndex(a => a.id === id)
          if (index !== -1) {
            localAddresses[index] = updatedAddress
            wx.setStorageSync('addressList', localAddresses)
          }
          
          console.log('[地址管理] 更新地址成功')
          return updatedAddress
        }
      } catch (error) {
        console.warn('[地址管理] API更新地址失败，仅更新本地:', error.message)
      }

      // 仅更新本地
      const localAddresses = wx.getStorageSync('addressList') || []
      const index = localAddresses.findIndex(a => a.id === id)
      if (index !== -1) {
        localAddresses[index] = {
          ...localAddresses[index],
          ...addressData,
          updatedAt: new Date().toISOString()
        }
        wx.setStorageSync('addressList', localAddresses)
        
        // 添加到同步队列
        apiManager.addToSyncQueue('updateAddress', { id, ...addressData })
        
        console.log('[地址管理] 地址已更新到本地')
        return localAddresses[index]
      }
      
      throw new Error('地址不存在')
    },

    // 删除地址
    async deleteAddress(id) {
      try {
        if (apiManager.isOnline) {
          await api.addressAPI.deleteAddress(id)
          console.log('[地址管理] API删除地址成功')
        }
      } catch (error) {
        console.warn('[地址管理] API删除地址失败，仅删除本地:', error.message)
      }

      // 删除本地数据
      const localAddresses = wx.getStorageSync('addressList') || []
      const filteredAddresses = localAddresses.filter(a => a.id !== id)
      wx.setStorageSync('addressList', filteredAddresses)
      
      // 添加到同步队列
      apiManager.addToSyncQueue('deleteAddress', { id })
      
      console.log('[地址管理] 地址已从本地删除')
      return true
    },

    // 智能解析地址
    async parseAddress(fullAddress) {
      try {
        if (apiManager.isOnline) {
          const response = await api.addressAPI.parseAddress(fullAddress)
          console.log('[地址管理] API解析地址成功')
          return response.data
        }
      } catch (error) {
        console.warn('[地址管理] API解析地址失败，使用本地解析:', error.message)
      }

      // 使用本地解析
      const addressParser = require('./addressParser.js')
      const result = addressParser.parseAddress(fullAddress)
      console.log('[地址管理] 使用本地解析地址')
      return result
    }
  }

  /**
   * 订单管理
   */
  orderManager = {
    // 获取订单列表
    async getOrders() {
      try {
        const response = await api.orderAPI.getAllOrders()
        const apiOrders = response.data.map(api.dataConverter.convertAPIOrderToLocal)
        console.log('[订单管理] 从API获取订单列表成功')
        return apiOrders
      } catch (error) {
        console.error('[订单管理] 从API获取订单列表失败:', error.message)
        throw error
      }
    },

    // 创建订单
    async createOrder(orderData) {
      const localOrder = api.dataConverter.convertLocalOrderToAPI(orderData)
      
      try {
        const response = await api.orderAPI.createOrder(localOrder)
        const newOrder = api.dataConverter.convertAPIOrderToLocal(response.data)
        console.log('[订单管理] 创建订单成功')
        return newOrder
      } catch (error) {
        console.error('[订单管理] 创建订单失败:', error.message)
        throw error
      }
    },

    // 更新订单状态
    async updateOrderStatus(id, status) {
      try {
        await api.orderAPI.updateOrderStatus(id, status)
        console.log('[订单管理] 更新订单状态成功')
        return true
      } catch (error) {
        console.error('[订单管理] 更新订单状态失败:', error.message)
        throw error
      }
    },

    // 更新支付状态
    async updatePaymentStatus(id, paymentStatus) {
      try {
        await api.orderAPI.updatePaymentStatus(id, paymentStatus)
        console.log('[订单管理] 更新支付状态成功')
        return true
      } catch (error) {
        console.error('[订单管理] 更新支付状态失败:', error.message)
        throw error
      }
    },

    // 计算订单
    async calculateOrder(calculationData) {
      try {
        const response = await api.orderAPI.calculateOrder(calculationData)
        console.log('[订单管理] 计算订单成功')
        return response.data
      } catch (error) {
        console.error('[订单管理] 计算订单失败:', error.message)
        throw error
      }
    },

    // 删除订单
    async deleteOrder(id) {
      try {
        await api.orderAPI.deleteOrder(id)
        console.log('[订单管理] 删除订单成功')
        return true
      } catch (error) {
        console.error('[订单管理] 删除订单失败:', error.message)
        throw error
      }
    }
  }

  /**
   * 运费管理
   */
  shippingManager = {
    // 获取运费配置
    async getShippingRates() {
      try {
        if (apiManager.isOnline) {
          const response = await api.shippingAPI.getAllShippingRates()
          console.log('[运费管理] 从API获取运费配置成功，共', response.data.length, '个配置')
          return response.data
        } else {
          throw new Error('当前离线，无法获取运费配置')
        }
      } catch (error) {
        console.error('[运费管理] 获取运费配置失败:', error.message)
        throw error
      }
    },

    // 计算运费
    async calculateShipping(province, weight) {
      try {
        if (apiManager.isOnline) {
          const response = await api.shippingAPI.calculateShipping({ province, weight })
          console.log('[运费管理] API计算运费成功')
          return response.data
        } else {
          throw new Error('当前离线，无法计算运费')
        }
      } catch (error) {
        console.error('[运费管理] 计算运费失败:', error.message)
        throw error
      }
    }
  }

}

// 创建全局实例
const apiManager = new APIManager()

// 导出
module.exports = apiManager
