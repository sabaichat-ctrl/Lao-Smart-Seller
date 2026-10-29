import React, { useRef } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Order, ShopSettings, PaymentStatus, DeliveryStatus } from '../types';
import {
  formatKip,
  formatDateLao,
  getPaymentStatusInfo,
  getDeliveryStatusInfo,
  getPaymentMethodLabel,
} from '../utils/formatters';

interface OrderDetailModalProps {
  order: Order | null;
  settings: ShopSettings | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, updates: Partial<Order>) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !order) return null;

  const paymentInfo = getPaymentStatusInfo(order.paymentStatus);
  const deliveryInfo = getDeliveryStatusInfo(order.deliveryStatus);

  const handleCopyCourierText = () => {
    const text = `📦 ລາຍການຈັດສົ່ງສິນຄ້າ
👤 ຊື່: ${order.customerName}
📞 ເບີໂທ: ${order.customerPhone}
📍 ທີ່ຢູ່: ${order.customerAddress || '-'}, ${order.province}
🚚 ຂົນສົ່ງ: ${order.shippingProvider}
📋 ສິນຄ້າ: ${order.items.map(it => `${it.productName} (x${it.quantity})`).join(', ')}
💰 ຍອດເກັບ: ${order.paymentStatus === 'paid' ? 'ຊຳລະແລ້ວ (ບໍ່ຕ້ອງເກັບ)' : `${formatKip(order.grandTotal)} (COD)`}
📝 ໝາຍເຫດ: ${order.notes || '-'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 border border-slate-200">
        {/* Modal Top Bar */}
        <div className="no-print px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-800">
                ອໍເດີ: {order.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${paymentInfo.bg} ${paymentInfo.text} ${paymentInfo.border}`}
              >
                {paymentInfo.label}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${deliveryInfo.bg} ${deliveryInfo.text} ${deliveryInfo.border}`}
              >
                {deliveryInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ວັນທີສັ່ງຊື້: {formatDateLao(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ພິມໃບບິນ</span>
            </button>
            <button
              onClick={() => onEdit(order)}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition-colors"
              title="ແກ້ໄຂອໍເດີ"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content Area */}
        <div className="p-6 space-y-6 print:p-2" id="printable-receipt">
          {/* Shop Header (Printable) */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {settings?.shopName || 'Lao Smart Seller'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ໂທ: {settings?.shopPhone || '-'} • {settings?.shopAddress || ''}
            </p>
            <div className="mt-2 inline-block px-3 py-1 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
              ໃບບິນຮັບເງິນ / ໃບສົ່ງເຄື່ອງ (Order Slip)
            </div>
          </div>

          {/* Customer & Shipping Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>ທີ່ຢູ່ຈັດສົ່ງ (Shipping To):</span>
              </div>
              <div className="text-slate-900 font-semibold">{order.customerName}</div>
              <div className="text-slate-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="text-slate-600">
                {order.customerAddress || 'ບໍ່ລະບຸ'}, {order.province}
              </div>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ຂໍ້ມູນການຂົນສົ່ງ (Delivery):</span>
              </div>
              <div className="text-slate-700">
                ບໍລິສັດ: <span className="font-semibold text-slate-900">{order.shippingProvider}</span>
              </div>
              <div className="text-slate-700">
                ເລກຕິດຕາມ (Tracking):{' '}
                <span className="font-semibold text-slate-900">
                  {order.trackingNumber || 'ຍັງບໍ່ມີເລກ'}
                </span>
              </div>
              <div className="text-slate-700">
                ວິທີຊຳລະ: {getPaymentMethodLabel(order.paymentMethod)}
              </div>
            </div>
          </div>

          {/* Quick Copy for Delivery Driver */}
          <div className="no-print flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="text-xs text-emerald-800">
              ກັອບປີ້ຂໍ້ມູນລູກຄ້າເພື່ອສົ່ງໃຫ້ຂົນສົ່ງ / ຄົນຂັບລົດ:
            </div>
            <button
              onClick={handleCourierCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'ກັອບປີ້ແລ້ວ!' : 'ກັອບປີ້ຂໍ້ຄວາມ'}</span>
            </button>
          </div>

          {/* Order Items Table */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2">ລາຍການສິນຄ້າ:</div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2 font-semibold">ລາຍການ</th>
                  <th className="py-2 text-center font-semibold">ຈຳນວນ</th>
                  <th className="py-2 text-right font-semibold">ລາຄາ</th>
                  <th className="py-2 text-right font-semibold">ລວມ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="text-slate-800">
                    <td className="py-2.5 font-medium">{it.productName}</td>
                    <td className="py-2.5 text-center">{it.quantity}</td>
                    <td className="py-2.5 text-right">{formatKip(it.price)}</td>
                    <td className="py-2.5 text-right font-semibold">{formatKip(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ລວມຄ່າສິນຄ້າ (Subtotal):</span>
              <span>{formatKip(order.itemsTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ຄ່າຈັດສົ່ງ (Shipping Fee):</span>
              <span>+{formatKip(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>ສ່ວນຫຼຸດ (Discount):</span>
                <span>-{formatKip(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-2">
              <span>ຍອດລວມສຸດທິ (Grand Total):</span>
              <span className="text-emerald-700">{formatKip(order.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Slip if available */}
          {order.paymentSlipUrl && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800">ຮູບສະລິບໂອນເງິນ (Transfer Slip):</div>
              <div className="w-48 h-48 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                <img
                  src={order.paymentSlipUrl}
                  alt="Transfer Slip"
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => window.open(order.paymentSlipUrl, '_blank')}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-700">ໝາຍເຫດ: </span>
              {order.notes}
            </div>
          )}

          {/* Print footer notice */}
          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            ຂໍຂອບໃຈທີ່ອຸດໜຸນຮ້ານເຮົາ • ບັນຊີ BCEL One: {settings?.bcelAccountNumber || '-'}
          </div>
        </div>

        {/* Action Controls for Fast Status Transition (no-print) */}
        <div className="no-print px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">ປ່ຽນສະຖານະໄວ:</span>
            {order.paymentStatus === 'pending' && (
              <button
                onClick={() => onUpdateStatus(order.id, { paymentStatus: 'paid' })}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                ✓ ຊຳລະແລ້ວ
              </button>
            )}
            {order.deliveryStatus === 'pending_pack' && (
              <button
                onClick={() => onUpdateStatus(order.id, { deliveryStatus: 'shipping' })}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
              >
                🚚 ກຳລັງຈັດສົ່ງ
              </button>
            )}
            {order.deliveryStatus === 'shipping' && (
              <button
                onClick={() => onUpdateStatus(order.id, { deliveryStatus: 'delivered' })}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                ✓ ຈັດສົ່ງສຳເລັດ
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບອໍເດີນີ້?')) {
                onDelete(order.id);
                onClose();
              }
            }}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ລົບອໍເດີ</span>
          </button>
        </div>
      </div>
    </div>
  );

  function handleCourierCopy() {
    handleCopyCourierText();
  }
};
