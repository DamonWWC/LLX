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
 * 智能解析地址信息 - 增强版
 * 支持识别各种顺序的组合：地址+电话+姓名、电话+地址+姓名等
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

  // 新算法：独立提取三大核心元素，不依赖顺序
  
  // 1. 独立提取手机号（优先级最高，特征最明显）
  const phoneResult = extractPhoneEnhanced(text);
  result.phone = phoneResult.phone;
  let remainText = phoneResult.remainText;

  // 2. 独立提取邮编
  const postalResult = extractPostalCode(remainText);
  result.postalCode = postalResult.postalCode;
  remainText = postalResult.remainText;

  // 3. 独立提取固定电话
  const telResult = extractTelephone(remainText);
  remainText = telResult.remainText;

  // 4. 独立提取省市区（地址特征明显）
  const addressResult = extractProvinceCityDistrictEnhanced(remainText);
  result.province = addressResult.province;
  result.city = addressResult.city;
  result.district = addressResult.district;
  remainText = addressResult.remainText;

  // 5. 智能提取姓名（增强算法，支持各种位置）
  const nameResult = extractNameEnhanced(remainText, text, addressText, result);
  result.name = nameResult.name;
  remainText = nameResult.remainText;

  // 6. 剩余部分作为详细地址
  result.detail = cleanDetailAddress(remainText);

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
 * 提取手机号 - 增强版
 * 支持各种位置和格式的手机号识别
 */
function extractPhoneEnhanced(text) {
  // 先尝试从标签后提取
  const labelMatch = text.match(/(?:手机号|电话|联系方式|TEL|Tel|tel)[:：\s]*([^\n]+)/);
  if (labelMatch) {
    const phoneText = labelMatch[1].trim();
    // 检查是否是遮蔽号码
    if (/1\d{2,3}\*+\d{2,3}/.test(phoneText)) {
      console.log('[地址解析] 检测到遮蔽手机号:', phoneText);
      return {
        phone: phoneText,
        isObscured: true,
        remainText: text.replace(labelMatch[0], '❌PHONE❌')
      };
    }
    
    // 从标签内容中提取手机号
    const phoneInLabel = phoneText.match(/1[3-9]\d{9}/);
    if (phoneInLabel) {
      return {
        phone: phoneInLabel[0],
        remainText: text.replace(labelMatch[0], '❌PHONE❌')
      };
    }
  }

  // 匹配11位手机号（支持各种分隔符和前后文）
  const patterns = [
    // 标准11位
    /1[3-9]\d{9}/g,
    // 带空格或横线分隔
    /1[3-9]\d[\s\-]?\d{4}[\s\-]?\d{4}/g,
    // 带括号
    /\(?1[3-9]\d{2}\)?[\s\-]?\d{4}[\s\-]?\d{4}/g,
    // 前后有非数字字符
    /(?:^|[^\d])(1[3-9]\d{9})(?:[^\d]|$)/g,
  ];

  for (let pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (let match of matches) {
      let phone = match[1] || match[0];
      phone = phone.replace(/[\s\-\(（\)）]/g, '');
      
      if (phone.length === 11 && /^1[3-9]\d{9}$/.test(phone)) {
        console.log('[地址解析] 提取到手机号:', phone);
        return {
          phone: phone,
          remainText: text.replace(match[0], '❌PHONE❌')
        };
      }
    }
  }

  return { phone: '', remainText: text };
}

/**
 * 提取手机号 - 旧版本（保留兼容）
 */
