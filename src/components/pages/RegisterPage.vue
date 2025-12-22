<template>
  <div class="auth-page">
    <div class="auth-card">
      <h3 class="title">Sign up</h3>
      <p class="subtitle">Enter your details below</p>

      <form @submit.prevent="submitRegister">
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="form.fullName" type="text" placeholder="Enter your fullname" />
        </div>

        <div class="form-group">
          <label>Username</label>
          <input v-model="form.username" type="text" placeholder="Enter your username" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="Enter your email" />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="form.password" type="password" placeholder="Enter your password" />
        </div>

        <div class="form-group">
          <label>Confirmation Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Enter your password"
          />
        </div>

        <div class="checkbox">
          <input type="checkbox" v-model="form.agree" />
          <span>
            By clicking sign up, I hereby agree and consent to the
            <a href="#">Terms & Conditions</a> and
            <a href="#">Privacy Policy</a>
          </span>
        </div>

        <button class="btn-primary" :disabled="!form.agree">
          Sign up
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { register } from '@/services/authService'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const submitRegister = async () => {
  if (form.password !== form.confirmPassword) {
    alert('Password tidak sama')
    return
  }

  try {
    await register(
      form.email,
      form.password,
      {
        fullName: form.fullName,
        username: form.username
      }
    )

    alert('Register success')
    router.push('/login')
  } catch (err) {
    console.error(err)
    alert('Register gagal')
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
  width: 380px;
  background: #fff;
  padding: 32px;
  border-radius: 8px;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.checkbox {
  display: flex;
  gap: 8px;
  font-size: 12px;
  margin: 16px 0;
}

.checkbox a {
  color: #4c4ddc;
  text-decoration: none;
}

.btn-primary {
  width: 100%;
  background: #0d9488;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
