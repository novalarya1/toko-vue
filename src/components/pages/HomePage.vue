<template>
  <Header />

  <!-- HERO -->
  <section class="hero">
    <div class="hero-overlay">
      <h2>
        Ready to declutter <br />
        your closet?
      </h2>
      <button class="btn-primary">Shop Now</button>
    </div>
  </section>

  <!-- POPULAR -->
  <section class="section">
    <div class="section-header">
      <h3>Popular Products</h3>
      <router-link to="/products" class="see-all">
        See all
      </router-link>
    </div>

    <p v-if="loading" class="loading">Loading...</p>

    <div v-else class="product-grid">
      <ClothList
        v-for="item in popularProducts"
        :key="item.id"
        :cloth="item"
      />
    </div>
  </section>

  <!-- NEW -->
  <section class="section">
    <div class="section-header">
      <h3>New Products</h3>
      <router-link to="/products" class="see-all">
        See all
      </router-link>

    </div>

    <div class="product-grid">
      <ClothList
        v-for="item in newProducts"
        :key="item.id"
        :cloth="item"
      />
    </div>
  </section>

  <Footer />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Header from '@/components/header/Header.vue'
import Footer from '@/components/footer/Footer.vue'
import ClothList from '@/components/cloth/ClothList.vue'
import { getProducts } from '@/services/productService'

const products = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (err) {
    console.error('ERROR FETCH PRODUCTS:', err)
  } finally {
    loading.value = false
  }
})

const popularProducts = computed(() => products.value.slice(0, 5))
const newProducts = computed(() => products.value.slice(5))
</script>


<style scoped>
/* HERO */
.hero {
  height: 380px;
  background: url('/img/hero.jpg') center / cover no-repeat;
  position: relative;
}

.hero-overlay {
  position: absolute;
  top: 30%;
  left: 60px;
  background: white;
  padding: 28px;
  border-radius: 8px;
  max-width: 360px;
}

.hero-overlay h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

/* SECTION */
.section {
  padding: 40px 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 600;
}

/* SEE ALL */
.see-all {
  font-size: 14px;
  color: #4c4ddc;
  text-decoration: none;
  font-weight: 500;
}

.see-all:hover {
  text-decoration: underline;
}

/* LOADING */
.loading {
  text-align: center;
  padding: 40px 0;
}

/* GRID */
.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

/* BUTTON */
.btn-primary {
  background: #0f766e;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 16px rgba(55, 56, 180, 0.25);
}

.btn-primary:hover {
  background: #0c5c59;
  box-shadow: 0 8px 20px rgba(76, 77, 220, 0.35);
  transform: translateY(-1px);
}

</style>
