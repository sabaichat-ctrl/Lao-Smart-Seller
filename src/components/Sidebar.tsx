import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Bot,
  Settings,
  X,
  Facebook,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MessengerConfig } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  messengerConfig: MessengerConfig | null;
  pendingOrdersCount: number;
  lowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  messengerConfig,
  pendingOrdersCount,
  lowStockCount,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'ພາບລວມຮ້ານຄ້າ',
      sublabel: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'products',
      label: 'ຈັດການສິນຄ້າ',
      sublabel: 'Products & Stock',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} ໃກ້ໝົດ` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'orders',
      label: 'ຈັດການອໍເດີ',
      sublabel: 'Orders Management',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: 'customers',
      label: 'ລາຍຊື່ລູກຄ້າ',
      sublabel: 'Customer List',
      icon: Users,
    },
    {
      id: 'reports',
      label: 'ລາຍງານຍອດຂາຍ',
      sublabel: 'Sales Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'messenger',
      label: 'ລະບົບ Messenger AI',
      sublabel: 'Automation & Webhook',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'settings',
      label: 'ຕັ້ງຄ່າຮ້ານຄ້າ',
      sublabel: 'Shop Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static lg:shadow-none'
        }`}
      >
        {/* Mobile close button & brand */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-800 text-sm">ເມນູຫຼັກ</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            ເມນູລະບົບ (Menu)
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="leading-tight">{item.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {item.sublabel}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isActive
                        ? 'bg-white text-emerald-800 border-white'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && !item.badge && (
                  <span
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Facebook Messenger Status Widget in Sidebar footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="rounded-xl p-3 bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Messenger Status</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  messengerConfig?.isConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>ສະຖານະ:</span>
              <span
                className={`font-medium ${
                  messengerConfig?.isConnected
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {messengerConfig?.isConnected
                  ? 'ເຊື່ອມຕໍ່ແລ້ວ'
                  : 'ຍັງບໍ່ໄດ້ເຊື່ອມຕໍ່'}
              </span>
            </div>

            <button
              onClick={() => handleNavClick('messenger')}
              className="w-full text-center text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-lg border border-emerald-200/60 transition-colors"
            >
              ຕັ້ງຄ່າ Webhook & AI &rarr;
            </button>
          </div>

          <div className="mt-2.5 text-center text-[10px] text-slate-400">
            Lao Smart Seller v1.0 • 2025
          </div>
        </div>
      </aside>
    </>
  );
};
