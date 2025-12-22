import { rtdb } from '@/firebase'
import { ref, get } from 'firebase/database'

export const getProducts = async () => {
  const snapshot = await get(ref(rtdb, 'products'))

  if (!snapshot.exists()) {
    return []
  }

  const data = snapshot.val()

  return Object.keys(data).map(id => ({
    id,
    name: data[id].name,
    price: data[id].price,
    image: data[id].image, // ⚠️ PENTING
    category: data[id].category
  }))
}
