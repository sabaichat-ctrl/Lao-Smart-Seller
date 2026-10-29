import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Product, Order, Customer, ShopSettings, MessengerConfig, MessengerMessageLog } from '../src/types';

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  name: string;
  token: string | null;
}

export interface DatabaseSchema {
  admin: AdminUser;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  settings: ShopSettings;
  messengerConfig: MessengerConfig;
  messengerLogs: MessengerMessageLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lao_smart_seller_db.json');

// Helper to hash password
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, chosenSalt, 64).toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

const defaultAdmin = hashPassword('lao123456');

const initialDatabase: DatabaseSchema = {
  admin: {
    id: 'admin_1',
    username: 'admin',
    passwordHash: defaultAdmin.hash,
    salt: defaultAdmin.salt,
    name: 'ຜູ້ຈັດການຮ້ານ (Shop Manager)',
    token: null,
  },
  settings: {
    shopName: 'ຮ້ານ Lao Smart Fashion & Shop',
    shopPhone: '020 55998877',
    shopAddress: 'ບ້ານ ໂພນສີນວນ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ',
    facebookPageName: 'Lao Smart Online Shop',
    facebookPageUrl: 'https://facebook.com/laosmartseller',
    bcelAccountNumber: '010-12-00-01987654-001',
    bcelAccountName: 'SOULIPHANH S.',
    bcelQrCodeUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=400&auto=format&fit=crop&q=80',
    shippingFeeVientiane: 15000,
    shippingFeeProvinces: 25000,
    lowStockThreshold: 5,
  },
  messengerConfig: {
    isConnected: false,
    webhookVerifyToken: 'lao_seller_verify_token_2025_' + crypto.randomBytes(4).toString('hex'),
    pageAccessToken: '',
    appSecret: '',
    pageId: '',
    aiAutoReplyEnabled: true,
    aiPromptInstruction: `ເຈົ້າເປັນພະນັກງານຂາຍອອນລາຍຄົນລາວ ທີ່ໜ້າຮັກ ສຸພາບ ແລະ ເປັນກັນເອງ ຂອງຮ້ານ 'Lao Smart Shop'.
ຄຳແນະນຳໃນການຕອບ:
1. ຕອບເປັນພາສາລາວທີ່ຖືກຕ້ອງ ແລະ ສຸພາບ ໃຊ້ຄຳວ່າ 'ເຈົ້າ', 'ເດີເຈົ້າ' ສະເໝີ.
2. ບອກລາຄາເປັນເງິນກີບ (₭ / Kip) ຕາມຂໍ້ມູນສິນຄ້າໃນຮ້ານຢ່າງຊັດເຈນ.
3. ຖ້າລູກຄ້າສົນໃຈສັ່ງຊື້ ໃຫ້ຂໍ: ຊື່ລູກຄ້າ, ເບີໂທລະສັບ ແລະ ທີ່ຢູ່ຈັດສົ່ງ / ແຂວງ.
4. ແຈ້ງຄ່າສົ່ງ: ນະຄອນຫຼວງ 15,000 ກີບ, ຕ່າງແຂວງ 25,000 ກີບ.
5. ຖ້າລູກຄ້າຂໍເລກບັນຊີ ໃຫ້ແຈ້ງບັນຊີ BCEL One ຂອງຮ້ານ ແລະ ບອກໃຫ້ສົ່ງສະລິບມາໄດ້ເລີຍ.`,
    autoReplyRules: [
      {
        id: 'rule_1',
        keyword: 'ເລກບັນຊີ',
        matchType: 'contains',
        replyText: 'ເລກບັນຊີ BCEL One ຂອງຮ້ານເຈົ້າ:\nເລກບັນຊີ: 010-12-00-01987654-001\nຊື່: SOULIPHANH S.\nໂອນແລ້ວສົ່ງສະລິບພ້ອມແຈ້ງຊື່, ເບີໂທ ແລະ ທີ່ຢູ່ໄດ້ເລີຍເດີເຈົ້າ!',
        isActive: true,
      },
      {
        id: 'rule_2',
        keyword: 'ຄ່າສົ່ງ',
        matchType: 'contains',
        replyText: 'ຄ່າຈັດສົ່ງຂອງຮ້ານເຮົາ:\n- ນະຄອນຫຼວງວຽງຈັນ: 15,000 ກີບ (ສົ່ງຮອດບ້ານ)\n- ຕ່າງແຂວງ: 25,000 ກີບ (ສົ່ງຜ່ານ ຮຸ່ງອາລຸນ / ອານຸສິດ 1-2 ມື້ຮອດເຈົ້າ)',
        isActive: true,
      },
      {
        id: 'rule_3',
        keyword: 'ສະບາຍດີ',
        matchType: 'contains',
        replyText: 'ສະບາຍດີເຈົ້າ ຍິນດີຕ້ອນຮັບສູ່ຮ້ານ Lao Smart! ລູກຄ້າສົນໃຈສິນຄ້າຕົວໃດສາມາດສອບຖາມ ຫຼື ສັ່ງຊື້ໄດ້ເລີຍເດີເຈົ້າ, ຍິນດີໃຫ້ບໍລິການ!',
        isActive: true,
      },
      {
        id: 'rule_4',
        keyword: 'ມີເຄື່ອງພ້ອມສົ່ງບໍ່',
        matchType: 'contains',
        replyText: 'ສິນຄ້າທັງໝົດໃນຮ້ານມີພ້ອມສົ່ງໃນສາງເລີຍເຈົ້າ ສັ່ງມື້ນີ້ແພັກສົ່ງມື້ອື່ນເຊົ້າໄດ້ເລີຍເດີ!',
        isActive: true,
      },
    ],
  },
  products: [
    {
      id: 'prod_1',
      name: 'ເສື້ອຢືດຝ້າຍແທ້ Premium ລາຍດອກຈຳປາ (Size M, L, XL)',
      sku: 'LSS-TSH-01',
      category: 'ເສື້ອຜ້າ',
      price: 95000,
      cost: 50000,
      stock: 42,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
      description: 'ເສື້ອຢືດເນື້ອຜ້າ Cotton 100% ຜ້ານຸ້ມໃສ່ສະບາຍ ບໍ່ຮ້ອນ ລວດລາຍດອກຈຳປາເອກະລັກລາວ',
      isActive: true,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_2',
      name: 'ຊຸດສິ້ນໄໝລາວປະຍຸກ ສີຟ້າຄາມ ລວດລາຍພື້ນເມືອງ',
      sku: 'LSS-SKT-02',
      category: 'ເສື້ອຜ້າ',
      price: 280000,
      cost: 160000,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
      description: 'ຊຸດສິ້ນໄໝລາວຕັດສຳເລັດຮູບ ໃສ່ໄປງານບຸນ ງານດອງ ຫຼື ງານທາງການ ງາມສະຫງ່າ',
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_3',
      name: 'ເຊຣັ່ມບຳລຸງຜິວໜ້າ White Glow ວິຕາມິນຊີ 50ml',
      sku: 'LSS-COS-03',
      category: 'ເຄື່ອງສຳອາງ',
      price: 125000,
      cost: 65000,
      stock: 24,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
      description: 'ຊ່ວຍໃຫ້ຜິວໜ້າຂາວໃສ ຫຼຸດຮອຍດຳ ຮອຍສິວ ແລະ ກະຈ່າງໃສເປັນທຳມະຊາດ',
      isActive: true,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_4',
      name: 'ກາເຟດາວ ໂບລາວ ຄົ້ວພິເສດ ອາຣາບິກ້າ 100% (500g)',
      sku: 'LSS-COF-04',
      category: 'ອາຫານ-ເຄື່ອງດື່ມ',
      price: 75000,
      cost: 40000,
      stock: 3, // Low stock alert!
      image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&auto=format&fit=crop&q=80',
      description: 'ເມັດກາເຟຄຸນນະພາບສູງຈາກພູພຽງບໍລະເວນ ແຂວງຈຳປາສັກ ຫອມເຂັ້ມລົງຕົວ',
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_5',
      name: 'ກະເປົາຜ້າແພພື້ນເມືອງ Handmade ລາຍນາກ',
      sku: 'LSS-BAG-05',
      category: 'ເກີບ-ກະເປົາ',
      price: 110000,
      cost: 55000,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
      description: 'ກະເປົາຜ້າຝ້າຍທໍມື ໃສ່ສະພາຍໄປວຽກ ຫຼື ໄປທ່ຽວໄດ້ງາມເກ່ຍ',
      isActive: true,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  customers: [
    {
      id: 'cust_1',
      name: 'ນາງ ມະນີວອນ ແສງດາວ',
      phone: '020 55667788',
      address: 'ບ້ານ ດົງໂດກ, ເມືອງ ໄຊທານີ',
      province: 'ນະຄອນຫຼວງວຽງຈັນ',
      totalOrders: 3,
      totalSpent: 470000,
      lastOrderAt: new Date().toISOString(),
      notes: 'ລູກຄ້າປະຈຳ ມັກສັ່ງເສື້ອຜ້າ ແລະ ໂອນຜ່ານ BCEL One ໄວ',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'cust_2',
      name: 'ທ້າວ ສົມພອນ ວິໄລສັກ',
      phone: '020 99112233',
      address: 'ບ້ານ ວັດທາດ, ເມືອງ ຫຼວງພະບາງ',
      province: 'ຫຼວງພະບາງ',
      totalOrders: 2,
      totalSpent: 355000,
      lastOrderAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: 'ສົ່ງຜ່ານ ຮຸ່ງອາລຸນ ສາຂາຫຼວງພະບາງ',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'cust_3',
      name: 'ນາງ ອາລຸນນີ ພົມມະຈັນ',
      phone: '030 52345678',
      address: 'ບ້ານ ໂພນສະຫວ່າງ, ເມືອງ ໄກສອນ ພົມວິຫານ',
      province: 'ສະຫວັນນະເຂດ',
      totalOrders: 1,
      totalSpent: 150000,
      lastOrderAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      notes: 'ລູກຄ້າໃໝ່ຈາກ Facebook Ads',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
  orders: [
    {
      id: 'ORD-2025-001',
      customerName: 'ນາງ ມະນີວອນ ແສງດາວ',
      customerPhone: '020 55667788',
      customerAddress: 'ບ້ານ ດົງໂດກ, ເມືອງ ໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ',
      province: 'ນະຄອນຫຼວງວຽງຈັນ',
      shippingProvider: 'ຈັດສົ່ງດ່ວນ (Delivery)',
      trackingNumber: 'VTE-DEL-8891',
      items: [
        {
          productId: 'prod_1',
          productName: 'ເສື້ອຢືດຝ້າຍແທ້ Premium ລາຍດອກຈຳປາ (Size M, L, XL)',
          price: 95000,
          cost: 50000,
          quantity: 2,
          subtotal: 190000,
        },
      ],
      itemsTotal: 190000,
      shippingFee: 15000,
      discount: 0,
      grandTotal: 205000,
      paymentStatus: 'paid',
      deliveryStatus: 'shipping',
      paymentMethod: 'bcel_one',
      paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      notes: 'ລູກຄ້າໂອນແລ້ວ ຂໍສົ່ງຕອນບ່າຍໂມງ',
      source: 'facebook_messenger',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ORD-2025-002',
      customerName: 'ທ້າວ ສົມພອນ ວິໄລສັກ',
      customerPhone: '020 99112233',
      customerAddress: 'ບ້ານ ວັດທາດ, ເມືອງ ຫຼວງພະບາງ',
      province: 'ຫຼວງພະບາງ',
      shippingProvider: 'ຮຸ່ງອາລຸນ (HAL)',
      trackingNumber: 'HAL-LPB-99234',
      items: [
        {
          productId: 'prod_2',
          productName: 'ຊຸດສິ້ນໄໝລາວປະຍຸກ ສີຟ້າຄາມ ລວດລາຍພື້ນເມືອງ',
          price: 280000,
          cost: 160000,
          quantity: 1,
          subtotal: 280000,
        },
      ],
      itemsTotal: 280000,
      shippingFee: 25000,
      discount: 0,
      grandTotal: 305000,
      paymentStatus: 'paid',
      deliveryStatus: 'delivered',
      paymentMethod: 'bcel_one',
      paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      notes: 'ສົ່ງຮອດສາຂາຮຸ່ງອາລຸນ ຫຼວງພະບາງ',
      source: 'facebook_messenger',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ORD-2025-003',
      customerName: 'ນາງ ອາລຸນນີ ພົມມະຈັນ',
      customerPhone: '030 52345678',
      customerAddress: 'ບ້ານ ໂພນສະຫວ່າງ, ເມືອງ ໄກສອນ ພົມວິຫານ, ແຂວງ ສະຫວັນນະເຂດ',
      province: 'ສະຫວັນນະເຂດ',
      shippingProvider: 'ອານຸສິດ (Anousith)',
      trackingNumber: '',
      items: [
        {
          productId: 'prod_3',
          productName: 'ເຊຣັ່ມບຳລຸງຜິວໜ້າ White Glow ວິຕາມິນຊີ 50ml',
          price: 125000,
          cost: 65000,
          quantity: 1,
          subtotal: 125000,
        },
      ],
      itemsTotal: 125000,
      shippingFee: 25000,
      discount: 0,
      grandTotal: 150000,
      paymentStatus: 'pending',
      deliveryStatus: 'pending_pack',
      paymentMethod: 'cod',
      notes: 'ເກັບເງິນປາຍທາງ (COD) ລໍຖ້າກວດສອບກ່ອນແພັກ',
      source: 'facebook_messenger',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  messengerLogs: [
    {
      id: 'log_1',
      timestamp: new Date().toISOString(),
      senderId: 'fb_user_10293847',
      senderName: 'Maniwon S.',
      messageText: 'ສະບາຍດີ ມີເສື້ອຢືດດອກຈຳປາ Size L ບໍ່ເຈົ້າ?',
      replyText: 'ສະບາຍດີເຈົ້າ! ເສື້ອຢືດດອກຈຳປາ Size L ຍັງມີພ້ອມສົ່ງເລີຍເຈົ້າ ລາຄາ 95,000 ກີບ/ໂຕ ຜ້າຝ້າຍ Cotton ແທ້ 100% ໃສ່ສະບາຍຫຼາຍ ສົນໃຈຮັບຈັກໂຕດີເຈົ້າ?',
      replyType: 'ai',
      status: 'simulated',
    },
    {
      id: 'log_2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      senderId: 'fb_user_88273641',
      senderName: 'Khamphao V.',
      messageText: 'ຂໍເລກບັນຊີແດ່ເຈົ້າ ຈະໂອນເງິນ',
      replyText: 'ເລກບັນຊີ BCEL One ຂອງຮ້ານເຈົ້າ:\nເລກບັນຊີ: 010-12-00-01987654-001\nຊື່: SOULIPHANH S.\nໂອນແລ້ວສົ່ງສະລິບພ້ອມແຈ້ງຊື່, ເບີໂທ ແລະ ທີ່ຢູ່ໄດ້ເລີຍເດີເຈົ້າ!',
      replyType: 'rule',
      status: 'simulated',
    },
  ],
};

class Database {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure structure has all fields
        return {
          admin: parsed.admin || initialDatabase.admin,
          products: parsed.products || initialDatabase.products,
          orders: parsed.orders || initialDatabase.orders,
          customers: parsed.customers || initialDatabase.customers,
          settings: parsed.settings || initialDatabase.settings,
          messengerConfig: parsed.messengerConfig || initialDatabase.messengerConfig,
          messengerLogs: parsed.messengerLogs || initialDatabase.messengerLogs,
        };
      }
    } catch (err) {
      console.error('Error loading DB file, creating fresh DB:', err);
    }

    // Write initial database
    this.saveDataDirect(initialDatabase);
    return initialDatabase;
  }

  private saveDataDirect(data: DatabaseSchema) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      this.saveDataDirect(this.data);
    } catch (e) {
      console.error('Failed to save DB:', e);
    } finally {
      this.isSaving = false;
    }
  }

  public getAdmin(): AdminUser {
    return this.data.admin;
  }

  public updateAdmin(updates: Partial<AdminUser>): AdminUser {
    this.data.admin = { ...this.data.admin, ...updates };
    this.save();
    return this.data.admin;
  }

  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProduct(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.save();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const beforeLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrder(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public addOrder(order: Order): Order {
    this.data.orders.unshift(order);

    // Update customer stats or create customer
    const phone = order.customerPhone.trim();
    if (phone) {
      let customer = this.data.customers.find(c => c.phone === phone);
      if (customer) {
        customer.name = order.customerName || customer.name;
        customer.address = order.customerAddress || customer.address;
        customer.province = order.province || customer.province;
        customer.totalOrders += 1;
        if (order.paymentStatus === 'paid') {
          customer.totalSpent += order.grandTotal;
        }
        customer.lastOrderAt = order.createdAt;
      } else {
        const newCustomer: Customer = {
          id: `cust_${Date.now()}`,
          name: order.customerName,
          phone: order.customerPhone,
          address: order.customerAddress,
          province: order.province,
          totalOrders: 1,
          totalSpent: order.paymentStatus === 'paid' ? order.grandTotal : 0,
          lastOrderAt: order.createdAt,
          createdAt: new Date().toISOString(),
        };
        this.data.customers.unshift(newCustomer);
      }
    }

    // Auto decrement stock
    order.items.forEach(item => {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.updatedAt = new Date().toISOString();
      }
    });

    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    const oldOrder = this.data.orders[idx];
    const updated = { ...oldOrder, ...updates, updatedAt: new Date().toISOString() };

    // If payment status changed from non-paid to paid, update customer's total spent
    if (oldOrder.paymentStatus !== 'paid' && updated.paymentStatus === 'paid') {
      const customer = this.data.customers.find(c => c.phone === updated.customerPhone);
      if (customer) {
        customer.totalSpent += updated.grandTotal;
      }
    } else if (oldOrder.paymentStatus === 'paid' && updated.paymentStatus === 'cancelled') {
      const customer = this.data.customers.find(c => c.phone === updated.customerPhone);
      if (customer) {
        customer.totalSpent = Math.max(0, customer.totalSpent - oldOrder.grandTotal);
      }
    }

    this.data.orders[idx] = updated;
    this.save();
    return updated;
  }

  public deleteOrder(id: string): boolean {
    const beforeLen = this.data.orders.length;
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    if (this.data.orders.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
    this.save();
    return this.data.customers[idx];
  }

  public getSettings(): ShopSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<ShopSettings>): ShopSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  public getMessengerConfig(): MessengerConfig {
    return this.data.messengerConfig;
  }

  public updateMessengerConfig(updates: Partial<MessengerConfig>): MessengerConfig {
    this.data.messengerConfig = { ...this.data.messengerConfig, ...updates };
    this.save();
    return this.data.messengerConfig;
  }

  public getMessengerLogs(): MessengerMessageLog[] {
    return this.data.messengerLogs;
  }

  public addMessengerLog(log: MessengerMessageLog) {
    this.data.messengerLogs.unshift(log);
    if (this.data.messengerLogs.length > 100) {
      this.data.messengerLogs = this.data.messengerLogs.slice(0, 100);
    }
    this.save();
  }
}

export const db = new Database();
