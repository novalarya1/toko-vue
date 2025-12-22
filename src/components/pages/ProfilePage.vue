<template>
  <Header />

  <div class="profile-wrapper">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <h3 class="sidebar-title">Settings</h3>

      <ul class="menu">
        <li :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">
          Profile Details
        </li>
        <li :class="{ active: activeTab === 'password' }" @click="activeTab = 'password'">
          Change Password
        </li>
        <li :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
          Transaction History
        </li>
      </ul>
    </aside>

    <!-- CONTENT -->
    <section class="content">

      <!-- ================= PROFILE ================= -->
      <div v-if="activeTab === 'profile'" class="card">
        <h3 class="card-title">Edit Profile</h3>

        <div class="photo-row">
          <div class="avatar">
            <img :src="previewPhoto || photoURL" />
          </div>

          <div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              hidden
              @change="handlePhotoChange"
            />
            <button class="btn-outline" @click="triggerFileInput">
              Change Photo
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input v-model="name" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="email" disabled />
        </div>

        <button class="btn-primary" @click="saveProfile">
          Save Profile
        </button>
      </div>

      <!-- ================= PASSWORD ================= -->
      <div v-if="activeTab === 'password'" class="card">
        <h3 class="card-title">Change Password</h3>

        <div class="form-group">
          <label>Old Password</label>
          <input type="password" v-model="oldPassword" />
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input type="password" v-model="newPassword" />
        </div>

        <div class="form-group">
          <label>Confirm New Password</label>
          <input type="password" v-model="confirmPassword" />
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <button class="btn-primary" @click="changePassword">
          Save Changes
        </button>
      </div>

      <!-- ================= TRANSACTION HISTORY ================= -->
      <div v-if="activeTab === 'history'" class="card">
        <h3 class="card-title">My Orders</h3>

        <p v-if="loadingOrders">Loading orders...</p>

        <div v-else-if="transactions.length === 0" class="order-empty">
          <img src="/img/empty.png" />
          <h4>No orders yet</h4>
          <p>Your transactions will appear here</p>
          <router-link to="/products" class="btn-primary">
            Shop now
          </router-link>
        </div>

        <div v-else class="order-list">
          <div v-for="order in transactions" :key="order.id" class="order-card">
            <div class="order-header">
              <div>
                <strong>Order ID:</strong> {{ order.id }}<br />
                <small>{{ order.createdAt?.toDate().toLocaleString('id-ID') }}</small>
              </div>
              <span class="order-status">{{ order.status }}</span>
            </div>

            <div v-for="item in order.items" :key="item.name" class="order-body">
              <img :src="item.image" />
              <div class="order-info">
                <h4>{{ item.name }}</h4>
                <p>{{ item.qty }} pcs • {{ item.variant || 'N/A' }}</p>
              </div>
              <div class="order-price">
                Rp{{ (item.price * item.qty).toLocaleString('id-ID') }}
              </div>
            </div>

            <div class="order-total">
              Total:
              <strong>Rp{{ order.total.toLocaleString('id-ID') }}</strong>
            </div>
          </div>
        </div>
      </div>

    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/header/Header.vue'

import { auth, rtdb, db } from '@/firebase'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile
} from 'firebase/auth'

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore'

import { ref as dbRef, get, set } from 'firebase/database'

/* ================= STATE ================= */
const route = useRoute()
const activeTab = ref('profile')

// profile
const name = ref('')
const email = ref('')
const photoURL = ref('/img/user.png')

// photo
const fileInput = ref(null)
const previewPhoto = ref('')
const photoBase64 = ref('')

// password
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')

// orders
const transactions = ref([])
const loadingOrders = ref(false)

/* ================= TAB ================= */
onMounted(() => {
  if (route.query.tab) activeTab.value = route.query.tab
})

watch(() => route.query.tab, v => {
  if (v) activeTab.value = v
})

/* ================= LOAD USER ================= */
onMounted(async () => {
  const user = auth.currentUser
  if (!user) return

  email.value = user.email
  name.value = user.displayName || ''

  const snap = await get(dbRef(rtdb, `users/${user.uid}`))
  if (snap.exists() && snap.val().photoBase64) {
    photoURL.value = snap.val().photoBase64
  }

  fetchOrders(user.uid)
})

/* ================= PHOTO ================= */
const triggerFileInput = () => {
  fileInput.value.click()
}

const handlePhotoChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 500 * 1024) {
    alert('Max image size 500KB')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    photoBase64.value = reader.result
    previewPhoto.value = reader.result
  }
  reader.readAsDataURL(file)
}

