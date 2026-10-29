import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Truck,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { api } from '../utils/api';
import { formatKip, formatDateLao } from '../utils/formatters';
import { Order } from '../types';

interface ReportsViewProps {
  orders: Order[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await api.getSalesReport();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;

    // Lao CSV headers
    const headers = [
      'ລະຫັດອໍເດີ (Order ID)',
      'ວັນທີ (Date)',
      'ຊື່ລູກຄ້າ (Customer)',
      'ເບີໂທລະສັບ (Phone)',
      'ແຂວງ (Province)',
      'ຂົນສົ່ງ (Shipping)',
      'ເລກພັດສະດຸ (Tracking)',
      'ສິນຄ້າ (Items)',
      'ຍອດສິນຄ້າ (Items Total)',
      'ຄ່າສົ່ງ (Shipping Fee)',
      'ສ່ວນຫຼຸດ (Discount)',
      'ຍອດລວມທັງໝົດ (Grand Total)',
      'ສະຖານະການຊຳລະ (Payment Status)',
      'ສະຖານະການຈັດສົ່ງ (Delivery Status)',
      'ວິທີຊຳລະ (Method)',
    ];

    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${formatDateLao(o.createdAt)}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.province}"`,
      `"${o.shippingProvider}"`,
      `"${o.trackingNumber || ''}"`,
      `"${o.items.map(it => `${it.productName} (x${it.quantity})`).join('; ')}"`,
      o.itemsTotal,
      o.shippingFee,
      o.discount,
      o.grandTotal,
      `"${o.paymentStatus}"`,
      `"${o.deliveryStatus}"`,
      `"${o.paymentMethod}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Lao character compatibility in Excel
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LaoSmartSeller_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>ກຳລັງປະມວນຜົນລາຍງານຍອດຂາຍ...</span>
      </div>
    );
  }

  // Calculate maximum for bar charts
  const maxDaySales = Math.max(...reportData.last7Days.map((d: any) => d.sales), 100000);

  // Delivered vs returned rate
  const totalCompleted = reportData.deliveryBreakdown.delivered + reportData.deliveryBreakdown.returned;
  const deliverySuccessRate =
    totalCompleted > 0
      ? Math.round((reportData.deliveryBreakdown.delivered / totalCompleted) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            ລາຍງານຍອດຂາຍ ແລະ ສະຖິຕິ (Sales Reports)
          </h1>
          <p className="text-xs text-slate-500">
            ສະຫຼຸບຜົນການດຳເນີນງານ, ລາຍຮັບ, ຕົ້ນທຶນ ແລະ ປະສິດທິພາບການຈັດສົ່ງ
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>ດາວໂຫລດລາຍງານ Excel (CSV)</span>
        </button>
      </div>

      {/* Top 3 High Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ລາຍຮັບລວມທັງໝົດ</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-700">
            {formatKip(reportData.totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-400">ຈາກທຸກອໍເດີທີ່ສຳເລັດ</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ອໍເດີຊຳລະແລ້ວ</span>
          <div className="mt-1 text-2xl font-extrabold text-indigo-700">
            {reportData.paymentBreakdown.paid}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {reportData.totalOrders} ອໍເດີ
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            ລໍຖ້າຊຳລະ {reportData.paymentBreakdown.pending} ອໍເດີ
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">ອັດຕາຈັດສົ່ງສຳເລັດ</span>
          <div className="mt-1 text-2xl font-extrabold text-teal-700">
            {deliverySuccessRate}%
          </div>
          <span className="text-[11px] text-slate-400">
            ຈັດສົ່ງແລ້ວ {reportData.deliveryBreakdown.delivered} • ຕີກັບ {reportData.deliveryBreakdown.returned}
          </span>
        </div>
      </div>

      {/* 7-Day Sales & Profit Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">
              ຍອດຂາຍ ແລະ ກຳໄລ 7 ວັນຍ້ອນຫຼັງ (Last 7 Days)
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
              <span className="text-slate-600">ຍອດຂາຍ (Sales)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-400 inline-block"></span>
              <span className="text-slate-600">ກຳໄລຄາດຄະເນ (Profit)</span>
            </span>
          </div>
        </div>

        {/* Bar chart bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 h-64 items-end">
          {reportData.last7Days.map((day: any, i: number) => {
            const heightPercent = Math.max(5, Math.round((day.sales / maxDaySales) * 100));
            const profitHeightPercent = Math.max(
              2,
              Math.round((Math.max(0, day.profit) / maxDaySales) * 100)
            );

            return (
              <div key={i} className="flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white rounded px-2 py-1 mb-1 whitespace-nowrap z-10 pointer-events-none">
                  <div>ຂາຍ: {formatKip(day.sales)}</div>
                  <div className="text-teal-300">ກຳໄລ: +{formatKip(day.profit)}</div>
                  <div>{day.orderCount} ອໍເດີ</div>
                </div>

                <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-44">
                  {/* Sales Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-1/2 bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all relative"
                  />
                  {/* Profit Bar */}
                  <div
                    style={{ height: `${profitHeightPercent}%` }}
                    className="w-1/2 bg-teal-400 rounded-t-md hover:bg-teal-500 transition-all relative"
                  />
                </div>

                {/* Day label */}
                <span className="mt-2 text-[10px] font-semibold text-slate-600 text-center leading-tight truncate w-full">
                  {day.label}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {formatKip(day.sales).replace(' ₭', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdowns: Category & Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>ຍອດຂາຍຕາມໝວດໝູ່ (Sales by Category)</span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(reportData.categorySales).length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">ຍັງບໍ່ມີຂໍ້ມູນຍອດຂາຍ</div>
            ) : (
              Object.entries(reportData.categorySales).map(([cat, amount]: [string, any]) => {
                const total = reportData.totalRevenue || 1;
                const pct = Math.round((amount / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="text-slate-900 font-bold">
                        {formatKip(amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Delivery status breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>ສະຖານະການຈັດສົ່ງ (Delivery Distribution)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[11px] text-sky-800 font-medium">ລໍຖ້າແພັກ</span>
              <div className="text-lg font-bold text-sky-900 mt-0.5">
                {reportData.deliveryBreakdown.pending_pack}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <span className="text-[11px] text-indigo-800 font-medium">ກຳລັງຈັດສົ່ງ</span>
              <div className="text-lg font-bold text-indigo-900 mt-0.5">
                {reportData.deliveryBreakdown.shipping}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] text-emerald-800 font-medium">ຈັດສົ່ງສຳເລັດ</span>
              <div className="text-lg font-bold text-emerald-900 mt-0.5">
                {reportData.deliveryBreakdown.delivered}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[11px] text-rose-800 font-medium">ຕີກັບ (Returned)</span>
              <div className="text-lg font-bold text-rose-900 mt-0.5">
                {reportData.deliveryBreakdown.returned}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
