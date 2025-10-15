// pages/shipping/shipping.js
const shippingConfig = require('../../utils/shippingConfig.js');

Page({
  data: {
    shippingRates: [],
    searchKey: ''
  },

  onLoad() {
    this.loadShippingRates()
  },

  // 加载运费配置
  loadShippingRates() {
    const rates = shippingConfig.getAllShippingRates()
    this.setData({
      shippingRates: rates
    })
  },

  // 搜索省份
  onSearchInput(e) {
    const searchKey = e.detail.value
    this.setData({
      searchKey: searchKey
    })
    
    if (searchKey) {
      const allRates = shippingConfig.getAllShippingRates()
      const filtered = allRates.filter(item => 
        item.province.includes(searchKey)
      )
      this.setData({
        shippingRates: filtered
      })
    } else {
      this.loadShippingRates()
    }
  },

  // 查看运费说明
  viewShippingInfo() {
    const ranges = shippingConfig.getShippingRanges()
    const content = `${ranges.low}\n${ranges.medium}\n${ranges.high}\n${ranges.veryHigh}`
    
    wx.showModal({
      title: '运费区间说明',
      content: content,
      showCancel: false,
      confirmText: '知道了'
    })
  }
})

