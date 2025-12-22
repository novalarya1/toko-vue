<template>
  <div class="page-wrapper">
    <Header />

    <main class="container favorite-page">
      <h4 class="mb-4">My Favorite Items</h4>

      <!-- EMPTY STATE -->
      <div v-if="favorites.length === 0" class="empty">
        <img src="/img/empty-favorite.png" alt="Empty" />
        <p>When add item to favorite, the item will appear <br>on the favorite list</p>
      </div>

      <!-- FAVORITE LIST -->
      <div v-else class="grid">
        <ClothList
          v-for="item in favorites"
          :key="item.id"
          :cloth="item"
        />
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'

import Header from '@/components/header/Header.vue'
import Footer from '@/components/footer/Footer.vue'
import ClothList from '@/components/cloth/ClothList.vue'

import { auth, db } from '@/firebase'

const favorites = ref([])

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid)
      )

      const snapshot = await getDocs(q)

      favorites.value = snapshot.docs.map(doc => {
        const data = doc.data()

        return {
          id: data.productId || doc.id,
          name: data.name || data.title,
          price: data.price || 0,
          image: data.image || '/img/placeholder.png'
        }
      })

      console.log('✅ FAVORITES LOADED:', favorites.value)
    } catch (error) {
      console.error('🔥 Failed to load favorites:', error)
    }
  })
})
</script>

<style scoped>
.favorite-page {
  padding: 48px 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.empty {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #777;
  text-align: center;
}

.empty img {
  width: 180px;
  margin-bottom: 12px;
}
</style>
