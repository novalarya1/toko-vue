import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []
  }),

  getters: {
    totalItems(state) {
      return state.items.reduce((sum, item) => sum + item.qty, 0)
    },
    totalPrice(state) {
      return state.items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      )
    }
  },

  actions: {
    addItem(item) {
      const cartKey = `${item.id}-${item.size}`

      const existing = this.items.find(
        i => i.cartKey === cartKey
      )

      if (existing) {
        existing.qty += 1
      } else {
        this.items.push({
          cartKey,
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          size: item.size,
          qty: 1
        })
      }
    },

    increaseQty(cartKey) {
      const item = this.items.find(i => i.cartKey === cartKey)
      if (item) item.qty++
    },

    decreaseQty(cartKey) {
      const item = this.items.find(i => i.cartKey === cartKey)
      if (!item) return

      item.qty--
      if (item.qty <= 0) {
        this.removeItem(cartKey)
      }
    },

    removeItem(cartKey) {
      this.items = this.items.filter(
        i => i.cartKey !== cartKey
      )
    },

    clearCart() {
      this.items = []
    }
  }
})
