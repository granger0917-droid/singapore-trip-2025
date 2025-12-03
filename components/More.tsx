import React, { useRef, useState, useEffect } from 'react';
import { AppData, PrintMode } from '../types';
// 確認這裡有包含 Car, Stamp, Smartphone, Map 等所有用到的圖示
import { CloudRain, Map, Printer, Database, Trash2, Download, Upload, Copy, Check, Plane, FileText, Layers, CloudLightning, Cloud, Sun, RefreshCw, Loader2, Smartphone, ExternalLink, Car, Stamp } from 'lucide-react';

interface Props {
  data: AppData;
  onReset: () => void;
  onImport: (data: AppData) => void;
  onPrint: (mode: PrintMode) => void;
}

interface WeatherItem {
  date: string;
  day: string;
  temp: string;
  condition: string;
  color: string;
  icon: React.ReactNode;
}

const More: React.FC<Props> = ({ data, onReset, onImport, onPrint }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  
  // Weather States
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Helper to generate dynamic placeholders based on TODAY
  const getSevenDayPlaceholder = () => {
      const items: WeatherItem[] = [];
      const today = new Date();
      const dayMap = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

      for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          items.push({
              date: `${d.getMonth() + 1}/${d.getDate()}`,
              day: i === 0 ? '今天' : dayMap[d.getDay()],
              temp: '--',
              condition: '載入中...',
              color: 'text-gray-400',
              icon: <Loader2 size={24} className="animate-spin opacity-50" />
          });
      }
      return items;
  };

  const [weatherData, setWeatherData] = useState<WeatherItem[]>(getSevenDayPlaceholder());

  // Fetch weather automatically on mount
  useEffect(() => {
      fetchWeather();
  }, []);

  const handleReset = () => {
    const pwd = prompt("請輸入重置密碼：");
    if (pwd === '0000') {
        if(confirm("確定要刪除所有票券並重置行程嗎？此動作無法復原。")) {
            onReset();
        }
    } else {
        if (pwd !== null) alert("密碼錯誤");
    }
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `SG_Trip_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target?.result as string);
                if (importedData.itinerary && importedData.flights) {
                    onImport(importedData);
                    alert("匯入成功！");
                } else {
                    alert("檔案格式錯誤");
                }
            } catch (err) {
                alert("無法解析檔案");
            }
        };
        reader.readAsText(file);
    }
  };

  const handleCopyText = () => {
    let text = `🇸🇬 2025 新加坡親子遊\n`;
    text += `✈️ 去程: ${data.flights.outbound.date} ${data.flights.outbound.code} ${data.flights.outbound.time}\n`;
    text += `✈️ 回程: ${data.flights.inbound.date} ${data.flights.inbound.code} ${data.flights.inbound.time}\n\n`;

    data.itinerary.forEach(day => {
        text += `📅 ${day.date} (${day.dayLabel})\n`;
        day.activities.forEach(act => {
            text += `  ${act.time} ${act.title}\n`;
            if (act.location) text += `    📍 ${act.location}\n`;
            if (act.note) text += `    💡 ${act.note}\n`;
        });
        text += '\n';
    });

    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Copy failed', err);
        alert('複製失敗，請手動選取');
    });
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  // Weather Logic
  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore'
        );
        const jsonData = await response.json();
        
        if (jsonData.daily) {
            const newForecast: WeatherItem[] = jsonData.daily.time.slice(0, 7).map((dateStr: string, index: number) => {
                const dateObj = new Date(dateStr);
                const month = dateObj.getMonth() + 1;
                const date = dateObj.getDate();
                const dayMap = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                const code = jsonData.daily.weather_code[index];
                const max = Math.round(jsonData.daily.temperature_2m_max[index]);
                const min = Math.round(jsonData.daily.temperature_2m_min[index]);

                let condition = '多雲';
                let icon = <Cloud size={24} />;
                let color = 'text-gray-500';

                if (code <= 3) {
                    condition = '晴時多雲';
                    icon = <Sun size={24} />;
                    color = 'text-orange-500';
                } else if (code >= 51 && code <= 67) {
                    condition = '陣雨';
                    icon = <CloudRain size={24} />;
                    color = 'text-blue-400';
                } else if (code >= 80 && code <= 99) {
                    condition = '雷陣雨';
                    icon = <CloudLightning size={24} />;
                    color = 'text-blue-600';
                }

                const today = new Date();
                const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth();

                return {
                    date: `${month}/${date}`,
                    day: isToday ? '今天' : dayMap[dateObj.getDay()],
                    temp: `${min}-${max}°C`,
                    condition,
                    color,
                    icon
                };
            });
            setWeatherData(newForecast);
        }
    } catch (error) {
        console.error("Weather fetch failed", error);
    } finally {
        setLoadingWeather(false);
    }
  };

  const mandaiMaps = [
      { name: '新加坡動物園', url: 'https://www.mandai.com/content/dam/mandai/singapore-zoo/park-map/sz-zh-map.pdf', color: 'bg-green-100 text-green-700' },
      { name: '夜間野生動物園', url: 'https://www.mandai.com/content/dam/mandai/night-safari/park-map/ns-zh-map.pdf', color: 'bg-indigo-100 text-indigo-700' },
      { name: '飛禽公園', url: 'https://www.mandai.com/content/dam/mandai/bird-paradise/park-map/bp-zh-map.pdf', color: 'bg-pink-100 text-pink-700' },
      { name: '河川生態園', url: 'https://www.mandai.com/content/dam/mandai/river-wonders/park-map/rw-zh-map.pdf', color: 'bg-teal-100 text-teal-700' },
      { name: '亞洲雨林探險園', url: 'https://www.mandai.com/content/dam/mandai/rainforest-wild-asia/park-map/rfw-asia-zh-map.pdf', color: 'bg-lime-100 text-lime-800' },
  ];

  const usefulApps = [
      { 
          name: 'Grab', 
          desc: '叫車與外送', 
          url: 'https://www.grab.com/sg/download/', 
          icon: <Car size={20} className="text-green-600" />,
          bg: 'bg-green-50'
      },
      { 
          name: 'Mandai', 
          desc: '動物園官方 App', 
          url: 'https://www.mandai.com/en/mandai-app.html', 
          icon: <Map size={20} className="text-lime-600" />,
          bg: 'bg-lime-50'
      },
      { 
          name: 'MyICA', 
          desc: '入境卡申報', 
          url: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/sg-arrival-card', 
          icon: <Stamp size={20} className="text-red-600" />,
          bg: 'bg-red-50'
      },
      { 
          name: 'Changi', 
          desc: '樟宜機場', 
          url: 'https://www.changiairport.com/en/download-app.html', 
          icon: <Plane size={20} className="text-purple-600" />,
          bg: 'bg-purple-50'
      }
  ];

  return (
    <div className="px-4 pt-14 pb-40 space-y-4 overflow-y-auto h-full bg-slate-50">
      <h2 className="text-xl font-bold text-gray-800 mb-4">更多功能</h2>

      {/* Weather Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center">
                <CloudRain className="text-blue-500 mr-2" />
                <div>
                    <h3 className="font-bold text-gray-700 leading-none">一週天氣預報 (新加坡)</h3>
                    <span className="text-[10px] text-gray-400">
                        {weatherData.length > 0 ? `更新時間: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '載入中...'}
                    </span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={fetchWeather}
                    disabled={loadingWeather}
                    className="p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-primary border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
                 >
                    {loadingWeather ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                 </button>
            </div>
        </div>
        <div className="flex overflow-x-auto no-scrollbar p-3 space-x-3">
            {weatherData.map((day, idx) => (
                <div key={idx} className="flex-none w-[72px] flex flex-col items-center bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400">{day.date}</span>
                    <span className={`text-[10px] mb-2 ${day.day === '今天' ? 'text-primary font-bold' : 'text-gray-400'}`}>{day.day}</span>
                    <div className={`mb-2 ${day.color}`}>{day.icon}</div>
                    <span className="text-xs font-black text-gray-700 whitespace-nowrap">{day.temp}</span>
                    <span className="text-[10px] text-gray-500 mt-1 scale-90 whitespace-nowrap">{day.condition}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Useful Apps Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-3">
              <Smartphone className="text-slate-700 mr-2" />
              <h3 className="font-bold text-gray-700">新加坡必備 APP</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
              {usefulApps.map((app, idx) => (
                  <button 
                    key={idx}
                    onClick={() => openUrl(app.url)}
                    className="flex items-center p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition-all active:scale-95 text-left bg-slate-50 hover:bg-white"
                  >
                      <div className={`p-2 rounded-lg mr-3 shrink-0 ${app.bg}`}>
                          {app.icon}
                      </div>
                      <div className="overflow-hidden">
                          <p className="font-bold text-sm text-gray-800 leading-tight">{app.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{app.desc}</p>
                      </div>
                  </button>
              ))}
          </div>
      </div>

      {/* Mandai Maps Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center mb-3">
             <Map className="text-green-600 mr-2" />
             <h3 className="font-bold text-gray-700">萬態園區地圖</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
            {mandaiMaps.map((map, idx) => (
                <button 
                    key={idx}
                    onClick={() => openUrl(map.url)}
                    className={`flex items-center p-3 rounded-xl transition-transform active:scale-95 text-left border border-transparent hover:border-black/5 ${map.color}`}
                >
                    <Map size={16} className="mr-2 shrink-0 opacity-70" />
                    <span className="text-xs font-bold leading-tight">{map.name}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Copy Text */}
      <div className="space-y-2">
        <button 
            onClick={handleCopyText}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center hover:bg-slate-50 active:scale-[0.98] transition-transform"
        >
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mr-3">
                {copied ? <Check size={24} /> : <Copy size={24} />}
            </div>
            <div className="text-left">
                <p className="font-bold text-gray-800">
                    {copied ? '已複製！' : '複製行程文字'}
                </p>
                <p className="text-xs text-gray-500">複製純文字格式到 Line / 記事本</p>
            </div>
        </button>
      </div>

      {/* Print Zone */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-3">
              <Printer className="text-blue-500 mr-2" />
              <h3 className="font-bold text-gray-700">列印與輸出</h3>
          </div>
          <div className="space-y-2">
              <button 
                onClick={() => onPrint(PrintMode.Itinerary)}
                className="w-full flex items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
              >
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded mr-3">
                      <FileText size={18} />
                  </div>
                  <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 block">1. 每日行程</span>
                      <span className="text-xs text-gray-400">僅列印文字行程表</span>
                  </div>
              </button>

              <button 
                onClick={() => onPrint(PrintMode.Flights)}
                className="w-full flex items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
              >
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded mr-3">
                      <Plane size={18} />
                  </div>
                  <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 block">2. 機票憑證</span>
                      <span className="text-xs text-gray-400">列印航班資訊與機票截圖</span>
                  </div>
              </button>

              <button 
                onClick={() => onPrint(PrintMode.All)}
                className="w-full flex items-center p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
              >
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded mr-3">
                      <Layers size={18} />
                  </div>
                  <div className="text-left">
                      <span className="text-sm font-bold text-gray-800 block">3. 全部資料</span>
                      <span className="text-xs text-gray-400">完整行程手冊 + 所有票券</span>
                  </div>
              </button>
          </div>
      </div>

      {/* Backup */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center mb-3">
              <Database className="text-purple-500 mr-2" />
              <h3 className="font-bold text-gray-700">資料備份與還原</h3>
          </div>
          <div className="flex space-x-2">
              <button 
                  onClick={handleExport}
                  className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                  <Download size={16} className="mr-1" /> 匯出
              </button>
              <button 
                  onClick={handleImportClick}
                  className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                  <Upload size={16} className="mr-1" /> 匯入
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </div>
      </div>

      {/* Reset */}
      <button 
          onClick={handleReset}
          className="w-full bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 flex items-center hover:bg-red-100 mt-2 transition-colors"
      >
          <div className="bg-red-200 p-2 rounded-lg text-red-700 mr-3">
              <Trash2 size={24} />
          </div>
          <div className="text-left">
              <p className="font-bold text-red-800">重置所有資料</p>
              <p className="text-xs text-red-600">密碼 0000 (慎用)</p>
          </div>
      </button>

      {/* About */}
      <div className="text-center text-gray-300 text-xs py-4">
        v1.3.1 | 2025 Singapore Family Trip
      </div>
    </div>
  );
};

export default More;
]]></content>
  </change>
</changes>
