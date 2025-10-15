/**
 * 运费配置管理
 * 基于省份的运费单价配置（元/斤）
 */

// 运费配置表（省份 → 运费单价）
const SHIPPING_RATES = {
  // 东北地区 - 低运费
  '黑龙江省': 0.8,
  '吉林省': 0.8,
  '辽宁省': 0.9,
  
  // 华北地区
  '北京市': 1.2,
  '天津市': 1.2,
  '河北省': 1.0,
  '山西省': 1.1,
  '内蒙古自治区': 1.3,
  
  // 华东地区 - 高运费
  '上海市': 1.4,
  '江苏省': 1.3,
  '浙江省': 1.3,
  '安徽省': 1.2,
  '福建省': 1.4,
  '江西省': 1.2,
  '山东省': 1.1,
  
  // 华中地区
  '河南省': 1.1,
  '湖北省': 1.2,
  '湖南省': 1.2,
  
  // 华南地区 - 高运费
  '广东省': 1.4,
  '广西自治区': 1.3,
  '海南省': 1.8,
  
  // 西南地区
  '重庆市': 1.3,
  '四川省': 1.2,
  '贵州省': 1.4,
  '云南省': 1.5,
  '西藏自治区': 2.5,
  
  // 西北地区
  '陕西省': 1.3,
  '甘肃省': 1.5,
  '青海省': 1.8,
  '宁夏自治区': 1.5,
  '新疆自治区': 2.0,
  
  // 特别行政区
  '香港特别行政区': 3.0,
  '澳门特别行政区': 3.0,
  '台湾省': 3.5
};

// 默认运费单价（当省份未配置时使用）
const DEFAULT_SHIPPING_RATE = 1.2;

/**
 * 获取指定省份的运费单价
 * @param {string} province - 省份名称
 * @returns {number} 运费单价（元/斤）
 */
function getShippingRate(province) {
  if (!province) {
    return DEFAULT_SHIPPING_RATE;
  }
  
  // 直接匹配
  if (SHIPPING_RATES[province]) {
    return SHIPPING_RATES[province];
  }
  
  // 模糊匹配（处理简称）
  for (let key in SHIPPING_RATES) {
    if (province.includes(key.replace(/省|市|自治区|特别行政区/g, ''))) {
      return SHIPPING_RATES[key];
    }
    if (key.includes(province.replace(/省|市|自治区|特别行政区/g, ''))) {
      return SHIPPING_RATES[key];
    }
  }
  
  return DEFAULT_SHIPPING_RATE;
}

/**
 * 计算运费
 * @param {number} totalWeight - 总重量（斤）
 * @param {string} province - 省份名称
 * @returns {object} 运费信息
 */
function calculateShipping(totalWeight, province) {
  const rate = getShippingRate(province);
  const shipping = (totalWeight * rate).toFixed(2);
  
  return {
    rate: rate,              // 运费单价（元/斤）
    totalWeight: totalWeight, // 总重量（斤）
    shipping: parseFloat(shipping), // 运费总计（元）
    province: province       // 省份
  };
}

/**
 * 获取所有运费配置
 * @returns {array} 运费配置列表
 */
function getAllShippingRates() {
  const rates = [];
  for (let province in SHIPPING_RATES) {
    rates.push({
      province: province,
      rate: SHIPPING_RATES[province]
    });
  }
  // 按运费从低到高排序
  rates.sort((a, b) => a.rate - b.rate);
  return rates;
}

/**
 * 更新运费配置
 * @param {string} province - 省份名称
 * @param {number} rate - 运费单价
 */
function updateShippingRate(province, rate) {
  SHIPPING_RATES[province] = rate;
  // 注意：这个修改只在运行时生效，刷新后会恢复
  // 如需持久化，需要配合本地存储或服务器
}

/**
 * 获取运费区间说明
 */
function getShippingRanges() {
  return {
    low: '东北地区最低 0.8元/斤',
    medium: '华北、华中 1.0-1.3元/斤',
    high: '华东、华南 1.3-1.5元/斤',
    veryHigh: '西部、港澳台 1.5-3.5元/斤'
  };
}

module.exports = {
  getShippingRate,
  calculateShipping,
  getAllShippingRates,
  updateShippingRate,
  getShippingRanges,
  DEFAULT_SHIPPING_RATE
};

