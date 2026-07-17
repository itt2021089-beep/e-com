import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, LogOut, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CustomerLayout() {
  const { user, logout } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const navigate = useNavigate();

  // Fetch the cart as soon as the layout mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <Link to="/" className="flex items-center space-x-2">
              <Package2 className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold tracking-tight">CloudStore</span>
            </Link>

            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500 hidden sm:block">Hello, {user?.email}</span>
              
              <Link to="/cart">
                <Button variant="outline" className="relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-600">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Button variant="ghost" onClick={handleLogout} size="icon">
                <LogOut className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet /> {/* This is where the Storefront or Cart pages will render */}
      </main>
    </div>
  );
}