/* ================= SAVE PROFILE ================= */
const saveProfile = async () => {
  const user = auth.currentUser
  if (!user) return

  await updateProfile(user, {
    displayName: name.value
  })

  if (photoBase64.value) {
    await set(dbRef(rtdb, `users/${user.uid}`), {
      photoBase64: photoBase64.value
    })

    photoURL.value = photoBase64.value
    previewPhoto.value = ''
    photoBase64.value = ''
  }

  alert('Profile updated')
}

/* ================= ORDERS ================= */
const fetchOrders = (uid) => {
  loadingOrders.value = true
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  )

  onSnapshot(q, snap => {
    transactions.value = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }))
    loadingOrders.value = false
  })
}

/* ================= PASSWORD ================= */
const changePassword = async () => {
  error.value = success.value = ''

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Password confirmation does not match'
    return
  }

  try {
    const user = auth.currentUser
    const cred = EmailAuthProvider.credential(
      user.email,
      oldPassword.value
    )

    await reauthenticateWithCredential(user, cred)
    await updatePassword(user, newPassword.value)

    success.value = 'Password updated successfully'
    oldPassword.value = newPassword.value = confirmPassword.value = ''
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
/* STYLE TIDAK DIUBAH — SAMA PERSIS */
.profile-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  display: flex;
  gap: 32px;
}
.sidebar { width: 240px; }
.sidebar-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
.menu { list-style: none; padding: 0; }
.menu li { padding: 10px 12px; cursor: pointer; color: #555; }
.menu li.active {
  font-weight: 600;
  color: #0d9488;
  border-left: 3px solid #0d9488;
  background: #f0fdfa;
}
.content { flex: 1; }
.card { background: white; padding: 32px; border-radius: 10px; margin-bottom: 24px; }
.photo-row { display: flex; gap: 20px; margin-bottom: 24px; }
.avatar img { width: 72px; height: 72px; border-radius: 50%; }
.form-group { margin-bottom: 16px; }
label { font-size: 13px; font-weight: 500; margin-bottom: 6px; display: block; }
input { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; }
.error { color: #dc2626; font-size: 13px; }
.success { color: #16a34a; font-size: 13px; }
.order-card { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.order-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.order-status { font-size: 13px; color: #0d9488; }
.order-body { display: flex; align-items: center; gap: 20px; margin-bottom: 12px; }
.order-body img { width: 64px; height: 64px; object-fit: cover; border-radius: 6px; }
.order-total { text-align: right; font-weight: 600; }
.btn-primary {
  margin-top: 20px;
  background: #0d9488;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
}
.btn-outline {
  border: 1px solid #0d9488;
  background: transparent;
  color: #0d9488;
  padding: 6px 14px;
  border-radius: 6px;
}

.profile-wrapper {
  max-width: 1100px;
  margin: 40px auto;
  display: flex;
  gap: 32px;
}

/* SIDEBAR */
.sidebar {
  width: 240px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.menu {
  list-style: none;
  padding: 0;
}

.menu li {
  padding: 10px 12px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}

.menu li.active {
  font-weight: 600;
  color: #0d9488;
  border-left: 3px solid #0d9488;
  background: #f0fdfa;
}

/* CONTENT AREA */
.content {
  flex: 1;
}

.card {
  background: white;
  padding: 32px;
  border-radius: 10px;
  margin-bottom: 24px;
}

/* PROFILE SECTION */
.photo-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
}

/* FORM ELEMENTS */
.form-group {
  margin-bottom: 16px;
}

label {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

/* PASSWORD FEEDBACK */
.error {
  color: #dc2626; /* red */
  font-size: 13px;
  margin-bottom: 8px;
}

.success {
  color: #16a34a; /* green */
  font-size: 13px;
  margin-bottom: 8px;
}

/* ORDER / TRANSACTION HISTORY */
.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-status {
  font-size: 13px;
  color: #0d9488;
  font-weight: 500;
}

.order-body {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 12px;
}

.order-body img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
}

.order-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.order-info p {
  font-size: 13px;
  color: #555;
  margin: 0;
}

.order-price {
  font-weight: 600;
  font-size: 14px;
}

.order-total {
  text-align: right;
  font-weight: 600;
  margin-top: 8px;
}

/* EMPTY STATE */
.order-empty {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
}

.order-empty img {
  width: 160px;
  margin-bottom: 8px;
}

.order-empty h4 {
  font-size: 18px;
  font-weight: 600;
}

.order-empty p {
  font-size: 14px;
  color: #777;
  max-width: 320px;
}

/* BUTTONS */
.btn-primary {
  margin-top: 20px;
  background: #0d9488;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #0b7a73;
}

.btn-outline {
  border: 1px solid #0d9488;
  background: transparent;
  color: #0d9488;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #f0fdfa;
}
</style>
