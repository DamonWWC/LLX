/**
 * 智能地址解析工具
 * 基于开源地址解析算法优化
 * 参考: smart-address-parse 和 address-parse
 */

// 省份数据
const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南',
  '西藏', '陕西', '甘肃', '青海', '宁夏',
  '新疆', '香港', '澳门', '台湾'
];

// 直辖市
const MUNICIPALITIES = ['北京', '天津', '上海', '重庆'];

/**
 * 智能解析地址信息
 * @param {string} addressText - 原始地址文本
 * @returns {object} 解析结果
 */
function parseAddress(addressText) {
  if (!addressText || typeof addressText !== 'string') {
    return {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      postalCode: '',
      raw: addressText
    };
  }

  // 预处理
  let text = preprocessText(addressText);
  console.log('[地址解析] 预处理后:', text);

  // 初始化结果
  const result = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    postalCode: '',
    raw: addressText
  };

  // 1. 提取手机号
  const phoneResult = extractPhone(text);
  result.phone = phoneResult.phone;
  text = phoneResult.remainText;

  // 2. 提取邮编
  const postalResult = extractPostalCode(text);
  result.postalCode = postalResult.postalCode;
  text = postalResult.remainText;

  // 3. 提取固定电话（可选）
  const telResult = extractTelephone(text);
  text = telResult.remainText;

  // 4. 提取省市区
  const addressResult = extractProvinceCityDistrict(text);
  result.province = addressResult.province;
  result.city = addressResult.city;
  result.district = addressResult.district;
  text = addressResult.remainText;

  // 5. 提取姓名
  const nameResult = extractName(text, addressText);
  result.name = nameResult.name;
  text = nameResult.remainText;

  // 6. 剩余部分作为详细地址
  result.detail = cleanDetailAddress(text);

  console.log('[地址解析] 最终结果:', result);
  return result;
}

/**
 * 预处理文本
 */
function preprocessText(text) {
  // 先处理标签格式，提取关键信息
  text = text
    .replace(/收件人\s*[:：]\s*/g, '收件人：')
    .replace(/姓名\s*[:：]\s*/g, '姓名：')
    .replace(/联系人\s*[:：]\s*/g, '联系人：')
    .replace(/手机号码?\s*[:：]\s*/g, '手机号：')
    .replace(/电话\s*[:：]\s*/g, '电话：')
    .replace(/所在地区\s*[:：]\s*/g, '所在地区：')
    .replace(/地区\s*[:：]\s*/g, '地区：')
    .replace(/详细地址\s*[:：]\s*/g, '详细地址：')
    .replace(/收货地址\s*[:：]\s*/g, '收货地址：')
    .replace(/地址\s*[:：]\s*/g, '地址：');

  // 统一换行和空格
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\u0000/g, '')
    .trim();
}

/**
 * 提取手机号
 */
function extractPhone(text) {
  // 先尝试从标签后提取
  const labelMatch = text.match(/手机号：([^\n]+)/);
  if (labelMatch) {
    const phoneText = labelMatch[1].trim();
    // 检查是否是遮蔽号码
    if (/1\d{2,3}\*+\d{2,3}/.test(phoneText)) {
      console.log('[地址解析] 检测到遮蔽手机号:', phoneText);
      // 保留遮蔽号码，但标记需要补全
      return {
        phone: '',  // 不返回遮蔽号码
        phoneHint: phoneText,  // 保存提示信息
        remainText: text.replace(labelMatch[0], '❌PHONE❌')
      };
    }
  }

  // 匹配11位手机号（支持空格、横线、括号分隔）
  const patterns = [
    /1[3-9]\d[\s\-]?\d{4}[\s\-]?\d{4}/g,
    /1[3-9]\d{9}/g,
    /(?:^|\D)(1[3-9]\d)[\s\-\(（]?(\d{4})[\s\-\)）]?(\d{4})(?:\D|$)/g
  ];

  for (let pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      const phone = matches[0].replace(/[\s\-\(（\)）]/g, '');
      if (phone.length === 11 && /^1[3-9]\d{9}$/.test(phone)) {
        return {
          phone: phone,
          remainText: text.replace(matches[0], '❌PHONE❌')
        };
      }
    }
  }

  return { phone: '', remainText: text };
}

/**
 * 提取邮编
 */
