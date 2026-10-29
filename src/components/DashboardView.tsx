import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { DashboardStats, Order, Product } from '../types';
import {
  formatKip,
  formatDateLao,
  getPaymentStatusInfo,
  getDeliveryStatusInfo,
} from '../utils/formatters';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onSelectTab: (tab: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewProduct: () => void;
  onViewOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, updates: Partial<Order>) => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onSelectTab,
  onOpenNewOrder,
  onOpenNewProduct,
  onViewOrder,
  onUpdateOrderStatus,
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <span>ກຳລັງໂຫລດຂໍ້ມູນສະຖິຕິ...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Low Stock Warning Banner if any items are running low */}
      {stats.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm">
                ແຈ້ງເຕືອນສິນຄ້າໃກ້ໝົດ: ມີ {stats.lowStockCount} ລາຍການໃນສາງ
              </div>
              <p className="text-xs text-amber-700">
                ກະລຸນາກວດສອບ ແລະ ເຕີມສະຕັອກສິນຄ້າເພື່ອປ້ອງກັນການຂາດສິນຄ້າຂາຍໃຫ້ລູກຄ້າ
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('products')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shrink-0 self-start sm:self-auto transition-colors"
          >
            ເບິ່ງສິນຄ້າໃກ້ໝົດ &rarr;
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Today's Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ຍອດຂາຍມື້ນີ້ (Today Sales)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatKip(stats.todaySales)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>ອໍເດີມື້ນີ້:</span>
            <span className="font-bold text-slate-800">{stats.todayOrdersCount} ລາຍການ</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* KPI 2: Today's Estimated Profit */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ກຳໄລຄາດຄະເນມື້ນີ້</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-teal-700 tracking-tight">
            +{formatKip(stats.todayProfit)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>ຫັກຕົ້ນທຶນສິນຄ້າ:</span>
            <span className="font-medium text-slate-600">
              {stats.todaySales > 0
                ? `${Math.round((stats.todayProfit / stats.todaySales) * 100)}% ມາກິນ`
                : '0%'}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400" />
        </div>

        {/* KPI 3: Monthly Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ຍອດຂາຍເດືອນນີ້</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatKip(stats.monthlySales)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>ອໍເດີທັງໝົດ:</span>
            <span className="font-bold text-slate-800">{stats.totalOrdersCount} ລາຍການ</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-400" />
        </div>

        {/* KPI 4: Pending Pack Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ລໍຖ້າແພັກ & ຈັດສົ່ງ</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-sky-700 tracking-tight">
            {stats.pendingOrdersCount} <span className="text-xs font-normal text-slate-400">ອໍເດີ</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>ກຳລັງຈັດສົ່ງ:</span>
            <span className="font-bold text-slate-800">{stats.shippingOrdersCount} ອໍເດີ</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">ເມນູດ່ວນ:</span>
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ ສ້າງອໍເດີໃໝ່</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>+ ເພີ່ມສິນຄ້າ</span>
          </button>
          <button
            onClick={() => onSelectTab('messenger')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors border border-indigo-200/60"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>ທົດສອບ Messenger AI</span>
          </button>
        </div>

        <button
          onClick={() => onSelectTab('reports')}
          className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
        >
          <span>ເບິ່ງລາຍງານຍອດຂາຍລະອຽດ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Content Grid: Recent Orders (8 cols) & Top Selling Products (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">
                ອໍເດີລ່າສຸດ (Recent Orders)
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>ເບິ່ງທັງໝົດ</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">ລະຫັດອໍເດີ</th>
                  <th className="px-4 py-3">ລູກຄ້າ</th>
                  <th className="px-4 py-3">ຍອດລວມ</th>
                  <th className="px-4 py-3">ການຊຳລະ</th>
                  <th className="px-4 py-3">ການຈັດສົ່ງ</th>
                  <th className="px-4 py-3 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      ຍັງບໍ່ມີອໍເດີໃນລະບົບ
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map(order => {
                    const pay = getPaymentStatusInfo(order.paymentStatus);
                    const del = getDeliveryStatusInfo(order.deliveryStatus);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onViewOrder(order)}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {order.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 truncate max-w-[130px]">
                            {order.customerName}
                          </div>
                          <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-700">
                          {formatKip(order.grandTotal)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pay.bg} ${pay.text} ${pay.border}`}
                          >
                            {pay.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${del.bg} ${del.text} ${del.border}`}
                          >
                            {del.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onViewOrder(order)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            ເບິ່ງບິນ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-800">
                ສິນຄ້າຂາຍດີ (Top Products)
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              ຈັດການ
            </button>
          </div>

          <div className="p-4 flex-1 space-y-3.5">
            {stats.topSellingProducts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                ຍັງບໍ່ມີຍອດຂາຍສິນຄ້າ
              </div>
            ) : (
              stats.topSellingProducts.map((item, idx) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ຂາຍໄດ້: <span className="font-bold text-slate-700">{item.totalQuantity}</span> ຊິ້ນ •
                      ຍອດ: <span className="font-bold text-emerald-700">{formatKip(item.totalRevenue)}</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 shrink-0">
                    #{idx + 1}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              + ເພີ່ມສິນຄ້າໃໝ່ ຫຼື ຈັດການສາງ &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
