import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const isLoading = ref(false)
  const isEditMode = ref(false)

  // 计算属性
  const totalQuantity = computed(() => 
    products.value.reduce((sum, product) => sum + product.quantity, 0)
  )

  const selectedProducts = computed(() => 
    products.value.filter(product => product.quantity > 0)
  )

  const isEmpty = computed(() => products.value.length === 0)

  // 获取默认商品
  const getDefaultProducts = () => [
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

  // 加载商品数据
  const loadProducts = async () => {
    isLoading.value = true
    try {
      const saved = localStorage.getItem('riceProducts')
      if (saved) {
        const savedProducts = JSON.parse(saved)
        // 修复和升级商品数据结构
        const fixedProducts = savedProducts.map(product => {
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
          
          // 升级数据结构
          if (!product.unit) {
            product.unit = '袋'
          }
          if (product.unit === '袋装') {
            product.unit = '袋'
          }
          if (product.unit === '箱装') {
            product.unit = '箱'
          }
          if (!product.weight) {
            product.weight = 10
          }
          if (product.shipping !== undefined) {
            delete product.shipping
          }
          
          return product
        })
        
        products.value = fixedProducts
        saveProducts()
        console.log('已修复并保存商品数据结构')
      } else {
        products.value = getDefaultProducts()
        saveProducts()
        console.log('首次启动，加载默认商品')
      }
    } catch (error) {
      console.error('加载商品数据失败', error)
      products.value = getDefaultProducts()
    } finally {
      isLoading.value = false
    }
  }

  // 保存商品数据
  const saveProducts = () => {
    try {
      localStorage.setItem('riceProducts', JSON.stringify(products.value))
      console.log('商品数据已保存到本地')
    } catch (error) {
      console.error('保存商品数据失败', error)
    }
  }

  // 更新商品数量
  const updateQuantity = (id, quantity) => {
    const product = products.value.find(p => p.id === id)
    if (product) {
      product.quantity = Math.max(0, quantity)
      saveProducts()
    }
  }

  // 增加数量
  const increaseQuantity = (id) => {
    updateQuantity(id, products.value.find(p => p.id === id).quantity + 1)
  }

  // 减少数量
  const decreaseQuantity = (id) => {
    const product = products.value.find(p => p.id === id)
    if (product && product.quantity > 0) {
      updateQuantity(id, product.quantity - 1)
    }
  }

  // 添加商品
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
      quantity: 0
    }
    products.value.push(newProduct)
    saveProducts()
  }

  // 删除商品
  const deleteProduct = (id) => {
    products.value = products.value.filter(p => p.id !== id)
    saveProducts()
  }

  // 清空购物车
  const clearCart = () => {
    products.value.forEach(product => {
      product.quantity = 0
    })
    saveProducts()
  }

  // 恢复默认商品
  const restoreDefaultProducts = () => {
    products.value = getDefaultProducts()
    saveProducts()
  }

  // 切换编辑模式
  const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value
  }

  return {
    // 状态
    products,
    isLoading,
    isEditMode,
    
    // 计算属性
    totalQuantity,
    selectedProducts,
    isEmpty,
    
    // 方法
    loadProducts,
    saveProducts,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    addProduct,
    deleteProduct,
    clearCart,
    restoreDefaultProducts,
    toggleEditMode
  }
})
