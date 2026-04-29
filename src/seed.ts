import { db, COLLECTIONS } from './lib/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

const PRODUCTS = [
  {
    name: "Royal Blue Silk Kurti Set",
    description: "Elegant silk kurti set with exquisite embroidery and matching dupatta. Perfect for festive occasions.",
    price: 2899,
    originalPrice: 3499,
    category: "Kurti Sets",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"],
    sizes: ["S", "M", "L", "XL"],
    inventory: 20,
    featured: true
  },
  {
    name: "Beige Floral Kurti Set",
    description: "Premium cotton kurti set with floral prints and contrast patterns. Lightweight and breathable.",
    price: 2499,
    originalPrice: 2999,
    category: "Kurti Sets",
    images: ["https://images.unsplash.com/photo-1610030469668-809831969248?w=800"],
    sizes: ["M", "L", "XL", "XXL"],
    inventory: 15,
    featured: true
  },
  {
    name: "Emerald Green Kanchipuram Saree",
    description: "Traditional hand-woven Kanchipuram silk saree with rich zari border and pallu.",
    price: 8500,
    originalPrice: 12000,
    category: "Sarees",
    images: ["https://images.unsplash.com/photo-1610030469668-809831969248?w=800"],
    sizes: ["Free Size"],
    inventory: 5,
    featured: true
  },
  {
    name: "Classic White Chikankari Kurti",
    description: "Hand-embroidered Chikankari work on pure cotton fabric. Perfect for summer days.",
    price: 1899,
    originalPrice: 2200,
    category: "Kurtis",
    images: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800"],
    sizes: ["S", "M", "L"],
    inventory: 30,
    featured: false
  },
  {
    name: "Magenta Mangalgiri Suit Set",
    description: "Authentic Mangalgiri cotton-silk suit set with signature Nizam border.",
    price: 3200,
    originalPrice: 3800,
    category: "Mangalgiri Suits",
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"],
    sizes: ["M", "L", "XL"],
    inventory: 12,
    featured: true
  }
];

// Helper to generate more variants
const CATEGORIES = ["New Arrivals", "Best Sellers", "Skirts & Dresses", "Sarees", "Kurti Sets", "Blouses", "Deals"];
const ADJECTIVES = ["Elegant", "Royal", "Graceful", "Vibrant", "Chic", "Traditional", "Modern", "Handcrafted"];
const COLORS = ["Midnight Blue", "Crimson Red", "Forest Green", "Golden Yellow", "Pastel Pink", "Ivory White", "Lavender", "Turquoise"];

const generateProducts = () => {
  const result: any[] = [];
  
  CATEGORIES.forEach(cat => {
    for (let i = 0; i < 10; i++) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const basePrice = 1500 + Math.floor(Math.random() * 5000);
      
      result.push({
        name: `${adj} ${color} ${cat.replace(/s$/i, '')} ${i + 1}`,
        description: `Premium ${color.toLowerCase()} ${cat.toLowerCase()} from our luxury collection. Crafted with the finest fabrics and intricate detailing.`,
        price: basePrice,
        originalPrice: Math.floor(basePrice * 1.25),
        category: cat,
        images: [
          `https://images.unsplash.com/photo-${1583391733956 + (cat.length * 100) + i}-6c78276477e2?w=800`
        ],
        sizes: cat === "Sarees" ? ["Free Size"] : ["S", "M", "L", "XL"],
        inventory: 15 + Math.floor(Math.random() * 30),
        featured: i === 0,
        createdAt: serverTimestamp()
      });
    }
  });

  return result;
};

export const seedDatabase = async () => {
  const products = generateProducts();
  const batch = writeBatch(db);
  const productsCol = collection(db, COLLECTIONS.PRODUCTS);
  
  console.log(`Seeding ${products.length} products...`);
  
  products.forEach(p => {
    const newDocRef = doc(productsCol);
    batch.set(newDocRef, {
      ...p,
      createdAt: serverTimestamp()
    });
  });

  try {
    await batch.commit();
    console.log("Seeding complete!");
    return true;
  } catch (error) {
    console.error("Error seeding:", error);
    throw error;
  }
};
