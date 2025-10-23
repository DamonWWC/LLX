<template>
  <div class="address-container">
    <!-- 顶部导航 -->
    <el-header class="header">
      <div class="header-content">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h1 class="page-title">地址管理</h1>
        <el-button @click="showAddDialog = true" type="text" class="add-btn">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </el-header>

    <el-main class="address-content">
      <!-- 智能识别地址 -->
      <el-card class="smart-parse-card">
        <template #header>
          <span>智能识别地址</span>
        </template>
        
        <el-input
          v-model="addressText"
          type="textarea"
          :rows="4"
          placeholder="请粘贴完整的收货地址信息，支持各种格式：&#10;张三 13800138000&#10;广东省深圳市南山区科技园南路1号&#10;&#10;或：&#10;收件人：张三&#10;电话：13800138000&#10;地址：广东省深圳市南山区科技园南路1号"
          class="address-input"
        />
        
        <div class="parse-actions">
          <el-button @click="parseAddress" type="primary" :loading="parsing">
            智能识别
          </el-button>
          <el-button @click="clearAddressText">清空</el-button>
        </div>
      </el-card>

      <!-- 地址列表 -->
      <div class="address-list">
        <el-card 
          v-for="address in addressList" 
          :key="address.id"
          class="address-card"
          :class="{ 'default-address': address.isDefault }"
        >
          <div class="address-content">
            <div class="address-header">
              <div class="name-phone">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
              </div>
              <div class="address-actions">
                <el-button 
                  v-if="!address.isDefault"
                  @click="setDefault(address.id)"
                  type="text"
                  size="small"
                >
                  设为默认
                </el-button>
                <el-button 
                  @click="editAddress(address)"
                  type="text"
                  size="small"
                >
                  编辑
                </el-button>
                <el-button 
                  @click="deleteAddress(address.id)"
                  type="text"
                  size="small"
                  class="delete-btn"
                >
                  删除
                </el-button>
              </div>
            </div>
            
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
            </div>
            
            <div v-if="address.isDefault" class="default-tag">
              默认地址
            </div>
          </div>
        </el-card>

        <div v-if="addressList.length === 0" class="empty-state">
          <el-empty description="暂无收货地址">
            <el-button type="primary" @click="showAddDialog = true">
              添加地址
            </el-button>
          </el-empty>
        </div>
      </div>
    </el-main>

    <!-- 添加/编辑地址对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingAddress ? '编辑地址' : '添加地址'"
      width="90%"
    >
      <el-form :model="addressForm" label-width="80px" label-position="left">
        <el-form-item label="收货人" required>
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" required>
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="省份" required>
          <el-input v-model="addressForm.province" placeholder="请输入省份" />
        </el-form-item>
        
        <el-form-item label="城市" required>
          <el-input v-model="addressForm.city" placeholder="请输入城市" />
        </el-form-item>
        
        <el-form-item label="区县" required>
          <el-input v-model="addressForm.district" placeholder="请输入区县" />
        </el-form-item>
        
        <el-form-item label="详细地址" required>
          <el-input 
            v-model="addressForm.detail" 
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">
            设为默认地址
          </el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress" :loading="saving">
          {{ editingAddress ? '保存' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAddressStore } from '@/stores/address'
import { parseAddress } from '@/utils/addressParser'

const router = useRouter()
const route = useRoute()
const addressStore = useAddressStore()

const showAddDialog = ref(false)
const editingAddress = ref(null)
const saving = ref(false)
const parsing = ref(false)
const addressText = ref('')

const addressForm = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const addressList = computed(() => addressStore.addressList)

// 返回上一页
const goBack = () => {
  router.back()
}

// 智能解析地址
const parseAddressText = () => {
  if (!addressText.value.trim()) {
    ElMessage.warning('请输入地址信息')
    return
  }

  parsing.value = true
  
  try {
    const result = parseAddress(addressText.value)
    
    // 填充表单
    addressForm.value = {
      name: result.name,
      phone: result.phone,
      province: result.province,
      city: result.city,
      district: result.district,
      detail: result.detail,
      isDefault: addressList.value.length === 0
    }
    
    showAddDialog.value = true
    addressText.value = ''
    
    ElMessage.success('地址解析成功')
  } catch (error) {
    console.error('地址解析失败:', error)
    ElMessage.error('地址解析失败，请手动输入')
  } finally {
    parsing.value = false
  }
}

// 清空地址文本
const clearAddressText = () => {
  addressText.value = ''
}

// 编辑地址
const editAddress = (address) => {
  editingAddress.value = address
  addressForm.value = { ...address }
  showAddDialog.value = true
}

// 保存地址
const saveAddress = () => {
  // 验证表单
  if (!addressForm.value.name.trim()) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  
  if (!addressForm.value.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  
  if (!addressForm.value.province.trim()) {
    ElMessage.warning('请输入省份')
    return
  }
  
  if (!addressForm.value.city.trim()) {
    ElMessage.warning('请输入城市')
    return
  }
  
  if (!addressForm.value.district.trim()) {
    ElMessage.warning('请输入区县')
    return
  }
  
  if (!addressForm.value.detail.trim()) {
    ElMessage.warning('请输入详细地址')
    return
  }

  saving.value = true

  setTimeout(() => {
    if (editingAddress.value) {
      // 编辑地址
      addressStore.updateAddress(editingAddress.value.id, addressForm.value)
      ElMessage.success('地址更新成功')
    } else {
      // 添加地址
      addressStore.addAddress(addressForm.value)
      ElMessage.success('地址添加成功')
    }
    
    saving.value = false
    showAddDialog.value = false
    editingAddress.value = null
    resetForm()
  }, 500)
}

// 删除地址
const deleteAddress = (id) => {
  ElMessageBox.confirm(
    '确定要删除这个地址吗？',
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    addressStore.deleteAddress(id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

// 设为默认地址
const setDefault = (id) => {
  addressStore.setDefaultAddress(id)
  ElMessage.success('已设为默认地址')
}

// 重置表单
const resetForm = () => {
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  }
}

onMounted(() => {
  addressStore.loadAddresses()
  
  // 如果是从结算页面跳转过来的，处理地址选择
  if (route.query.from === 'checkout') {
    // 可以在这里添加特殊逻辑
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.address-container {
  min-height: 100vh;
  @include flex-column;
  background-color: $bg-secondary;
}

.header {
  background: $bg-primary;
  border-bottom: 1px solid $border-light;
  padding: 0;
  height: 60px;
  @include flex-center;
}

.header-content {
  width: 100%;
  @include flex-between;
  padding: 0 $spacing-xl;
  
  @include respond-to(sm) {
    padding: 0 $spacing-lg;
  }
}

.back-btn,
.add-btn {
  font-size: $font-size-xl;
  color: $text-primary;
}

.page-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $text-primary;
}

.address-content {
  flex: 1;
  padding: $spacing-xl;
  overflow-y: auto;
  
  @include respond-to(sm) {
    padding: $spacing-lg;
  }
}

.smart-parse-card {
  margin-bottom: $spacing-xl;
}

.address-input {
  margin-bottom: $spacing-lg;
}

.parse-actions {
  @include flex-center;
  gap: $spacing-md;
  justify-content: flex-end;
}

.address-list {
  @include flex-column;
  gap: $spacing-lg;
}

.address-card {
  transition: all $transition-base $ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-base;
  }
}

.default-address {
  border: 2px solid $primary-color;
}

.address-content {
  padding: $spacing-lg 0;
}

.address-header {
  @include flex-between;
  align-items: flex-start;
  margin-bottom: $spacing-md;
  
  @include respond-to(sm) {
    @include flex-column;
    gap: $spacing-md;
  }
}

.name-phone {
  @include flex-center;
  gap: $spacing-lg;
}

.name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.phone {
  font-size: $font-size-base;
  color: $text-regular;
}

.address-actions {
  @include flex-center;
  gap: $spacing-sm;
  
  @include respond-to(sm) {
    align-self: flex-end;
  }
}

.delete-btn {
  color: $danger-color;
}

.address-detail {
  font-size: $font-size-sm;
  color: $text-regular;
  line-height: $line-height-base;
  margin-bottom: $spacing-sm;
}

.default-tag {
  display: inline-block;
  background: $primary-color;
  color: white;
  font-size: $font-size-xs;
  padding: 2px $spacing-sm;
  border-radius: $border-radius-small;
}

.empty-state {
  @include flex-center;
  min-height: 300px;
}
</style>
