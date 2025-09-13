import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, CartItem, UserInventory, ShopListing } from '../lib/supabase';

interface SellingItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  sellingItems: SellingItem[];
  inventory: UserInventory[];
  shopListings: ShopListing[];
  total: number;
  itemCount: number;
}

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => void;
  addToSelling: (product: Product, quantity: number) => void;
  removeFromSelling: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateInventoryQuantity: (productId: string, quantity: number) => void;
  loadUserData: (inventory: UserInventory[], shopListings: ShopListing[]) => void;
  getInventoryQuantity: (productId: string) => number;
  getShopQuantity: (productId: string) => number;
  clearCart: () => void;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'ADD_TO_SELLING'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_SELLING'; payload: string }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'UPDATE_INVENTORY_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'LOAD_USER_DATA'; payload: { inventory: UserInventory[]; shopListings: ShopListing[] } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[]; sellingItems: SellingItem[] } }
  | { type: 'CLEAR_USER_DATA' };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.product.id === action.payload.product.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product: action.payload.product, quantity: action.payload.quantity }];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'ADD_TO_SELLING': {
      const existingItem = state.sellingItems.find(item => item.product.id === action.payload.product.id);
      
      let newSellingItems: SellingItem[];
      if (existingItem) {
        newSellingItems = state.sellingItems.map(item =>
          item.product.id === action.payload.product.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Mark product as for sale and add to selling items
        const productForSale = { ...action.payload.product, forSale: true };
        newSellingItems = [...state.sellingItems, { product: productForSale, quantity: action.payload.quantity }];
      }
      
      return { ...state, sellingItems: newSellingItems };
    }
    
    case 'UPDATE_INVENTORY_QUANTITY': {
      const newInventory = state.inventory.map(item =>
        item.product_id === action.payload.productId
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      );
      
      return { ...state, inventory: newInventory };
    }
    
    case 'LOAD_USER_DATA': {
      // Convert inventory and shop listings to selling items format for compatibility
      const sellingItems: SellingItem[] = action.payload.shopListings.map(listing => ({
        product: listing.product!,
        quantity: listing.quantity
      }));
      
      return { 
        ...state, 
        inventory: action.payload.inventory,
        shopListings: action.payload.shopListings,
        sellingItems
      };
    }
    
    case 'REMOVE_FROM_SELLING': {
      const newSellingItems = state.sellingItems.filter(item => item.product.id !== action.payload);
      return { ...state, sellingItems: newSellingItems };
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.product.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.product.id === action.payload.productId
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return { ...state, items: newItems, total, itemCount };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0, itemCount: 0 };
    
    case 'CLEAR_USER_DATA':
      return { ...state, inventory: [], shopListings: [], sellingItems: [] };
    
    case 'LOAD_CART': {
      const total = action.payload.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = action.payload.items.reduce((sum, item) => sum + item.quantity, 0);
      
      return { 
        items: action.payload.items, 
        sellingItems: action.payload.sellingItems || [],
        total, 
        itemCount 
      };
    }
    
    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    sellingItems: [],
    inventory: [],
    shopListings: [],
    total: 0,
    itemCount: 0,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    // Only load cart if user wants to be remembered or is currently signed in
    const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
    if (!rememberMe) {
      // Clear cart data for users who don't want to be remembered
      localStorage.removeItem('aztec-cart');
      localStorage.removeItem('aztec-selling');
      return;
    }
    
    const savedCart = localStorage.getItem('aztec-cart');
    const savedSelling = localStorage.getItem('aztec-selling');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        const sellingItems = savedSelling ? JSON.parse(savedSelling) : [];
        dispatch({ type: 'LOAD_CART', payload: { items: cartItems, sellingItems } });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('aztec-cart');
        localStorage.removeItem('aztec-selling');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save cart if user wants to be remembered
    const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
    if (rememberMe) {
      localStorage.setItem('aztec-cart', JSON.stringify(state.items));
      localStorage.setItem('aztec-selling', JSON.stringify(state.sellingItems));
    }
  }, [state.items, state.sellingItems]);

  const addToCart = (product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const addToSelling = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_TO_SELLING', payload: { product, quantity } });
  };

  const removeFromSelling = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_SELLING', payload: productId });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const updateInventoryQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_INVENTORY_QUANTITY', payload: { productId, quantity } });
  };

  const loadUserData = (inventory: UserInventory[], shopListings: ShopListing[]) => {
    dispatch({ type: 'LOAD_USER_DATA', payload: { inventory, shopListings } });
  };

  const getInventoryQuantity = (productId: string): number => {
    const inventoryItem = state.inventory.find(item => item.product_id === productId);
    return inventoryItem ? inventoryItem.quantity : 0;
  };

  const getShopQuantity = (productId: string): number => {
    const shopItem = state.shopListings.find(item => item.product_id === productId);
    return shopItem ? shopItem.quantity : 0;
  };
  const value = {
    ...state,
    addToCart,
    addToSelling,
    removeFromSelling,
    removeFromCart,
    updateQuantity,
    updateInventoryQuantity,
    loadUserData,
    getInventoryQuantity,
    getShopQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};