import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  MapPin,
  ShoppingBag,
  PlusCircle,
  Edit2,
  Calendar,
} from 'lucide-react';
import { Customer } from '../types';
import { formatKip, formatDateLao } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  onSelectCustomerForOrder: (customer: Customer) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSelectCustomerForOrder,
  onUpdateCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [notesInput, setNotesInput] = useState('');

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.province && c.province.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setNotesInput(customer.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingCustomer) return;
    await onUpdateCustomer(editingCustomer.id, { notes: notesInput });
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            ລາຍຊື່ລູກຄ້າ (Customer List)
          </h1>
          <p className="text-xs text-slate-500">
            ລູກຄ້າທັງໝົດ {customers.length} ຄົນ • ຕິດຕາມຍອດຊື້ສະສົມ ແລະ ປະຫວັດການສັ່ງຊື້
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ຄົ້ນຫາຊື່ ຫຼື ເບີໂທ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ຊື່ລູກຄ້າ</th>
                <th className="px-4 py-3">ເບີໂທລະສັບ</th>
                <th className="px-4 py-3">ທີ່ຢູ່ & ແຂວງ</th>
                <th className="px-4 py-3 text-center">ຈຳນວນອໍເດີ</th>
                <th className="px-4 py-3">ຍອດຊື້ສະສົມ</th>
                <th className="px-4 py-3">ສັ່ງຊື້ລ່າສຸດ</th>
                <th className="px-4 py-3">ໝາຍເຫດ</th>
                <th className="px-4 py-3 text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">ບໍ່ພົບລາຍຊື່ລູກຄ້າ</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                          {customer.name.slice(0, 1)}
                        </div>
                        <span className="truncate max-w-[140px]">{customer.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-medium">{customer.phone}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-800 line-clamp-1 max-w-[160px]">
                        {customer.address || '-'}
                      </div>
                      <div className="text-[10px] text-slate-400">{customer.province}</div>
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {customer.totalOrders}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-extrabold text-emerald-700 whitespace-nowrap">
                      {formatKip(customer.totalSpent)}
                    </td>

                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDateLao(customer.lastOrderAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-500 line-clamp-1 max-w-[140px] text-[11px]">
                        {customer.notes || '-'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCustomerForOrder(customer)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                          title="ສ້າງອໍເດີໃຫ້ລູກຄ້ານີ້"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>ສ້າງອໍເດີ</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="ແກ້ໄຂໝາຍເຫດ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Notes Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              ແກ້ໄຂໝາຍເຫດລູກຄ້າ: {editingCustomer.name}
            </h3>
            <textarea
              rows={3}
              placeholder="ໃສ່ໝາຍເຫດ ເຊັ່ນ: ລູກຄ້າປະຈຳ, ມັກສັ່ງ Size L, ໂອນຜ່ານ BCEL One..."
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                ບັນທຶກ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
