import { AppData, TicketCategory } from './types';

export const INITIAL_DATA: AppData = {
  flights: {
    outbound: {
      code: 'JX771',
      date: '2025-11-27',
      time: '08:25',
      airport: 'TPE ➝ SIN',
      terminal: 'T2'
    },
    inbound: {
      code: 'JX772',
      date: '2025-12-01',
      time: '14:45',
      airport: 'SIN ➝ TPE',
      terminal: 'T2'
    }
  },
  hotel: {
    name: 'The Clan Hotel Singapore',
    address: 'Far East Square, 近 Telok Ayer 站',
    mapQuery: 'The Clan Hotel Singapore',
    checkIn: '2025-11-27',
    checkOut: '2025-12-01',
    phone: '+65 6228 6388'
  },
  itinerary: [
    {
      date: '2025-11-27',
      dayLabel: 'Day 1',
      activities: [
        { id: '1-1', time: '08:25', title: '出發：桃園機場 T2', location: 'TPE Terminal 2 (JX771)', mapQuery: 'Taoyuan International Airport Terminal 2', isImportant: true },
        { id: '1-2', time: '13:15', title: '抵達新加坡樟宜機場 T2', location: 'Changi Airport T2', mapQuery: 'Changi Airport Terminal 2' },
        { id: '1-3', time: '14:15', title: '星耀樟宜 (寄放行李/奇幻滑梯/雨漩渦)', location: 'Jewel Changi', mapQuery: 'Jewel Changi Airport' },
        { id: '1-4', time: '17:00', title: '晚餐：松發肉骨茶', location: 'Jewel B2', mapQuery: 'Song Fa Bak Kut Teh Jewel' },
        { id: '1-5', time: '18:00', title: '甜點：Mr. Coconut', location: 'Jewel B2', mapQuery: 'Mr Coconut Jewel' },
        { id: '1-6', time: '18:30', title: '前往飯店 Check-in', location: 'The Clan Hotel', mapQuery: 'The Clan Hotel Singapore', isImportant: true },
        { id: '1-7', time: '19:30', title: '濱海灣花園 (超級樹/燈光秀)', location: 'Supertree Grove', mapQuery: 'Supertree Grove', note: '19:45 燈光秀' }
      ]
    },
    {
      date: '2025-11-28',
      dayLabel: 'Day 2',
      activities: [
        { id: '2-1', time: '08:30', title: '飯店出發 (Grab)', location: '往 Mandai Wildlife', mapQuery: 'Singapore Zoo' },
        { id: '2-2', time: '09:30', title: '🐘 大象餵食 (亞洲象區)', location: 'Singapore Zoo', mapQuery: 'Singapore Zoo Elephants of Asia', isImportant: true },
        { id: '2-3', time: '10:30', title: '💦 海獅表演 (Splash Safari)', location: 'Shaw Foundation Amphitheatre', mapQuery: 'Shaw Foundation Amphitheatre', isImportant: true },
        { id: '2-4', time: '11:15', title: '午餐：Ah Meng Restaurant', location: 'Ah Meng Restaurant', mapQuery: 'Ah Meng Restaurant Singapore Zoo' },
        { id: '2-5', time: '12:30', title: '😴 寶寶午睡 (搭遊園車前往非洲區)', location: 'Tram Station', mapQuery: 'Singapore Zoo Tram Station' },
        { id: '2-6', time: '13:50', title: '🦒 長頸鹿餵食', location: 'Wild Africa', mapQuery: 'Wild Africa Singapore Zoo', isImportant: true },
        { id: '2-7', time: '15:00', title: '💦 KidzWorld 兒童玩水區', location: 'KidzWorld', mapQuery: 'KidzWorld Singapore Zoo', note: '記得帶泳衣、毛巾' },
        { id: '2-8', time: '17:00', title: '離園返回市區', location: 'Exit', mapQuery: '' }
      ]
    },
    {
      date: '2025-11-29',
      dayLabel: 'Day 3',
      activities: [
        { id: '3-1', time: '09:00', title: '出發前往聖淘沙', location: 'Beach Station', mapQuery: 'Beach Station Sentosa' },
        { id: '3-2', time: '09:30', title: '🏎️ 斜坡滑車 Luge', location: 'Skyline Luge', mapQuery: 'Skyline Luge Singapore', isImportant: true },
        { id: '3-3', time: '11:30', title: '午餐：Shake Shack', location: 'Beach Station', mapQuery: 'Shake Shack Sentosa' },
        { id: '3-4', time: '13:00', title: '輕軌前往名勝世界', location: 'Waterfront Station', mapQuery: 'Resorts World Sentosa' },
        { id: '3-5', time: '14:00', title: '🐠 S.E.A. 海洋館', location: 'S.E.A. Aquarium', mapQuery: 'S.E.A. Aquarium' },
        { id: '3-6', time: '16:30', title: '前往 VivoCity', location: 'VivoCity', mapQuery: 'VivoCity Singapore' },
        { id: '3-7', time: '18:00', title: '晚餐：VivoCity', location: 'VivoCity', mapQuery: 'VivoCity Food Court' }
      ]
    },
    {
      date: '2025-11-30',
      dayLabel: 'Day 4',
      activities: [
        { id: '4-1', time: '09:00', title: '早餐：亞坤 (新達城店)', location: 'Suntec City', mapQuery: 'Ya Kun Kaya Toast Suntec City' },
        { id: '4-2', time: '10:00', title: '🦆 鴨子船 (Ducktours)', location: 'Suntec City B1', mapQuery: 'Ducktours Singapore', isImportant: true },
        { id: '4-3', time: '11:15', title: '魚尾獅公園拍照', location: 'Merlion Park', mapQuery: 'Merlion Park' },
        { id: '4-4', time: '12:00', title: '午餐：濱海灣金沙', location: 'Marina Bay Sands', mapQuery: 'Marina Bay Sands' },
        { id: '4-5', time: '15:30', title: '🌿 雲霧林 (Cloud Forest)', location: 'Gardens by the Bay', mapQuery: 'Cloud Forest Singapore', isImportant: true },
        { id: '4-6', time: '17:00', title: '🌸 花穹 (Flower Dome)', location: 'Gardens by the Bay', mapQuery: 'Flower Dome Singapore' },
        { id: '4-7', time: '18:00', title: '晚餐：Satay by the Bay', location: 'Satay by the Bay', mapQuery: 'Satay by the Bay' },
        { id: '4-8', time: '19:45', title: '超級樹燈光秀', location: 'Supertree Grove', mapQuery: 'Supertree Grove', note: '躺著看' }
      ]
    },
    {
      date: '2025-12-01',
      dayLabel: 'Day 5',
      activities: [
        { id: '5-1', time: '09:30', title: '早餐：亞坤 (T2)', location: 'Changi Airport T2', mapQuery: 'Ya Kun Kaya Toast Changi Airport Terminal 2' },
        { id: '5-2', time: '10:30', title: '星宇航空報到', location: 'T2 Check-in Counter', mapQuery: 'Changi Airport Terminal 2', isImportant: true },
        { id: '5-3', time: '11:45', title: '搭 Skytrain 往 T3', location: 'Terminal 3', mapQuery: '' },
        { id: '5-4', time: '12:00', title: '🦋 蝴蝶園 & 午餐', location: 'T3 Butterfly Garden', mapQuery: 'Butterfly Garden Changi Airport' },
        { id: '5-5', time: '13:40', title: '搭 Skytrain 返 T2', location: 'Terminal 2', mapQuery: '' },
        { id: '5-6', time: '14:45', title: '起飛返家 (JX772)', location: 'T2 Gate', mapQuery: '' },
        { id: '5-7', time: '19:20', title: '抵達桃園機場', location: 'TPE Terminal 2', mapQuery: '' }
      ]
    }
  ],
  tickets: []
};

// Updated Colors based on Earth Tone Palette
// Flight: Primary Copper Brown
// Zoo: Secondary Olive Gold
// Feeding: Accent Dark Slate (or a lighter variation)
// Other: Gray/Neutral
export const CATEGORY_COLORS: Record<TicketCategory, string> = {
  [TicketCategory.Flight]: 'bg-[#98694c]/10 text-[#98694c] border-[#98694c]/20',
  [TicketCategory.Zoo]: 'bg-[#86754d]/10 text-[#86754d] border-[#86754d]/20',
  [TicketCategory.Feeding]: 'bg-[#41464b]/10 text-[#41464b] border-[#41464b]/20',
  [TicketCategory.Other]: 'bg-slate-100 text-slate-600 border-slate-200',
};