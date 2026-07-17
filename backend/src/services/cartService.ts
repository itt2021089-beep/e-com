import { cartRepository } from '../repositories/cartRepository';
import { productRepository } from '../repositories/productRepository';

export const cartService = {
  async getMyCart(userId: string) {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found. Please contact support.');
    
    // Calculate running total dynamically for the frontend
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    return { ...cart, totalAmount };
  },

  async addItemToCart(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new Error('Quantity must be greater than zero');

    const product = await productRepository.findById(productId);
    if (!product) throw new Error('Product does not exist');
    if (product.stock < quantity) throw new Error(`Only ${product.stock} units available in stock`);

    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    // Check if adding this will exceed total stock limits (existing quantity + new quantity)
    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem && (existingItem.quantity + quantity) > product.stock) {
      throw new Error(`Cannot add more. You already have ${existingItem.quantity} in cart, and only ${product.stock} are in stock.`);
    }

    await cartRepository.upsertCartItem(cart.id, productId, quantity);
    return this.getMyCart(userId); // Return the fully populated updated cart
  },

  async updateItemQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) throw new Error('Quantity must be greater than zero. Use remove to delete item.');

    const product = await productRepository.findById(productId);
    if (!product) throw new Error('Product does not exist');
    if (product.stock < quantity) throw new Error(`Only ${product.stock} units available in stock`);

    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    await cartRepository.updateItemQuantity(cart.id, productId, quantity);
    return this.getMyCart(userId);
  },

  async removeItemFromCart(userId: string, productId: string) {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) throw new Error('Cart not found');

    // Using try-catch here safely handles deleting an item that isn't in the cart
    try {
      await cartRepository.removeCartItem(cart.id, productId);
    } catch (error) {
      throw new Error('Item not found in cart');
    }
    
    return this.getMyCart(userId);
  }
};