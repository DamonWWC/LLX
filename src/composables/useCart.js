import { computed } from 'vue'
import { useProductStore } from '@/stores/product'
import { useShippingStore } from '@/stores/shipping'

export function useCart() {
  const productStore = useProductStore()
  const shippingStore = useShippingStore()

  const cartItems = computed(() => 
    productStore.selectedProducts.map(product => ({
      ...product,
      subtotal: product.price * product.quantity
    }))
  )

  const totalPrice = computed(() => 
    cartItems.value.reduce((sum, item) => sum + item.subtotal, 0)
  )

  const totalWeight = computed(() => 
    cartItems.value.reduce((sum, item) => sum + (item.weight * item.quantity), 0)
  )

  const increaseQuantity = (id) => {
    productStore.increaseQuantity(id)
  }

  const decreaseQuantity = (id) => {
    productStore.decreaseQuantity(id)
  }

  const clearCart = () => {
    productStore.clearCart()
  }

  const goCheckout = () => {
    if (cartItems.value.length === 0) {
      return false
    }
    return true
  }

  return {
    cartItems,
    totalPrice,
    totalWeight,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    goCheckout
  }
}
