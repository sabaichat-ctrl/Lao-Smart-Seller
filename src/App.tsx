import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { ReportsView } from './components/ReportsView';
import { MessengerAutomationView } from './components/MessengerAutomationView';
import { SettingsView } from './components/SettingsView';
import { ProductModal } from './components/ProductModal';
import { OrderModal } from './components/OrderModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { AuthModal } from './components/AuthModal';
import {
  Product,
  Order,
  Customer,
  ShopSettings,
  MessengerConfig,
  DashboardStats,
} from './types';
import { api, getAuthToken, clearAuthToken, setAuthToken } from './utils/api';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [adminUser, setAdminUser] = useState<any>({ name: 'ຜູ້ຈັດການຮ້ານ' });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Data state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [messengerConfig, setMessengerConfig] = useState<MessengerConfig | null>(null);

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderInitialCustomer, setOrderInitialCustomer] = useState<{
    name: string;
    phone: string;
    address: string;
    province: string;
  } | null>(null);

  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Toast Notification Helper
  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Initial Data Fetching
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Verify or initialize session
      try {
        const authRes = await api.getMe();
        if (authRes.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(authRes.admin);
        } else {
          // Attempt seamless initial auto login with default credentials if token absent
          try {
            const loginRes = await api.login({ username: 'admin', password: 'lao123456' });
            setAuthToken(loginRes.token);
            setIsAuthenticated(true);
            setAdminUser(loginRes.admin);
          } catch {
            setIsAuthenticated(false);
          }
        }
      } catch {
        // Fallback
      }

      const [statsData, productsData, ordersData, customersData, settingsData, messengerData] =
        await Promise.all([
          api.getDashboardStats(),
          api.getProducts(),
          api.getOrders(),
          api.getCustomers(),
          api.getSettings(),
          api.getMessengerConfig(),
        ]);

      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
      setCustomers(customersData);
      setSettings(settingsData);
      setMessengerConfig(messengerData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      showNotification('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    clearAuthToken();
    setIsAuthenticated(false);
    setShowAuthModal(true);
    showNotification('ອອກຈາກລະບົບແລ້ວ', 'success');
  };

  // Product Actions
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (productToEdit) {
      const updated = await api.updateProduct(productToEdit.id, productData);
      setProducts(products.map(p => (p.id === updated.id ? updated : p)));
      showNotification('ແກ້ໄຂສິນຄ້າສຳເລັດແລ້ວ');
    } else {
      const created = await api.createProduct(productData);
      setProducts([created, ...products]);
      showNotification('ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດແລ້ວ');
    }
    // Refresh stats
    api.getDashboardStats().then(setStats);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      showNotification('ລົບສິນຄ້າສຳເລັດແລ້ວ');
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      showNotification(err.message || 'ລົບສິນຄ້າບໍ່ສຳເລັດ', 'error');
    }
  };

  const handleQuickUpdateStock = async (id: string, newStock: number) => {
    try {
      const updated = await api.updateProduct(id, { stock: newStock });
      setProducts(products.map(p => (p.id === id ? updated : p)));
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      showNotification(err.message || 'ປັບປຸງສະຕັອກບໍ່ສຳເລັດ', 'error');
    }
  };

  // Order Actions
  const handleSaveOrder = async (orderData: Partial<Order>) => {
    if (orderToEdit) {
      const updated = await api.updateOrder(orderToEdit.id, orderData);
      setOrders(orders.map(o => (o.id === updated.id ? updated : o)));
      if (viewingOrder && viewingOrder.id === updated.id) {
        setViewingOrder(updated);
      }
      showNotification('ແກ້ໄຂອໍເດີສຳເລັດແລ້ວ');
    } else {
      const created = await api.createOrder(orderData);
      setOrders([created, ...orders]);
      showNotification('ສ້າງອໍເດີໃໝ່ສຳເລັດແລ້ວ');
    }

    // Refresh products (stock may have changed) & stats & customers
    api.getProducts().then(setProducts);
    api.getDashboardStats().then(setStats);
    api.getCustomers().then(setCustomers);
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
      showNotification('ລົບອໍເດີສຳເລັດແລ້ວ');
      api.getDashboardStats().then(setStats);
    } catch (err: any) {
      showNotification(err.message || 'ລົບອໍເດີບໍ່ສຳເລັດ', 'error');
    }
  };

  const handleUpdateOrderStatus = async (id: string, updates: Partial<Order>) => {
    try {
      const updated = await api.updateOrder(id, updates);
      setOrders(orders.map(o => (o.id === id ? updated : o)));
      if (viewingOrder && viewingOrder.id === id) {
        setViewingOrder(updated);
      }
      showNotification('ອັບເດດສະຖານະອໍເດີແລ້ວ');
      api.getDashboardStats().then(setStats);
      api.getCustomers().then(setCustomers);
    } catch (err: any) {
      showNotification(err.message || 'ອັບເດດສະຖານະບໍ່ສຳເລັດ', 'error');
    }
  };

  // Customer Actions
  const handleSelectCustomerForOrder = (customer: Customer) => {
    setOrderInitialCustomer({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      province: customer.province,
    });
    setOrderToEdit(null);
    setOrderModalOpen(true);
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const updated = await api.updateCustomer(id, updates);
      setCustomers(customers.map(c => (c.id === id ? updated : c)));
      showNotification('ບັນທຶກຂໍ້ມູນລູກຄ້າແລ້ວ');
    } catch (err: any) {
      showNotification(err.message || 'ບັນທຶກບໍ່ສຳເລັດ', 'error');
    }
  };

  // Settings Actions
  const handleUpdateSettings = async (newSettings: Partial<ShopSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        settings={settings}
        adminName={adminUser?.name || 'ຜູ້ຈັດການຮ້ານ'}
        lowStockCount={stats?.lowStockCount || 0}
        pendingOrdersCount={stats?.pendingOrdersCount || 0}
        onOpenNewOrder={() => {
          setOrderToEdit(null);
          setOrderInitialCustomer(null);
          setOrderModalOpen(true);
        }}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        onSelectTab={tab => setCurrentTab(tab)}
      />

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => setCurrentTab(tab)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          messengerConfig={messengerConfig}
          pendingOrdersCount={stats?.pendingOrdersCount || 0}
          lowStockCount={stats?.lowStockCount || 0}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">ກຳລັງໂຫລດລະບົບ Lao Smart Seller...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  onSelectTab={setCurrentTab}
                  onOpenNewOrder={() => {
                    setOrderToEdit(null);
                    setOrderInitialCustomer(null);
                    setOrderModalOpen(true);
                  }}
                  onOpenNewProduct={() => {
                    setProductToEdit(null);
                    setProductModalOpen(true);
                  }}
                  onViewOrder={order => setViewingOrder(order)}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              )}

              {currentTab === 'products' && (
                <ProductsView
                  products={products}
                  settings={settings}
                  onOpenNewProduct={() => {
                    setProductToEdit(null);
                    setProductModalOpen(true);
                  }}
                  onEditProduct={product => {
                    setProductToEdit(product);
                    setProductModalOpen(true);
                  }}
                  onDeleteProduct={handleDeleteProduct}
                  onQuickUpdateStock={handleQuickUpdateStock}
                />
              )}

              {currentTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  onOpenNewOrder={() => {
                    setOrderToEdit(null);
                    setOrderInitialCustomer(null);
                    setOrderModalOpen(true);
                  }}
                  onViewOrder={order => setViewingOrder(order)}
                  onEditOrder={order => {
                    setOrderToEdit(order);
                    setOrderModalOpen(true);
                  }}
                  onDeleteOrder={handleDeleteOrder}
                  onUpdateStatus={handleUpdateOrderStatus}
                />
              )}

              {currentTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  onSelectCustomerForOrder={handleSelectCustomerForOrder}
                  onUpdateCustomer={handleUpdateCustomer}
                />
              )}

              {currentTab === 'reports' && <ReportsView orders={orders} />}

              {currentTab === 'messenger' && (
                <MessengerAutomationView onNotify={showNotification} />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onNotify={showNotification}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setOrderToEdit(null);
          setOrderInitialCustomer(null);
        }}
        onSave={handleSaveOrder}
        orderToEdit={orderToEdit}
        products={products}
        settings={settings}
        initialCustomer={orderInitialCustomer}
      />

      {/* Order Detail & Receipt Modal */}
      <OrderDetailModal
        order={viewingOrder}
        settings={settings}
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        onEdit={order => {
          setViewingOrder(null);
          setOrderToEdit(order);
          setOrderModalOpen(true);
        }}
        onDelete={handleDeleteOrder}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      {/* Auth Modal if session requires login */}
      <AuthModal
        isOpen={showAuthModal || !isAuthenticated}
        onSuccess={admin => {
          setIsAuthenticated(true);
          setAdminUser(admin);
          setShowAuthModal(false);
          showNotification('ເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ');
          fetchAllData();
        }}
      />
    </div>
  );
}
