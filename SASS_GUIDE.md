# Sass 样式系统使用指南

## 📋 概述

本项目已全面迁移到 Sass 预处理器，提供了完整的样式系统，包括全局变量、混入函数、响应式设计等。

## 🎨 样式架构

### 文件结构
```
src/styles/
├── variables.scss    # 全局变量定义
├── mixins.scss      # 混入函数库
└── (组件样式文件)
```

## 🔧 全局变量

### 颜色系统
```scss
// 主色调
$primary-color: #ff6034;
$secondary-color: #ee0a24;

// 功能色
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

// 文字颜色
$text-primary: #333333;
$text-regular: #666666;
$text-secondary: #999999;
$text-placeholder: #c0c4cc;

// 背景色
$bg-primary: #ffffff;
$bg-secondary: #f5f5f5;
$bg-tertiary: #fafafa;
```

### 间距系统
```scss
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 20px;
$spacing-xxl: 24px;
```

### 字体系统
```scss
$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 20px;
$font-size-xxl: 24px;

$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### 断点系统
```scss
$breakpoint-xs: 480px;
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;
$breakpoint-xl: 1920px;
```

## 🛠️ 混入函数

### 响应式设计
```scss
// 使用示例
.my-component {
  padding: $spacing-lg;
  
  @include respond-to(sm) {
    padding: $spacing-md;
  }
}
```

### Flex 布局
```scss
// 居中布局
@include flex-center;

// 两端对齐
@include flex-between;

// 垂直布局
@include flex-column;

// 垂直居中
@include flex-column-center;
```

### 文本处理
```scss
// 单行省略
@include text-ellipsis;

// 多行省略
@include text-ellipsis-multiline(2);
```

### 按钮样式
```scss
// 主要按钮
@include button-primary;

// 次要按钮
@include button-secondary;
```

### 卡片样式
```scss
// 标准卡片
@include card;
```

### 输入框样式
```scss
// 标准输入框
@include input;
```

### 动画效果
```scss
// 淡入动画
@include fade-in;

// 上滑动画
@include slide-up;

// 弹跳动画
@include bounce-in;
```

## 📱 响应式设计

### 断点使用
```scss
.component {
  // 默认样式
  font-size: $font-size-lg;
  
  // 平板样式
  @include respond-to(md) {
    font-size: $font-size-base;
  }
  
  // 手机样式
  @include respond-to(sm) {
    font-size: $font-size-sm;
  }
}
```

### 移动端优先
```scss
.component {
  // 移动端样式（默认）
  padding: $spacing-sm;
  
  // 平板及以上
  @include respond-to(md) {
    padding: $spacing-lg;
  }
  
  // 桌面端
  @include respond-to(lg) {
    padding: $spacing-xl;
  }
}
```

## 🎯 组件样式最佳实践

### 1. 导入变量和混入
```scss
<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.my-component {
  // 组件样式
}
</style>
```

### 2. 使用变量
```scss
.my-component {
  background-color: $bg-primary;
  color: $text-primary;
  padding: $spacing-lg;
  border-radius: $border-radius-base;
}
```

### 3. 使用混入
```scss
.my-component {
  @include flex-center;
  @include card;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
}
```

### 4. 嵌套选择器
```scss
.my-component {
  padding: $spacing-lg;
  
  .header {
    @include flex-between;
    margin-bottom: $spacing-md;
    
    .title {
      font-size: $font-size-lg;
      font-weight: $font-weight-semibold;
      color: $text-primary;
    }
    
    .actions {
      @include flex-center;
      gap: $spacing-sm;
    }
  }
  
  .content {
    padding: $spacing-md 0;
    
    .item {
      padding: $spacing-sm 0;
      border-bottom: 1px solid $border-light;
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
```

## 🎨 主题定制

### 修改主色调
```scss
// 在 variables.scss 中修改
$primary-color: #your-color;
$primary-gradient: linear-gradient(135deg, $primary-color, $secondary-color);
```

### 添加新颜色
```scss
// 在 variables.scss 中添加
$custom-color: #your-color;
$custom-light: lighten($custom-color, 20%);
$custom-dark: darken($custom-color, 20%);
```

### 添加新混入
```scss
// 在 mixins.scss 中添加
@mixin custom-effect {
  // 自定义效果
  background: $custom-gradient;
  border-radius: $border-radius-large;
  box-shadow: $shadow-custom;
}
```

## 🔄 迁移指南

### 从 CSS 到 Sass
1. **添加 lang="scss"**
   ```vue
   <style lang="scss" scoped>
   ```

2. **导入变量和混入**
   ```scss
   @import '@/styles/variables.scss';
   @import '@/styles/mixins.scss';
   ```

3. **替换硬编码值**
   ```scss
   // 之前
   padding: 16px;
   color: #333;
   
   // 之后
   padding: $spacing-lg;
   color: $text-primary;
   ```

4. **使用混入函数**
   ```scss
   // 之前
   display: flex;
   align-items: center;
   justify-content: center;
   
   // 之后
   @include flex-center;
   ```

## 📚 工具类

### 间距工具类
```html
<!-- 使用示例 -->
<div class="m-2 p-3">内容</div>
<div class="mt-1 mb-2">内容</div>
```

### 布局工具类
```html
<!-- 使用示例 -->
<div class="flex-center">居中内容</div>
<div class="flex-between">两端对齐</div>
<div class="text-center">居中文本</div>
```

## 🚀 性能优化

### 1. 避免深层嵌套
```scss
// 避免
.component {
  .header {
    .title {
      .text {
        color: $text-primary;
      }
    }
  }
}

// 推荐
.component {
  .header-title-text {
    color: $text-primary;
  }
}
```

### 2. 合理使用变量
```scss
// 推荐：复用性高的值使用变量
.component {
  padding: $spacing-lg;
  margin: $spacing-md;
}

// 避免：一次性使用的值直接写
.component {
  padding: 16px;
  margin: 12px;
}
```

### 3. 使用混入减少重复
```scss
// 推荐：使用混入
.button {
  @include button-primary;
}

// 避免：重复写样式
.button {
  background: $primary-gradient;
  border: none;
  color: white;
  // ... 更多样式
}
```

## 🎯 总结

Sass 样式系统为项目提供了：

- **统一的视觉语言**：通过变量系统确保设计一致性
- **高效的开发体验**：通过混入函数减少重复代码
- **灵活的响应式设计**：通过断点系统适配各种设备
- **可维护的代码结构**：通过模块化组织样式文件
- **强大的扩展能力**：通过混入和变量轻松定制主题

通过合理使用这套样式系统，可以大大提高开发效率和代码质量。
