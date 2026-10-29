import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, verifyPassword, hashPassword } from './server/db';
import { generateMessengerReply } from './server/gemini';
import { Order, Product, PaymentStatus, DeliveryStatus, PaymentMethod } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser with raw body retention for Meta signature verification
app.use(
  express.json({
    limit: '15mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Auth Token Middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ (Unauthorized)' });
  }
  const token = authHeader.split(' ')[1];
  const admin = db.getAdmin();
  if (!admin.token || admin.token !== token) {
    return res.status(401).json({ error: 'ເຊສຊັນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່' });
  }
  next();
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const admin = db.getAdmin();

  if (!username || !password) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ' });
  }

  if (username.trim() !== admin.username) {
    return res.status(401).json({ error: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' });
  }

  const isValid = verifyPassword(password, admin.passwordHash, admin.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' });
  }

  // Generate secure random session token
  const token = crypto.randomBytes(32).toString('hex');
  db.updateAdmin({ token });

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
    },
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  const admin = db.getAdmin();
  if (!admin.token || admin.token !== token) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
    },
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  db.updateAdmin({ token: null });
  res.json({ success: true, message: 'ອອກຈາກລະບົບສຳເລັດ' });
});

app.put('/api/auth/change-password', authenticateAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນລະຫັດຜ່ານເກົ່າ ແລະ ໃໝ່' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ' });
  }

  const admin = db.getAdmin();
  const isValid = verifyPassword(currentPassword, admin.passwordHash, admin.salt);
  if (!isValid) {
    return res.status(400).json({ error: 'ລະຫັດຜ່ານປັດຈຸບັນບໍ່ຖືກຕ້ອງ' });
  }

  const { hash, salt } = hashPassword(newPassword);
  db.updateAdmin({ passwordHash: hash, salt });
  res.json({ success: true, message: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ' });
});

// -------------------------------------------------------------
// DASHBOARD & REPORTS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const settings = db.getSettings();

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const todayOrders = orders.filter(o => o.createdAt.slice(0, 10) === todayStr && o.paymentStatus !== 'cancelled');
  const todaySales = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  // Today profit estimation
  let todayCost = 0;
  todayOrders.forEach(o => {
    o.items.forEach(it => {
      todayCost += (it.cost || 0) * it.quantity;
    });
  });
  const todayProfit = todaySales - todayCost;

  // Monthly sales (current month)
  const currentMonthPrefix = now.toISOString().slice(0, 7);
  const monthlySales = orders
    .filter(o => o.createdAt.startsWith(currentMonthPrefix) && o.paymentStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Status counts
  const pendingOrdersCount = orders.filter(o => o.deliveryStatus === 'pending_pack' && o.paymentStatus !== 'cancelled').length;
  const shippingOrdersCount = orders.filter(o => o.deliveryStatus === 'shipping').length;
  const deliveredOrdersCount = orders.filter(o => o.deliveryStatus === 'delivered').length;
  const lowStockCount = products.filter(p => p.stock <= (settings.lowStockThreshold || 5)).length;

  // Top products
  const productSalesMap = new Map<string, { product: Product; quantity: number; revenue: number }>();
  orders
    .filter(o => o.paymentStatus !== 'cancelled')
    .forEach(o => {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const cur = productSalesMap.get(prod.id) || { product: prod, quantity: 0, revenue: 0 };
          cur.quantity += item.quantity;
          cur.revenue += item.subtotal;
          productSalesMap.set(prod.id, cur);
        }
      });
    });

  const topSellingProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(x => ({
      product: x.product,
      totalQuantity: x.quantity,
      totalRevenue: x.revenue,
    }));

  res.json({
    todaySales,
    todayOrdersCount: todayOrders.length,
    todayProfit,
    monthlySales,
    totalOrdersCount: orders.length,
    pendingOrdersCount,
    shippingOrdersCount,
    deliveredOrdersCount,
    lowStockCount,
    recentOrders: orders.slice(0, 8),
    topSellingProducts,
  });
});

