// utils/apiManager.js
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
      await this.checkNetworkConnection()
      this.isOnline = true
      console.log('[API管理器] 初始化成功，网络连接正常')
    } catch (error) {
      this.isOnline = false
      console.warn('[API管理器] 初始化失败，网络连接异常:', error.message)
    }

    this.isInitialized = true
  }

  /**
   * 检查网络连接
   */
  async checkNetworkConnection() {
    try {
      // 尝试访问API健康检查接口
      await api.systemAPI.healthCheck()
      console.log('[API管理器] 网络连接正常')
    } catch (error) {
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
        const response = await api.productAPI.createProduct(localProduct)
        const newProduct = api.dataConverter.convertAPIProductToLocal(response.data)
        console.log('[商品管理] 创建商品成功')
        return newProduct
      } catch (error) {
        console.error('[商品管理] 创建商品失败:', error.message)
        throw error
      }
    },

    // 更新商品
    async updateProduct(id, productData) {
      const localProduct = api.dataConverter.convertLocalProductToAPI(productData)
      
      try {
        const response = await api.productAPI.updateProduct(id, localProduct)
        const updatedProduct = api.dataConverter.convertAPIProductToLocal(response.data)
        console.log('[商品管理] 更新商品成功')
        return updatedProduct
      } catch (error) {
        console.error('[商品管理] 更新商品失败:', error.message)
        throw error
      }
    },

    // 删除商品
    async deleteProduct(id) {
      try {
        await api.productAPI.deleteProduct(id)
        console.log('[商品管理] 删除商品成功')
        return true
      } catch (error) {
        console.error('[商品管理] 删除商品失败:', error.message)
        throw error
      }
    }
  }

  /**
   * 地址管理
   */
  addressManager = {
    // 获取地址列表
    async getAddresses() {
      try {
        const response = await api.addressAPI.getAllAddresses()
        const apiAddresses = response.data.map(api.dataConverter.convertAPIAddressToLocal)
        console.log('[地址管理] 从API获取地址列表成功')
        return apiAddresses
      } catch (error) {
        console.error('[地址管理] 从API获取地址列表失败:', error.message)
        throw error
      }
    },

    // 创建地址
    async createAddress(addressData) {
      const localAddress = api.dataConverter.convertLocalAddressToAPI(addressData)
      
      try {
        const response = await api.addressAPI.createAddress(localAddress)
        const newAddress = api.dataConverter.convertAPIAddressToLocal(response.data)
        console.log('[地址管理] 创建地址成功')
        return newAddress
      } catch (error) {
        console.error('[地址管理] 创建地址失败:', error.message)
        throw error
      }
    },

    // 更新地址
    async updateAddress(id, addressData) {
      const localAddress = api.dataConverter.convertLocalAddressToAPI(addressData)
      
      try {
        const response = await api.addressAPI.updateAddress(id, localAddress)
        const updatedAddress = api.dataConverter.convertAPIAddressToLocal(response.data)
        console.log('[地址管理] 更新地址成功')
        return updatedAddress
      } catch (error) {
        console.error('[地址管理] 更新地址失败:', error.message)
        throw error
      }
    },

    // 删除地址
    async deleteAddress(id) {
      try {
        await api.addressAPI.deleteAddress(id)
        console.log('[地址管理] 删除地址成功')
        return true
      } catch (error) {
        console.error('[地址管理] 删除地址失败:', error.message)
        throw error
      }
    },

    // 设置默认地址
    async setDefaultAddress(id) {
      try {
        await api.addressAPI.setDefaultAddress(id)
        console.log('[地址管理] 设置默认地址成功')
        return true
      } catch (error) {
        console.error('[地址管理] 设置默认地址失败:', error.message)
        throw error
      }
    },

    // 智能解析地址
    async parseAddress(addressText) {
      try {
        const response = await api.addressAPI.parseAddress({ addressText })
        console.log('[地址管理] API解析地址成功')
        return response.data
      } catch (error) {
        console.warn('[地址管理] API解析地址失败，使用本地解析:', error.message)
        
        // 使用本地解析作为备用
        const addressParser = require('./addressParser.js')
        const result = addressParser.parseAddress(addressText)
        console.log('[地址管理] 使用本地解析地址')
        return result
      }
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
        const response = await api.shippingAPI.getAllShippingRates()
        console.log('[运费管理] 从API获取运费配置成功，共', response.data.length, '个配置')
        return response.data
      } catch (error) {
        console.error('[运费管理] 获取运费配置失败:', error.message)
        throw error
      }
    },

    // 计算运费
    async calculateShipping(province, weight) {
      try {
        const response = await api.shippingAPI.calculateShipping({ province, weight })
        console.log('[运费管理] API计算运费成功')
        return response.data
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
