import React, { useState, useEffect } from 'react';
import { AppData, Activity, Tab, TicketCategory } from '../types';
import { Plane, Calendar, AlertCircle, Hotel, MapPin, Phone, Navigation, Star } from 'lucide-react';

interface Props {
  data: AppData;
  onChangeTab: (tab: Tab, category?: TicketCategory | 'ALL') => void;
}

const Overview: React.FC<Props> = ({ data, onChangeTab }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, started: false });
  const [nextActivity, setNextActivity] = useState<Activity | null>(null);
  const [flightView, setFlightView] = useState<'outbound' | 'inbound'>('outbound');
  
  // Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const departureTime = `${data.flights.outbound.date}T${data.flights.outbound.time}:00`;
      const departure = new Date(departureTime);
      const diff = departure.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, started: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes, started: false });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data.flights]);

  // Next Activity Logic
  useEffect(() => {
    const now = new Date();
    const currentMs = now.getTime();

    // Flatten all activities with full timestamp
    let upcoming: { act: Activity; ms: number; dayLabel: string }[] = [];
    
    data.itinerary.forEach(day => {
        day.activities.forEach(act => {
            const actTime = new Date(`${day.date}T${act.time}:00`).getTime();
            if (actTime > currentMs) {
                upcoming.push({ act, ms: actTime, dayLabel: day.dayLabel });
            }
        });
    });

    upcoming.sort((a, b) => a.ms - b.ms);
    
    if (upcoming.length > 0) {
        setNextActivity(upcoming[0].act);
    }
  }, [data.itinerary]);

  const today = new Date().toISOString().split('T')[0];
  const currentDayItinerary = data.itinerary.find(d => d.date === today);
  const displayItinerary = currentDayItinerary || data.itinerary[0];
  const hasImportantToday = displayItinerary.activities.some(a => a.isImportant);
  const isToday = !!currentDayItinerary;

  const currentFlight = flightView === 'outbound' ? data.flights.outbound : data.flights.inbound;
  const origin = flightView === 'outbound' ? 'TPE' : 'SIN';
  const destination = flightView === 'outbound' ? 'SIN' : 'TPE';
  const originName = flightView === 'outbound' ? 'TAIPEI' : 'SINGAPORE';
  const destName = flightView === 'outbound' ? 'SINGAPORE' : 'TAIPEI';

  return (
    <div className="bg-slate-50 h-full flex flex-col">
      {/* Hero Header - Earth Tone Gradient */}
      <div className="relative bg-[#98694c] text-white pb-8 pt-16 px-6 rounded-b-[3rem] shadow-2xl z-10 shrink-0 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#86754d] rounded-full mix-blend-overlay opacity-40 blur-3xl"></div>
        <div className="absolute top-10 -left-10 w-40 h-40 bg-[#41464b] rounded-full mix-blend-overlay opacity-30 blur-2xl"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-1 text-white">Singapore</h1>
                    <p className="text-orange-100 text-sm font-medium tracking-widest uppercase">Family Trip 2025</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs font-bold text-orange-50 flex items-center">
                    <Calendar size={12} className="mr-1.5" />
                    <span>{timeLeft.days} 天後出發</span>
                </div>
            </div>
            
            {/* Countdown Cards */}
            {!timeLeft.started && (
                <div className="flex space-x-3 mt-6">
                    <CountdownUnit value={timeLeft.days} label="DAYS" />
                    <CountdownUnit value={timeLeft.hours} label="HRS" />
                    <CountdownUnit value={timeLeft.minutes} label="MINS" />
                </div>
            )}
            {timeLeft.started && (
                <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-green-400 p-2 rounded-full mr-3 animate-pulse">
                        <Plane size={20} className="text-green-900" />
                    </div>
                    <div>
                        <p className="font-bold text-lg leading-none">旅程進行中</p>
                        <p className="text-xs text-green-100 mt-1">Have a nice trip!</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-32">
        
        {/* NEXT UP Card (Dynamic) */}
        {nextActivity && (
             <div className="transform -translate-y-12">
                 <div className="flex justify-between items-center px-2 mb-2 text-white/90 text-xs font-bold uppercase tracking-wider">
                     <span>Next Activity</span>
                     <span>即將前往</span>
                 </div>
                 <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 border-l-4 border-primary relative overflow-hidden">
                     <div className="absolute right-0 top-0 p-3 opacity-5 text-primary">
                         <Navigation size={80} />
                     </div>
                     <div className="relative z-10">
                         <div className="flex items-center text-primary font-mono font-bold text-xl mb-1">
                             {nextActivity.time}
                             <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">UPCOMING</span>
                         </div>
                         <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2 pr-8">{nextActivity.title}</h3>
                         <div className="flex items-center text-sm text-gray-500">
                             <MapPin size={14} className="mr-1.5 text-secondary" />
                             <span className="line-clamp-1">{nextActivity.location || '已安排行程'}</span>
                         </div>
                         <div className="mt-4 flex space-x-2">
                             <button 
                                 onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextActivity.mapQuery)}`, '_blank')}
                                 className="flex-1 bg-primary text-white text-sm py-2 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center"
                             >
                                 <Navigation size={14} className="mr-1.5" /> 導航
                             </button>
                             <button 
                                 onClick={() => onChangeTab(Tab.Itinerary)}
                                 className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                             >
                                 詳細
                             </button>
                         </div>
                     </div>
                 </div>
             </div>
        )}

        {/* Boarding Pass Style Flight Card */}
        <div className={!nextActivity ? '-mt-6' : ''}>
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mr-3 border border-slate-100">
                        <Plane size={18}/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Flight Ticket</span>
                        <span className="font-bold text-gray-800">航班資訊</span>
                    </div>
                </div>
                <div className="flex bg-slate-200 rounded-lg p-0.5">
                    <button 
                        onClick={() => setFlightView('outbound')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${flightView === 'outbound' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                        去程
                    </button>
                    <button 
                        onClick={() => setFlightView('inbound')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${flightView === 'inbound' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                        回程
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative transition-all duration-300">
                {/* Top Part */}
                <div className="p-5 pb-8 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center space-x-2">
                             <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs">JX</div>
                             <span className="font-bold text-slate-700">STARLUX</span>
                         </div>
                         <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">ECONOMY</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-4xl font-black text-slate-800">{origin}</p>
                            <p className="text-xs text-gray-400 font-bold mt-1">{originName}</p>
                        </div>
                        <div className="flex flex-col items-center px-4 w-full">
                            <Plane size={20} className={`text-primary mb-1 transition-transform duration-500 ${flightView === 'inbound' ? '-scale-x-100' : ''}`} />
                            <div className="w-full h-0.5 bg-slate-200 relative">
                                <div className="absolute left-0 right-0 -top-0.5 h-1.5 w-1.5 bg-slate-300 rounded-full mx-auto"></div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">{currentFlight.time.replace(':','')}H</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-slate-800">{destination}</p>
                            <p className="text-xs text-gray-400 font-bold mt-1">{destName}</p>
                        </div>
                    </div>
                </div>

                {/* Perforation Line */}
                <div className="relative flex items-center justify-between -mt-3 z-20">
                    <div className="w-6 h-6 bg-slate-50 rounded-full -ml-3 border-r border-slate-200"></div>
                    <div className="flex-1 border-b-2 border-dashed border-slate-200 mx-2"></div>
                    <div className="w-6 h-6 bg-slate-50 rounded-full -mr-3 border-l border-slate-200"></div>
                </div>

                {/* Bottom Details */}
                <div className="bg-slate-50/50 p-5 pt-4 grid grid-cols-4 gap-2 text-center">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Date</p>
                        <p className="text-xs font-bold text-slate-700">{currentFlight.date.slice(5)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Time</p>
                        <p className="text-xs font-bold text-slate-700">{currentFlight.time}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Flight</p>
                        <p className="text-xs font-black text-primary">{currentFlight.code}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Terminal</p>
                        <p className="text-xs font-bold text-slate-700">{currentFlight.terminal}</p>
                    </div>
                </div>
                
                <button 
                   onClick={() => onChangeTab(Tab.Tickets, TicketCategory.Flight)}
                   className="w-full py-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-t border-slate-100"
                >
                    查看所有機票憑證
                </button>
            </div>
        </div>

        {/* Hotel Card */}
        <div>
            <SectionHeader icon={<Hotel size={18}/>} title="Accommodation" subtitle="住宿飯店" />
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-0 overflow-hidden">
                <div className="p-5">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{data.hotel.name}</h3>
                            <div className="flex items-center text-primary text-xs font-bold">
                                <Star size={12} className="fill-current mr-1" />
                                <span>5-Star Hotel</span>
                            </div>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Hotel className="text-primary" size={24} />
                        </div>
                    </div>
                    
                    <div className="mt-4 flex items-start space-x-2 text-sm text-gray-500 bg-slate-50 p-3 rounded-xl">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                        <span className="line-clamp-2 leading-relaxed">{data.hotel.address}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => window.open(`tel:${data.hotel.phone?.replace(/\s/g, '')}`, '_self')}
                            className="py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center"
                        >
                            <Phone size={16} className="mr-2 text-gray-400" />
                            撥打電話
                        </button>
                        <button 
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.hotel.mapQuery)}`, '_blank')}
                            className="py-2.5 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center shadow-lg shadow-slate-200"
                        >
                            <MapPin size={16} className="mr-2" />
                            開啟地圖
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Alerts */}
        {isToday && hasImportantToday && (
             <div className="bg-[#fcf8f2] border-l-4 border-secondary rounded-r-xl p-4 flex items-start space-x-3 shadow-sm">
                 <div className="bg-secondary/20 p-1.5 rounded-full text-secondary shrink-0 mt-0.5">
                    <AlertCircle size={16} />
                 </div>
                 <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm">今日有重要預約</p>
                    <p className="text-xs text-gray-600 mt-0.5">請確認票券是否已準備好。</p>
                 </div>
                 <button 
                    onClick={() => onChangeTab(Tab.Tickets)}
                    className="text-[10px] bg-white text-secondary px-3 py-1.5 rounded-lg border border-[#e8dfd0] shadow-sm font-bold"
                 >
                    檢查票券
                 </button>
           </div>
        )}
      </div>
    </div>
  );
};

// Sub-components
const CountdownUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 min-w-[70px]">
        <span className="text-2xl font-black text-white leading-none mb-1">{String(value).padStart(2,'0')}</span>
        <span className="text-[9px] text-orange-100 font-bold tracking-wider opacity-80">{label}</span>
    </div>
);

const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) => (
    <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary mr-3 border border-slate-100">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                <span className="font-bold text-gray-800">{subtitle}</span>
            </div>
        </div>
    </div>
);

export default Overview;