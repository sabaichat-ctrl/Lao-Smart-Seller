import { PaymentStatus, DeliveryStatus, PaymentMethod } from '../types';

export function formatKip(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₭';
  return `${amount.toLocaleString('lo-LA')} ₭`;
}

export function formatDateLao(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

export function getPaymentStatusInfo(status: PaymentStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'paid':
      return {
        label: 'ຊຳລະແລ້ວ',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'pending':
      return {
        label: 'ລໍຖ້າຊຳລະ',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'cancelled':
      return {
        label: 'ຍົກເລີກ',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
      };
  }
}

export function getDeliveryStatusInfo(status: DeliveryStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'pending_pack':
      return {
        label: 'ລໍຖ້າແພັກ',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
      };
    case 'shipping':
      return {
        label: 'ກຳລັງຈັດສົ່ງ',
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
      };
    case 'delivered':
      return {
        label: 'ຈັດສົ່ງສຳເລັດ',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'returned':
      return {
        label: 'ຕີກັບ',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
      };
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'bcel_one':
      return 'BCEL One / QR';
    case 'cod':
      return 'ເກັບເງິນປາຍທາງ (COD)';
    case 'cash':
      return 'ເງິນສົດ';
    case 'transfer_other':
      return 'ທະນາຄານອື່ນ (JDB/LDB)';
    default:
      return method;
  }
}

export const LAO_PROVINCES = [
  'ນະຄອນຫຼວງວຽງຈັນ',
  'ຫຼວງພະບາງ',
  'ຈຳປາສັກ',
  'ສະຫວັນນະເຂດ',
  'ວຽງຈັນ (ແຂວງ)',
  'ຄຳມ່ວນ',
  'ບໍລິຄຳໄຊ',
  'ຊຽງຂວາງ',
  'ຫົວພັນ',
  'ອຸດົມໄຊ',
  'ຫຼວງນ້ຳທາ',
  'ບໍ່ແກ້ວ',
  'ຜົ້ງສາລີ',
  'ໄຊຍະບູລີ',
  'ສາລະວັນ',
  'ເຊກອງ',
  'ອັດຕະປື',
  'ໄຊສົມບູນ',
];

export const SHIPPING_PROVIDERS = [
  'ຮຸ່ງອາລຸນ (HAL Express)',
  'ອານຸສິດ (Anousith Express)',
  'ມີໄຊ (Mixay Express)',
  'ເຄທີ (KT Express)',
  'ຈັດສົ່ງດ່ວນ (Delivery ນະຄອນຫຼວງ)',
  'ລູກຄ້າມາຮັບເອງ (Pick up)',
];
