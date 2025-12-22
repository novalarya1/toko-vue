import { createRouter, createWebHistory } from 'vue-router'

import HomePage from '@/components/pages/HomePage.vue'
import ProductsPage from '@/components/pages/ProductsPage.vue'
import LoginPage from '@/components/pages/LoginPage.vue'
import RegisterPage from '@/components/pages/RegisterPage.vue'
import ProfilePage from '@/components/pages/ProfilePage.vue'
import OrderPage from '@/components/pages/OrderPage.vue'
import DetailProductPage from '@/components/pages/DetailProductPage.vue'
import CartPage from '@/components/pages/CartPage.vue'
import FavoritePage from '@/components/pages/FavoritePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/products',
    name: 'products',
    component: ProductsPage
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: DetailProductPage,
    props: true
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage
  },
  {
    path: '/order',
    name: 'order',
    component: OrderPage
  },
  { path: '/favorite', 
    component: FavoritePage, 
  },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
