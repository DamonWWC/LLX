<template>
  <el-card 
    class="product-card" 
    :class="{ 'edit-mode': isEditMode, [`view-${viewMode}`]: true }"
    shadow="hover"
  >
    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <!-- 商品图片区域 -->
      <div class="product-image-container">
        <el-image
          :src="product.image"
          :alt="product.name"
          class="product-image"
          fit="cover"
        />
        <div v-if="isEditMode" class="edit-overlay">
          <el-button
            type="danger"
            size="small"
            circle
            class="delete-btn"
            @click="$emit('delete', product.id)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        <div v-if="product.quantity > 0" class="quantity-badge">
          {{ product.quantity }}
        </div>
      </div>

      <!-- 商品信息区域 -->
      <div class="product-info">
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-specs">
          <span class="spec-item">{{ product.weight }}斤/{{ product.unit }}</span>
        </div>
        <div class="product-price-row">
          <span class="price">¥{{ product.price }}</span>
          <span class="unit">/{{ product.unit }}</span>
        </div>
      </div>

      <!-- 操作区域 -->
      <div class="product-actions">
        <el-button-group>
          <el-button
            size="small"
            :disabled="product.quantity <= 0"
            @click="$emit('decrease', product.id)"
          >
            <el-icon><Minus /></el-icon>
          </el-button>
          <el-button size="small" disabled class="quantity-display">
            {{ product.quantity || 0 }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="$emit('increase', product.id)"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <div class="list-content">
        <!-- 商品图片 -->
        <div class="list-image-container">
          <el-image
            :src="product.image"
            :alt="product.name"
            class="list-image"
            fit="cover"
          />
          <div v-if="product.quantity > 0" class="list-quantity-badge">
            {{ product.quantity }}
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="list-info">
          <h3 class="list-name">{{ product.name }}</h3>
          <div class="list-specs">
            <el-tag size="small" type="info">{{ product.weight }}斤/{{ product.unit }}</el-tag>
          </div>
          <div class="list-price">
            <span class="price">¥{{ product.price }}</span>
            <span class="unit">/{{ product.unit }}</span>
          </div>
        </div>

        <!-- 操作区域 -->
        <div class="list-actions">
          <el-button-group>
            <el-button
              size="small"
              :disabled="product.quantity <= 0"
              @click="$emit('decrease', product.id)"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
            <el-button size="small" disabled class="quantity-display">
              {{ product.quantity || 0 }}
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="$emit('increase', product.id)"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
          </el-button-group>
          
          <el-button
            v-if="isEditMode"
            type="danger"
            size="small"
            @click="$emit('delete', product.id)"
            class="delete-btn"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'grid' // 'grid' 或 'list'
  }
})

defineEmits(['increase', 'decrease', 'delete'])
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.product-card {
  transition: all $transition-base $ease-out;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
  
  &.edit-mode {
    border: 2px solid $danger-color;
  }
  
  &.view-grid {
    height: 100%;
  }
  
  &.view-list {
    margin-bottom: $spacing-md;
  }
}

// 网格视图样式
.grid-view {
  @include flex-column;
  height: 100%;
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: $border-radius-base $border-radius-base 0 0;
}

.product-image {
  width: 100%;
  height: 100%;
  transition: transform $transition-base $ease-out;
  
  &:hover {
    transform: scale(1.05);
  }
}

.edit-overlay {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  z-index: 2;
}

.delete-btn {
  background: rgba(245, 108, 108, 0.9);
  border: none;
  color: white;
  
  &:hover {
    background: $danger-color;
  }
}

.quantity-badge {
  position: absolute;
  top: $spacing-sm;
  left: $spacing-sm;
  background: $primary-color;
  color: white;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-large;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  z-index: 2;
}

.product-info {
  padding: $spacing-lg;
  flex: 1;
  @include flex-column;
}

.product-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  @include text-ellipsis;
  line-height: $line-height-tight;
}

.product-specs {
  margin-bottom: $spacing-md;
}

.spec-item {
  font-size: $font-size-sm;
  color: $text-regular;
  background: $bg-tertiary;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-small;
}

.product-price-row {
  @include flex-center;
  gap: $spacing-xs;
  margin-bottom: $spacing-lg;
  justify-content: flex-start;
}

.price {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $primary-color;
}

.unit {
  font-size: $font-size-sm;
  color: $text-regular;
}

.product-actions {
  padding: 0 $spacing-lg $spacing-lg;
  @include flex-center;
  justify-content: center;
}

.quantity-display {
  min-width: 40px;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

// 列表视图样式
.list-view {
  width: 100%;
}

.list-content {
  @include flex-center;
  gap: $spacing-lg;
  padding: $spacing-md;
}

.list-image-container {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: $border-radius-base;
  overflow: hidden;
}

.list-image {
  width: 100%;
  height: 100%;
}

.list-quantity-badge {
  position: absolute;
  top: -$spacing-xs;
  right: -$spacing-xs;
  background: $primary-color;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: $border-radius-round;
  @include flex-center;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
}

.list-info {
  flex: 1;
  @include flex-column;
  gap: $spacing-xs;
}

.list-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  margin: 0;
  @include text-ellipsis;
}

.list-specs {
  @include flex-center;
  justify-content: flex-start;
}

.list-price {
  @include flex-center;
  gap: $spacing-xs;
  justify-content: flex-start;
  
  .price {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $primary-color;
  }
  
  .unit {
    font-size: $font-size-sm;
    color: $text-regular;
  }
}

.list-actions {
  @include flex-center;
  gap: $spacing-sm;
  flex-direction: column;
}

// 响应式设计
@include respond-to(sm) {
  .list-content {
    gap: $spacing-md;
    padding: $spacing-sm;
  }
  
  .list-image-container {
    width: 60px;
    height: 60px;
  }
  
  .list-info {
    gap: 2px;
  }
  
  .list-name {
    font-size: $font-size-sm;
  }
  
  .list-price .price {
    font-size: $font-size-base;
  }
  
  .list-actions {
    gap: $spacing-xs;
  }
}
</style>