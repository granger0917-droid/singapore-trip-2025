
import React from 'react';
import { AppData, TicketType, PrintMode, TicketCategory } from '../types';

interface Props {
  data: AppData;
  mode: PrintMode;
}

const PrintView: React.FC<Props> = ({ data, mode }) => {
  const showItinerary = mode === PrintMode.Itinerary || mode === PrintMode.All;
  
  // Logic for tickets
  let ticketsToShow = data.tickets;
  if (mode === PrintMode.Flights) {
      ticketsToShow = data.tickets.filter(t => t.category === TicketCategory.Flight);
  } else if (mode === PrintMode.Itinerary) {
      ticketsToShow = [];
  }

  const showFlightHeader = true; 

  return (
    <div className="print-only hidden bg-white text-black w-full mx-auto text-[11pt] leading-tight">
      <div className="border-b-2 border-black pb-2 mb-6">
          <h1 className="text-2xl font-bold">2025 新加坡親子遊</h1>
          <p className="text-gray-600 text-sm mt-0.5">
             {mode === PrintMode.Itinerary && "每日行程表"}
             {mode === PrintMode.Flights && "機票與航班憑證"}
             {mode === PrintMode.All && "完整行程手冊"}
          </p>
      </div>
      
      {/* Flight & Hotel Info */}
      {showFlightHeader && (
        <div className="mb-8 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
            <h2 className="font-bold text-base mb-2 border-b border-gray-300 pb-1">航班資訊</h2>
            <div className="space-y-3">
                <div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold mr-2">去程</span>
                    <span className="font-mono font-bold">{data.flights.outbound.code}</span>
                    <div className="ml-10 text-gray-600 mt-1">
                        {data.flights.outbound.date} {data.flights.outbound.time} <br/>
                        {data.flights.outbound.origin} → {data.flights.outbound.destination} (Term {data.flights.outbound.terminal})
                    </div>
                </div>
                <div>
                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold mr-2">回程</span>
                    <span className="font-mono font-bold">{data.flights.inbound.code}</span>
                    <div className="ml-10 text-gray-600 mt-1">
                        {data.flights.inbound.date} {data.flights.inbound.time} <br/>
                        {data.flights.inbound.origin} → {data.flights.inbound.destination} (Term {data.flights.inbound.terminal})
                    </div>
                </div>
            </div>
            </div>
            <div>
            <h2 className="font-bold text-base mb-2 border-b border-gray-300 pb-1">住宿資訊</h2>
            <p className="font-bold text-base">{data.hotel.name}</p>
            <p className="text-gray-600 mt-1">{data.hotel.address}</p>
            <p className="text-gray-500 text-xs mt-2">
                Check-in: {data.hotel.checkIn} / Check-out: {data.hotel.checkOut}
            </p>
            </div>
        </div>
      )}

      {/* Daily Itinerary Table */}
      {showItinerary && (
        <div className="space-y-6">
            {data.itinerary.map(day => (
                <div key={day.date} className="mb-4">
                    <h3 className="text-lg font-bold bg-slate-800 text-white py-1.5 px-3 rounded-t-lg break-after-avoid">
                        {day.dayLabel} <span className="text-sm font-normal opacity-75 ml-2">{day.date}</span>
                    </h3>
                    <div className="border border-slate-300 rounded-b-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-slate-200">
                                {day.activities.map((act, idx) => (
                                    <tr key={act.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="py-2 px-3 font-mono font-bold w-20 align-top text-slate-700 border-r border-slate-200">
                                            {act.time}
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="font-bold text-base text-gray-900 flex items-center">
                                                {act.title}
                                                {act.isImportant && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 rounded border border-red-200">★</span>}
                                            </div>
                                            {act.location && (
                                                <div className="text-gray-600 text-xs mt-0.5 flex items-center">
                                                    📍 {act.location}
                                                </div>
                                            )}
                                            {act.note && (
                                                <div className="mt-1 text-xs bg-yellow-50 text-yellow-800 p-1.5 rounded border border-yellow-100 italic whitespace-pre-wrap">
                                                    {act.note}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Ticket Gallery */}
      {ticketsToShow.length > 0 && (
        <div className="break-before-page mt-6">
            <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">
                {mode === PrintMode.Flights ? '機票憑證' : '票券附件'}
            </h2>
            
            {/* Group by category */}
            {mode === PrintMode.All ? (
                Object.values(TicketCategory).map(cat => {
                    const catTickets = ticketsToShow.filter(t => t.category === cat);
                    if (catTickets.length === 0) return null;
                    return (
                        <div key={cat} className="mb-6">
                            <h3 className="text-base font-bold mb-3 text-slate-700 border-l-4 border-primary pl-2">{cat}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {catTickets.map(t => (
                                    <div key={t.id} className="border border-gray-200 rounded-lg p-3 break-inside-avoid">
                                        <p className="font-bold text-sm mb-1 truncate">{t.title}</p>
                                        <p className="text-xs text-gray-500 mb-2 truncate">{t.description}</p>
                                        {t.type === TicketType.Image ? (
                                            <img src={t.data} className="w-full h-auto object-contain max-h-[350px]" alt={t.title} />
                                        ) : (
                                            <div className="border-2 border-dashed p-6 text-center bg-gray-50 text-gray-400 text-xs">
                                                PDF 文件<br/>{t.fileName}<br/>(請另行列印)
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="grid grid-cols-1 gap-6">
                     {ticketsToShow.map(t => (
                        <div key={t.id} className="border border-gray-200 rounded-lg p-4 break-inside-avoid">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-base">{t.title}</p>
                                    <p className="text-sm text-gray-600">{t.description}</p>
                                </div>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{t.category}</span>
                            </div>
                            
                            {t.type === TicketType.Image ? (
                                <img src={t.data} className="w-full h-auto object-contain max-h-[800px]" alt={t.title} />
                            ) : (
                                <div className="border-2 border-dashed p-10 text-center bg-gray-50 text-gray-400">
                                    PDF 文件 (請另行列印原始檔)<br/>{t.fileName}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default PrintView;
