export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  sizes: string[];
  inventory: number;
  featured: boolean;
  createdAt: any;
}

export interface Order {
  id?: string;
  orderId: string;
  items: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  total: number;
  status: 'placed' | 'processing' | 'shipped' | 'delivered';
  paymentStatus: 'pending' | 'confirmed';
  upiTransactionId?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}
