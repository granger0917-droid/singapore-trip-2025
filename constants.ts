
import { AppData, TicketCategory } from './types';

export const INITIAL_DATA: AppData = {
  flights: {
    outbound: {
      airline: 'STARLUX',
      code: '',
      date: '2025-01-01',
      time: '10:00',
      origin: 'TPE',
      destination: 'SIN',
      terminal: 'T2'
    },
    inbound: {
      airline: 'STARLUX',
      code: '',
      date: '2025-01-05',
      time: '14:00',
      origin: 'SIN',
      destination: 'TPE',
      terminal: 'T2'
    }
  },
  hotel: {
    name: '請編輯飯店資訊',
    address: '請輸入地址',
    mapQuery: '',
    checkIn: '2025-01-01',
    checkOut: '2025-01-05',
    phone: ''
  },
  itinerary: [
    {
      date: new Date().toISOString().split('T')[0], // Today
      dayLabel: 'Day 1',
      activities: []
    }
  ],
  tickets: []
};

export const CATEGORY_COLORS: Record<TicketCategory, string> = {
  [TicketCategory.Flight]: 'bg-[#98694c]/10 text-[#98694c] border-[#98694c]/20',
  [TicketCategory.Zoo]: 'bg-[#86754d]/10 text-[#86754d] border-[#86754d]/20',
  [TicketCategory.Feeding]: 'bg-[#41464b]/10 text-[#41464b] border-[#41464b]/20',
  [TicketCategory.Other]: 'bg-slate-100 text-slate-600 border-slate-200',
};
