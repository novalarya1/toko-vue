<template>
  <div class="page-wrapper">
    <Header />

    <main class="detail-page container">
      <!-- LOADING -->
      <div v-if="isLoading" class="loading">
        Loading...
      </div>

      <!-- PRODUCT -->
      <div v-else-if="product" class="row">
        <!-- IMAGE -->
        <div class="col-md-7 position-relative">
          <!-- ❤️ FAVORITE -->
          <button
            class="favorite-btn"
            @click="toggleFavorite"
            title="Add to favorite"
          >
            <i
              :class="isFavorite
                ? 'fa-solid fa-heart active'
                : 'fa-regular fa-heart'"
            ></i>
          </button>

          <img
            :src="product.image || '/img/placeholder.png'"
            class="product-image img-fluid"
            alt="Product"
          />
        </div>

        <!-- INFO -->
        <div class="col-md-5">
          <h3 class="price">
            Rp{{ product.price?.toLocaleString('id-ID') }}
          </h3>

          <h5 class="title">{{ product.name }}</h5>
          <p class="meta">{{ product.size }}</p>

          <hr />

          <ul class="product-info list-unstyled">
            <li><strong>Description:</strong> {{ product.description }}</li>
            <li><strong>Category:</strong> {{ product.category }}</li>
            <li><strong>Size:</strong> {{ product.size }}</li>
            <li><strong>Condition:</strong> {{ product.condition }}</li>
            <li><strong>Color:</strong> {{ product.color }}</li>
            <li>
              <strong>Shipping:</strong>
              Rp{{ product.shipping?.toLocaleString('id-ID') || 0 }}
            </li>
          </ul>

          <div class="action-buttons">
            <button
              class="btn btn-primary w-100 mb-2 btn-buy-now"
              @click="buyNow"
            >
              Buy Now
            </button>

            <button
              class="btn btn-outline w-100 btn-add-cart"
              @click="addToCart"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <!-- NOT FOUND -->
      <div v-else class="not-found">
        Product not found
      </div>

      <!-- OTHER PRODUCTS -->
      <section
        v-if="otherProducts.length"
        class="other-products"
      >
        <h5 class="section-title mb-4">
          Other Products
        </h5>

        <div class="row">
          <div
            v-for="item in otherProducts"
            :key="item.id"
            class="col-md-3 col-sm-6 mb-4"
          >
            <div
              class="other-card"
              @click="goToDetail(item.id)"
            >
              <img
                :src="item.image || '/img/placeholder.png'"
                class="other-image"
              />

              <div class="other-body">
                <p class="other-price">
                  Rp{{ item.price?.toLocaleString('id-ID') }}
                </p>
                <p class="other-title">{{ item.name }}</p>
                <small class="other-meta">{{ item.size }}</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'

import Header from '@/components/header/Header.vue'
import Footer from '@/components/footer/Footer.vue'

import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'

/* ================= STATE ================= */
const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const product = ref(null)
const otherProducts = ref([])
const isLoading = ref(true)

const user = ref(null)
const favorites = ref([])

const BASE_URL = import.meta.env.VITE_FIREBASE_DB_URL

/* ================= FETCH PRODUCT ================= */
const fetchProductDetail = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/products/${route.params.id}.json`
    )
    product.value = res.data
  } catch (err) {
    product.value = null
  }
}

const fetchOtherProducts = async () => {
  const res = await axios.get(`${BASE_URL}/products.json`)
  const data = res.data || {}

  otherProducts.value = Object.keys(data)
    .filter(id => id !== route.params.id)
    .slice(0, 4)
    .map(id => ({
      id,
      ...data[id]
    }))
}

/* ================= AUTH & FAVORITE ================= */
onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    user.value = u
    if (!u) return

    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', u.uid)
    )

    const snapshot = await getDocs(q)
    favorites.value = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))
  })
})

const isFavorite = computed(() =>
  favorites.value.some(
    f => f.productId === route.params.id
  )
)

const toggleFavorite = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  if (!product.value) return

  const existing = favorites.value.find(
    f => f.productId === route.params.id
  )

  if (existing) {
    await deleteDoc(doc(db, 'favorites', existing.id))
    favorites.value = favorites.value.filter(
      f => f.id !== existing.id
    )
  } else {
    const docRef = await addDoc(collection(db, 'favorites'), {
      userId: user.value.uid,
      productId: route.params.id,
      title: product.value.name || '',
      price: product.value.price || 0,
      image: product.value.image || '',
      createdAt: new Date()
    })

    favorites.value.push({
      id: docRef.id,
      productId: route.params.id
    })
  }
}
/* ================= BUY NOw ================= */
const buyNow = () => {
  if (!product.value) return

  cart.clearCart()

  cart.addItem({
    id: route.params.id,
    title: product.value.name,
    size: product.value.size,
    price: product.value.price,
    image: product.value.image,
    qty: 1
  })

  router.push('/order')
}

/* ================= CART ================= */
const addToCart = () => {
  cart.addItem({
    id: route.params.id,
    title: product.value.name,
    size: product.value.size,
    price: product.value.price,
    image: product.value.image
  })

  alert(`${product.value.name} added to cart`)
}

const goToDetail = (id) => {
  router.push(`/products/${id}`)
}

/* ================= LIFECYCLE ================= */
onMounted(async () => {
  await fetchProductDetail()
  await fetchOtherProducts()
  isLoading.value = false
})

watch(() => route.params.id, async () => {
  isLoading.value = true
  await fetchProductDetail()
  await fetchOtherProducts()
  isLoading.value = false
})
</script>

<style scoped>
.detail-page {
  padding: 48px 0 72px;
}

/* IMAGE */
.product-image {
  width: 100%;
  max-height: 750px;
  object-fit: contain;
  border-radius: 16px;
}

/* FAVORITE */
.favorite-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.favorite-btn i {
  font-size: 20px;
  color: #9ca3af;
}

.favorite-btn i.active {
  color: #ef4444;
}

/* BUY NOW BUTTON */
.btn-buy-now {
  background-color: #0f766e;
  border-color: #0f766e;
  color: #fff;
  transition: background-color 0.2s;
}

.btn-buy-now:hover {
  background-color: #0c5c59;
  border-color: #0c5c59;
  color: #fff;
}

/* ADD TO CART BUTTON */
.btn-add-cart {
  border: 2px solid #0f766e;
  color: #0f766e;
  background-color: transparent;
  transition: all 0.2s;
}

.btn-add-cart:hover {
  background-color: #0f766e;
  color: #fff;
  border-color: #0c5c59;
}

/* TEXT */
.price {
  font-size: 1.6rem;
  font-weight: 700;
}

.meta {
  color: #6b7280;
}

/* OTHER */
.other-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.other-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.loading,
.not-found {
  text-align: center;
  padding: 60px 0;
}
</style>
