<template>
  <header class="header">
    <!-- LOGO -->
    <div class="logo" @click="goHome">
      <img src="/img/Logo Horizontal.png" alt="Vintage Logo" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="right-actions">
      <!-- SEARCH -->
      <div class="search-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          placeholder="Search for items"
          class="search-input"
          v-model="searchQuery"
          @input="onSearch"
        />
      </div>

      <!-- ICON ACTIONS -->
      <div class="icon-actions">
        <!-- CART -->
        <router-link to="/cart" class="icon-btn cart-icon">
          <i class="fa-solid fa-cart-shopping"></i>
          <span
            v-if="cartStore.totalItems > 0"
            class="cart-badge"
          >
            {{ cartStore.totalItems }}
          </span>
        </router-link>

        <!-- FAVORITE -->
        <router-link to="/favorite" class="icon-btn">
          <i class="fa-regular fa-heart"></i>
        </router-link>
      </div>

      <!-- AUTH -->
      <div class="header-actions">
        <!-- BELUM LOGIN -->
        <template v-if="!isLogin">
          <router-link to="/login">
            <button class="btn-outline">Login</button>
          </router-link>

          <router-link to="/register">
            <button class="btn-primary">Sign up</button>
          </router-link>
        </template>

        <!-- SUDAH LOGIN -->
        <template v-else>
          <div class="user-menu">
            <img
              :src="photoURL"
              class="avatar"
              @click="toggleMenu"
            />

            <div v-if="showMenu" class="dropdown">
              <router-link to="/profile">Profile</router-link>
              <router-link
                :to="{ path: '/profile', query: { tab: 'history' } }"
              >
                Order
              </router-link>
              <button class="logout" @click="logout">
                Logout
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, rtdb } from '@/firebase'
import { ref as dbRef, get, onValue } from 'firebase/database'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

/* ================= SEARCH ================= */
const searchQuery = ref('')
const emit = defineEmits(['search'])

const onSearch = () => {
  emit('search', searchQuery.value)
}

/* ================= AUTH ================= */
const isLogin = ref(false)
const showMenu = ref(false)
const photoURL = ref('/img/user.png') // default avatar

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    isLogin.value = !!user

    if (user) {
      // realtime sync photo profile
      const userRef = dbRef(rtdb, `users/${user.uid}`)
      onValue(userRef, (snap) => {
        if (snap.exists() && snap.val().photoBase64) {
          photoURL.value = snap.val().photoBase64
        } else {
          photoURL.value = '/img/user.png'
        }
      })
    } else {
      photoURL.value = '/img/user.png'
    }
  })
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const logout = async () => {
  await signOut(auth)
  showMenu.value = false
  router.push('/login')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 14px 32px;
  border-bottom: 1px solid #eee;
}

/* LOGO */
.logo img {
  height: 36px;
  cursor: pointer;
}

/* RIGHT SIDE */
.right-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}

/* SEARCH */
.search-wrapper {
  position: relative;
  width: 420px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 14px;
}

/* ICON ACTIONS */
.icon-actions {
  display: flex;
  gap: 16px;
}

.icon-btn {
  font-size: 20px;
  color: #333;
  text-decoration: none;
  position: relative;
}

/* CART BADGE */
.cart-icon {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #dc2626;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
}

/* AUTH */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* BUTTONS */
.btn-outline {
  border: 1px solid #4c4ddc;
  color: #4c4ddc;
  background: transparent;
  padding: 6px 14px;
  border-radius: 6px;
}

.btn-primary {
  background: #4c4ddc;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
}

/* USER MENU */
.user-menu {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 46px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,.1);
  min-width: 140px;
  padding: 8px 0;
  z-index: 2000;
}

.dropdown a,
.dropdown button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
}

.dropdown a:hover,
.dropdown button:hover {
  background: #f5f5f5;
}

.logout {
  color: #dc2626;
}
</style>
