// pages/shipping/shipping.js
const apiManager = require('../../utils/apiManager.js');

Page({
  data: {
    shippingRates: [],
    searchKey: '',
    loading: true
  },

  async onLoad() {
    // 确保API管理器已初始化
    if (!apiManager.isInitialized) {
      try {
        await apiManager.init()
        console.log('[运费页面] API管理器初始化完成')
      } catch (error) {
        console.warn('[运费页面] API管理器初始化失败:', error.message)
      }
    }
    
    await this.loadShippingRates()
  },

  // 从API加载运费配置
  async loadShippingRates() {
    try {
      this.setData({ loading: true })
      const rates = await apiManager.shippingManager.getShippingRates()
      
      // 按照运费价格由低到高排序
      const sortedRates = rates.sort((a, b) => {
        const rateA = parseFloat(a.rate) || 0
        const rateB = parseFloat(b.rate) || 0
        return rateA - rateB
      })
      
      this.setData({
        shippingRates: sortedRates,
        loading: false
      })
      console.log('[运费页面] 加载运费配置成功，共', sortedRates.length, '个配置，已按价格排序')
    } catch (error) {
      console.error('[运费页面] 加载运费配置失败:', error)
      this.setData({
        shippingRates: [],
        loading: false
      })
      wx.showToast({
        title: '加载运费配置失败',
        icon: 'none'
      })
    }
  },

  // 搜索省份
  onSearchInput(e) {
    const searchKey = e.detail.value
    this.setData({
      searchKey: searchKey
    })
    
    if (searchKey) {
      // 从当前已加载的数据中搜索
      const allRates = this.data.shippingRates
      const filtered = allRates.filter(item => 
        item.province && item.province.includes(searchKey)
      )
      
      // 搜索结果也按照运费价格排序
      const sortedFiltered = filtered.sort((a, b) => {
        const rateA = parseFloat(a.rate) || 0
        const rateB = parseFloat(b.rate) || 0
        return rateA - rateB
      })
      
      this.setData({
        shippingRates: sortedFiltered
      })
    } else {
      // 重新加载所有数据
      this.loadShippingRates()
    }
  },

  // 查看运费说明
  viewShippingInfo() {
    const content = `运费区间说明：
    
东北地区：1.0元/斤
华北地区：1.2元/斤
华东/华中/华南/西南/西北地区：1.4元/斤
偏远地区（西藏、青海、新疆）：5.4元/斤
特别行政区：1.4元/斤`
    
    wx.showModal({
      title: '运费区间说明',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})

