import { supabase } from '../lib/supabase';

export const getProductImageUrl = (imagePath: string | null): string => {
  if (!imagePath) {
    return 'https://placehold.co/400x400/purple/white?text=No+Image';
  }

  try {
    const { data: { publicUrl } } = supabase.storage
      .from('shop')
      .getPublicUrl(`products/${imagePath}`);
    
    return publicUrl;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return 'https://placehold.co/400x400/purple/white?text=No+Image';
  }
};