import { createSlice } from '@reduxjs/toolkit';

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const savedItems = JSON.parse(localStorage.getItem('cartItems')) || [];

const initialState = {
  items: savedItems,
  restaurant: JSON.parse(localStorage.getItem('cartRestaurant')) || null,
  totalAmount: calculateTotal(savedItems),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { food, restaurant } = action.payload;

      // If cart is from another restaurant, reset cart
      if (state.restaurant && state.restaurant._id !== restaurant._id) {
        state.items = [];
      }
      state.restaurant = restaurant;
      localStorage.setItem('cartRestaurant', JSON.stringify(restaurant));

      const existingItem = state.items.find(item => item._id === food._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...food, quantity: 1 });
      }

      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const foodId = action.payload;
      const existingItem = state.items.find(item => item._id === foodId);
      if (existingItem) {
        if (existingItem.quantity === 1) {
          state.items = state.items.filter(item => item._id !== foodId);
        } else {
          existingItem.quantity -= 1;
        }
      }

      if (state.items.length === 0) {
        state.restaurant = null;
        localStorage.removeItem('cartRestaurant');
      }

      state.totalAmount = calculateTotal(state.items);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurant = null;
      state.totalAmount = 0;
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartRestaurant');
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
