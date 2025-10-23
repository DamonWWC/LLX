<template>
  <div class="shipping-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <el-button type="text" @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </el-button>
        <h1 class="page-title">运费标准</h1>
        <div class="placeholder"></div>
      </div>
    </el-header>

    <!-- 运费计算器 -->
    <el-card class="calculator-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Calculator /></el-icon>
          <span class="header-title">运费计算器</span>
        </div>
      </template>
      
      <div class="calculator-content">
        <el-form :model="calculatorForm" label-width="100px" class="calculator-form">
          <el-form-item label="商品重量">
            <el-input-number
              v-model="calculatorForm.weight"
              :min="0"
              :precision="1"
              placeholder="请输入重量"
              style="width: 100%"
              @change="calculateShipping"
            />
            <span class="unit-text">斤</span>
          </el-form-item>
          
          <el-form-item label="收货省份">
            <el-select
              v-model="calculatorForm.province"
              placeholder="请选择省份"
              style="width: 100%"
              @change="calculateShipping"
            >
              <el-option
                v-for="province in provinces"
                :key="province"
                :label="province"
                :value="province"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="calculateShipping" class="calculate-btn">
              <el-icon><Calculator /></el-icon>
              计算运费
            </el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="calculationResult" class="calculation-result">
          <el-alert
            :title="`运费计算结果：¥${calculationResult.shipping}`"
            type="success"
            :description="`${calculationResult.weight}斤 × ${calculationResult.rate}元/斤 = ¥${calculationResult.shipping}`"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </el-card>

    <!-- 运费标准表格 -->
    <el-card class="rates-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><List /></el-icon>
          <span class="header-title">运费标准表</span>
        </div>
      </template>
      
      <div class="rates-content">
        <el-table
          :data="shippingRates"
          stripe
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        >
          <el-table-column prop="province" label="省份" width="120" align="center">
            <template #default="{ row }">
              <el-tag type="primary" size="small">{{ row.province }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rate" label="运费标准" width="120" align="center">
            <template #default="{ row }">
              <span class="rate-text">¥{{ row.rate }}/斤</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" min-width="200">
            <template #default="{ row }">
              <span class="description-text">{{ row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column label="示例" width="150" align="center">
            <template #default="{ row }">
              <div class="example">
                <div class="example-weight">10斤</div>
                <div class="example-arrow">→</div>
                <div class="example-price">¥{{ (row.rate * 10).toFixed(1) }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 运费说明 -->
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><InfoFilled /></el-icon>
          <span class="header-title">运费说明</span>
        </div>
      </template>
      
      <div class="info-content">
        <el-timeline>
          <el-timeline-item timestamp="计算方式" placement="top">
            <el-card>
              <h4>按重量计费</h4>
              <p>运费 = 商品总重量 × 对应省份运费标准</p>
              <p>例如：10斤大米发往广东省，运费 = 10 × 1.5 = ¥15</p>
            </el-card>
          </el-timeline-item>
          
          <el-timeline-item timestamp="配送范围" placement="top">
            <el-card>
              <h4>全国包邮</h4>
              <p>支持全国各省市自治区配送，偏远地区运费标准可能有所不同</p>
              <p>具体运费以结算页面显示为准</p>
            </el-card>
          </el-timeline-item>
          
          <el-timeline-item timestamp="免邮条件" placement="top">
            <el-card>
              <h4>满额免邮</h4>
              <p>单笔订单满200元免运费（仅限部分省份）</p>
              <p>活动期间可能有特殊免邮政策，请关注最新公告</p>
            </el-card>
          </el-timeline-item>
          
          <el-timeline-item timestamp="配送时效" placement="top">
            <el-card>
              <h4>快速配送</h4>
              <p>一般地区：1-3个工作日送达</p>
              <p>偏远地区：3-5个工作日送达</p>
              <p>具体时效以物流信息为准</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 常见问题 -->
    <el-card class="faq-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><QuestionFilled /></el-icon>
          <span class="header-title">常见问题</span>
        </div>
      </template>
      
      <div class="faq-content">
        <el-collapse v-model="activeFaq" accordion>
          <el-collapse-item title="运费是如何计算的？" name="1">
            <div class="faq-answer">
              <p>运费按照商品总重量和收货地址所在省份的运费标准计算。</p>
              <p>计算公式：运费 = 商品总重量（斤）× 对应省份运费标准（元/斤）</p>
              <p>例如：购买10斤大米，发往广东省，运费 = 10 × 1.5 = ¥15</p>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="可以包邮吗？" name="2">
            <div class="faq-answer">
              <p>目前我们提供以下包邮政策：</p>
              <ul>
                <li>单笔订单满200元免运费（限部分省份）</li>
                <li>新用户首单免运费</li>
                <li>活动期间可能有特殊免邮政策</li>
              </ul>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="偏远地区运费如何计算？" name="3">
            <div class="faq-answer">
              <p>偏远地区（如新疆、西藏、内蒙古等）运费标准可能有所不同。</p>
              <p>具体运费请在下单时查看结算页面的运费显示，或联系客服咨询。</p>
            </div>
          </el-collapse-item>
          
          <el-collapse-item title="运费可以退吗？" name="4">
            <div class="faq-answer">
              <p>运费属于物流服务费用，一般情况下不支持单独退款。</p>
              <p>如果因商品问题导致退货，运费将一并退还。</p>
              <p>如果因地址错误导致需要重新发货，运费由客户承担。</p>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllShippingRates, calculateShipping } from '@/utils/shippingConfig'

const router = useRouter()

// 响应式数据
const calculatorForm = ref({
  weight: 10,
  province: '广东省'
})

const calculationResult = ref(null)
const activeFaq = ref('1')

// 计算属性
const shippingRates = computed(() => {
  const rates = getAllShippingRates()
  return rates.map(rate => ({
    province: rate.province,
    rate: rate.rate,
    description: getProvinceDescription(rate.province)
  }))
})

const provinces = computed(() => {
  return shippingRates.value.map(rate => rate.province)
})

// 方法
const goBack = () => {
  router.back()
}

const calculateShipping = () => {
  if (!calculatorForm.value.weight || !calculatorForm.value.province) {
    return
  }
  
  const result = calculateShipping(calculatorForm.value.weight, calculatorForm.value.province)
  calculationResult.value = {
    weight: calculatorForm.value.weight,
    rate: result.rate,
    shipping: result.shipping
  }
}

const getProvinceDescription = (province) => {
  const descriptions = {
    '广东省': '珠三角地区，配送快速',
    '江苏省': '长三角地区，物流发达',
    '浙江省': '电商发达地区，配送便捷',
    '山东省': '华北地区，交通便利',
    '河南省': '中原地区，配送网络完善',
    '四川省': '西南地区，覆盖主要城市',
    '湖北省': '华中地区，交通枢纽',
    '湖南省': '中部地区，配送便利',
    '河北省': '华北地区，临近北京',
    '安徽省': '华东地区，交通便利',
    '福建省': '东南沿海，物流发达',
    '江西省': '中部地区，配送网络完善',
    '辽宁省': '东北地区，主要城市覆盖',
    '黑龙江省': '东北地区，配送范围有限',
    '吉林省': '东北地区，主要城市配送',
    '山西省': '华北地区，配送网络完善',
    '陕西省': '西北地区，主要城市覆盖',
    '甘肃省': '西北地区，配送范围有限',
    '青海省': '西北地区，配送范围有限',
    '宁夏': '西北地区，配送范围有限',
    '新疆': '西北地区，配送范围有限',
    '西藏': '西南地区，配送范围有限',
    '内蒙古': '华北地区，配送范围有限',
    '广西': '华南地区，配送网络完善',
    '云南': '西南地区，主要城市覆盖',
    '贵州': '西南地区，配送网络完善',
    '海南': '华南地区，配送范围有限',
    '北京': '直辖市，配送快速',
    '上海': '直辖市，配送快速',
    '天津': '直辖市，配送快速',
    '重庆': '直辖市，配送网络完善'
  }
  return descriptions[province] || '配送范围有限，具体请咨询客服'
}

// 生命周期
onMounted(() => {
  calculateShipping()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.shipping-container {
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
  box-shadow: $shadow-light;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  @include flex-between;
  padding: 0 $spacing-xl;
  
  @include respond-to(sm) {
    padding: 0 $spacing-lg;
  }
}

.back-btn {
  @include flex-center;
  gap: $spacing-xs;
  color: $text-primary;
  
  .back-text {
    @include respond-to(sm) {
      display: none;
    }
  }
}

.page-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $text-primary;
}

.placeholder {
  width: 40px;
}

.shipping-content {
  flex: 1;
  padding: $spacing-xl;
  overflow-y: auto;
  
  @include respond-to(sm) {
    padding: $spacing-lg;
  }
}

.calculator-card,
.rates-card,
.info-card,
.faq-card {
  margin-bottom: $spacing-lg;
  border-radius: $border-radius-large;
  overflow: hidden;
}

.card-header {
  @include flex-center;
  gap: $spacing-sm;
}

.header-icon {
  font-size: $font-size-lg;
  color: $primary-color;
}

.header-title {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.calculator-content {
  padding: $spacing-lg 0;
}

.calculator-form {
  max-width: 400px;
  margin: 0 auto;
}

.unit-text {
  margin-left: $spacing-sm;
  color: $text-regular;
  font-size: $font-size-sm;
}

.calculate-btn {
  @include button-primary;
  width: 100%;
  padding: $spacing-md;
}

.calculation-result {
  margin-top: $spacing-xl;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.rates-content {
  padding: $spacing-lg 0;
}

.rate-text {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $primary-color;
}

.description-text {
  font-size: $font-size-sm;
  color: $text-regular;
}

.example {
  @include flex-center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  
  .example-weight {
    color: $text-regular;
  }
  
  .example-arrow {
    color: $text-secondary;
  }
  
  .example-price {
    color: $primary-color;
    font-weight: $font-weight-semibold;
  }
}

.info-content {
  padding: $spacing-lg 0;
}

.faq-content {
  padding: $spacing-lg 0;
}

.faq-answer {
  padding: $spacing-md 0;
  
  p {
    margin-bottom: $spacing-sm;
    color: $text-regular;
    line-height: $line-height-base;
  }
  
  ul {
    margin: $spacing-sm 0;
    padding-left: $spacing-lg;
    
    li {
      margin-bottom: $spacing-xs;
      color: $text-regular;
    }
  }
}

// 响应式设计
@include respond-to(sm) {
  .calculator-form {
    max-width: 100%;
  }
  
  .calculation-result {
    max-width: 100%;
  }
}
</style>