app.get('/api/reports/sales', (req: Request, res: Response) => {
  const orders = db.getOrders().filter(o => o.paymentStatus !== 'cancelled');
  const products = db.getProducts();

  // Daily sales for the last 7 days
  const last7Days: { date: string; label: string; sales: number; profit: number; orderCount: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter(o => o.createdAt.slice(0, 10) === dateStr);
    const sales = dayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    let cost = 0;
    dayOrders.forEach(o => {
      o.items.forEach(it => {
        cost += (it.cost || 0) * it.quantity;
      });
    });

    const dayNameLao = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'][d.getDay()];
    last7Days.push({
      date: dateStr,
      label: `${dayNameLao} (${d.getDate()}/${d.getMonth() + 1})`,
      sales,
      profit: sales - cost,
      orderCount: dayOrders.length,
    });
  }

  // Payment status breakdown
  const allOrders = db.getOrders();
  const paymentBreakdown = {
    paid: allOrders.filter(o => o.paymentStatus === 'paid').length,
    pending: allOrders.filter(o => o.paymentStatus === 'pending').length,
    cancelled: allOrders.filter(o => o.paymentStatus === 'cancelled').length,
  };

  // Delivery status breakdown
  const deliveryBreakdown = {
    pending_pack: allOrders.filter(o => o.deliveryStatus === 'pending_pack').length,
    shipping: allOrders.filter(o => o.deliveryStatus === 'shipping').length,
    delivered: allOrders.filter(o => o.deliveryStatus === 'delivered').length,
    returned: allOrders.filter(o => o.deliveryStatus === 'returned').length,
  };

  // Category sales breakdown
  const categorySales: { [cat: string]: number } = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cat = prod?.category || 'ອື່ນໆ';
      categorySales[cat] = (categorySales[cat] || 0) + it.subtotal;
    });
  });

  res.json({
    last7Days,
    paymentBreakdown,
    deliveryBreakdown,
    categorySales,
    totalRevenue: orders.reduce((s, o) => s + o.grandTotal, 0),
    totalOrders: allOrders.length,
  });
});

// -------------------------------------------------------------
// PRODUCT ENDPOINTS
// -------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, lowStock } = req.query;
  let products = db.getProducts();
  const settings = db.getSettings();

  if (category && category !== 'ທັງໝົດ') {
    products = products.filter(p => p.category === category);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (lowStock === 'true') {
    products = products.filter(p => p.stock <= (settings.lowStockThreshold || 5));
  }

  res.json(products);
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, sku, category, price, cost, stock, image, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນຊື່ສິນຄ້າ' });
  }

  const numPrice = Number(price);
  const numCost = Number(cost) || 0;
  const numStock = Number(stock) || 0;

  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ error: 'ລາຄາຂາຍຕ້ອງເປັນຕົວເລກທີ່ຖືກຕ້ອງ' });
  }

  const generatedSku = sku?.trim() || `LSS-${Date.now().toString().slice(-6)}`;

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name: name.trim(),
    sku: generatedSku,
    category: category?.trim() || 'ທົ່ວໄປ',
    price: Math.round(numPrice),
    cost: Math.round(numCost),
    stock: Math.max(0, Math.round(numStock)),
    image:
      image?.trim() ||
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    description: description?.trim() || '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addProduct(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, sku, category, price, cost, stock, image, description, isActive } = req.body;

  const existing = db.getProduct(id);
  if (!existing) {
    return res.status(404).json({ error: 'ບໍ່ພົບສິນຄ້ານີ້' });
  }

  const updates: Partial<Product> = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (sku !== undefined) updates.sku = String(sku).trim();
  if (category !== undefined) updates.category = String(category).trim();
  if (price !== undefined) updates.price = Math.round(Math.max(0, Number(price)));
  if (cost !== undefined) updates.cost = Math.round(Math.max(0, Number(cost)));
  if (stock !== undefined) updates.stock = Math.round(Math.max(0, Number(stock)));
  if (image !== undefined) updates.image = String(image).trim();
  if (description !== undefined) updates.description = String(description).trim();
  if (isActive !== undefined) updates.isActive = Boolean(isActive);

  const updated = db.updateProduct(id, updates);
  res.json(updated);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteProduct(id);
  if (!success) {
    return res.status(404).json({ error: 'ບໍ່ພົບສິນຄ້າ' });
  }
  res.json({ success: true, message: 'ລົບສິນຄ້າສຳເລັດ' });
});

