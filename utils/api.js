/**
 * API服务层 - 林龍香大米商城
 * 封装所有后端接口调用
 */

// API基础配置
const API_CONFIG = {
  baseUrl: 'http://118.126.105.146:8081', // 后端服务地址
  timeout: 10000, // 请求超时时间
  version: 'v1'
}

/**
 * 统一请求方法
 * @param {string} url - 请求地址
 * @param {object} options - 请求选项
 * @returns {Promise} 请求结果
 */
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      method = 'GET',
      data = {},
      header = {},
      timeout = API_CONFIG.timeout
    } = options

    // 构建完整URL
    const fullUrl = `${API_CONFIG.baseUrl}${url}`
    
    // 设置请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }

    console.log(`[API请求] ${method} ${fullUrl}`, data)

    wx.request({
      url: fullUrl,
      method: method,
      data: data,
      header: requestHeader,
      timeout: timeout,
      success: (res) => {
        console.log(`[API响应] ${method} ${fullUrl}`, res)
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 检查业务状态
          if (res.data && res.data.success !== false) {
            resolve(res.data)
          } else {
            // 业务错误
            const errorMsg = res.data?.message || '请求失败'
            console.error(`[API业务错误] ${errorMsg}`, res.data)
            reject(new Error(errorMsg))
          }
        } else {
          // HTTP错误
          const errorMsg = `HTTP ${res.statusCode}: ${res.data?.message || '请求失败'}`
          console.error(`[API HTTP错误] ${errorMsg}`, res)
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        console.error(`[API请求失败] ${method} ${fullUrl}`, err)
        
        let errorMsg = '网络请求失败'
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMsg = '请求超时，请检查网络连接'
          } else if (err.errMsg.includes('fail')) {
            errorMsg = '网络连接失败，请检查网络设置'
          }
        }
        
        reject(new Error(errorMsg))
      }
    })
  })
}

/**
 * 商品管理API
 */
const productAPI = {
  // 获取所有商品
  getAllProducts() {
    return request('/api/products')
  },

  // 根据ID获取商品
  getProductById(id) {
    return request(`/api/products/${id}`)
  },

  // 搜索商品
  searchProducts(name) {
    return request(`/api/products/search?name=${encodeURIComponent(name)}`)
  },

  // 分页获取商品
  getProductsPaged(params = {}) {
    const {
      pageNumber = 1,
      pageSize = 20,
      sortBy = null,
      sortDescending = false,
      searchTerm = null
    } = params

    let url = `/api/products/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (sortBy) url += `&sortBy=${sortBy}&sortDescending=${sortDescending}`
    if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`

    return request(url)
  },

  // 创建商品
  createProduct(productData) {
    return request('/api/products', {
      method: 'POST',
      data: productData
    })
  },

  // 更新商品
  updateProduct(id, productData) {
    return request(`/api/products/${id}`, {
      method: 'PUT',
      data: productData
    })
  },

  // 删除商品
  deleteProduct(id) {
    return request(`/api/products/${id}`, {
      method: 'DELETE'
    })
  },

  // 更新商品库存
  updateProductQuantity(id, quantity) {
    return request(`/api/products/${id}/quantity`, {
      method: 'PATCH',
      data: quantity
    })
  }
}

/**
 * 地址管理API
 */
const addressAPI = {
  // 获取所有地址
  getAllAddresses() {
    return request('/api/addresses')
  },

  // 根据ID获取地址
  getAddressById(id) {
    return request(`/api/addresses/${id}`)
  },

  // 获取默认地址
  getDefaultAddress() {
    return request('/api/addresses/default')
  },

  // 根据手机号获取地址列表
  getAddressesByPhone(phone) {
    return request(`/api/addresses/phone/${phone}`)
  },

  // 创建地址
  createAddress(addressData) {
    return request('/api/addresses', {
      method: 'POST',
      data: addressData
    })
  },

  // 更新地址
  updateAddress(id, addressData) {
    return request(`/api/addresses/${id}`, {
      method: 'PUT',
      data: addressData
    })
  },

  // 删除地址
  deleteAddress(id) {
    return request(`/api/addresses/${id}`, {
      method: 'DELETE'
    })
  },

  // 设置默认地址
  setDefaultAddress(id) {
    return request(`/api/addresses/${id}/default`, {
      method: 'PATCH'
    })
  },

  // 智能解析地址
  parseAddress(fullAddress) {
    return request('/api/addresses/parse', {
      method: 'POST',
      data: { fullAddress }
    })
  }
}

/**
 * 订单管理API
 */
const orderAPI = {
  // 获取所有订单
  getAllOrders() {
    return request('/api/orders')
  },

  // 根据ID获取订单
  getOrderById(id) {
    return request(`/api/orders/${id}`)
  },

  // 根据订单号获取订单
  getOrderByOrderNo(orderNo) {
    return request(`/api/orders/order-no/${orderNo}`)
  },

  // 根据状态获取订单列表
  getOrdersByStatus(status) {
    return request(`/api/orders/status/${status}`)
  },

  // 根据地址ID获取订单列表
  getOrdersByAddressId(addressId) {
    return request(`/api/orders/address/${addressId}`)
  },

  // 创建订单
  createOrder(orderData) {
    return request('/api/orders', {
      method: 'POST',
      data: orderData
    })
  },

  // 更新订单状态
  updateOrderStatus(id, status) {
    return request(`/api/orders/${id}/status`, {
      method: 'PATCH',
      data: { status }
    })
  },

  // 更新支付状态
  updatePaymentStatus(id, paymentStatus) {
    return request(`/api/orders/${id}/payment-status`, {
      method: 'PATCH',
      data: { paymentStatus }
    })
  },

  // 删除订单
  deleteOrder(id) {
    return request(`/api/orders/${id}`, {
      method: 'DELETE'
    })
  },

  // 批量删除订单
  deleteOrdersBatch(orderIds) {
    return request('/api/orders/batch/delete', {
      method: 'POST',
      data: { ids: orderIds }
    })
  },

  // 计算订单
  calculateOrder(calculationData) {
    return request('/api/orders/calculate', {
      method: 'POST',
      data: calculationData
    })
  }
}

