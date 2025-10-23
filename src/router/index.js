import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/HomeView.vue'),
    meta: { title: '商品' }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout/CheckoutView.vue'),
    meta: { title: '结算' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders/OrdersView.vue'),
    meta: { title: '订单管理' }
  },
  {
    path: '/order-detail/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderDetail/OrderDetailView.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('@/views/Address/AddressView.vue'),
    meta: { title: '地址管理' }
  },
  {
    path: '/shipping',
    name: 'Shipping',
    component: () => import('@/views/Shipping/ShippingView.vue'),
    meta: { title: '运费标准' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 林龍香大米商城`
  }
  next()
})

export default router
