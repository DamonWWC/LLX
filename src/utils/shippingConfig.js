/**
 * 运费配置管理
 * 基于省份的运费单价配置（元/斤）
 */

// 运费配置表（省份 → 运费单价）
const SHIPPING_RATES = {
  // 东北地区 - 1元/斤
  '黑龙江省': 1.0,
  '吉林省': 1.0,
  '辽宁省': 1.0,
  
  // 华北地区 - 1.2元/斤
  '北京市': 1.2,
  '天津市': 1.2,
  '河北省': 1.2,
  '山西省': 1.2,
  '内蒙古自治区': 1.2,
  '山东省': 1.2,
  '河南省': 1.2,
  
  // 华东地区 - 1.4元/斤
  '上海市': 1.4,
  '江苏省': 1.4,
  '浙江省': 1.4,
  '安徽省': 1.4,
  '福建省': 1.4,
  '江西省': 1.4,
  
  // 华中地区 - 1.4元/斤
  '湖北省': 1.4,
  '湖南省': 1.4,
  
  // 华南地区 - 1.4元/斤
  '广东省': 1.4,
  '广西壮族自治区': 1.4,
  '海南省': 1.4,
  
  // 西南地区 - 1.4元/斤
  '重庆市': 1.4,
  '四川省': 1.4,
  '贵州省': 1.4,
  '云南省': 1.4,
  
  // 西北地区 - 1.4元/斤
  '陕西省': 1.4,
  '甘肃省': 1.4,
  '宁夏回族自治区': 1.4,
  
  // 偏远地区 - 5.4元/斤
  '西藏自治区': 5.4,
  '青海省': 5.4,
  '新疆维吾尔自治区': 5.4,
  
  // 特别行政区 - 1.4元/斤
  '香港特别行政区': 1.4,
  '澳门特别行政区': 1.4,
  '台湾省': 1.4
};

// 默认运费单价（当省份未配置时使用）
const DEFAULT_SHIPPING_RATE = 1.4;

/**
 * 获取指定省份的运费单价
 * @param {string} province - 省份名称
 * @returns {number} 运费单价（元/斤）
 */
export function getShippingRate(province) {
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
export function calculateShipping(totalWeight, province) {
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
export function getAllShippingRates() {
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
export function updateShippingRate(province, rate) {
  SHIPPING_RATES[province] = rate;
  // 注意：这个修改只在运行时生效，刷新后会恢复
  // 如需持久化，需要配合本地存储或服务器
}

/**
 * 获取运费区间说明
 */
export function getShippingRanges() {
  return {
    low: '东北地区（黑吉辽）1.0元/斤',
    medium: '华北地区（京津冀鲁晋蒙豫）1.2元/斤',
    high: '其他地区 1.4元/斤',
    veryHigh: '偏远地区（西藏、青海、新疆）5.4元/斤'
  };
}

export { DEFAULT_SHIPPING_RATE };
