import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(4);

      if (error) {
        console.error('Error fetching featured products:', error);
        return;
      }

      setProducts(data || []);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            className="relative backdrop-blur-md bg-white/30 rounded-lg shadow-lg overflow-hidden border border-white/20"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">₦{product.price}</span>
                <button
                  onClick={() => {/* Add to cart logic */}}
                  className="px-4 py-2 bg-purple-600/80 text-white rounded-md hover:bg-purple-700/80 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}