function extractPostalCode(text) {
  const match = text.match(/\b\d{6}\b/);
  if (match) {
    return {
      postalCode: match[0],
      remainText: text.replace(match[0], '❌ZIP❌')
    };
  }
  return { postalCode: '', remainText: text };
}

/**
 * 提取固定电话
 */
function extractTelephone(text) {
  // 匹配固定电话格式: 0755-12345678, 021-12345678, (0755)12345678
  const patterns = [
    /0\d{2,3}[\s\-]?\d{7,8}/g,
    /\(0\d{2,3}\)\d{7,8}/g
  ];

  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        telephone: match[0],
        remainText: text.replace(match[0], '❌TEL❌')
      };
    }
  }

  return { telephone: '', remainText: text };
}

/**
 * 提取省市区 - 核心算法
 */
function extractProvinceCityDistrict(text) {
  let province = '';
  let city = '';
  let district = '';
  let remainText = text;

  // 先尝试从"所在地区："或"地区："标签后提取
  const labelMatch = text.match(/(?:所在地区|地区|收货地址|详细地址|地址)：([^\n]+)/);
  if (labelMatch) {
    const addressPart = labelMatch[1];
    // 如果标签后包含省市区信息，优先从这里提取
    console.log('[地址解析] 从标签提取地区:', addressPart);
    remainText = text.replace(labelMatch[0], '❌ADDRESS_LABEL❌ ' + addressPart);
  }

  // 省份匹配规则
  const provinceRules = [
    // 完整省份名
    { pattern: /(北京|天津|上海|重庆)市?/, suffix: '市' },
    { pattern: /(河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾)省?/, suffix: '省' },
    { pattern: /(内蒙古|广西|西藏|宁夏|新疆)(?:壮族|维吾尔|回族)?(?:自治区)?/, suffix: '自治区' },
    { pattern: /(香港|澳门)(?:特别行政区)?/, suffix: '特别行政区' }
  ];

  // 匹配省份
  for (let rule of provinceRules) {
    const match = remainText.match(rule.pattern);
    if (match) {
      const provinceName = match[1];
      // 标准化省份名称
      if (['北京', '天津', '上海', '重庆'].includes(provinceName)) {
        province = provinceName + '市';
      } else if (['内蒙古', '广西', '西藏', '宁夏', '新疆'].includes(provinceName)) {
        province = provinceName;
        if (!province.includes('自治区')) {
          province += '自治区';
        }
      } else if (['香港', '澳门'].includes(provinceName)) {
        province = provinceName + '特别行政区';
      } else {
        province = provinceName + '省';
      }
      remainText = remainText.replace(match[0], '❌PROVINCE❌');
      break;
    }
  }

  // 城市匹配规则
  const cityRules = [
    { pattern: /([\u4e00-\u9fa5]{2,10}?)市/, suffix: '市' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)地区/, suffix: '地区' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)(?:藏族|回族|蒙古族|壮族|彝族|朝鲜族|维吾尔|哈萨克|傣族|白族|土家族)?自治州/, suffix: '自治州' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)盟/, suffix: '盟' }
  ];

  // 匹配城市
  for (let rule of cityRules) {
    const match = remainText.match(rule.pattern);
    if (match) {
      city = match[0];
      remainText = remainText.replace(match[0], '❌CITY❌');
      break;
    }
  }

  // 如果是直辖市且没有匹配到城市，城市设为省份
  if (province && MUNICIPALITIES.some(m => province.includes(m)) && !city) {
    city = province;
  }

  // 区县匹配规则
  const districtRules = [
    { pattern: /([\u4e00-\u9fa5]{2,10}?)区/, suffix: '区' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)县/, suffix: '县' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)(?:满族|蒙古族|回族|藏族)?(?:自治)?旗/, suffix: '旗' }
  ];

  // 匹配区县
  for (let rule of districtRules) {
    const match = remainText.match(rule.pattern);
    if (match) {
      district = match[0];
      remainText = remainText.replace(match[0], '❌DISTRICT❌');
      break;
    }
  }

  // 识别街道（但不从district中移除，保留在详细地址中）
  const streetMatch = remainText.match(/([\u4e00-\u9fa5]{2,10}?)街道/);
  if (streetMatch) {
    console.log('[地址解析] 检测到街道:', streetMatch[0]);
    // 标记街道，但保留在详细地址中
    remainText = remainText.replace(streetMatch[0], '❌STREET❌' + streetMatch[0]);
  }

  return {
    province,
    city,
    district,
    remainText
  };
}

