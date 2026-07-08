import { create } from 'zustand'

const useCartStore = create((set, get) => ({
    items: [],

    addItem: (pizza) => set((state) => ({
        items: [...state.items, { ...pizza, id: Date.now() }],
    })),

    removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
    })),

    clearCart: () => set({ items: [] }),

    getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.itemPrice * item.quantity, 0)
    },

    getItemCount: () => get().items.length,
}))

export default useCartStore