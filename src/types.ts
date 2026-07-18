export interface Product {
  id: string;
  name: { [lang: string]: string };
  category: 'menu' | 'extra';
  price: number;
  contents: { [lang: string]: string[] };
  image: string;
  description: { [lang: string]: string };
  ingredients: { [lang: string]: string };
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  allergens: { [lang: string]: string[] };
  weight: string;
  deliveryTime: { [lang: string]: string };
  popular?: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
}

export interface ReservationDetails {
  date: string;
  time: string;
  address: string;
  postalCode: string;
  type: 'hotel' | 'airbnb' | 'apartment' | 'other';
  accommodationName: string; // Hotel or Airbnb name
  roomNumber?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  reservation: ReservationDetails;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cooking' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  clientEmail: string;
  paymentMethod: string;
}

export interface ClientProfile {
  email: string;
  name: string;
  phone: string;
  address?: string;
  postalCode?: string;
  accommodationName?: string;
  roomNumber?: string;
  favorites: string[]; // product IDs
}

export interface DashboardStats {
  salesCount: number;
  revenue: number;
  ordersPending: number;
  ordersDelivered: number;
  popularProducts: { name: string; count: number }[];
  recentOrders: Order[];
}
