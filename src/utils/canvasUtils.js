/**
 * Canvas工具函数
 * 用于生成订单图片和发货单
 */

/**
 * 绘制订单内容到Canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {Object} order - 订单数据
 * @param {number} canvasHeight - Canvas高度
 * @returns {Promise<number>} 实际使用的高度
 */
export async function drawOrderContent(ctx, order, canvasHeight) {
  return new Promise((resolve) => {
    const width = 375 // 固定宽度
    let y = 40

    // 设置背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, canvasHeight)

    // 标题
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('订单详情', 20, y)
    y += 40

    // 订单号
    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(`订单号: ${order.orderNo}`, 20, y)
    y += 30

    // 分割线
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 收货地址
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('收货信息', 20, y)
    y += 30

    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(`${order.address.name}  ${order.address.phone}`, 20, y)
    y += 25
    
    const addressText = `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`
    const addressLines = wrapText(ctx, addressText, 20, y, width - 40, 22)
    y += addressLines * 22 + 25  // 根据实际行数动态调整

    // 分割线
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 商品列表
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('商品明细', 20, y)
    y += 30

    order.products.forEach((item, index) => {
      const totalWeight = (item.quantity || 0) * (item.weight || 0)
      const price = item.price || 0
      
      // 商品名称可能需要换行
      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      const productName = `${index + 1}.${item.name}（${item.weight || 10}斤/${item.unit || '袋'}）单价：${price}元`
      const nameLines = wrapText(ctx, productName, 20, y, width - 40, 22)
      y += nameLines * 22 + 3
      
      ctx.font = '14px sans-serif'
      ctx.fillStyle = '#999999'
      ctx.fillText(`   数量：${item.quantity}${item.unit || '袋'} ，总重：${totalWeight}斤 ，总价：${item.subtotal}元`, 20, y)
      y += 28
    })

    // 分割线
    y += 10
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 价格汇总
    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText('商品总价', 20, y)
    ctx.fillText(`${order.totalRicePrice}元`, width - 100, y)
    y += 30

    if (order.totalWeight && order.shippingRate && order.totalShipping) {
      ctx.fillText('总重量', 20, y)
      ctx.fillText(`${order.totalWeight}斤`, width - 100, y)
      y += 30
      ctx.fillText(`运费 (${order.shippingRate}元/斤)`, 20, y)
      ctx.fillText(`${order.totalShipping}元`, width - 100, y)
      y += 40
    } else {
      y += 10
    }

    // 实付款
    ctx.font = 'bold 20px sans-serif'
    ctx.fillStyle = '#333333'
    ctx.fillText('实付款', 20, y)
    ctx.fillStyle = '#ff6034'
    ctx.fillText(`${order.grandTotal}元`, width - 120, y)
    y += 40

    // 订单时间
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#999999'
    ctx.fillText(`下单时间: ${order.createTime}`, 20, y)
    y += 40  // 留出底部空白

    resolve(y)  // 返回实际使用的高度
  })
}

/**
 * 绘制发货单内容（不含价格和运费）
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {Object} order - 订单数据
 * @param {number} canvasHeight - Canvas高度
 * @returns {Promise<number>} 实际使用的高度
 */