function extractPhone(text) {
  return extractPhoneEnhanced(text);
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
 * 提取省市区 - 增强版
 * 独立识别，不依赖文本顺序
 */
function extractProvinceCityDistrictEnhanced(text) {
  let province = '';
  let city = '';
  let district = '';
  let remainText = text;

  // 先尝试从"所在地区："或"地区："标签后提取
  const labelMatch = text.match(/(?:所在地区|地区|收货地址|详细地址|地址)[:：\s]*([^\n]+)/);
  if (labelMatch) {
    const addressPart = labelMatch[1];
    console.log('[地址解析] 从标签提取地区:', addressPart);
    remainText = text.replace(labelMatch[0], '❌ADDRESS_LABEL❌ ' + addressPart);
  }

  // 省份匹配规则（增强识别能力）
  const provinceRules = [
    // 直辖市（优先匹配，避免与普通城市混淆）
    { pattern: /(北京|天津|上海|重庆)(?:市)?(?!\s*[路街巷道])/g, suffix: '市', type: 'municipality' },
    // 普通省份
    { pattern: /(河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾)(?:省)?/g, suffix: '省', type: 'province' },
    // 自治区
    { pattern: /(内蒙古|广西|西藏|宁夏|新疆)(?:壮族|维吾尔|回族)?(?:自治区)?/g, suffix: '自治区', type: 'autonomous' },
    // 特别行政区
    { pattern: /(香港|澳门)(?:特别行政区)?/g, suffix: '特别行政区', type: 'special' }
  ];

  // 匹配省份（全局搜索，找到最可能的省份）
  for (let rule of provinceRules) {
    const matches = [...remainText.matchAll(rule.pattern)];
    if (matches.length > 0) {
      const match = matches[0]; // 取第一个匹配
      const provinceName = match[1];
      
      // 标准化省份名称
      if (rule.type === 'municipality') {
        // 直辖市：省份去掉"市"字，城市设为完整名称
        province = provinceName;
      } else if (rule.type === 'autonomous') {
        province = provinceName;
        if (!province.includes('自治区')) {
          province += '自治区';
        }
      } else if (rule.type === 'special') {
        province = provinceName + '特别行政区';
      } else {
        province = provinceName + '省';
      }
      
      remainText = remainText.replace(match[0], '❌PROVINCE❌');
      console.log('[地址解析] 提取到省份:', province);
      break;
    }
  }

  // 城市匹配规则（增强识别）
  const cityRules = [
    { pattern: /([\u4e00-\u9fa5]{2,10}?)市(?!\s*[路街巷道])/g, suffix: '市' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)地区/g, suffix: '地区' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)(?:藏族|回族|蒙古族|壮族|彝族|朝鲜族|维吾尔|哈萨克|傣族|白族|土家族)?自治州/g, suffix: '自治州' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)盟/g, suffix: '盟' }
  ];

  // 匹配城市
  for (let rule of cityRules) {
    const matches = [...remainText.matchAll(rule.pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      city = match[0];
      remainText = remainText.replace(match[0], '❌CITY❌');
      console.log('[地址解析] 提取到城市:', city);
      break;
    }
  }

  // 直辖市特殊处理：确保城市名称正确
  if (province && MUNICIPALITIES.includes(province)) {
    // 如果没有匹配到城市，城市设为完整名称
    if (!city) {
      city = province + '市';
    }
    // 如果城市名称不正确（不包含"市"），修正为完整名称
    else if (!city.includes('市')) {
      city = province + '市';
    }
  }

  // 区县匹配规则
  const districtRules = [
    { pattern: /([\u4e00-\u9fa5]{2,10}?)区(?!\s*[路街巷道])/g, suffix: '区' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)县/g, suffix: '县' },
    { pattern: /([\u4e00-\u9fa5]{2,10}?)(?:满族|蒙古族|回族|藏族)?(?:自治)?旗/g, suffix: '旗' }
  ];

  // 匹配区县
  for (let rule of districtRules) {
    const matches = [...remainText.matchAll(rule.pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      district = match[0];
      remainText = remainText.replace(match[0], '❌DISTRICT❌');
      console.log('[地址解析] 提取到区县:', district);
      break;
    }
  }

  // 识别街道（保留在详细地址中）
  const streetMatch = remainText.match(/([\u4e00-\u9fa5]{2,10}?)街道/);
  if (streetMatch) {
    console.log('[地址解析] 检测到街道:', streetMatch[0]);
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
 * 提取省市区 - 旧版本（保留兼容）
 */
function extractProvinceCityDistrict(text) {
  return extractProvinceCityDistrictEnhanced(text);
}

/**
 * 提取姓名 - 增强版
 * 支持从任意位置识别姓名（在手机号和地址之前、之后或中间）
 */
function extractNameEnhanced(remainText, processedText, originalText, result) {
  // 策略1: 优先从标签后提取
  let match = remainText.match(/(?:收件人|姓名|联系人|收货人|NAME|Name|name)[:：\s]+([^\n\s❌]+)/);
  if (match) {
    const nameText = match[1].trim();
    // 提取中文姓名（2-4个字）
    const nameMatch = nameText.match(/^[\u4e00-\u9fa5]{2,4}/);
    if (nameMatch) {
      console.log('[地址解析] 从标签提取到姓名:', nameMatch[0]);
      return {
        name: nameMatch[0],
        remainText: remainText.replace(match[0], '❌NAME❌')
      };
    }
  }

  // 策略2: 从原始文本开头提取（格式：姓名 + 手机号 + 地址）
  const headMatch = originalText.match(/^[\u4e00-\u9fa5]{2,4}(?=\s|[,，]|\d)/);
  if (headMatch) {
    const possibleName = headMatch[0];
    // 验证这个名字不是省份或城市名
    if (!PROVINCES.some(p => p.includes(possibleName)) && 
        !['北京市', '天津市', '上海市', '重庆市'].includes(possibleName)) {
      console.log('[地址解析] 从开头提取到姓名:', possibleName);
      return {
        name: possibleName,
        remainText: remainText.replace(possibleName, '❌NAME❌')
      };
    }
  }

  // 策略3: 在手机号之前查找姓名（格式：姓名 + 手机号 + 地址）
  if (result.phone) {
    const beforePhoneMatch = originalText.match(new RegExp(`([\\u4e00-\\u9fa5]{2,4})\\s*[,，]?\\s*${result.phone}`));
    if (beforePhoneMatch) {
      const possibleName = beforePhoneMatch[1];
      if (!PROVINCES.some(p => p.includes(possibleName))) {
        console.log('[地址解析] 从手机号前提取到姓名:', possibleName);
        return {
          name: possibleName,
          remainText: remainText.replace(possibleName, '❌NAME❌')
        };
      }
    }
  }

  // 策略4: 在地址之后查找姓名（格式：地址 + 手机号 + 姓名）
  if (result.province || result.city) {
    // 在剩余文本中查找2-4个中文字符
    const afterAddressMatch = remainText.match(/[\u4e00-\u9fa5]{2,4}(?=\s*$|[,，\s]+$)/);
    if (afterAddressMatch) {
      const possibleName = afterAddressMatch[0];
      // 过滤掉常见的非姓名词汇
      const blacklist = ['收货地址', '详细地址', '联系电话', '手机号', '固定电话', '邮政编码', '街道办', '居委会', '村委会'];
      if (!blacklist.some(word => word.includes(possibleName))) {
        console.log('[地址解析] 从地址后提取到姓名:', possibleName);
        return {
          name: possibleName,
          remainText: remainText.replace(possibleName, '❌NAME❌')
        };
      }
    }
  }

  // 策略5: 匹配开头的2-4个中文字符
  match = remainText.match(/^[\u4e00-\u9fa5]{2,4}(?=\s|❌|[,，]|$)/);
  if (match) {
    console.log('[地址解析] 从开头匹配到姓名:', match[0]);
    return {
      name: match[0],
      remainText: remainText.replace(match[0], '❌NAME❌')
    };
  }

  // 策略6: 查找所有2-4个连续中文字符，智能筛选
  const allMatches = remainText.match(/[\u4e00-\u9fa5]{2,4}/g);
  if (allMatches && allMatches.length > 0) {
    // 过滤掉常见的非姓名词汇
    const blacklist = ['收货地址', '详细地址', '联系电话', '手机号', '固定电话', '邮政编码', '街道办', '居委会', '村委会'];
    const filtered = allMatches.filter(name => {
      // 排除黑名单
      if (blacklist.some(word => word.includes(name))) return false;
      // 排除省份名
      if (PROVINCES.some(p => p.includes(name))) return false;
      return true;
    });
    
    if (filtered.length > 0) {
      console.log('[地址解析] 从候选中提取到姓名:', filtered[0]);
      return {
        name: filtered[0],
        remainText: remainText.replace(filtered[0], '❌NAME❌')
      };
    }
  }

  return { name: '', remainText: remainText };
}

/**
 * 提取姓名 - 旧版本（保留兼容）
 */
function extractName(text, originalText) {
  return extractNameEnhanced(text, text, originalText, {});
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
    .replace(/❌ADDRESS_LABEL❌/g, '')
    .replace(/❌STREET❌/g, '')  // 保留街道名称
    .replace(/收货地址|详细地址|所在地区|地区|收货人|姓名|联系人|手机号码?|电话|邮编|收件人/g, '')
    .replace(/[:：]+/g, '')  // 去除冒号
    .replace(/[,，.。、;；]+/g, '')  // 去除标点
    .replace(/\s+/g, ' ')  // 合并空格
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

