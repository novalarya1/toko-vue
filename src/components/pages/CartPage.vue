<template>
  <div class="page-wrapper">
    <Header />

    <main class="cart-page container">
      <div class="row">
        <!-- LEFT -->
        <div class="col-md-8">
          <h5 class="mb-3">
            Cart ({{ cart.totalItems }} items)
          </h5>

          <!-- CART LIST -->
          <div class="cart-list">
            <!-- EMPTY CART -->
            <div v-if="!cart.items.length" class="empty-cart">
              <img
                src="/img/shopping-cart.png"
                alt="Empty Cart"
                class="empty-cart-image"
              />
              <h4>Your cart is empty</h4>
              <p class="text-muted mt-2">
                Find your favorite items and add to cart before checkout
              </p>

              <router-link to="/products">
                <button class="btn btn-browse-products mt-3">
                  Browse Products
                </button>
              </router-link>
            </div>

            <!-- CART ITEMS -->
            <div
              v-else
              v-for="item in cart.items"
              :key="item.id"
              class="cart-item d-flex align-items-center"
            >
              <img :src="item.image" class="cart-image" />

              <div class="cart-info flex-grow-1 position-relative">
                <!-- FAVORITE ICON -->
                <button
                  class="favorite-btn"
                  @click="toggleFavorite(item)"
                  :title="isFavorite(item.id) ? 'Remove from favorite' : 'Add to favorite'"
                >
                  <i
                    class="fa-heart"
                    :class="isFavorite(item.id) ? 'fa-solid active' : 'fa-regular'"
                  ></i>
                </button>

                <p class="fw-semibold mb-1">
                  {{ item.title }}
                </p>

                <small class="text-muted">
                  {{ item.size }}
                </small>

                <p class="price">
                  Rp{{ item.price.toLocaleString() }}
                </p>

                <button
                  class="remove"
                  @click.stop="cart.removeItem(item)"
                >
                  Remove
                </button>

              </div>

              <div class="qty-control">
                <button @click="cart.decreaseQty(item.id)">−</button>
                <span>{{ item.qty }}</span>
                <button @click="cart.increaseQty(item.id)">+</button>
              </div>
            </div>
          </div>

          <!-- OTHER PRODUCTS -->
          <section
            v-if="otherProducts.length"
            class="other-products"
          >
            <h5 class="mb-3">You may also like</h5>

            <div class="row">
              <div
                v-for="item in otherProducts"
                :key="item.id"
                class="col-md-4 mb-4"
              >
                <div
                  class="other-card"
                  @click="goToDetail(item.id)"
                >
                  <img
                    :src="item.image"
                    class="other-image"
                  />

                  <div class="other-body">
                    <p class="other-price">
                      Rp{{ item.price.toLocaleString() }}
                    </p>
                    <p class="other-title">
                      {{ item.title }}
                    </p>
                    <small class="text-muted">
                      {{ item.size }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- RIGHT -->
        <div class="col-md-4">
          <div class="summary-box">
            <p class="fw-semibold mb-2">
              Order Summary
            </p>

            <p class="total">
              Rp{{ cart.totalPrice.toLocaleString() }}
            </p>

            <small class="text-muted">
              Not include shipping fee
            </small>

            <button
              class="btn btn-primary w-100 mt-3 btn-checkout"
              @click="goToCheckout"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import Header from '@/components/header/Header.vue'
import Footer from '@/components/footer/Footer.vue'
import { useCartStore } from '@/stores/cart'

import { auth, db } from '@/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const cart = useCartStore()
const router = useRouter()

/* ================= FAVORITE ================= */
const favorites = ref([])
const user = ref(null)

/* ================= OTHER PRODUCTS ================= */
const otherProducts = ref([])
const BASE_URL = import.meta.env.VITE_FIREBASE_DB_URL

/* ================= AUTH & FAVORITES ================= */
onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    user.value = u
    if (!u) return

    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', u.uid)
    )

    const snapshot = await getDocs(q)
    favorites.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })

  fetchOtherProducts()
})

/* ================= FAVORITE LOGIC ================= */
const isFavorite = (productId) => {
  return favorites.value.some(f => f.productId === productId)
}

const toggleFavorite = async (item) => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  const existing = favorites.value.find(f => f.productId === item.id)

  if (existing) {
    await deleteDoc(doc(db, 'favorites', existing.id))
    favorites.value = favorites.value.filter(f => f.id !== existing.id)
  } else {
    const docRef = await addDoc(collection(db, 'favorites'), {
      userId: user.value.uid,
      productId: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      createdAt: new Date()
    })

    favorites.value.push({
      id: docRef.id,
      productId: item.id
    })
  }
}

/* ================= OTHER PRODUCTS ================= */
const fetchOtherProducts = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/products.json`)
    const data = res.data || {}

    const cartIds = cart.items.map(i => i.id)

    otherProducts.value = Object.keys(data)
      .filter(id => !cartIds.includes(id))
      .slice(0, 3)
      .map(id => ({
        id,
        ...data[id]
      }))
  } catch (err) {
    console.error('Failed load products', err)
  }
}

const goToDetail = (id) => {
  router.push(`/products/${id}`)
}

const goToCheckout = () => {
  if (!cart.items.length) {
    alert('Your cart is empty')
    return
  }

  router.push('/order')
}
</script>

<style scoped>
.cart-page {
  padding: 48px 0;
}

/* CART LIST */
.cart-list {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 8px;
}

/* EMPTY CART */
.empty-cart {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-cart-image {
  width: 140px;
  margin-bottom: 12px;
}

/* BROWSE PRODUCTS BUTTON */
.btn-browse-products {
  background-color: #0f766e;
  border-color: #0f766e;
  color: #fff;
  transition: background-color 0.2s;
}

.btn-browse-products:hover {
  background-color: #0c5c59;
  border-color: #0c5c59;
  color: #fff;
}

/* CART ITEM */
.cart-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
}

.cart-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  margin-right: 16px;
}

.cart-info .price {
  font-weight: 600;
}

.remove {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 0.8rem;
  padding: 0;
}

/* FAVORITE */
.favorite-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #9ca3af;
}

.favorite-btn i.active {
  color: #ef4444;
}

/* QTY */
.qty-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-control button {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

/* SUMMARY */
.summary-box {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  position: sticky;
  top: 100px;
}

.summary-box .total {
  font-size: 1.4rem;
  font-weight: 700;
}

/* CHECKOUT BUTTON */
.summary-box .btn-checkout {
  background-color: #0f766e;
  border-color: #0f766e;
  color: #fff;
  transition: background-color 0.2s;
}

.summary-box .btn-checkout:hover {
  background-color: #0c5c59;
  border-color: #0c5c59;
  color: #fff;
}

/* OTHER PRODUCTS */
.other-products {
  margin-top: 48px;
}

.other-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s;
}

.other-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,.08);
}

.other-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.other-body {
  padding: 12px;
}

.other-price {
  font-weight: 600;
}
</style>