/**
 * 运费管理API
 */
const shippingAPI = {
  // 获取所有运费配置
  getAllShippingRates() {
    return request('/api/shipping/rates')
  },

  // 根据ID获取运费配置
  getShippingRateById(id) {
    return request(`/api/shipping/rates/${id}`)
  },

  // 根据省份获取运费配置
  getShippingRateByProvince(province) {
    return request(`/api/shipping/rates/province/${encodeURIComponent(province)}`)
  },

  // 创建运费配置
  createShippingRate(rateData) {
    return request('/api/shipping/rates', {
      method: 'POST',
      data: rateData
    })
  },

  // 更新运费配置
  updateShippingRate(id, rateData) {
    return request(`/api/shipping/rates/${id}`, {
      method: 'PUT',
      data: rateData
    })
  },

  // 删除运费配置
  deleteShippingRate(id) {
    return request(`/api/shipping/rates/${id}`, {
      method: 'DELETE'
    })
  },

  // 计算运费
  calculateShipping(calculationData) {
    return request('/api/shipping/calculate', {
      method: 'POST',
      data: calculationData
    })
  }
}

/**
 * 系统健康检查API
 */
const systemAPI = {
  // 健康检查
  healthCheck() {
    return request('/health')
  }
}

/**
 * 错误处理工具
 */
const errorHandler = {
  // 处理API错误
  handleError(error, defaultMessage = '操作失败') {
    console.error('[API错误处理]', error)
    
    let message = defaultMessage
    if (error.message) {
      message = error.message
    }
    
    // 显示错误提示
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
    
    return message
  },

  // 处理网络错误
  handleNetworkError(error) {
    return this.handleError(error, '网络连接失败，请检查网络设置')
  },

  // 处理业务错误
  handleBusinessError(error) {
    return this.handleError(error, '操作失败，请重试')
  }
}

/**
 * 数据转换工具
 */
const dataConverter = {
  // 将本地商品数据转换为API格式
  convertLocalProductToAPI(localProduct) {
    return {
      name: localProduct.name,
      price: parseFloat(localProduct.price),
      unit: localProduct.unit || '袋',
      weight: parseFloat(localProduct.weight || 10),
      image: localProduct.image,
      quantity: parseInt(localProduct.quantity || 0)
    }
  },

  // 将API商品数据转换为本地格式
  convertAPIProductToLocal(apiProduct) {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      price: apiProduct.price,
      unit: apiProduct.unit,
      weight: apiProduct.weight,
      image: apiProduct.image,
      quantity: apiProduct.quantity || 0,
      createdAt: apiProduct.createdAt,
      updatedAt: apiProduct.updatedAt
    }
  },

  // 将本地地址数据转换为API格式
  convertLocalAddressToAPI(localAddress) {
    return {
      name: localAddress.name,
      phone: localAddress.phone,
      province: localAddress.province,
      city: localAddress.city,
      district: localAddress.district || '',
      detail: localAddress.detail,
      isDefault: localAddress.isDefault || false
    }
  },

  // 将API地址数据转换为本地格式
  convertAPIAddressToLocal(apiAddress) {
    return {
      id: apiAddress.id,
      name: apiAddress.name,
      phone: apiAddress.phone,
      province: apiAddress.province,
      city: apiAddress.city,
      district: apiAddress.district,
      detail: apiAddress.detail,
      isDefault: apiAddress.isDefault,
      createdAt: apiAddress.createdAt,
      updatedAt: apiAddress.updatedAt
    }
  },

  // 将本地订单数据转换为API格式
  convertLocalOrderToAPI(localOrder) {
    return {
      addressId: localOrder.address.id,
      items: localOrder.products.map(product => ({
        productId: product.id,
        quantity: product.quantity
      })),
      paymentStatus: localOrder.paymentStatus || "未付款",
      status: localOrder.status || "待发货"
    }
  },

  // 将API订单数据转换为本地格式
  convertAPIOrderToLocal(apiOrder) {
    return {
      id: apiOrder.id,
      orderNo: apiOrder.orderNo,
      products: apiOrder.orderItems.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        unit: item.productUnit,
        weight: item.productWeight,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      address: apiOrder.address,
      totalRicePrice: apiOrder.totalRicePrice,
      totalWeight: apiOrder.totalWeight,
      shippingRate: apiOrder.shippingRate,
      totalShipping: apiOrder.totalShipping,
      grandTotal: apiOrder.grandTotal,
      paymentStatus: apiOrder.paymentStatus,
      status: apiOrder.status,
      createTime: apiOrder.createdAt
    }
  }
}

// 导出API服务
module.exports = {
  // API配置
  API_CONFIG,
  
  // 基础请求方法
  request,
  
  // 各模块API
  productAPI,
  addressAPI,
  orderAPI,
  shippingAPI,
  systemAPI,
  
  // 工具方法
  errorHandler,
  dataConverter
}
