<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Brand -->
      <div class="footer-col">
        <h3 class="brand">Vintage</h3>
        <p>About us</p>
        <p>Sustainability</p>
        <p>Blog</p>
        <p>Advertising</p>
      </div>

      <!-- Discover -->
      <div class="footer-col">
        <h4>Discover</h4>
        <p>How it works</p>
        <p>Help center</p>
        <p>Infoboard</p>
        <p>Mobile apps</p>
      </div>

      <!-- Help -->
      <div class="footer-col">
        <h4>Help</h4>
        <p>Help center</p>
        <p>Buying</p>
        <p>Trust & Safety</p>
      </div>

      <!-- Community -->
      <div class="footer-col">
        <h4>Community</h4>
        <p>Forum</p>
      </div>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background-color: #0f6b67; /* hijau seperti gambar */
  color: white;
  padding: 60px;
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}

.footer-col h3,
.footer-col h4 {
  margin-bottom: 16px;
  font-weight: 600;
}

.brand {
  font-size: 22px;
}

.footer-col p {
  margin: 8px 0;
  font-size: 14px;
  opacity: 0.9;
  cursor: pointer;
}

.footer-col p:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>