// -------------------------------------------------------------
// ORDER ENDPOINTS
// -------------------------------------------------------------
app.get('/api/orders', (req: Request, res: Response) => {
  const { paymentStatus, deliveryStatus, search } = req.query;
  let orders = db.getOrders();

  if (paymentStatus && paymentStatus !== 'ທັງໝົດ') {
    orders = orders.filter(o => o.paymentStatus === paymentStatus);
  }

  if (deliveryStatus && deliveryStatus !== 'ທັງໝົດ') {
    orders = orders.filter(o => o.deliveryStatus === deliveryStatus);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    orders = orders.filter(
      o =>
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
    );
  }

  res.json(orders);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    province,
    shippingProvider,
    trackingNumber,
    items,
    shippingFee,
    discount,
    paymentStatus,
    deliveryStatus,
    paymentMethod,
    paymentSlipUrl,
    notes,
    source,
  } = req.body;

  if (!customerName || !customerName.trim()) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນຊື່ລູກຄ້າ' });
  }
  if (!customerPhone || !customerPhone.trim()) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນເບີໂທລະສັບລູກຄ້າ' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'ກະລຸນາເລືອກສິນຄ້າຢ່າງໜ້ອຍ 1 ລາຍການ' });
  }

  // Validate and recalculate items total
  let calculatedItemsTotal = 0;
  const validatedItems = items.map(item => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const prc = Math.max(0, Number(item.price) || 0);
    const cst = Math.max(0, Number(item.cost) || 0);
    const sub = prc * qty;
    calculatedItemsTotal += sub;
    return {
      productId: String(item.productId),
      productName: String(item.productName || 'ສິນຄ້າ'),
      price: prc,
      cost: cst,
      quantity: qty,
      subtotal: sub,
    };
  });

  const parsedShippingFee = Math.max(0, Number(shippingFee) || 0);
  const parsedDiscount = Math.max(0, Number(discount) || 0);
  const calculatedGrandTotal = Math.max(0, calculatedItemsTotal + parsedShippingFee - parsedDiscount);

  // Generate order number like ORD-2025-XXXX
  const dateObj = new Date();
  const year = dateObj.getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `ORD-${year}-${randomSuffix}`;

  const newOrder: Order = {
    id: orderId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: (customerAddress || '').trim(),
    province: province || 'ນະຄອນຫຼວງວຽງຈັນ',
    shippingProvider: shippingProvider || 'ຮຸ່ງອາລຸນ (HAL)',
    trackingNumber: (trackingNumber || '').trim(),
    items: validatedItems,
    itemsTotal: calculatedItemsTotal,
    shippingFee: parsedShippingFee,
    discount: parsedDiscount,
    grandTotal: calculatedGrandTotal,
    paymentStatus: (paymentStatus as PaymentStatus) || 'pending',
    deliveryStatus: (deliveryStatus as DeliveryStatus) || 'pending_pack',
    paymentMethod: (paymentMethod as PaymentMethod) || 'bcel_one',
    paymentSlipUrl: paymentSlipUrl || '',
    notes: (notes || '').trim(),
    source: source || 'manual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.addOrder(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.getOrder(id);
  if (!existing) {
    return res.status(404).json({ error: 'ບໍ່ພົບອໍເດີນີ້' });
  }

  const updates = { ...req.body };
  // Recalculate if items or fees change
  if (updates.items && Array.isArray(updates.items)) {
    let itemsTotal = 0;
    updates.items = updates.items.map((it: any) => {
      const q = Math.max(1, Number(it.quantity) || 1);
      const p = Math.max(0, Number(it.price) || 0);
      const sub = q * p;
      itemsTotal += sub;
      return { ...it, quantity: q, price: p, subtotal: sub };
    });
    updates.itemsTotal = itemsTotal;
    const ship = updates.shippingFee !== undefined ? Number(updates.shippingFee) : existing.shippingFee;
    const disc = updates.discount !== undefined ? Number(updates.discount) : existing.discount;
    updates.grandTotal = Math.max(0, itemsTotal + ship - disc);
  }

  const updated = db.updateOrder(id, updates);
  res.json(updated);
});

