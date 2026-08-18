import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  { name: 'Organic Lettuce', category: 'leafy-greens', price: 399, stock: 25, image_url: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg', description: 'Fresh, crisp lettuce grown in our state-of-the-art hydroponic system.', harvest_date: '2025-01-10', quality: 'Premium', rating: 4.9 },
  { name: 'Cherry Tomatoes', category: 'fruits', price: 559, stock: 18, image_url: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', description: 'Sweet, vine-ripened cherry tomatoes packed with flavor and nutrients.', harvest_date: '2025-01-08', quality: 'Premium', rating: 4.8 },
  { name: 'Fresh Basil', category: 'herbs', price: 279, stock: 32, image_url: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg', description: 'Aromatic basil leaves perfect for cooking and garnishing.', harvest_date: '2025-01-12', quality: 'Premium', rating: 4.9 },
  { name: 'Baby Spinach', category: 'leafy-greens', price: 439, stock: 22, image_url: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg', description: 'Tender baby spinach leaves rich in iron and vitamins.', harvest_date: '2025-01-09', quality: 'Premium', rating: 4.7 },
  { name: 'Mixed Herbs Bundle', category: 'herbs', price: 719, stock: 15, image_url: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg', description: 'Variety pack including basil, cilantro, parsley, and mint.', harvest_date: '2025-01-11', quality: 'Premium', rating: 4.8 },
  { name: 'Cucumber', category: 'fruits', price: 239, stock: 28, image_url: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg', description: 'Crisp, refreshing cucumbers perfect for salads and snacking.', harvest_date: '2025-01-13', quality: 'Premium', rating: 4.6 },
  { name: 'Kale', category: 'leafy-greens', price: 359, stock: 20, image_url: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg', description: 'Nutrient-dense kale leaves perfect for smoothies and salads.', harvest_date: '2025-01-14', quality: 'Premium', rating: 4.7 },
  { name: 'Bell Peppers', category: 'fruits', price: 459, stock: 16, image_url: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg', description: 'Colorful bell peppers with sweet, crisp texture.', harvest_date: '2025-01-15', quality: 'Premium', rating: 4.8 }
];

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

async function seed() {
  console.log("Seeding products...");
  
  // Create a dummy user
  const auth = getAuth(app);
  let user;
  try {
      const cred = await createUserWithEmailAndPassword(auth, "farm@aztec.com", "password123");
      user = cred.user;
      await setDoc(doc(db, 'user_profiles', user.uid), {
          id: user.uid,
          email: "farm@aztec.com",
          username: "AztecFarm",
          contact: "1234567890",
          created_at: new Date().toISOString()
      });
  } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, "farm@aztec.com", "password123");
          user = cred.user;
      } else {
          throw e;
      }
  }

  for (const p of products) {
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, {
      ...p,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    // Add to shop listings
    const listingId = `${user.uid}_${docRef.id}`;
    await setDoc(doc(db, 'shop_listings', listingId), {
        user_id: user.uid,
        product_id: docRef.id,
        quantity: Math.floor(Math.random() * 30) + 10,
        price: p.price,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    console.log("Added:", p.name);
  }
  console.log("Seeding done.");
  process.exit(0);
}

seed().catch(console.error);
