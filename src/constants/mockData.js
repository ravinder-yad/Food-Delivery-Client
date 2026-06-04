export const CATEGORIES = [
  { id: '1', name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=200' },
  { id: '4', name: 'Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=200' },
  { id: '5', name: 'Sushi', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200' },
  { id: '6', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=200' },
];

export const RESTAURANTS = [
  {
    _id: 'res1',
    name: 'La Piazza & Pizzeria',
    description: 'Authentic stone-baked Italian pizzas and fresh pastas.',
    bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    rating: 4.8,
    numReviews: 240,
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    isOpen: true,
    estimatedDeliveryTime: '20-30 mins',
    deliveryPrice: 40,
    menu: [
      { _id: 'f101', name: 'Margherita Pizza', price: 299, description: 'Classic mozzarella, basil, and tomato sauce.', isVeg: true, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=300' },
      { _id: 'f102', name: 'Pepperoni Pizza', price: 399, description: 'Double pepperoni and mozzarella cheese.', isVeg: false, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=300' },
      { _id: 'f103', name: 'Arrabbiata Pasta', price: 249, description: 'Spicy tomato sauce with garlic and herbs.', isVeg: true, image: 'https://images.unsplash.com/photo-1563379971899-660589a0163e?auto=format&fit=crop&q=80&w=300' },
    ]
  },
  {
    _id: 'res2',
    name: 'Burger Craft & Co',
    description: 'Gourmet smashed burgers, loaded fries, and milkshakes.',
    bannerImage: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=600',
    rating: 4.5,
    numReviews: 180,
    cuisine: ['American', 'Burgers', 'Fast Food'],
    isOpen: true,
    estimatedDeliveryTime: '25-35 mins',
    deliveryPrice: 30,
    menu: [
      { _id: 'f201', name: 'Smashed Cheese Burger', price: 199, description: 'Angus beef patty, cheddar, craft sauce.', isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=300' },
      { _id: 'f202', name: 'Spicy Paneer Burger', price: 179, description: 'Crispy paneer patty with spicy mayonnaise.', isVeg: true, image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=300' },
      { _id: 'f203', name: 'Truffle Fries', price: 129, description: 'Skin-on fries tossed in truffle oil and parmesan.', isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=300' },
    ]
  },
  {
    _id: 'res3',
    name: 'The Royal Biryani',
    description: 'Legacy Dum Biryani, Mughlai specialities and kebabs.',
    bannerImage: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=600',
    rating: 4.7,
    numReviews: 520,
    cuisine: ['Mughlai', 'Biryani', 'North Indian'],
    isOpen: true,
    estimatedDeliveryTime: '35-45 mins',
    deliveryPrice: 50,
    menu: [
      { _id: 'f301', name: 'Hyderabadi Chicken Biryani', price: 349, description: 'Fragrant basmati rice layered with spiced marinated chicken.', isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=300' },
      { _id: 'f302', name: 'Paneer Tikka Biryani', price: 299, description: 'Rich paneer tikka chunks layered with aromatic rice.', isVeg: true, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=300' },
      { _id: 'f303', name: 'Murgh Malai Kebab', price: 279, description: 'Creamy grilled chicken skewers melt-in-mouth.', isVeg: false, image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=300' },
    ]
  }
];
