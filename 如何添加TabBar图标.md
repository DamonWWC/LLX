# 如何添加 TabBar 图标

## 当前状态

✅ **TabBar已配置为纯文字模式**，可以正常运行！

底部导航栏会显示：
- 商品（文字）
- 我的（文字）

选中时文字颜色会变为橙红色（#ff6034）。

## 如果想添加图标

### 步骤1：下载图标

从以下网站下载图标：
- **iconfont.cn**（阿里巴巴矢量图标库）- 推荐
- **iconpark.bytedance.com**（字节跳动图标库）
- **flaticon.com**（国际图标网站）

### 步骤2：图标规格

需要准备 **4个图标文件**：

| 文件名 | 说明 | 颜色 | 尺寸 |
|--------|------|------|------|
| tab-shop.png | 商品-未选中 | 灰色 #999999 | 81×81px |
| tab-shop-active.png | 商品-选中 | 橙红 #ff6034 | 81×81px |
| tab-my.png | 我的-未选中 | 灰色 #999999 | 81×81px |
| tab-my-active.png | 我的-选中 | 橙红 #ff6034 | 81×81px |

**图标要求**：
- 格式：PNG
- 背景：透明
- 尺寸：81px × 81px（标准尺寸）
- 风格：简洁、清晰

### 步骤3：放置图标文件

将下载的图标文件放到项目的 `images/` 目录下：

```
miniprogram-1/
├── images/
│   ├── tab-shop.png
│   ├── tab-shop-active.png
│   ├── tab-my.png
│   └── tab-my-active.png
└── ...
```

### 步骤4：修改 app.json

在 `app.json` 的 `tabBar.list` 中添加图标路径：

```json
"tabBar": {
  "color": "#999999",
  "selectedColor": "#ff6034",
  "backgroundColor": "#ffffff",
  "borderStyle": "black",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "商品",
      "iconPath": "images/tab-shop.png",
      "selectedIconPath": "images/tab-shop-active.png"
    },
    {
      "pagePath": "pages/my/my",
      "text": "我的",
      "iconPath": "images/tab-my.png",
      "selectedIconPath": "images/tab-my-active.png"
    }
  ]
}
```

### 步骤5：编译运行

保存文件后，微信开发者工具会自动重新编译，TabBar就会显示图标了！

## 图标设计建议

### 商品图标 (shop)
推荐使用：
- 🏪 商店图标
- 🛍️ 购物袋
- 📦 包裹/盒子
- 🛒 购物车

### 我的图标 (my/user)
推荐使用：
- 👤 用户头像
- 👨 人形图标
- 📱 个人中心
- ⚙️ 设置图标

## 在线制作图标

如果不想下载，可以使用在线工具制作：

1. **Canva**（canva.cn）
   - 创建 81×81px 画布
   - 添加图标元素
   - 导出为 PNG

2. **稿定设计**（gaoding.com）
   - 在线编辑
   - 支持透明背景
   - 一键导出

3. **Photoshop / Figma**
   - 专业设计工具
   - 精确控制

## 快速示例

### 使用 Emoji 作为临时图标

如果只是测试，也可以使用简单的纯色图标：
1. 创建 81×81px 的图片
2. 灰色图标：#999999 纯色 + 简单形状
3. 红色图标：#ff6034 纯色 + 简单形状

## 注意事项

⚠️ **重要**：
- 图标文件必须存在，否则编译会报错
- 图标路径相对于项目根目录
- 图标文件名必须完全匹配
- 图标大小不要超过 40KB

✅ **推荐**：
- 使用 SVG 转 PNG 保证清晰度
- 使用 TinyPNG 压缩图标大小
- 保持图标风格统一
- 选中态图标只改变颜色，不改变形状

## 当前状态说明

**目前配置：纯文字TabBar**
- ✅ 无需图标文件
- ✅ 立即可用
- ✅ 功能完整
- 📱 显示效果：文字导航 + 颜色变化

**如需图标：**
- 按照上述步骤添加图标文件
- 修改 app.json 配置
- 重新编译即可

---

💡 **提示**：纯文字 TabBar 在很多小程序中也很常见，简洁明了。如果不确定图标设计，可以先使用纯文字版本！

