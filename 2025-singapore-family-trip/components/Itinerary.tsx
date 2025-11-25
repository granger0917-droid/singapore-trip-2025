import React, { useState, useEffect, useRef } from 'react';
import { AppData, Activity } from '../types';
import { MapPin, ArrowUp, ArrowDown, Edit3, Trash2, Plus, X, Save } from 'lucide-react';

interface Props {
  data: AppData;
  onUpdate: (data: any) => void;
}

const Itinerary: React.FC<Props> = ({ data, onUpdate }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isNewActivity, setIsNewActivity] = useState(false);
  const [formData, setFormData] = useState<Partial<Activity>>({});

  const selectedDay = data.itinerary[selectedDayIndex];

  // Auto-scroll selected day into view
  useEffect(() => {
    if (scrollRef.current) {
        const btn = scrollRef.current.children[selectedDayIndex] as HTMLElement;
        if (btn) {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [selectedDayIndex]);

  const handleMapClick = (query: string) => {
    if (!editMode) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  const updateItinerary = (newActivities: Activity[]) => {
    const newItinerary = [...data.itinerary];
    newItinerary[selectedDayIndex] = { ...selectedDay, activities: newActivities };
    onUpdate(newItinerary);
  };

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const activities = [...selectedDay.activities];
    if (direction === 'up' && index > 0) {
      [activities[index], activities[index - 1]] = [activities[index - 1], activities[index]];
    } else if (direction === 'down' && index < activities.length - 1) {
      [activities[index], activities[index + 1]] = [activities[index + 1], activities[index]];
    }
    updateItinerary(activities);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此行程嗎？')) {
        const activities = selectedDay.activities.filter(a => a.id !== id);
        updateItinerary(activities);
    }
  };

  const handleEditOpen = (activity: Activity) => {
    setFormData({ ...activity });
    setIsNewActivity(false);
    setShowModal(true);
  };

  const handleAddOpen = () => {
    setFormData({
        id: Date.now().toString(),
        time: '09:00',
        title: '',
        location: '',
        mapQuery: '',
        note: '',
        isImportant: false
    });
    setIsNewActivity(true);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.time) {
        alert('請填寫時間與標題');
        return;
    }

    let activities = [...selectedDay.activities];
    const newActivity = {
        ...formData,
        mapQuery: formData.mapQuery || formData.location || ''
    } as Activity;

    if (isNewActivity) {
        activities.push(newActivity);
    } else {
        activities = activities.map(a => a.id === newActivity.id ? newActivity : a);
    }

    // Sort by time
    activities.sort((a, b) => a.time.localeCompare(b.time));

    updateItinerary(activities);
    setShowModal(false);
  };

  const isCurrentActivity = (time: string) => {
      const now = new Date();
      const dateStr = selectedDay.date; 
      const actTime = new Date(`${dateStr}T${time}:00`);
      const diff = (now.getTime() - actTime.getTime()) / (1000 * 60); 
      return now.toISOString().split('T')[0] === dateStr && diff >= 0 && diff < 90; 
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Date Scroller */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm z-30 sticky top-0 border-b border-slate-200/50 pt-12">
        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar py-3 px-2 space-x-2 scroll-smooth">
          {data.itinerary.map((day, idx) => (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 rounded-2xl px-4 py-2.5 flex flex-col items-center min-w-[72px] transition-all duration-300 relative overflow-hidden ${
                selectedDayIndex === idx 
                  ? 'bg-[#98694c] text-white shadow-lg shadow-[#98694c]/20 scale-100' 
                  : 'bg-transparent text-gray-400 hover:bg-slate-100'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${selectedDayIndex === idx ? 'text-white/80' : ''}`}>{day.dayLabel}</span>
              <span className="text-sm font-black tracking-tight">{day.date.slice(5).replace('-', '/')}</span>
            </button>
          ))}
        </div>
        
        {/* Sub Header */}
        <div className="px-5 py-3 flex justify-between items-center bg-slate-50/80 text-xs text-gray-500 border-b border-slate-100">
            <span className="font-bold tracking-wide">
                {selectedDay.date} 行程總覽 ({selectedDay.activities.length})
            </span>
            <button 
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all ${editMode ? 'text-white bg-primary shadow-md shadow-primary/20' : 'bg-white border border-slate-200 hover:border-primary hover:text-primary'}`}
            >
                <Edit3 size={12} />
                <span className="font-bold">{editMode ? '完成' : '編輯'}</span>
            </button>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 pt-6 scroll-smooth">
        <div className="relative pl-4 space-y-8">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-slate-200 rounded-full"></div>

          {selectedDay.activities.map((act, idx) => {
            const isCurrent = isCurrentActivity(act.time);
            return (
                <div key={act.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                    
                {/* Timeline Dot */}
                <div className={`absolute -left-[22px] top-5 w-3.5 h-3.5 rounded-full border-[3px] border-slate-50 shadow-sm z-10 transition-colors duration-500
                    ${isCurrent ? 'bg-green-500 ring-4 ring-green-100 animate-pulse' : 
                      act.isImportant ? 'bg-[#86754d]' : 'bg-slate-300'}`}>
                </div>
                
                {/* Current Indicator Line Overlay */}
                {isCurrent && (
                     <div className="absolute -left-[20px] top-8 bottom-[-32px] w-[3px] bg-green-400 z-0 opacity-50 blur-[1px]"></div>
                )}

                <div className={`bg-white rounded-2xl p-4 border ml-4 transition-all duration-300 relative
                    ${isCurrent ? 'border-green-200 shadow-xl shadow-green-100/50 scale-[1.02]' : 
                      act.isImportant ? 'border-l-[6px] border-l-[#86754d] border-y-slate-100 border-r-slate-100 shadow-sm' : 
                      'border-slate-100 shadow-sm hover:shadow-md'}`}>
                    
                    <div className="flex justify-between items-start mb-2">
                        <div className={`flex items-center font-mono font-bold text-lg tracking-tight ${isCurrent ? 'text-green-600' : 'text-[#98694c]'}`}>
                            {act.time}
                            {isCurrent && <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold tracking-wide">NOW</span>}
                        </div>
                        
                        {editMode && (
                            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200 scale-90 origin-right shadow-sm">
                                <button onClick={() => handleEditOpen(act)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={14} /></button>
                                <div className="w-px h-3 bg-gray-300 mx-1"></div>
                                <button onClick={() => moveActivity(idx, 'up')} disabled={idx === 0} className="p-1.5 text-gray-600 disabled:opacity-20 hover:bg-gray-100 rounded"><ArrowUp size={14} /></button>
                                <button onClick={() => moveActivity(idx, 'down')} disabled={idx === selectedDay.activities.length - 1} className="p-1.5 text-gray-600 disabled:opacity-20 hover:bg-gray-100 rounded"><ArrowDown size={14} /></button>
                                <div className="w-px h-3 bg-gray-300 mx-1"></div>
                                <button onClick={() => handleDelete(act.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                            </div>
                        )}
                    </div>
                    
                    <h3 className={`font-bold text-[17px] mb-1.5 leading-snug ${act.isImportant ? 'text-gray-900' : 'text-slate-700'}`}>{act.title}</h3>
                    
                    {act.location && (
                        <div 
                            onClick={() => handleMapClick(act.mapQuery)}
                            className={`flex items-start text-sm mt-1 bg-slate-50/50 -mx-2 px-2 py-1.5 rounded-lg w-fit max-w-full ${editMode ? '' : 'cursor-pointer active:bg-slate-100 transition-colors'}`}
                        >
                            <MapPin size={14} className="mr-1.5 mt-0.5 text-secondary shrink-0" />
                            <span className={`text-gray-500 text-xs font-medium truncate pr-2`}>{act.location}</span>
                        </div>
                    )}

                    {act.note && (
                        <div className="bg-[#fcf8f2] text-[#86754d] text-xs px-3 py-2.5 rounded-xl mt-3 border border-[#e8dfd0] leading-relaxed font-medium">
                            💡 {act.note}
                        </div>
                    )}
                </div>
                </div>
            );
          })}

          {/* Add Button */}
          {editMode && (
             <div className="relative pl-4 pt-4 pb-8">
                 <button 
                    onClick={handleAddOpen}
                    className="w-full py-4 border-2 border-dashed border-primary/30 rounded-2xl text-primary font-bold flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors active:scale-95 group"
                 >
                     <div className="bg-white p-1 rounded-full border border-primary/20 mr-2 group-hover:scale-110 transition-transform">
                        <Plus size={16} />
                     </div>
                     新增行程
                 </button>
             </div>
          )}
          
          {selectedDay.activities.length === 0 && !editMode && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <Edit3 size={24} className="opacity-20" />
                  </div>
                  <span className="text-sm font-medium">今天還沒安排行程</span>
                  <button onClick={() => setEditMode(true)} className="mt-4 text-primary text-xs font-bold underline">開始安排</button>
              </div>
          )}
        </div>
      </div>

      {/* Edit/Add Modal (Reused) */}
      {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-[#98694c] px-6 py-4 flex justify-between items-center text-white">
                      <h3 className="font-bold text-lg">{isNewActivity ? '新增行程' : '編輯行程'}</h3>
                      <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                  </div>
                  
                  <div className="p-6 space-y-5">
                      <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-1">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">時間</label>
                              <input 
                                type="time" 
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">標題</label>
                              <input 
                                type="text" 
                                placeholder="例：晚餐、動物園"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">地點 (Google Maps)</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="例：Ah Meng Restaurant"
                                value={formData.location}
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">備註</label>
                          <textarea 
                             rows={2}
                             placeholder="注意事項、訂位代號..."
                             value={formData.note}
                             onChange={e => setFormData({...formData, note: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
                          />
                      </div>

                      <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer" onClick={() => setFormData({...formData, isImportant: !formData.isImportant})}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.isImportant ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                             {formData.isImportant && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <label className="text-sm text-gray-700 font-bold select-none cursor-pointer">標記為重點行程 (Highlight)</label>
                      </div>

                      <div className="pt-2 flex space-x-3">
                          <button 
                            onClick={() => setShowModal(false)}
                            className="flex-1 py-3.5 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                          >
                              取消
                          </button>
                          <button 
                            onClick={handleSave}
                            className="flex-1 py-3.5 text-white font-bold bg-[#98694c] rounded-xl hover:bg-[#86593f] transition-colors flex items-center justify-center shadow-lg shadow-[#98694c]/30"
                          >
                              <Save size={18} className="mr-2" />
                              儲存
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Itinerary;