import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock_level: number;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

type CartStore = {
  items: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  
  addToCart: async (product) => {
    try {
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            product_id: product.id,
            quantity: 1
          });
      }

      // Refresh cart items
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            stock_level
          )
        `);

      set({
        items: (cartItems || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: item.products[0], // Assuming `products` is an array with one item
        }))
      });
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  },

  removeFromCart: async (productId) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId);

      set(state => ({
        items: state.items.filter(item => item.product_id !== productId)
      }));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('product_id', productId);

      set(state => ({
        items: state.items.map(item =>
          item.product_id === productId ? { ...item, quantity } : item
        )
      }));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  },

  clearCart: async () => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .neq('id', null);

      set({ items: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }
}));