/**
 * 提取姓名 - 增强算法
 */
function extractName(text, originalText) {
  // 策略1: 优先从标签后提取（支持换行格式）
  let match = text.match(/(?:收件人|姓名|联系人)：\s*([^\n]+)/);
  if (match) {
    const name = match[1].trim();
    // 提取中文姓名（2-4个字）
    const nameMatch = name.match(/^[\u4e00-\u9fa5]{2,4}/);
    if (nameMatch) {
      return {
        name: nameMatch[0],
        remainText: text.replace(match[0], '❌NAME❌')
      };
    }
  }

  // 策略2: 匹配开头的2-4个中文字符（最常见）
  match = text.match(/^[\u4e00-\u9fa5]{2,4}(?=\s|❌|$)/);
  if (match) {
    return {
      name: match[0],
      remainText: text.replace(match[0], '❌NAME❌')
    };
  }

  // 策略3: 匹配"收货人"、"姓名"等关键词后的内容（兼容旧格式）
  match = text.match(/(?:收货人|姓名|联系人|收件人)[:：\s]*[\u4e00-\u9fa5]{2,4}/);
  if (match) {
    const name = match[0].replace(/(?:收货人|姓名|联系人|收件人)[:：\s]*/, '');
    return {
      name: name,
      remainText: text.replace(match[0], '❌NAME❌')
    };
  }

  // 策略3: 在原始文本开头查找（有些格式会在省份前）
  match = originalText.match(/^[\u4e00-\u9fa5]{2,4}(?=\s|\d)/);
  if (match) {
    return {
      name: match[0],
      remainText: text
    };
  }

  // 策略4: 查找所有2-4个连续中文字符，取第一个
  const allMatches = text.match(/[\u4e00-\u9fa5]{2,4}/g);
  if (allMatches && allMatches.length > 0) {
    // 过滤掉常见的非姓名词汇
    const filtered = allMatches.filter(name => {
      const blacklist = ['收货地址', '详细地址', '联系电话', '手机号', '固定电话', '邮政编码'];
      return !blacklist.some(word => word.includes(name));
    });
    
    if (filtered.length > 0) {
      return {
        name: filtered[0],
        remainText: text.replace(filtered[0], '❌NAME❌')
      };
    }
  }

  return { name: '', remainText: text };
}

/**
 * 清理详细地址
 */
function cleanDetailAddress(text) {
  return text
    .replace(/❌PHONE❌/g, '')
    .replace(/❌ZIP❌/g, '')
    .replace(/❌TEL❌/g, '')
    .replace(/❌PROVINCE❌/g, '')
    .replace(/❌CITY❌/g, '')
    .replace(/❌DISTRICT❌/g, '')
    .replace(/❌NAME❌/g, '')
    .replace(/收货地址|详细地址|地址|收货人|姓名|联系人|手机号|电话|邮编|收件人/g, '')
    .replace(/[:：,，.。、;；\s]+/g, ' ')
    .replace(/^\s*[,，.。、;；]\s*/, '')
    .trim();
}

/**
 * 验证解析结果
 */
function validateResult(result) {
  const errors = [];
  const warnings = [];

  // 验证手机号
  if (result.phone && !/^1[3-9]\d{9}$/.test(result.phone)) {
    errors.push('手机号格式不正确');
  }

  // 验证省份
  if (result.province) {
    const isValidProvince = PROVINCES.some(p => result.province.includes(p));
    if (!isValidProvince) {
      warnings.push('省份可能不准确');
    }
  }

  // 警告：缺少重要字段
  if (!result.name) warnings.push('未识别到姓名');
  if (!result.phone) warnings.push('未识别到手机号');
  if (!result.province) warnings.push('未识别到省份');
  if (!result.detail) warnings.push('未识别到详细地址');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 格式化地址（用于显示）
 */
function formatAddress(result) {
  const parts = [];
  
  if (result.province) parts.push(result.province);
  if (result.city && result.city !== result.province) parts.push(result.city);
  if (result.district) parts.push(result.district);
  if (result.detail) parts.push(result.detail);
  
  return parts.join('');
}

/**
 * 获取完整地址字符串
 */
function getFullAddress(result) {
  return formatAddress(result);
}

// 导出
module.exports = {
  parseAddress,
  validateResult,
  formatAddress,
  getFullAddress,
  PROVINCES,
  MUNICIPALITIES
};

