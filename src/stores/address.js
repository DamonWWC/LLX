import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAddressStore = defineStore('address', () => {
  const addressList = ref([])
  const isLoading = ref(false)
  const selectedAddress = ref(null)

  // 计算属性
  const defaultAddress = computed(() => 
    addressList.value.find(addr => addr.isDefault)
  )

  // 加载地址列表
  const loadAddresses = async () => {
    isLoading.value = true
    try {
      const saved = localStorage.getItem('addressList')
      if (saved) {
        addressList.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('加载地址失败', error)
    } finally {
      isLoading.value = false
    }
  }

  // 保存地址列表
  const saveAddresses = () => {
    try {
      localStorage.setItem('addressList', JSON.stringify(addressList.value))
    } catch (error) {
      console.error('保存地址失败', error)
    }
  }

  // 添加地址
  const addAddress = (addressData) => {
    const newAddress = {
      ...addressData,
      id: Date.now(),
      isDefault: addressList.value.length === 0 // 第一个地址设为默认
    }
    
    // 如果设为默认地址，取消其他地址的默认状态
    if (newAddress.isDefault) {
      addressList.value.forEach(addr => {
        addr.isDefault = false
      })
    }
    
    addressList.value.push(newAddress)
    saveAddresses()
    return newAddress
  }

  // 更新地址
  const updateAddress = (id, addressData) => {
    const index = addressList.value.findIndex(addr => addr.id === id)
    if (index !== -1) {
      addressList.value[index] = { ...addressList.value[index], ...addressData }
      
      // 如果设为默认地址，取消其他地址的默认状态
      if (addressData.isDefault) {
        addressList.value.forEach((addr, i) => {
          if (i !== index) {
            addr.isDefault = false
          }
        })
      }
      
      saveAddresses()
    }
  }

  // 删除地址
  const deleteAddress = (id) => {
    const index = addressList.value.findIndex(addr => addr.id === id)
    if (index !== -1) {
      const wasDefault = addressList.value[index].isDefault
      addressList.value.splice(index, 1)
      
      // 如果删除的是默认地址，设置第一个地址为默认
      if (wasDefault && addressList.value.length > 0) {
        addressList.value[0].isDefault = true
      }
      
      saveAddresses()
    }
  }

  // 设置默认地址
  const setDefaultAddress = (id) => {
    addressList.value.forEach(addr => {
      addr.isDefault = addr.id === id
    })
    saveAddresses()
  }

  // 选择地址
  const selectAddress = (address) => {
    selectedAddress.value = address
  }

  // 清除选择
  const clearSelection = () => {
    selectedAddress.value = null
  }

  // 智能解析地址
  const parseAddress = (addressText) => {
    // 这里会调用地址解析工具
    const { parseAddress: parseAddressUtil } = require('@/utils/addressParser')
    return parseAddressUtil(addressText)
  }

  return {
    // 状态
    addressList,
    isLoading,
    selectedAddress,
    
    // 计算属性
    defaultAddress,
    
    // 方法
    loadAddresses,
    saveAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    selectAddress,
    clearSelection,
    parseAddress
  }
})