app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = db.deleteOrder(id);
  if (!success) {
    return res.status(404).json({ error: 'ບໍ່ພົບອໍເດີ' });
  }
  res.json({ success: true, message: 'ລົບອໍເດີສຳເລັດ' });
});

// -------------------------------------------------------------
// CUSTOMER ENDPOINTS
// -------------------------------------------------------------
app.get('/api/customers', (_req: Request, res: Response) => {
  const customers = db.getCustomers();
  res.json(customers);
});

app.put('/api/customers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = db.updateCustomer(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'ບໍ່ພົບຂໍ້ມູນລູກຄ້າ' });
  }
  res.json(updated);
});

// -------------------------------------------------------------
// SETTINGS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// -------------------------------------------------------------
// MESSENGER AUTOMATION & WEBHOOK ENDPOINTS
// -------------------------------------------------------------
app.get('/api/messenger/config', (_req: Request, res: Response) => {
  const config = db.getMessengerConfig();
  // Compute public webhook URL
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/webhook/messenger`;

  // Safely mask access token and app secret
  const maskedPageToken = config.pageAccessToken
    ? `${config.pageAccessToken.slice(0, 6)}••••••••••••••••${config.pageAccessToken.slice(-4)}`
    : '';
  const maskedAppSecret = config.appSecret
    ? `••••••••••••${config.appSecret.slice(-4)}`
    : '';

  res.json({
    ...config,
    webhookUrl,
    hasPageAccessToken: Boolean(config.pageAccessToken),
    hasAppSecret: Boolean(config.appSecret),
    pageAccessToken: maskedPageToken,
    appSecret: maskedAppSecret,
  });
});

app.put('/api/messenger/config', (req: Request, res: Response) => {
  const {
    webhookVerifyToken,
    pageAccessToken,
    appSecret,
    pageId,
    aiAutoReplyEnabled,
    aiPromptInstruction,
    autoReplyRules,
    isConnected,
  } = req.body;

  const current = db.getMessengerConfig();
  const updates: any = {};

  if (webhookVerifyToken !== undefined) updates.webhookVerifyToken = webhookVerifyToken.trim();
  if (pageId !== undefined) updates.pageId = pageId.trim();
  if (aiAutoReplyEnabled !== undefined) updates.aiAutoReplyEnabled = Boolean(aiAutoReplyEnabled);
  if (aiPromptInstruction !== undefined) updates.aiPromptInstruction = aiPromptInstruction;
  if (autoReplyRules !== undefined) updates.autoReplyRules = autoReplyRules;
  if (isConnected !== undefined) updates.isConnected = Boolean(isConnected);

  // Only update secrets if non-empty and not masked
  if (pageAccessToken && !pageAccessToken.includes('••••')) {
    updates.pageAccessToken = pageAccessToken.trim();
    updates.isConnected = true;
  }
  if (appSecret && !appSecret.includes('••••')) {
    updates.appSecret = appSecret.trim();
  }

  const updated = db.updateMessengerConfig(updates);
  res.json({ success: true, config: updated });
});

// Facebook Webhook Verification Handshake (GET)
app.get('/api/webhook/messenger', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const config = db.getMessengerConfig();

  if (mode === 'subscribe' && token === config.webhookVerifyToken) {
    console.log('[Meta Webhook Verified Successfully]');
    return res.status(200).send(challenge);
  } else {
    console.warn('[Meta Webhook Verification Failed]', { mode, tokenReceived: token });
    return res.status(403).send('Forbidden');
  }
});

// Facebook Webhook Event Receiver (POST)
app.post('/api/webhook/messenger', async (req: Request, res: Response) => {
  const body = req.body;
  const config = db.getMessengerConfig();

  // Signature verification if App Secret configured
  const signature = req.headers['x-hub-signature-256'] as string;
  if (config.appSecret && signature && (req as any).rawBody) {
    const expectedSig =
      'sha256=' +
      crypto.createHmac('sha256', config.appSecret).update((req as any).rawBody).digest('hex');
    if (signature !== expectedSig) {
      console.warn('[Meta Webhook Signature Mismatch]');
      return res.status(403).send('Invalid signature');
    }
  }

  // Acknowledge Meta immediately with 200 OK
  res.status(200).send('EVENT_RECEIVED');

  if (body.object === 'page' && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (Array.isArray(entry.messaging)) {
        for (const event of entry.messaging) {
          if (event.message && !event.message.is_echo && event.message.text) {
            const senderId = event.sender?.id || 'fb_user';
            const userText = event.message.text;

            try {
              // Generate AI or Rule response
              const reply = await generateMessengerReply(userText, 'ລູກຄ້າ');

              // Log to database
              db.addMessengerLog({
                id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                timestamp: new Date().toISOString(),
                senderId,
                senderName: `Facebook User (${senderId.slice(-4)})`,
                messageText: userText,
                replyText: reply.replyText,
                replyType: reply.replyType,
                status: config.pageAccessToken ? 'sent' : 'simulated',
              });

              // Send back via Meta Send API if pageAccessToken is configured
              if (config.pageAccessToken) {
                await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${config.pageAccessToken}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    recipient: { id: senderId },
                    message: { text: reply.replyText },
                  }),
                });
              }
            } catch (err) {
              console.error('Error handling Facebook message event:', err);
            }
          }
        }
      }
    }
  }
});

// Messenger Simulation / Test Console (POST)
app.post('/api/messenger/simulate', async (req: Request, res: Response) => {
  const { messageText, senderName } = req.body;
  if (!messageText || !messageText.trim()) {
    return res.status(400).json({ error: 'ກະລຸນາປ້ອນຂໍ້ຄວາມເພື່ອທົດສອບ' });
  }

  const name = senderName?.trim() || 'ລູກຄ້າທົດສອບ';
  const reply = await generateMessengerReply(messageText, name);

  const logEntry = {
    id: `sim_${Date.now()}`,
    timestamp: new Date().toISOString(),
    senderId: `test_user_${Date.now().toString().slice(-4)}`,
    senderName: name,
    messageText: messageText.trim(),
    replyText: reply.replyText,
    replyType: reply.replyType,
    status: 'simulated' as const,
  };

  db.addMessengerLog(logEntry);

  res.json({
    success: true,
    userMessage: messageText,
    replyText: reply.replyText,
    replyType: reply.replyType,
    log: logEntry,
  });
});

app.get('/api/messenger/logs', (_req: Request, res: Response) => {
  res.json(db.getMessengerLogs());
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Lao Smart Seller] Vite middleware attached in development mode');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Lao Smart Seller] Serving production static files from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lao Smart Seller] Server running at http://0.0.0.0:${PORT}`);
  });
}

// Only start standalone server when not in Vercel serverless environment
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start Lao Smart Seller server:', err);
    process.exit(1);
  });
}

export default app;
