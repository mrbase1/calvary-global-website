import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../stores/cartStore';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_level: number;
  is_featured: boolean;
  is_new: boolean;
}

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (product && newQuantity > product.stock_level) {
      toast.warning(`Only ${product.stock_level} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    try {
      if (!product) return;
      await addToCart(product.id, quantity); // Pass the quantity
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link 
            to="/shop"
            className="text-purple-600 hover:text-purple-700 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        to="/shop"
        className="text-purple-600 hover:text-purple-700 flex items-center mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-center object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="mt-2 text-3xl text-purple-600">₦{product.price.toLocaleString()}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-4">
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Quantity</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 border rounded-md hover:bg-gray-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 border rounded-md hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {product.stock_level > 0 
                ? `${product.stock_level} items in stock` 
                : 'Out of stock'}
            </p>
            <button
              onClick={handleAddToCart}
              disabled={product.stock_level === 0}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}