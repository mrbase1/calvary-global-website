import { useCart, CartItem } from '../stores/cartStore';
import { Link } from 'react-router-dom';
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react';

export function Cart() {
  const { items, loading, removeFromCart, updateQuantity } = useCart();


// Removed duplicate CartItem definition to avoid conflicts

const total = items.reduce((sum: number, item: CartItem) => 
    sum + (item.product ? item.product.price * item.quantity : 0), 0
);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link 
            to="/shop"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {items.map((item: CartItem) => (
                <div 
                  key={item.id}
                  className="flex items-center p-4 border-b last:border-b-0"
                >
                  <img
                    src={item.product ? item.product.image_url : ''}
                    alt={item.product ? item.product.name : 'Product'}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.product?.name || 'Unknown Product'}</h3>
                    <p className="text-gray-600">
                      ₦{item.product?.price?.toLocaleString() ?? '0'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="text-gray-500 hover:text-purple-600"
                    >
                      <MinusCircle className="h-5 w-5" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="text-gray-500 hover:text-purple-600"
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="ml-4 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}