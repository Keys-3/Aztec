import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  getDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export type User = {
  id: string;
  email: string;
  username: string;
  contact: string;
  role?: 'customer' | 'farmer' | 'admin';
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  description: string;
  harvest_date: string;
  quality: string;
  rating: number;
  created_at: string;
  updated_at: string;
  forSale?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
};

export type UserInventory = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  user_profiles?: { username: string };
};

export type ShopListing = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  user_profiles?: { username: string };
};

// Helper to fetch a product by ID
const getProductById = async (productId: string): Promise<Product | null> => {
  const productDoc = await getDoc(doc(db, 'products', productId));
  if (productDoc.exists()) {
    return { id: productDoc.id, ...productDoc.data() } as Product;
  }
  return null;
};

// Inventory management functions
export const getUserInventory = async (userId: string): Promise<UserInventory[]> => {
  try {
    const q = query(
      collection(db, 'user_inventory'), 
      where('user_id', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const inventory: UserInventory[] = [];
    for (const d of querySnapshot.docs) {
      const data = d.data();
      const product = await getProductById(data.product_id);
      inventory.push({
        id: d.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        created_at: data.created_at,
        updated_at: data.updated_at,
        product: product || undefined
      });
    }
    return inventory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching user inventory:', error);
    throw error;
  }
};

export const getAllUserInventory = async (): Promise<UserInventory[]> => {
  try {
    const q = query(collection(db, 'user_inventory'));
    const querySnapshot = await getDocs(q);
    
    const inventory: UserInventory[] = [];
    for (const d of querySnapshot.docs) {
      const data = d.data();
      const product = await getProductById(data.product_id);
      
      let username = 'Unknown';
      const userDoc = await getDoc(doc(db, 'user_profiles', data.user_id));
      if (userDoc.exists()) {
        username = userDoc.data().username;
      }

      inventory.push({
        id: d.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        created_at: data.created_at,
        updated_at: data.updated_at,
        product: product || undefined,
        user_profiles: { username }
      });
    }
    return inventory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching all user inventory:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const inventoryId = `${userId}_${productId}`;
    await deleteDoc(doc(db, 'user_inventory', inventoryId));
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
};

export const updateInventoryQuantity = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
  try {
    const inventoryId = `${userId}_${productId}`;
    const docRef = doc(db, 'user_inventory', inventoryId);
    
    await setDoc(docRef, {
      user_id: userId,
      product_id: productId,
      quantity: Math.max(0, quantity),
      updated_at: new Date().toISOString()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    return false;
  }
};

export const addInventoryQuantity = async (userId: string, productId: string, addedQuantity: number): Promise<boolean> => {
  try {
    const inventoryId = `${userId}_${productId}`;
    const docRef = doc(db, 'user_inventory', inventoryId);
    
    const snap = await getDoc(docRef);
    const currentQuantity = snap.exists() ? snap.data().quantity || 0 : 0;
    
    await setDoc(docRef, {
      user_id: userId,
      product_id: productId,
      quantity: Math.max(0, currentQuantity + addedQuantity),
      updated_at: new Date().toISOString(),
      created_at: snap.exists() ? snap.data().created_at : new Date().toISOString()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error adding inventory quantity:', error);
    return false;
  }
};

export const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
  try {
    const newProductRef = doc(collection(db, 'products'));
    const now = new Date().toISOString();
    await setDoc(newProductRef, {
      ...productData,
      created_at: now,
      updated_at: now
    });
    return newProductRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<boolean> => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

export const getUserShopListings = async (userId: string): Promise<ShopListing[]> => {
  try {
    // Fetch all listings for user and filter active in memory to avoid composite index requirement
    const q = query(
      collection(db, 'shop_listings'),
      where('user_id', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const listings: ShopListing[] = [];
    for (const d of querySnapshot.docs) {
      const data = d.data();
      if (data.status !== 'active') continue; // Client-side filter
      
      const product = await getProductById(data.product_id);
      listings.push({
        id: d.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        price: data.price,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        product: product || undefined
      });
    }
    return listings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching shop listings:', error);
    throw error;
  }
};

export const getAllShopListings = async (): Promise<ShopListing[]> => {
  try {
    // Fetch active status only and filter quantity > 0 in memory to avoid composite index requirement
    const q = query(
      collection(db, 'shop_listings'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    
    const listings: ShopListing[] = [];
    for (const d of querySnapshot.docs) {
      const data = d.data();
      if (data.quantity <= 0) continue; // Client-side filter

      const product = await getProductById(data.product_id);
      
      let username = 'Unknown';
      const userDoc = await getDoc(doc(db, 'user_profiles', data.user_id));
      if (userDoc.exists()) {
        username = userDoc.data().username;
      }

      listings.push({
        id: d.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        price: data.price,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        product: product || undefined,
        user_profiles: { username }
      });
    }
    return listings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.error('Error fetching all shop listings:', error);
    throw error;
  }
};

export const createShopListing = async (userId: string, productId: string, quantity: number, price: number): Promise<boolean> => {
  try {
    const listingId = `${userId}_${productId}`;
    const docRef = doc(db, 'shop_listings', listingId);
    
    const now = new Date().toISOString();
    await setDoc(docRef, {
      user_id: userId,
      product_id: productId,
      quantity,
      price,
      status: 'active',
      updated_at: now
    }, { merge: true });
    
    // Set created_at only if it's new
    const snap = await getDoc(docRef);
    if (!snap.data()?.created_at) {
        await updateDoc(docRef, { created_at: now });
    }

    return true;
  } catch (error) {
    console.error('Error creating shop listing:', error);
    return false;
  }
};

export const removeShopListing = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const listingId = `${userId}_${productId}`;
    await deleteDoc(doc(db, 'shop_listings', listingId));
    return true;
  } catch (error) {
    console.error('Error removing shop listing:', error);
    return false;
  }
};

export const updateShopListing = async (userId: string, productId: string, updates: { quantity?: number, price?: number }): Promise<boolean> => {
  try {
    const listingId = `${userId}_${productId}`;
    const docRef = doc(db, 'shop_listings', listingId);
    
    await updateDoc(docRef, { 
        ...updates,
        updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating shop listing:', error);
    return false;
  }
};

export const updateShopListingQuantity = async (userId: string, productId: string, quantity: number): Promise<boolean> => {
  if (quantity <= 0) {
    return removeShopListing(userId, productId);
  }

  try {
    const listingId = `${userId}_${productId}`;
    const docRef = doc(db, 'shop_listings', listingId);
    
    await updateDoc(docRef, { 
        quantity,
        updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating shop listing quantity:', error);
    return false;
  }
};

export const processOrderQuantities = async (items: { product_id: string, quantity: number }[]): Promise<void> => {
  try {
    for (const item of items) {
      // Find the active shop listing for this product
      const q = query(
        collection(db, 'shop_listings'),
        where('product_id', '==', item.product_id),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Assume one active listing per product
        const listingDoc = snapshot.docs[0];
        const listingData = listingDoc.data();
        const currentQty = listingData.quantity || 0;
        const newQty = Math.max(0, currentQty - item.quantity);
        
        await updateDoc(listingDoc.ref, {
          quantity: newQty,
          updated_at: new Date().toISOString()
        });

        // Sync user_inventory as well
        const userId = listingData.user_id;
        if (userId) {
          const invId = `${userId}_${item.product_id}`;
          const invRef = doc(db, 'user_inventory', invId);
          const invSnap = await getDoc(invRef);
          if (invSnap.exists()) {
             const currentInvQty = invSnap.data().quantity || 0;
             await updateDoc(invRef, {
                quantity: Math.max(0, currentInvQty - item.quantity),
                updated_at: new Date().toISOString()
             });
          }
        }
      }

      // Also update the global product stock
      const productRef = doc(db, 'products', item.product_id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, {
          stock: Math.max(0, currentStock - item.quantity),
          updated_at: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error processing order quantities:', error);
  }
};

export const restoreOrderQuantities = async (orderId: string): Promise<void> => {
  try {
    // 1. Fetch order items
    const itemsQ = query(collection(db, 'order_items'), where('order_id', '==', orderId));
    const itemsSnapshot = await getDocs(itemsQ);
    
    for (const itemDoc of itemsSnapshot.docs) {
      const itemData = itemDoc.data();
      const productId = itemData.product_id;
      const quantityToRestore = itemData.quantity;

      // 2. Restore to shop_listings if it exists
      const shopQ = query(collection(db, 'shop_listings'), where('product_id', '==', productId));
      const shopSnapshot = await getDocs(shopQ);
      
      if (!shopSnapshot.empty) {
        const listingDoc = shopSnapshot.docs[0];
        const currentQty = listingDoc.data().quantity || 0;
        await updateDoc(listingDoc.ref, {
          quantity: currentQty + quantityToRestore,
          status: 'active', // Reactivate if it was out of stock
          updated_at: new Date().toISOString()
        });
        
        // Also restore to user_inventory for the farmer who listed it
        const listingUserId = listingDoc.data().user_id;
        if (listingUserId) {
          const inventoryId = `${listingUserId}_${productId}`;
          const invRef = doc(db, 'user_inventory', inventoryId);
          const invSnap = await getDoc(invRef);
          if (invSnap.exists()) {
             const currentInvQty = invSnap.data().quantity || 0;
             await updateDoc(invRef, {
                quantity: currentInvQty + quantityToRestore,
                updated_at: new Date().toISOString()
             });
          }
        }
      }

      // 3. Restore global product stock
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, {
          stock: currentStock + quantityToRestore,
          updated_at: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error restoring order quantities:', error);
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updated_at: new Date().toISOString()
    });
    
    if (status === 'cancelled' || status === 'returned') {
      await restoreOrderQuantities(orderId);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
  try {
    const userRef = doc(db, 'user_profiles', userId);
    await updateDoc(userRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};
