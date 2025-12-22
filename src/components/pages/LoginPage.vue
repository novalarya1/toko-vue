<template>
  <div class="auth-page">
    <div class="auth-card">
      <img src="/img/Logo Horizontal.png" alt="Vintage" class="logo" />

      <h3>Login to Vintage</h3>
      <p class="subtitle">Enter your details below</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input
            type="email"
            v-model="email"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" class="btn-primary">
          Continue
        </button>
      </form>

      <p class="footer-text">
        Don’t have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/') // Header otomatis update
  } catch (err) {
    alert(err.message)
  }
}
</script>


<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.auth-card {
  background: white;
  width: 360px;
  padding: 32px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,.08);
}

.logo {
  display: block;
  margin: 0 auto 16px;
  height: 40px;
}

h3 {
  text-align: center;
  margin-bottom: 6px;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  color: #777;
  margin-bottom: 24px;
}

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
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.btn-primary {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: #1aa7a1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.footer-text {
  text-align: center;
  font-size: 13px;
  margin-top: 20px;
}

.footer-text a {
  color: #1aa7a1;
  text-decoration: none;
  font-weight: 500;
}
</style>
