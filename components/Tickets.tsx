import React, { useState, useRef } from 'react';
import { AppData, Ticket, TicketCategory, TicketType } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Upload, X, FileText, ChevronLeft, MoreVertical, Trash2, ZoomIn, ZoomOut, Edit2, Save, ExternalLink } from 'lucide-react';

interface Props {
  data: AppData;
  selectedCategory: TicketCategory | 'ALL';
  onSelectCategory: (category: TicketCategory | 'ALL') => void;
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onRemoveTicket: (id: string) => void;
}

const Tickets: React.FC<Props> = ({ 
  data, 
  selectedCategory, 
  onSelectCategory, 
  onAddTicket, 
  onUpdateTicket, 
  onRemoveTicket 
}) => {
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  
  // Menu & Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit State
  const [editFormData, setEditFormData] = useState<Partial<Ticket>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Viewer States
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const categories = Object.values(TicketCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("檔案太大！請上傳小於 10MB 的檔案。");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const type = file.type.includes('pdf') ? TicketType.PDF : TicketType.Image;
      const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      
      const newTicket: Ticket = {
        id: Date.now().toString(),
        title: fileNameWithoutExt, 
        description: '', 
        category: selectedCategory === 'ALL' ? TicketCategory.Other : selectedCategory,
        type,
        data: base64,
        fileName: file.name
      };
      onAddTicket(newTicket);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredTickets = data.tickets.filter(t => selectedCategory === 'ALL' || t.category === selectedCategory);

  // Viewer Logic
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (viewingTicket?.type === TicketType.PDF) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || viewingTicket?.type === TicketType.PDF) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const openViewer = (ticket: Ticket) => {
    setViewingTicket(ticket);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsMenuOpen(false);
    setShowDeleteConfirm(false);
    setShowEditModal(false);
  };

  const closeViewer = () => {
    setViewingTicket(null);
  };

  const openEditModal = () => {
    if (viewingTicket) {
      setEditFormData({ ...viewingTicket });
      setShowEditModal(true);
      setIsMenuOpen(false);
    }
  };

  const handleSaveEdit = () => {
    if (viewingTicket && editFormData.title) {
      const updated = {
        ...viewingTicket,
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category || viewingTicket.category
      };
      onUpdateTicket(updated);
      setViewingTicket(updated); // Update viewer immediately
      setShowEditModal(false);
    }
  };

  const confirmDelete = () => {
    if (viewingTicket) {
        onRemoveTicket(viewingTicket.id);
        closeViewer();
    }
  };

  const openOriginal = () => {
    if (viewingTicket) {
      const win = window.open('', '_blank');
      if (win) {
        const isPdf = viewingTicket.type === TicketType.PDF;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html style="height: 100%; margin: 0; padding: 0;">
          <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
              <title>${viewingTicket.title}</title>
              <style>
                  body { margin: 0; padding: 0; background-color: #333; height: 100%; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                  .toolbar {
                      background-color: #98694c;
                      color: white;
                      padding: 16px;
                      padding-top: max(20px, env(safe-area-inset-top) + 20px);
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                      z-index: 9999;
                      flex-shrink: 0;
                      position: sticky;
                      top: 0;
                  }
                  .btn-close {
                      background: rgba(255,255,255,0.9);
                      color: #98694c;
                      border: none;
                      padding: 10px 20px;
                      border-radius: 12px;
                      font-size: 16px;
                      font-weight: 800;
                      cursor: pointer;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                      transition: transform 0.1s;
                  }
                  .btn-close:active {
                      transform: scale(0.95);
                      background: rgba(255,255,255,0.7);
                  }
                  .title { 
                      font-size: 16px; 
                      font-weight: bold; 
                      overflow: hidden; 
                      text-overflow: ellipsis; 
                      white-space: nowrap; 
                      margin-right: 15px; 
                      flex: 1;
                      color: white;
                  }
                  .content-wrapper {
                      flex: 1;
                      overflow: auto;
                      -webkit-overflow-scrolling: touch;
                      display: flex;
                      align-items: flex-start;
                      justify-content: center;
                      background-color: #f0f0f0;
                  }
                  iframe { border: none; width: 100%; height: 100%; display: block; }
                  img { width: 100%; height: auto; display: block; }
              </style>
          </head>
          <body>
              <div class="toolbar">
                  <div class="title">${viewingTicket.title}</div>
                  <button class="btn-close" onclick="window.close()">✕ 返回 App</button>
              </div>
              <div class="content-wrapper">
                  ${isPdf 
                    ? `<iframe src="${viewingTicket.data}" title="Content"></iframe>` 
                    : `<img src="${viewingTicket.data}" alt="${viewingTicket.title}" />`
                  }
              </div>
          </body>
          </html>
        `;
        win.document.write(htmlContent);
        win.document.close();
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Category Tabs */}
      <div className="bg-white/90 backdrop-blur-md pt-14 pb-3 px-3 shadow-sm overflow-x-auto no-scrollbar flex space-x-2 sticky top-0 z-10 border-b border-slate-100">
        <button
          onClick={() => onSelectCategory('ALL')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all ${selectedCategory === 'ALL' ? 'bg-slate-800 text-white shadow-lg shadow-slate-300' : 'bg-slate-100 text-gray-500 hover:bg-slate-200'}`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-gray-500 hover:bg-slate-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="px-4 py-4 bg-white border-b border-slate-100">
        <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
            <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-bold text-gray-600">
                上傳{selectedCategory === 'ALL' ? '票券' : selectedCategory} (圖片/PDF)
            </span>
            <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
            />
        </label>
      </div>

      {/* Ticket Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 grid grid-cols-2 gap-4 content-start">
        {filteredTickets.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-10 text-gray-400">
                <FileText size={48} className="mb-2 opacity-20" />
                <span className="text-sm">這裡還沒有票券，趕快上傳吧！</span>
            </div>
        )}
        {filteredTickets.map(ticket => (
            <div 
                key={ticket.id} 
                onClick={() => openViewer(ticket)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-48 active:scale-95 transition-transform duration-200 cursor-pointer group"
            >
                {/* Thumbnail Area */}
                <div className="flex-1 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                    {ticket.type === TicketType.Image ? (
                        <img src={ticket.data} alt={ticket.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-red-500 w-full h-full bg-red-50/50">
                            <div className="bg-white p-3 rounded-xl shadow-sm mb-2">
                                <FileText size={28} className="text-red-500" />
                            </div>
                            <span className="text-[10px] font-bold text-red-400">PDF 文件</span>
                        </div>
                    )}
                    {/* Category Tag */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm border ${CATEGORY_COLORS[ticket.category]}`}>
                        {ticket.category}
                    </div>
                </div>
                
                {/* Info Area */}
                <div className="p-3 bg-white border-t border-gray-50">
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">{ticket.title}</h3>
                    <p className="text-xs text-gray-500 truncate flex items-center">
                        {ticket.description ? (
                           <span className="text-primary font-medium">{ticket.description}</span>
                        ) : (
                           <span className="opacity-70">{ticket.fileName}</span>
                        )}
                    </p>
                </div>
            </div>
        ))}
      </div>

      {/* Immersive Viewer */}
      {viewingTicket && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-200">
              
              {/* Header Bar */}
              <div className="bg-slate-900/90 text-white px-4 pb-4 pt-16 flex justify-between items-center backdrop-blur-md z-50 border-b border-white/10">
                  <button onClick={closeViewer} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                      <ChevronLeft size={24} />
                  </button>
                  
                  <div className="flex-1 mx-4 text-center overflow-hidden">
                      <h3 className="font-bold text-base truncate">{viewingTicket.title}</h3>
                      <p className="text-[10px] text-gray-400 truncate">
                          {viewingTicket.description || viewingTicket.fileName}
                      </p>
                  </div>

                  <div className="relative flex items-center">
                      <button 
                        onClick={openOriginal}
                        className="p-2 mr-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                        title="外部開啟"
                      >
                          <ExternalLink size={20} />
                      </button>
                      
                      <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 -mr-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                      >
                          <MoreVertical size={24} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden py-1 text-gray-800 animate-in fade-in zoom-in-95 duration-100 origin-top-right ring-1 ring-black/5">
                              <button 
                                onClick={openEditModal}
                                className="w-full px-4 py-3 text-left text-sm flex items-center hover:bg-gray-50 border-b border-gray-100"
                              >
                                  <Edit2 size={16} className="mr-3 text-gray-500" /> 編輯詳情
                              </button>
                              <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full px-4 py-3 text-left text-sm flex items-center hover:bg-red-50 text-red-600 font-bold"
                              >
                                  <Trash2 size={16} className="mr-3" /> 刪除票券
                              </button>
                          </div>
                      )}
                  </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
                   {viewingTicket.type === TicketType.Image ? (
                        <div 
                            className="w-full h-full flex items-center justify-center touch-none"
                            onMouseDown={handleTouchStart}
                            onMouseMove={handleTouchMove}
                            onMouseUp={() => setIsDragging(false)}
                            onMouseLeave={() => setIsDragging(false)}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={() => setIsDragging(false)}
                        >
                            <img 
                                src={viewingTicket.data} 
                                alt="Ticket" 
                                style={{ 
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                                }}
                                className="max-w-full max-h-full object-contain"
                                draggable={false}
                            />
                        </div>
                   ) : (
                       <iframe 
                           src={viewingTicket.data} 
                           className="w-full h-full bg-white"
                           title="PDF Viewer"
                       />
                   )}
              </div>

              {/* Image Controls (Only for Images) */}
              {viewingTicket.type === TicketType.Image && (
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-6 text-white pointer-events-none safe-bottom">
                      <div className="bg-slate-900/80 backdrop-blur rounded-full px-6 py-2 flex items-center space-x-6 pointer-events-auto shadow-lg border border-white/10">
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 active:opacity-50"><ZoomOut size={20}/></button>
                        <span className="text-xs font-mono w-8 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={() => setScale(s => Math.min(4, s + 0.2))} className="p-1 active:opacity-50"><ZoomIn size={20}/></button>
                      </div>
                  </div>
              )}

              {/* Edit Modal */}
              {showEditModal && (
                   <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                       <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                           <div className="bg-gray-100 px-4 py-3 flex justify-between items-center border-b">
                               <h3 className="font-bold text-gray-800">編輯票券</h3>
                               <button onClick={() => setShowEditModal(false)} className="text-gray-500"><X size={20}/></button>
                           </div>
                           <div className="p-5 space-y-4">
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-1">標題</label>
                                   <input 
                                     type="text" 
                                     value={editFormData.title || ''}
                                     onChange={e => setEditFormData({...editFormData, title: e.target.value})}
                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                     placeholder="例如：爸爸 - 去程機票"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-1">簡短說明 (航班號 / 日期)</label>
                                   <input 
                                     type="text" 
                                     value={editFormData.description || ''}
                                     onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                                     className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                     placeholder="例如：JX771 / 11月27日"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-gray-500 mb-1">分類</label>
                                   <div className="flex flex-wrap gap-2">
                                       {categories.map(cat => (
                                           <button
                                              key={cat}
                                              onClick={() => setEditFormData({...editFormData, category: cat})}
                                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${editFormData.category === cat ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                                           >
                                               {cat}
                                           </button>
                                       ))}
                                   </div>
                               </div>
                               <button 
                                 onClick={handleSaveEdit}
                                 className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-2 hover:bg-teal-700 flex items-center justify-center shadow-lg shadow-primary/30"
                               >
                                   <Save size={18} className="mr-2" /> 儲存變更
                               </button>
                           </div>
                       </div>
                   </div>
              )}

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                  <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in">
                      <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl text-center">
                          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Trash2 size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">確定要刪除這張票券嗎？</h3>
                          <p className="text-sm text-gray-500 mb-6">
                              此動作將永久刪除「{viewingTicket.title}」，無法復原。
                          </p>
                          <div className="flex space-x-3">
                              <button 
                                onClick={() => { setShowDeleteConfirm(false); setIsMenuOpen(false); }}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                              >
                                  取消
                              </button>
                              <button 
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200"
                              >
                                  確認刪除
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default Tickets;