export async function drawShippingListContent(ctx, order, canvasHeight) {
  return new Promise((resolve) => {
    const width = 375
    let y = 40

    // 背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, canvasHeight)

    // 标题
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('发货单', 20, y)
    y += 40

    // 订单号
    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(`订单号: ${order.orderNo}`, 20, y)
    y += 30

    // 分割线
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 收货信息标题
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('收货信息', 20, y)
    y += 35

    // 收件人和电话
    ctx.font = 'bold 18px sans-serif'
    ctx.fillStyle = '#333333'
    ctx.fillText(`收件人：${order.address.name}`, 20, y)
    y += 30

    ctx.fillText(`联系电话：${order.address.phone}`, 20, y)
    y += 35

    // 收货地址
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('收货地址：', 20, y)
    y += 30

    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#555555'
    const addressText = `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`
    const addressLines = wrapText(ctx, addressText, 20, y, width - 40, 25)
    y += addressLines * 25 + 30  // 根据实际行数动态调整

    // 分割线
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 商品明细标题
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('商品明细', 20, y)
    y += 35

    // 商品列表（包含详细数量和种类）
    order.products.forEach((item, index) => {
      const totalWeight = (item.quantity || 0) * (item.weight || 0)
      
      // 商品名称可能需要换行
      ctx.font = 'bold 17px sans-serif'
      ctx.fillStyle = '#333333'
      const productName = `${index + 1}.${item.name}（${item.weight || 10}斤/${item.unit || '袋'}）`
      const nameLines = wrapText(ctx, productName, 20, y, width - 40, 24)
      y += nameLines * 24 + 5

      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#666666'
      ctx.fillText(`   数量：${item.quantity}${item.unit || '袋'} ，总重：${totalWeight}斤`, 20, y)
      y += 30  // 增加商品间距
    })

    y += 10

    // 分割线
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 总计信息（只显示数量，不显示价格）
    let totalQuantity = 0
    let totalWeight = 0
    order.products.forEach(item => {
      totalQuantity += item.quantity
      if (item.weight && item.quantity) {
        totalWeight += item.weight * item.quantity
      }
    })

    ctx.font = 'bold 18px sans-serif'
    ctx.fillStyle = '#333333'
    ctx.fillText('总计信息', 20, y)
    y += 30

    ctx.font = '16px sans-serif'
    ctx.fillStyle = '#666666'
    ctx.fillText(`商品总数：${totalQuantity} 份`, 20, y)
    y += 30

    // 总重量（加粗显示）
    ctx.font = 'bold 18px sans-serif'
    ctx.fillStyle = '#ff6034'
    ctx.fillText(`商品总重：${order.totalWeight || totalWeight} 斤`, 20, y)
    y += 35

    // 分割线
    ctx.strokeStyle = '#eeeeee'
    ctx.beginPath()
    ctx.moveTo(20, y)
    ctx.lineTo(width - 20, y)
    ctx.stroke()
    y += 30

    // 发货说明
    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#999999'
    ctx.fillText('* 请核对商品数量和收货地址', 20, y)
    y += 25

    ctx.fillText(`下单时间: ${order.createTime}`, 20, y)
    y += 40  // 留出底部空白

    resolve(y)  // 返回实际使用的高度
  })
}

/**
 * 文字换行（返回实际使用的行数）
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {string} text - 要绘制的文本
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} maxWidth - 最大宽度
 * @param {number} lineHeight - 行高
 * @returns {number} 实际使用的行数
 */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split('')
  let line = ''
  let testLine = ''
  let lineCount = 0

  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y + lineCount * lineHeight)
      line = words[n]
      lineCount++
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, y + lineCount * lineHeight)
  return lineCount + 1  // 返回实际使用的行数
}

/**
 * 生成Canvas图片
 * @param {Object} order - 订单数据
 * @param {string} type - 类型：'order' | 'shipping'
 * @returns {Promise<string>} 图片的dataURL
 */
export async function generateOrderImage(order, type = 'order') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('无法创建Canvas上下文'))
      return
    }

    // 根据商品数量预估高度
    const estimatedHeight = Math.max(3000, 800 + order.products.length * 100)
    canvas.width = 375
    canvas.height = estimatedHeight

    // 绘制内容
    const drawFunction = type === 'shipping' ? drawShippingListContent : drawOrderContent
    
    drawFunction(ctx, order, estimatedHeight).then(actualHeight => {
      // 使用实际高度重新绘制
      canvas.width = 375
      canvas.height = actualHeight
      
      drawFunction(ctx, order, actualHeight).then(() => {
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      }).catch(reject)
    }).catch(reject)
  })
}

/**
 * 下载图片
 * @param {string} dataURL - 图片的dataURL
 * @param {string} filename - 文件名
 */
export function downloadImage(dataURL, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
