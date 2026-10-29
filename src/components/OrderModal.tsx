import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  ShoppingBag,
  Truck,
  CreditCard,
  User,
  Upload,
} from 'lucide-react';
import {
  Order,
  Product,
  OrderItem,
  PaymentStatus,
  DeliveryStatus,
  PaymentMethod,
  ShopSettings,
} from '../types';
import { formatKip, LAO_PROVINCES, SHIPPING_PROVIDERS } from '../utils/formatters';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<Order>) => Promise<void>;
  orderToEdit?: Order | null;
  products: Product[];
  settings: ShopSettings | null;
  initialCustomer?: { name: string; phone: string; address: string; province: string } | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  products,
  settings,
  initialCustomer,
}) => {
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [province, setProvince] = useState(LAO_PROVINCES[0]);
  const [shippingProvider, setShippingProvider] = useState(SHIPPING_PROVIDERS[0]);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Items
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Financials
  const [shippingFee, setShippingFee] = useState<number>(15000);
  const [discount, setDiscount] = useState<number>(0);

  // Statuses
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>('pending_pack');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bcel_one');
  const [paymentSlipUrl, setPaymentSlipUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState<'facebook_messenger' | 'manual' | 'facebook_comment'>('facebook_messenger');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset or initialize state
  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.customerName);
      setCustomerPhone(orderToEdit.customerPhone);
      setCustomerAddress(orderToEdit.customerAddress);
      setProvince(orderToEdit.province || LAO_PROVINCES[0]);
      setShippingProvider(orderToEdit.shippingProvider || SHIPPING_PROVIDERS[0]);
      setTrackingNumber(orderToEdit.trackingNumber || '');
      setItems(orderToEdit.items || []);
      setShippingFee(orderToEdit.shippingFee || 0);
      setDiscount(orderToEdit.discount || 0);
      setPaymentStatus(orderToEdit.paymentStatus);
      setDeliveryStatus(orderToEdit.deliveryStatus);
      setPaymentMethod(orderToEdit.paymentMethod);
      setPaymentSlipUrl(orderToEdit.paymentSlipUrl || '');
      setNotes(orderToEdit.notes || '');
      setSource(orderToEdit.source || 'manual');
    } else {
      setCustomerName(initialCustomer?.name || '');
      setCustomerPhone(initialCustomer?.phone || '');
      setCustomerAddress(initialCustomer?.address || '');
      const initProv = initialCustomer?.province || LAO_PROVINCES[0];
      setProvince(initProv);
      setShippingProvider(SHIPPING_PROVIDERS[0]);
      setTrackingNumber('');

      // Auto default shipping fee based on province
      const defaultFee =
        initProv === 'ນະຄອນຫຼວງວຽງຈັນ'
          ? settings?.shippingFeeVientiane ?? 15000
          : settings?.shippingFeeProvinces ?? 25000;
      setShippingFee(defaultFee);
      setDiscount(0);

      // Default one item if products exist
      if (products.length > 0) {
        const firstProd = products[0];
        setItems([
          {
            productId: firstProd.id,
            productName: firstProd.name,
            price: firstProd.price,
            cost: firstProd.cost,
            quantity: 1,
            subtotal: firstProd.price,
          },
        ]);
        setSelectedProductId(products[1]?.id || products[0].id);
      } else {
        setItems([]);
        setSelectedProductId('');
      }

      setPaymentStatus('pending');
      setDeliveryStatus('pending_pack');
      setPaymentMethod('bcel_one');
      setPaymentSlipUrl('');
      setNotes('');
      setSource('facebook_messenger');
    }
    setError(null);
  }, [orderToEdit, initialCustomer, isOpen, settings, products]);

  // Adjust shipping fee when province changes if creating new order
  const handleProvinceChange = (newProv: string) => {
    setProvince(newProv);
    if (!orderToEdit && settings) {
      if (newProv === 'ນະຄອນຫຼວງວຽງຈັນ') {
        setShippingFee(settings.shippingFeeVientiane);
        setShippingProvider('ຈັດສົ່ງດ່ວນ (Delivery ນະຄອນຫຼວງ)');
      } else {
        setShippingFee(settings.shippingFeeProvinces);
        setShippingProvider('ຮຸ່ງອາລຸນ (HAL Express)');
      }
    }
  };

  if (!isOpen) return null;

  // Real-time calculations
  const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const grandTotal = Math.max(0, itemsTotal + Number(shippingFee || 0) - Number(discount || 0));

  // Add product to order items
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Check if already in items
    const existingIndex = items.findIndex(it => it.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].price;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          price: prod.price,
          cost: prod.cost,
          quantity: 1,
          subtotal: prod.price,
        },
      ]);
    }
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    const updated = [...items];
    updated[index].quantity = qty;
    updated[index].subtotal = qty * updated[index].price;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError('ຂະໜາດຮູບສະລິບບໍ່ຄວນເກີນ 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentSlipUrl(reader.result as string);
      setPaymentStatus('paid'); // Auto flag paid on slip upload
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('ກະລຸນາປ້ອນຊື່ລູກຄ້າ');
      return;
    }
    if (!customerPhone.trim()) {
      setError('ກະລຸນາປ້ອນເບີໂທລະສັບລູກຄ້າ');
      return;
    }
    if (items.length === 0) {
      setError('ກະລຸນາເລືອກສິນຄ້າຢ່າງໜ້ອຍ 1 ລາຍການ');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onSave({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        province,
        shippingProvider,
        trackingNumber: trackingNumber.trim(),
        items,
        itemsTotal,
        shippingFee: Number(shippingFee) || 0,
        discount: Number(discount) || 0,
        grandTotal,
        paymentStatus,
        deliveryStatus,
        paymentMethod,
        paymentSlipUrl: paymentSlipUrl || undefined,
        notes: notes.trim(),
        source,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກອໍເດີ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden my-8 border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {orderToEdit ? `ແກ້ໄຂອໍເດີ ${orderToEdit.id}` : 'ສ້າງອໍເດີໃໝ່ (Create Order)'}
              </h2>
              <p className="text-xs text-slate-500">
                ຄິດໄລ່ຍອດລວມອັດຕະໂນມັດ, ບັນທຶກສະຖານະ ແລະ ຂໍ້ມູນຈັດສົ່ງ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Customer Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>ຂໍ້ມູນລູກຄ້າ (Customer Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ຊື່ລູກຄ້າ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: ນາງ ມະນີວອນ..."
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ເບີໂທລະສັບ (Phone) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="020 XXXXXXXX / 030 XXXXXXXX"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ທີ່ຢູ່ຈັດສົ່ງລະອຽດ (ບ້ານ, ເມືອງ)
                </label>
                <input
                  type="text"
                  placeholder="ບ້ານ ດົງໂດກ, ເມືອງ ໄຊທານີ..."
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  ແຂວງ (Province)
                </label>
                <select
                  value={province}
                  onChange={e => handleProvinceChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {LAO_PROVINCES.map(prov => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Items Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>ລາຍການສິນຄ້າໃນອໍເດີ (Items)</span>
              </div>
              <span className="text-[11px] text-slate-500">
                ຈຳນວນ: {items.length} ລາຍການ
              </span>
            </div>

            {/* Product Adder dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- ເລືອກສິນຄ້າເພື່ອເພີ່ມເຂົ້າອໍເດີ --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} - {formatKip(p.price)} (ສາງ: {p.stock})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>ເພີ່ມ</span>
              </button>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  ຍັງບໍ່ມີສິນຄ້າໃນອໍເດີນີ້ (ກະລຸນາເລືອກດ້ານເທິງ)
                </div>
              ) : (
                items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{it.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatKip(it.price)} x {it.quantity} ={' '}
                        <span className="font-semibold text-emerald-700">{formatKip(it.subtotal)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(idx, it.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-xs font-semibold">{it.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(idx, it.quantity + 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Shipping & Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ບໍລິສັດຂົນສົ່ງ (Shipping Provider)
              </label>
              <select
                value={shippingProvider}
                onChange={e => setShippingProvider(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {SHIPPING_PROVIDERS.map(sp => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ເລກພັດສະດຸ (Tracking Number)
              </label>
              <input
                type="text"
                placeholder="HAL-1234567..."
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              />
            </div>
          </div>

          {/* Section 4: Totals & Fees Calculator */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ຄ່າຈັດສົ່ງ (Shipping Fee)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={shippingFee}
                    onChange={e => setShippingFee(Number(e.target.value) || 0)}
                    className="w-full pl-3 pr-7 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold">₭</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ສ່ວນຫຼຸດ (Discount)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value) || 0)}
                    className="w-full pl-3 pr-7 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-2.5 top-2 text-[10px] text-slate-400 font-bold">₭</span>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-[10px] text-slate-500">ລວມຄ່າສິນຄ້າ:</span>
                <span className="text-sm font-semibold text-slate-700">{formatKip(itemsTotal)}</span>
              </div>
            </div>

            {/* Grand Total Badge */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">ຍອດລວມທັງໝົດ (Grand Total):</span>
              <span className="text-base font-extrabold text-emerald-700">
                {formatKip(grandTotal)}
              </span>
            </div>
          </div>

          {/* Section 5: Payment & Delivery Statuses */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ວິທີຊຳລະເງິນ (Payment Method)
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              >
                <option value="bcel_one">BCEL One / QR</option>
                <option value="cod">ເກັບເງິນປາຍທາງ (COD)</option>
                <option value="cash">ເງິນສົດ</option>
                <option value="transfer_other">ທະນາຄານອື່ນ</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ສະຖານະການຊຳລະ
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              >
                <option value="pending">ລໍຖ້າຊຳລະ (Pending)</option>
                <option value="paid">ຊຳລະແລ້ວ (Paid)</option>
                <option value="cancelled">ຍົກເລີກ (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                ສະຖານະການຈັດສົ່ງ
              </label>
              <select
                value={deliveryStatus}
                onChange={e => setDeliveryStatus(e.target.value as DeliveryStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white"
              >
                <option value="pending_pack">ລໍຖ້າແພັກ (Pending)</option>
                <option value="shipping">ກຳລັງຈັດສົ່ງ (In Transit)</option>
                <option value="delivered">ຈັດສົ່ງສຳເລັດ (Delivered)</option>
                <option value="returned">ຕີກັບ (Returned)</option>
              </select>
            </div>
          </div>

          {/* Payment slip upload preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {paymentSlipUrl ? (
                <img src={paymentSlipUrl} alt="Slip" className="w-full h-full object-cover" />
              ) : (
                <CreditCard className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium hover:underline">
                <Upload className="w-3.5 h-3.5" />
                <span>{paymentSlipUrl ? 'ປ່ຽນຮູບສະລິບໂອນ' : 'ແນບຮູບສະລິບໂອນເງິນ'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipUpload}
                  className="hidden"
                />
              </label>
              <div className="text-[10px] text-slate-500">
                {paymentSlipUrl ? 'ມີຮູບສະລິບຢັ້ງຢືນແລ້ວ' : 'ຖ້າລູກຄ້າໂອນແລ້ວ ສາມາດແນບສະລິບເພື່ອຢືນຢັນ'}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              ໝາຍເຫດ (Notes)
            </label>
            <input
              type="text"
              placeholder="ລາຍລະອຽດເພີ່ມເຕີມ ເຊັ່ນ: ໂທກ່ອນສົ່ງ, ຝາກໄວ້ປ້ອມຍາມ..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-2"
            >
              {loading ? (
                <span>ກຳລັງບັນທຶກ...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{orderToEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງອໍເດີ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
