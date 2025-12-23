<template>
  <div class="page-wrapper">
    <Header />

    <main class="order-page container">
      <h4 class="mb-4">Order Confirmation</h4>

      <div class="row">
        <!-- LEFT -->
        <div class="col-md-8">
          <!-- ORDER ITEMS -->
          <div class="box mb-4">
            <h6 class="box-title">Order</h6>
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="order-item d-flex align-items-center"
            >
              <img :src="item.image" class="order-image" />
              <div class="flex-grow-1 ms-3">
                <p class="fw-semibold mb-1">{{ item.title }}</p>
                <small class="text-muted">{{ item.size }} / {{ item.qty }} pcs</small>
              </div>
              <p class="fw-semibold">Rp{{ (item.price * item.qty).toLocaleString('id-ID') }}</p>
            </div>
          </div>

          <!-- SHIPPING -->
          <div class="box mb-4">
            <h6 class="box-title">Shipping Address</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <input v-model="shipping.fullName" type="text" placeholder="Full Name" class="form-control" />
              </div>
              <div class="col-md-6">
                <input v-model="shipping.phone" type="text" placeholder="Phone Number" class="form-control" />
              </div>
              <div class="col-12">
                <textarea v-model="shipping.address" placeholder="Street name, house number..." class="form-control" rows="2"></textarea>
              </div>
              <div class="col-md-6">
                <input v-model="shipping.city" type="text" placeholder="City" class="form-control" />
              </div>
              <div class="col-md-6">
                <input v-model="shipping.postalCode" type="text" placeholder="Postal Code" class="form-control" />
              </div>
            </div>
          </div>

          <!-- DELIVERY -->
          <div class="box mb-4">
            <h6 class="box-title">Delivery Details</h6>
            <div class="delivery-options">
              <div
                v-for="option in deliveryOptions"
                :key="option.id"
                class="delivery-option d-flex justify-content-between align-items-center"
                :class="{ active: selectedDelivery === option.id }"
                @click="selectedDelivery = option.id"
              >
                <div class="d-flex align-items-center">
                  <i class="fa fa-truck me-2"></i>
                  <div>
                    <strong>{{ option.title }}</strong>
                    <p class="text-muted mb-0">{{ option.duration }}</p>
                  </div>
                </div>
                <span class="text-green">+ Rp{{ option.fee.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>

          <!-- PAYMENT -->
          <div class="box mb-4">
            <h6 class="box-title">Payment Method</h6>
            <div class="payment-options">
              <div
                v-for="method in paymentMethods"
                :key="method.id"
                class="payment-option d-flex justify-content-between align-items-center"
                :class="{ active: selectedPayment === method.id }"
                @click="selectedPayment = method.id"
              >
                <div class="d-flex align-items-center">
                  <i class="fa fa-credit-card me-2" v-if="method.id === 1"></i>
                  <i class="fa fa-money-bill-wave me-2" v-else></i>
                  <div>
                    <strong>{{ method.title }}</strong>
                    <small class="text-muted d-block">{{ method.detail }}</small>
                  </div>
                </div>
                <span v-if="selectedPayment === method.id" class="checkmark">✔</span>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT SUMMARY -->
        <div class="col-md-4">
          <div class="summary-box">
            <h6 class="mb-3">Order summary</h6>
            <div class="summary-row">
              <span>Order</span>
              <span>Rp{{ cart.totalPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="summary-row">
              <span>Protection fee</span>
              <span>Rp{{ PROTECTION_FEE.toLocaleString('id-ID') }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>Rp{{ deliveryFee.toLocaleString('id-ID') }}</span>
            </div>
            <hr />
            <div class="summary-row total">
              <span>Total to pay</span>
              <span>Rp{{ totalPay.toLocaleString('id-ID') }}</span>
            </div>
            <button class="order-btn mt-3" @click="submitOrder">Order Now</button>
          </div>
        </div>
      </div>
    </main>

    <Footer />

    <!-- SUCCESS MODAL -->
    <div v-if="showSuccess" class="modal-overlay">
      <div class="modal-card">
        <img src="/img/payment-success.png" alt="Success" class="modal-icon" />
        <h5 class="mt-3">
          Order #ORD-{{ orderId?.slice(0, 6).toUpperCase() }} <br />
          placed successfully
        </h5>
        <p class="text-muted mt-2">
          Thank you for shopping at Vintage.<br />
          You can track and see your order in the transaction history menu.
        </p>
        <button class="modal-btn outline" @click="goHome">Continue shopping</button>
        <button class="modal-btn primary" @click="goToOrders">Go to History Transaction</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/header/Header.vue'
import Footer from '@/components/footer/Footer.vue'
import { useCartStore } from '@/stores/cart'
import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const cart = useCartStore()
const router = useRouter()

const showSuccess = ref(false)
const orderId = ref(null)
const user = ref(null)

const PROTECTION_FEE = 2000

const shipping = ref({
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: ''
})

const deliveryOptions = ref([
  { id: 1, title: 'Standard', duration: '3-5 days', fee: 20000 },
  { id: 2, title: 'Express', duration: '1-2 days', fee: 40000 }
])
const paymentMethods = ref([
  { id: 1, title: 'Credit Card', detail: 'Visa, MasterCard, etc.' },
  { id: 2, title: 'COD', detail: 'Cash on delivery' }
])

const selectedDelivery = ref(deliveryOptions.value[0].id)
const selectedPayment = ref(paymentMethods.value[0].id)

const deliveryFee = computed(() => deliveryOptions.value.find(o => o.id === selectedDelivery.value)?.fee || 0)
const totalPay = computed(() => cart.totalPrice + deliveryFee.value + PROTECTION_FEE)

onMounted(() => {
  onAuthStateChanged(auth, u => user.value = u)
  if (!cart.items.length) router.push('/products')
})

const submitOrder = async () => {
  try {
    if (!user.value) throw new Error('USER NOT LOGIN')
    if (!cart.items.length) throw new Error('CART EMPTY')
    if (!shipping.value.fullName || !shipping.value.phone || !shipping.value.address) {
      alert('Please fill all shipping details')
      return
    }

    const orderItems = cart.items.map(item => ({
      title: item.title || 'No title',
      price: item.price || 0,
      qty: item.qty || 1,
      size: item.size || null,
      image: item.image || null
    }))

    const orderData = {
      userId: user.value.uid,
      items: orderItems,
      subtotal: cart.totalPrice,
      shippingFee: deliveryFee.value,
      protectionFee: PROTECTION_FEE,
      total: totalPay.value,
      deliveryOption: selectedDelivery.value,
      paymentMethod: selectedPayment.value,
      status: 'Processing',
      shipping: shipping.value,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'orders'), orderData)
    orderId.value = docRef.id
    cart.clearCart()
    showSuccess.value = true
  } catch (err) {
    alert(err.message)
    console.error(err)
  }
}

const goHome = () => { showSuccess.value = false; router.push('/products') }
const goToOrders = () => router.push({ path: '/profile', query: { tab: 'history' } })
</script>

<style scoped>
.order-page { 
  padding: 48px 0; 
}

.box { 
  border: 1px solid #e5e7eb; 
  border-radius: 12px; 
  padding: 20px; 
}

.box-title { 
  font-weight: 600; 
  margin-bottom: 16px; 
}

.order-item { 
  padding: 12px 0; 
  border-bottom: 1px solid #e5e7eb; 
}

.order-item:last-child { 
  border-bottom: none; 
}

.order-image { 
  width: 64px; 
  height: 64px; 
  border-radius: 10px; 
  object-fit: cover; 
}

.summary-box { 
  border: 1px solid #e5e7eb; 
  border-radius: 12px; 
  padding: 20px; 
  position: sticky; 
  top: 100px; 
}

.summary-row { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 8px; 
}

.summary-row.total { 
  font-weight: 700; 
}

.order-btn { 
  width: 100%; 
  background-color: #0f6b67; 
  color: white; 
  border: none; 
  padding: 14px; 
  border-radius: 10px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: 0.3s; 
}

.order-btn:hover { 
  background-color: #0c5c59; 
}

.delivery-option, 
.payment-option { 
  padding: 12px; 
  border: 1px solid #e5e7eb; 
  border-radius: 10px; 
  margin-bottom: 8px; 
  cursor: pointer; 
  transition: 0.3s; 
}

.delivery-option.active, 
.payment-option.active { 
  border-color: #0f6b67; 
  background-color: #f0fdfd; 
}

.modal-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.6); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 9999; 
}

.modal-card { 
  background: white; 
  width: 360px; 
  padding: 32px 24px; 
  border-radius: 14px; 
  text-align: center; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
}

.modal-icon { 
  width: 120px; 
  height: auto; 
  margin-bottom: 16px; 
  animation: pop 0.4s ease-out; 
}

.modal-btn { 
  width: 100%; 
  padding: 12px; 
  border-radius: 8px; 
  font-weight: 600; 
  margin-top: 12px; 
  cursor: pointer; 
}

.modal-btn.primary { 
  background-color: #0f6b67; 
  color: white; 
  border: none; 
}

.modal-btn.outline { 
  background: transparent; 
  border: 1px solid #0f6b67; 
  color: #0f6b67; 
}

.checkmark { 
  color: #0f6b67; 
  font-weight: bold; 
}

@keyframes 
  pop { 0% { 
    transform: scale(0.8); 
    opacity: 0; 
  } 
  100% { 
    transform: scale(1); 
    opacity: 1; 
  } 
}
</style>
