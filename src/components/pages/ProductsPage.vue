<template>
  <div class="page-wrapper">
    <!-- Header -->
    <Header @search="handleSearch" />

    <!-- MAIN CONTENT -->
    <main class="products-page">
      <!-- TOP BAR -->
      <div class="top-bar">
        <h3>Items</h3>
        <div class="filters">
          <select v-model="selectedCategory">
            <option value="">All</option>
            <option value="T-Shirt">T-Shirt</option>
            <option value="Polo">Polo</option>
            <option value="Hoodie">Hoodie</option>
          </select>
        </div>
      </div>

      <!-- LOADING -->
      <p v-if="loading" class="loading">Loading...</p>

      <!-- EMPTY STATE -->
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <img src="/img/empty.png" alt="Empty" />
        <h4>Product not found</h4>
        <p>
          We cannot find what you are looking for,
          try to use other keywords or reset keyword.
        </p>
        <button @click="resetFilter" class="btn-reset">
          Reset Filter
        </button>
      </div>

      <!-- GRID -->
      <div v-else class="product-grid">
        <ClothList
          v-for="item in filteredProducts"
          :key="item.id"
          :cloth="item"
        />
      </div>
    </main>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from '@/components/header/Header.vue'
import Footer from '@/components/footer/Footer.vue'
import ClothList from '@/components/cloth/ClothList.vue'
import { getProducts } from '@/services/productService'

const products = ref([])
const loading = ref(true)
const selectedCategory = ref('')
const keyword = ref('') // search keyword

// tangkap event search dari Header
const handleSearch = (value) => {
  keyword.value = value.toLowerCase()
}

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

// filteredProducts dengan kategori + search keyword
const filteredProducts = computed(() => {
  let result = products.value

  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  if (keyword.value) {
    result = result.filter(p => p.name.toLowerCase().includes(keyword.value))
  }

  return result
})

// reset filter dan keyword
const resetFilter = () => {
  selectedCategory.value = ''
  keyword.value = ''
}
</script>

<style scoped>
.products-page {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* TOP BAR */
.top-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
}

.top-bar h3 {
  font-size: 1.8rem;
  font-weight: 600;
}

.filters select {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #ddd;
  min-width: 120px;
}

/* GRID */
.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

/* EMPTY STATE */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
  text-align: center;
  padding: 20px;
}

.empty-state img {
  width: 140px;
  margin-bottom: 20px;
}

.empty-state h4 {
  font-weight: 600;
  font-size: 1.4rem;
  margin-bottom: 8px;
}

.empty-state p {
  color: #555;
  margin-bottom: 20px;
}

.btn-reset {
  background: #0f766e;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-reset:hover {
  background: #115e59;
}

/* LOADING */
.loading {
  text-align: center;
  padding: 60px 0;
  font-size: 1.2rem;
  color: #555;
}

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* konten utama ngisi sisa tinggi */
.products-page {
  flex: 1;
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
