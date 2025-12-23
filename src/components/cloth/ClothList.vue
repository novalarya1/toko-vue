<template>
  <div class="card-wrapper">
    <!-- ❤️ FAVORITE -->
    <button
      class="favorite-btn"
      @click.stop="toggleFavorite"
    >
      <i
        :class="isFavorite
          ? 'fa-solid fa-heart active'
          : 'fa-regular fa-heart'"
      ></i>
    </button>

    <!-- CARD -->
    <router-link
      :to="`/products/${cloth.id}`"
      class="card"
    >
      <!-- IMAGE -->
      <div class="image-wrapper">
        <img
          :src="cloth.image || '/img/placeholder.png'"
          :alt="cloth.name"
        />
      </div>

      <!-- BODY -->
      <div class="card-body">
        <h4 class="title">
          {{ cloth.name || 'No Title' }}
        </h4>

        <p class="price">
          Rp{{ cloth.price?.toLocaleString('id-ID') || '0' }}
        </p>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'

/* ================= PROPS ================= */
const props = defineProps({
  cloth: {
    type: Object,
    required: true
  }
})

/* ================= STATE ================= */
const user = ref(null)
const favorites = ref([])

/* ================= AUTH & FETCH FAVORITES ================= */
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

/* ================= COMPUTED ================= */
const isFavorite = computed(() =>
  favorites.value.some(
    f => f.productId === props.cloth.id
  )
)

/* ================= TOGGLE FAVORITE ================= */
const toggleFavorite = async () => {
  if (!user.value) {
    alert('Please login first')
    return
  }

  const existing = favorites.value.find(
    f => f.productId === props.cloth.id
  )

  // REMOVE
  if (existing) {
    await deleteDoc(doc(db, 'favorites', existing.id))
    favorites.value = favorites.value.filter(
      f => f.id !== existing.id
    )
    return
  }

  // ADD (PASTI TIDAK UNDEFINED)
  const payload = {
    userId: user.value.uid,
    productId: props.cloth.id,
    name: props.cloth.name || '',
    price: props.cloth.price || 0,
    image: props.cloth.image || '',
    createdAt: serverTimestamp()
  }

  const docRef = await addDoc(
    collection(db, 'favorites'),
    payload
  )

  favorites.value.push({
    id: docRef.id,
    productId: props.cloth.id
  })
}
</script>

<style scoped>
/* WRAPPER */
.card-wrapper {
  position: relative;
  height: 100%;
}

/* ❤️ FAVORITE */
.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(255,255,255,0.95);
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.favorite-btn i {
  font-size: 16px;
  color: #9ca3af;
}

.favorite-btn i.active {
  color: #ef4444;
}

/* CARD */
.card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,.08);
}

/* IMAGE */
.image-wrapper {
  width: 100%;
  height: 220px;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* BODY */
.card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* TITLE */
.title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 8px;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* PRICE */
.price {
  margin-top: auto;
  color: #0f766e;
  font-weight: 600;
  font-size: 14px;
}
</style>