import axios from 'axios'

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY
const AUTH_URL = import.meta.env.VITE_FIREBASE_AUTH_URL
const DB_URL = import.meta.env.VITE_FIREBASE_DB_URL

// REGISTER
export const register = async (email, password, userData) => {
  // 1. Create account (Firebase Auth)
  const res = await axios.post(
    `${AUTH_URL}/accounts:signUp?key=${API_KEY}`,
    {
      email,
      password,
      returnSecureToken: true
    }
  )

  const userId = res.data.localId

  // 2. Save additional user data to DB
  await axios.put(`${DB_URL}/users/${userId}.json`, {
    fullName: userData.fullName,
    username: userData.username,
    email: email
  })

  return res.data
}
