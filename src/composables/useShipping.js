import { computed } from 'vue'
import { useCart } from './useCart'
import { calculateShipping } from '@/utils/shippingConfig'

export function useShipping() {
  const { totalWeight } = useCart()

  const calculateShippingCost = (province) => {
    if (!province || totalWeight.value === 0) {
      return {
        rate: 0,
        totalWeight: 0,
        shipping: 0,
        province: ''
      }
    }
    return calculateShipping(totalWeight.value, province)
  }

  const getShippingInfo = (province) => {
    const shippingInfo = calculateShippingCost(province)
    return {
      ...shippingInfo,
      totalPrice: shippingInfo.shipping
    }
  }

  return {
    calculateShippingCost,
    getShippingInfo
  }
}
