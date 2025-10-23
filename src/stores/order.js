import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useOrderStore = defineStore('order', () => {
  const orderList = ref([])
  const isLoading = ref(false)
  const searchKeyword = ref('')
  const filterStatus = ref('')
  const isMultiSelectMode = ref(false)
  const selectedOrders = ref([])

  // 计算属性
  const filteredOrderList = computed(() => {
    let filtered = orderList.value

    // 按状态过滤
    if (filterStatus.value) {
      filtered = filtered.filter(order => order.status === filterStatus.value)
    }

    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(order => {
        const name = order.address?.name || ''
        const phone = order.address?.phone || ''
        return name.toLowerCase().includes(keyword) || phone.includes(keyword)
      })
    }

    return filtered
  })

  const totalAmount = computed(() => 
    selectedOrders.value.reduce((sum, order) => sum + (parseFloat(order.grandTotal) || 0), 0)
  )

  // 加载订单列表
  const loadOrders = async () => {
    isLoading.value = true
    try {
      const saved = localStorage.getItem('orderList')
      if (saved) {
        let orders = JSON.parse(saved)
        
        // 数据修复：清理所有订单的状态字段
        let needSave = false
        orders = orders.map(order => {
          if (order.status) {
            const trimmedStatus = order.status.trim()
            if (trimmedStatus !== order.status) {
              needSave = true
              return { ...order, status: trimmedStatus }
            }
          } else {
            // 如果没有 status 字段，根据 paymentStatus 补充
            const newStatus = order.paymentStatus === '已付款' ? '待发货' : '待付款'
            needSave = true
            return { ...order, status: newStatus }
          }
          return order
        })
        
        // 如果有修复，保存回存储
        if (needSave) {
          localStorage.setItem('orderList', JSON.stringify(orders))
        }
        
        orderList.value = orders
      }
    } catch (error) {
      console.error('加载订单失败', error)
    } finally {
      isLoading.value = false
    }
  }

  // 保存订单列表
  const saveOrders = () => {
    try {
      localStorage.setItem('orderList', JSON.stringify(orderList.value))
    } catch (error) {
      console.error('保存订单失败', error)
    }
  }

  // 创建订单
  const createOrder = (orderData) => {
    const order = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
      status: orderData.paymentStatus === '已付款' ? '待发货' : '待付款',
      products: orderData.products,
      address: orderData.address,
      totalRicePrice: orderData.totalRicePrice,
      totalWeight: orderData.totalWeight,
      shippingRate: orderData.shippingRate,
      totalShipping: orderData.totalShipping,
      grandTotal: orderData.grandTotal,
      paymentStatus: orderData.paymentStatus,
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    orderList.value.unshift(order)
    saveOrders()
    return order
  }

  // 更新订单状态
  const updateOrderStatus = (orderId, newStatus, trackingNumber = '') => {
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      order.status = newStatus
      
      // 如果是确认付款操作，同时更新付款状态
      if (newStatus === '待发货' && order.status === '待付款') {
        order.paymentStatus = '已付款'
      }
      
      // 如果有快递单号，添加到订单中
      if (trackingNumber.trim()) {
        order.trackingNumber = trackingNumber.trim()
        order.shippingTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      
      saveOrders()
    }
  }

  // 更新快递单号
  const updateTrackingNumber = (orderId, trackingNumber) => {
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      if (trackingNumber.trim()) {
        order.trackingNumber = trackingNumber.trim()
        order.shippingTime = order.shippingTime || dayjs().format('YYYY-MM-DD HH:mm:ss')
      } else {
        delete order.trackingNumber
        delete order.shippingTime
      }
      saveOrders()
    }
  }

  // 删除订单
  const deleteOrder = (orderId) => {
    orderList.value = orderList.value.filter(o => o.id !== orderId)
    saveOrders()
  }

  // 清空所有订单
  const clearAllOrders = () => {
    orderList.value = []
    saveOrders()
  }

  // 设置搜索关键词
  const setSearchKeyword = (keyword) => {
    searchKeyword.value = keyword
  }

  // 设置状态过滤
  const setFilterStatus = (status) => {
    filterStatus.value = status
  }

  // 切换多选模式
  const toggleMultiSelectMode = () => {
    isMultiSelectMode.value = !isMultiSelectMode.value
    if (!isMultiSelectMode.value) {
      selectedOrders.value = []
      // 清除所有订单的选择状态
      orderList.value.forEach(order => {
        order.selected = false
      })
    }
  }

  // 切换订单选择状态
  const toggleOrderSelection = (orderId) => {
    const order = orderList.value.find(o => o.id === orderId)
    if (order) {
      order.selected = !order.selected
      
      if (order.selected) {
        selectedOrders.value.push(order)
      } else {
        selectedOrders.value = selectedOrders.value.filter(o => o.id !== orderId)
      }
    }
  }

  // 获取订单统计
  const getOrderStats = () => {
    const stats = {
      total: orderList.value.length,
      pending: orderList.value.filter(o => o.status === '待付款').length,
      processing: orderList.value.filter(o => o.status === '待发货').length,
      shipped: orderList.value.filter(o => o.status === '已发货').length
    }
    return stats
  }

  return {
    // 状态
    orderList,
    isLoading,
    searchKeyword,
    filterStatus,
    isMultiSelectMode,
    selectedOrders,
    
    // 计算属性
    filteredOrderList,
    totalAmount,
    
    // 方法
    loadOrders,
    saveOrders,
    createOrder,
    updateOrderStatus,
    updateTrackingNumber,
    deleteOrder,
    clearAllOrders,
    setSearchKeyword,
    setFilterStatus,
    toggleMultiSelectMode,
    toggleOrderSelection,
    getOrderStats
  }
})
