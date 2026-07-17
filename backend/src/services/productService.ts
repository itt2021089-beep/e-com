import { productRepository } from '../repositories/productRepository';

export const productService = {
  async getAllProducts(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const { products, total } = await productRepository.findAll(skip, limit, search);
    
    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  async createProduct(data: { name: string; description: string; price: number; stock: number }) {
    return productRepository.create(data);
  },

  async updateProduct(id: string, data: { name?: string; description?: string; price?: number; stock?: number }) {
    // Verify existence first
    await this.getProductById(id);
    return productRepository.update(id, data);
  },

  async deleteProduct(id: string) {
    await this.getProductById(id);
    return productRepository.delete(id);
  }
};