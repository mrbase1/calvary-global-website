import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Package, ShoppingCart } from 'lucide-react';
import { ProductEditModal } from '../../components/shop/ProductEditModal';

const getPublicImageUrl = (filename: string) => {
  if (!filename) return 'https://placehold.co/400x400/purple/white?text=No+Image';
  
  // Remove any path or URL components, just keep filename
  const cleanFilename = filename.split('/').pop()?.split('?')[0] || filename;
  
  // Get the CDN URL from Supabase client
  const { data } = supabase.storage
    .from('shop')
    .getPublicUrl(`products/${cleanFilename}`);
    
  return data.publicUrl;
};

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
  created_at?: string;
  updated_at?: string;
}

export function AdminShopManagement() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productsWithUrls = data?.map(product => ({
        ...product,
        image_url: getPublicImageUrl(product.image_url)
      })) || [];

      setProducts(productsWithUrls);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleAddProduct = () => {
    const emptyProduct: Product = {
      id: '', // Provide a default empty string for the id
      name: '',
      description: '',
      price: 0,
      image_url: '',
      category: '',
      stock_level: 0,
      is_featured: false,
      is_new: false
    };
    setEditingProduct(emptyProduct);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shop Management</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'products' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Package className="h-5 w-5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              activeTab === 'orders' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            Orders
          </button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-semibold">Products</h3>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="relative h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                            {product.image_url ? (
                              <img 
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (!target.dataset.fallback) {
                                    target.dataset.fallback = 'true';
                                    console.debug('Loading fallback for:', product.name);
                                    target.src = 'https://placehold.co/400x400/purple/white?text=No+Image';
                                  }
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">{product.name}</td>
                        <td className="px-6 py-4">₦{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">{product.stock_level}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* We'll add order management in the next step */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Orders</h3>
          {/* Order management interface will go here */}
        </div>
      )}

      {/* Product Edit Modal - We'll create this component next */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
}