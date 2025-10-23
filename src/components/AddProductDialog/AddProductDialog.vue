<template>
  <el-dialog
    v-model="visible"
    title="添加大米品种"
    width="90%"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="100px" label-position="left">
      <!-- 图片选择 -->
      <el-form-item label="商品图片">
        <div class="image-picker" @click="chooseImage">
          <el-image 
            v-if="form.image" 
            :src="form.image" 
            class="preview-image"
            fit="cover"
          />
          <div v-else class="image-placeholder">
            <el-icon><Plus /></el-icon>
            <span>点击上传图片</span>
          </div>
        </div>
        <div class="image-hint">支持相册选择或拍照</div>
      </el-form-item>

      <!-- 大米名称 -->
      <el-form-item label="大米名称" required>
        <el-input 
          v-model="form.name"
          placeholder="例如: 五常稻花香"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <!-- 价格 -->
      <el-form-item label="价格（元）" required>
        <el-input-number
          v-model="form.price"
          :min="0"
          :precision="2"
          placeholder="请输入价格"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 单位 -->
      <el-form-item label="单位" required>
        <el-radio-group v-model="form.unit">
          <el-radio value="袋">袋</el-radio>
          <el-radio value="箱">箱</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 重量 -->
      <el-form-item label="重量（斤）" required>
        <el-input-number
          v-model="form.weight"
          :min="0"
          :precision="1"
          placeholder="请输入重量"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          确定添加
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)

const form = ref({
  name: '',
  price: null,
  unit: '袋',
  weight: null,
  image: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23F5F5F5"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%239E9E9E" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E'
})

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    price: null,
    unit: '袋',
    weight: null,
    image: 'data:image/svg+xml,%3Csvg width="300" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="300" height="300" fill="%23F5F5F5"/%3E%3Ctext x="50%25" y="50%25" font-size="80" fill="%239E9E9E" text-anchor="middle" dy=".3em"%3E🌾%3C/text%3E%3C/svg%3E'
  }
}

// 监听对话框显示状态
watch(visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

// 选择图片
const chooseImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.image = e.target.result
        ElMessage.success('图片已选择')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 确认添加
const handleConfirm = () => {
  // 验证表单
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入大米名称')
    return
  }

  if (!form.value.price || form.value.price <= 0) {
    ElMessage.warning('请输入有效的价格')
    return
  }

  if (!form.value.weight || form.value.weight <= 0) {
    ElMessage.warning('请输入有效的重量')
    return
  }

  loading.value = true

  // 模拟异步操作
  setTimeout(() => {
    emit('confirm', {
      name: form.value.name.trim(),
      price: form.value.price,
      unit: form.value.unit,
      weight: form.value.weight,
      image: form.value.image
    })
    
    loading.value = false
    visible.value = false
    ElMessage.success('添加成功')
  }, 500)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.image-picker {
  width: 120px;
  height: 120px;
  border: 2px dashed $border-base;
  border-radius: $border-radius-large;
  @include flex-center;
  cursor: pointer;
  transition: all $transition-base $ease-out;
  overflow: hidden;
  
  &:hover {
    border-color: $primary-color;
    background-color: rgba(255, 96, 52, 0.05);
  }
  
  @include respond-to(sm) {
    width: 100px;
    height: 100px;
  }
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  @include flex-column-center;
  gap: $spacing-sm;
  color: $text-secondary;
}

.image-hint {
  font-size: $font-size-xs;
  color: $text-secondary;
  margin-top: $spacing-sm;
}

.dialog-footer {
  @include flex-between;
  gap: $spacing-md;
  justify-content: flex-end;
}
</style>
