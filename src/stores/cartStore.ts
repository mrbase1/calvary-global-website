import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  product: {
    name: string;
    price: number;
    image_url: string;
    stock_level: number;
  };
}

interface CartStore {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      set({ items: [] });
      return;
    }

    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products (
            name,
            price,
            image_url,
            stock_level
          )
        `)
        .eq('user_id', session.user.id);

      if (error) throw error;
      set({ items: data || [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Must be logged in to add to cart');
    }

    try {
      const { data: existingItem, error: findError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', session.user.id)
        .single();

      if (findError && findError.code !== 'PGRST116') throw findError;

      if (existingItem) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            product_id: productId,
            user_id: session.user.id,
            quantity: quantity
          });

        if (insertError) throw insertError;
      }

      await get().fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  removeFromCart: async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await get().fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      if (quantity < 1) {
        return await get().removeFromCart(productId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('product_id', productId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      await get().fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  },

  clearCart: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;
      set({ items: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
}));