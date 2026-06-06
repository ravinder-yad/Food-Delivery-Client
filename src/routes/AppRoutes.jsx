import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home.jsx';
import Login from '../pages/Login/Login.jsx';
import Register from '../pages/Register/Register.jsx';
import Restaurants from '../pages/Restaurants/Restaurants.jsx';
import RestaurantDetails from '../pages/RestaurantDetails/RestaurantDetails.jsx';
import Cart from '../pages/Cart/Cart.jsx';
import Checkout from '../pages/Checkout/Checkout.jsx';
import Orders from '../pages/Orders/Orders.jsx';
import Tracking from '../pages/Tracking/Tracking.jsx';
import Wishlist from '../pages/Wishlist/Wishlist.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import Categories from '../pages/Categories/Categories.jsx';
import Offers from '../pages/Offers/Offers.jsx';
import BecomePartner from '../pages/BecomePartner/BecomePartner.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/restaurants" element={<Restaurants />} />
      <Route path="/restaurants/:id" element={<RestaurantDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/tracking/:id" element={<Tracking />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/become-partner" element={<BecomePartner />} />
    </Routes>
  );
}
