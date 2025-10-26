/**
 * API测试工具
 * 用于测试API连接和数据获取
 */

const api = require('./api.js')
const apiManager = require('./apiManager.js')

/**
 * 测试API连接
 */
async function testAPIConnection() {
  console.log('=== 开始API连接测试 ===')
  
  try {
    // 测试健康检查
    console.log('1. 测试健康检查...')
    const healthResponse = await api.systemAPI.healthCheck()
    console.log('✅ 健康检查成功:', healthResponse)
    
    // 初始化API管理器
    console.log('2. 初始化API管理器...')
    await apiManager.init()
    console.log('✅ API管理器初始化成功')
    
    // 测试商品API
    console.log('3. 测试商品API...')
    const products = await apiManager.productManager.getProducts()
    console.log('✅ 获取商品列表成功，共', products.length, '个商品')
    
    // 测试地址API
    console.log('4. 测试地址API...')
    const addresses = await apiManager.addressManager.getAddresses()
    console.log('✅ 获取地址列表成功，共', addresses.length, '个地址')
    
    // 测试订单API
    console.log('5. 测试订单API...')
    const orders = await apiManager.orderManager.getOrders()
    console.log('✅ 获取订单列表成功，共', orders.length, '个订单')
    
    // 测试运费API
    console.log('6. 测试运费API...')
    const shippingRates = await apiManager.shippingManager.getShippingRates()
    console.log('✅ 获取运费配置成功，共', shippingRates.length, '个配置')
    
    // 测试运费计算
    console.log('7. 测试运费计算...')
    const shippingResult = await apiManager.shippingManager.calculateShipping('广东省', 10)
    console.log('✅ 运费计算成功:', shippingResult)
    
    console.log('=== API连接测试完成 ===')
    return true
    
  } catch (error) {
    console.error('❌ API连接测试失败:', error.message)
    return false
  }
}

/**
 * 测试地址解析API
 */
async function testAddressParsing() {
  console.log('=== 开始地址解析测试 ===')
  
  try {
    const testAddress = '北京市朝阳区建国门外大街1号国贸大厦A座1001室'
    console.log('测试地址:', testAddress)
    
    const result = await apiManager.addressManager.parseAddress(testAddress)
    console.log('✅ 地址解析成功:', result)
    
    return true
  } catch (error) {
    console.error('❌ 地址解析测试失败:', error.message)
    return false
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始运行API测试...')
  
  const connectionTest = await testAPIConnection()
  const parsingTest = await testAddressParsing()
  
  if (connectionTest && parsingTest) {
    console.log('🎉 所有测试通过！')
    wx.showToast({
      title: 'API测试通过',
      icon: 'success'
    })
  } else {
    console.log('⚠️ 部分测试失败')
    wx.showToast({
      title: 'API测试失败',
      icon: 'none'
    })
  }
}

module.exports = {
  testAPIConnection,
  testAddressParsing,
  runAllTests
}