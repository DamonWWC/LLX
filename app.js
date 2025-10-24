// app.js
const apiManager = require('./utils/apiManager.js')

App({
  onLaunch() {
    console.log('大米价格计算器启动')
    
    // 初始化API管理器
    this.initAPIManager()
  },
  
  // 初始化API管理器
  async initAPIManager() {
    try {
      await apiManager.init()
      console.log('API管理器初始化完成')
    } catch (error) {
      console.warn('API管理器初始化失败:', error.message)
    }
  },
  
  globalData: {
    // 全局数据
    apiManager: apiManager
  }
})
