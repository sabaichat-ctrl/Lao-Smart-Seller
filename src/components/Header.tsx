import React from 'react';
import {
  ShoppingBag,
  PlusCircle,
  Bell,
  Menu,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { ShopSettings } from '../types';

interface HeaderProps {
  settings: ShopSettings | null;
  adminName: string;
  lowStockCount: number;
  pendingOrdersCount: number;
  onOpenNewOrder: () => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  adminName,
  lowStockCount,
  pendingOrdersCount,
  onOpenNewOrder,
  onToggleSidebar,
  onLogout,
  onSelectTab,
}) => {
  const todayDate = new Intl.DateTimeFormat('lo-LA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile menu button & App Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  Lao Smart Seller
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  LAK ₭
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[240px]">
                {settings?.shopName || 'ລະບົບຮ້ານຄ້າອອນລາຍ Facebook'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Date / Info (desktop) */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{todayDate}</span>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Notifications pill */}
          <div className="flex items-center gap-1.5">
            {lowStockCount > 0 && (
              <button
                onClick={() => onSelectTab('products')}
                title={`${lowStockCount} ລາຍການສິນຄ້າໃກ້ໝົດ`}
                className="relative p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors border border-amber-200/60"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {lowStockCount}
                </span>
              </button>
            )}

            {pendingOrdersCount > 0 && (
              <button
                onClick={() => onSelectTab('orders')}
                title={`${pendingOrdersCount} ອໍເດີລໍຖ້າແພັກ`}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200/80 hover:bg-sky-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>ລໍຖ້າແພັກ: {pendingOrdersCount}</span>
              </button>
            )}
          </div>

          {/* Quick Create Order Button */}
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">ສ້າງອໍເດີໃໝ່</span>
            <span className="xs:hidden">ອໍເດີ</span>
          </button>

          {/* Admin badge & logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden lg:block text-right">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{adminName || 'ຜູ້ຈັດການຮ້ານ'}</span>
              </div>
              <span className="text-[10px] text-slate-400">Admin Active</span>
            </div>

            <button
              onClick={onLogout}
              title="ອອກຈາກລະບົບ (Logout)"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
