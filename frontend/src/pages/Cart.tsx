import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';

export default function Cart() {
  const { items, totalAmount, updateItem, removeItem, clearCart, } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Generate a unique idempotency key for this specific checkout attempt
      const idempotencyKey = crypto.randomUUID(); 

      await api.post('/orders/checkout', {}, {
        headers: {
          'X-Idempotency-Key': idempotencyKey
        }
      });

      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-gray-500">Looks like you haven't added any infrastructure yet.</p>
        <Button onClick={() => navigate('/')}>Return to Store</Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Cart Items List */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.product.name}</h3>
                <p className="text-gray-500">${Number(item.product.price).toFixed(2)}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" onClick={() => updateItem(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => updateItem(item.productId, item.quantity + 1)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="destructive" size="icon" onClick={() => removeItem(item.productId)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">${Number(totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Taxes</span>
              <span className="font-medium">Calculated at checkout</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${Number(totalAmount).toFixed(2)}</span>
            </div>
            
            <Button 
              className="w-full mt-6" 
              size="lg" 
              onClick={handleCheckout} 
              disabled={isCheckingOut}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isCheckingOut ? 'Processing...' : 'Secure Checkout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}