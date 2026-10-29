import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Order, PaymentStatus, DeliveryStatus } from '../types';
import {
  formatKip,
  formatDateLao,
  getPaymentStatusInfo,
  getDeliveryStatusInfo,
  getPaymentMethodLabel,
} from '../utils/formatters';

interface OrdersViewProps {
  orders: Order[];
  onOpenNewOrder: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateStatus: (id: string, updates: Partial<Order>) => Promise<void>;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenNewOrder,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState<string>('all');

  const tabs = [
    { id: 'all', label: 'ທັງໝົດ', count: orders.length },
    {
      id: 'pending_pack',
      label: 'ລໍຖ້າແພັກ',
      count: orders.filter(o => o.deliveryStatus === 'pending_pack').length,
    },
    {
      id: 'shipping',
      label: 'ກຳລັງຈັດສົ່ງ',
      count: orders.filter(o => o.deliveryStatus === 'shipping').length,
    },
    {
      id: 'delivered',
      label: 'ຈັດສົ່ງສຳເລັດ',
      count: orders.filter(o => o.deliveryStatus === 'delivered').length,
    },
    {
      id: 'pending_pay',
      label: 'ລໍຖ້າຊຳລະ',
      count: orders.filter(o => o.paymentStatus === 'pending').length,
    },
    {
      id: 'cancelled',
      label: 'ຍົກເລີກ',
      count: orders.filter(o => o.paymentStatus === 'cancelled').length,
    },
  ];

  const filteredOrders = orders.filter(order => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.id.toLowerCase().includes(q) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q));

    let matchesTab = true;
    if (statusTab === 'pending_pack') matchesTab = order.deliveryStatus === 'pending_pack';
    if (statusTab === 'shipping') matchesTab = order.deliveryStatus === 'shipping';
    if (statusTab === 'delivered') matchesTab = order.deliveryStatus === 'delivered';
    if (statusTab === 'pending_pay') matchesTab = order.paymentStatus === 'pending';
    if (statusTab === 'cancelled') matchesTab = order.paymentStatus === 'cancelled';

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            ຈັດການອໍເດີ ແລະ ການຈັດສົ່ງ (Orders Management)
          </h1>
          <p className="text-xs text-slate-500">
            ອໍເດີທັງໝົດ {orders.length} ລາຍການ • ຄຸ້ມຄອງສະຖານະການຊຳລະ ແລະ ພິມໃບບິນຈັດສົ່ງ
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ ສ້າງອໍເດີໃໝ່</span>
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                statusTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຕາມຊື່ລູກຄ້າ, ເບີໂທລະສັບ, ລະຫັດອໍເດີ ຫຼື ເລກພັດສະດຸ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ລະຫັດ / ວັນທີ</th>
                <th className="px-4 py-3">ລູກຄ້າ & ທີ່ຢູ່</th>
                <th className="px-4 py-3">ລາຍການສິນຄ້າ</th>
                <th className="px-4 py-3">ຂົນສົ່ງ / ເລກພັດສະດຸ</th>
                <th className="px-4 py-3">ຍອດລວມ</th>
                <th className="px-4 py-3">ການຊຳລະ</th>
                <th className="px-4 py-3">ການຈັດສົ່ງ</th>
                <th className="px-4 py-3 text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">ບໍ່ພົບລາຍການອໍເດີ</p>
                    <p className="text-[11px] mt-0.5">ກົດປຸ່ມ "+ ສ້າງອໍເດີໃໝ່" ເພື່ອເລີ່ມຕົ້ນ</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const payInfo = getPaymentStatusInfo(order.paymentStatus);
                  const delInfo = getDeliveryStatusInfo(order.deliveryStatus);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onViewOrder(order)}
                    >
                      {/* ID and Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{order.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatDateLao(order.createdAt)}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 truncate max-w-[140px]">
                          {order.customerName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {order.province}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 line-clamp-1 max-w-[180px]">
                          {order.items.map(it => `${it.productName} (x${it.quantity})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.items.length} ລາຍການ
                        </div>
                      </td>

                      {/* Shipping */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-700">{order.shippingProvider}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {order.trackingNumber || 'ຍັງບໍ່ມີເລກ'}
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-extrabold text-emerald-700 text-sm">
                          {formatKip(order.grandTotal)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </div>
                      </td>

                      {/* Payment Status Dropdown */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.paymentStatus}
                          onChange={e =>
                            onUpdateStatus(order.id, { paymentStatus: e.target.value as PaymentStatus })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${payInfo.bg} ${payInfo.text} ${payInfo.border} focus:outline-none`}
                        >
                          <option value="pending">ລໍຖ້າຊຳລະ</option>
                          <option value="paid">ຊຳລະແລ້ວ</option>
                          <option value="cancelled">ຍົກເລີກ</option>
                        </select>
                      </td>

                      {/* Delivery Status Dropdown */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.deliveryStatus}
                          onChange={e =>
                            onUpdateStatus(order.id, {
                              deliveryStatus: e.target.value as DeliveryStatus,
                            })
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${delInfo.bg} ${delInfo.text} ${delInfo.border} focus:outline-none`}
                        >
                          <option value="pending_pack">ລໍຖ້າແພັກ</option>
                          <option value="shipping">ກຳລັງຈັດສົ່ງ</option>
                          <option value="delivered">ຈັດສົ່ງສຳເລັດ</option>
                          <option value="returned">ຕີກັບ</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="ເບິ່ງໃບບິນ & ພິມ"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditOrder(order)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="ແກ້ໄຂອໍເດີ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບອໍເດີ ${order.id}?`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="ລົບອໍເດີ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
