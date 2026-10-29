export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // LAK
  cost: number;  // LAK
  stock: number;
  image: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  cost: number;
  quantity: number;
  subtotal: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type DeliveryStatus = 'pending_pack' | 'shipping' | 'delivered' | 'returned';
export type PaymentMethod = 'bcel_one' | 'cod' | 'cash' | 'transfer_other';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  province: string;
  shippingProvider: string;
  trackingNumber?: string;
  items: OrderItem[];
  itemsTotal: number;
  shippingFee: number;
  discount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  paymentMethod: PaymentMethod;
  paymentSlipUrl?: string;
  notes?: string;
  source: 'facebook_messenger' | 'manual' | 'facebook_comment';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  province: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  notes?: string;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
  facebookPageName: string;
  facebookPageUrl: string;
  bcelAccountNumber: string;
  bcelAccountName: string;
  bcelQrCodeUrl: string;
  shippingFeeVientiane: number;
  shippingFeeProvinces: number;
  lowStockThreshold: number;
}

export interface AutoReplyRule {
  id: string;
  keyword: string;
  matchType: 'contains' | 'exact';
  replyText: string;
  isActive: boolean;
}

export interface MessengerMessageLog {
  id: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  messageText: string;
  replyText: string;
  replyType: 'ai' | 'rule' | 'manual';
  status: 'sent' | 'failed' | 'simulated';
}

export interface MessengerConfig {
  isConnected: boolean;
  webhookVerifyToken: string;
  pageAccessToken: string;
  appSecret: string;
  pageId: string;
  aiAutoReplyEnabled: boolean;
  aiPromptInstruction: string;
  autoReplyRules: AutoReplyRule[];
}

export interface DashboardStats {
  todaySales: number;
  todayOrdersCount: number;
  todayProfit: number;
  monthlySales: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  shippingOrdersCount: number;
  deliveredOrdersCount: number;
  lowStockCount: number;
  recentOrders: Order[];
  topSellingProducts: { product: Product; totalQuantity: number; totalRevenue: number }[];
}
