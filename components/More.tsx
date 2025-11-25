import React, { useRef, useState } from 'react';
import { AppData, PrintMode } from '../types';
import { CloudRain, Map, Printer, Database, Trash2, Download, Upload, Copy, Check, Plane, FileText, Layers, CloudLightning, Cloud, Sun, RefreshCw, Loader2 } from 'lucide-react';

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
  const [isLiveForecast, setIsLiveForecast] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherItem[]>([
    { date: '11/27', day: '週四', temp: '25-31°C', condition: '雷陣雨', color: 'text-blue-600', icon: <CloudLightning size={24} /> },
    { date: '11/28', day: '週五', temp: '26-31°C', condition: '多雲時雨', color: 'text-blue-500', icon: <CloudRain size={24} /> },
    { date: '11/29', day: '週六', temp: '25-32°C', condition: '局部雷雨', color: 'text-yellow-600', icon: <CloudLightning size={24} /> },
    { date: '11/30', day: '週日', temp: '26-31°C', condition: '多雲', color: 'text-gray-500', icon: <Cloud size={24} /> },
    { date: '12/01', day: '週一', temp: '25-30°C', condition: '陣雨', color: 'text-blue-400', icon: <CloudRain size={24} /> },
  ]);

  const handleReset = () => {
    const pwd = prompt("請輸入重置密碼：");
    if (pwd === '0902') {
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

  const openMap = () => {
    window.open('https://www.mandai.com/content/dam/mandai/singapore-zoo/park-map/sz-zh-map.pdf', '_blank');
  };

  // Weather Logic
  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
        // Fetch Singapore (1.3521, 103.8198) weather from Open-Meteo
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FSingapore'
        );
        const jsonData = await response.json();
        
        if (jsonData.daily) {
            const newForecast: WeatherItem[] = jsonData.daily.time.slice(0, 5).map((dateStr: string, index: number) => {
                const dateObj = new Date(dateStr);
                const month = dateObj.getMonth() + 1;
                const date = dateObj.getDate();
                const dayMap = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                const code = jsonData.daily.weather_code[index];
                const max = Math.round(jsonData.daily.temperature_2m_max[index]);
                const min = Math.round(jsonData.daily.temperature_2m_min[index]);

                // Map WMO codes to UI
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

                return {
                    date: `${month}/${date}`,
                    day: dayMap[dateObj.getDay()],
                    temp: `${min}-${max}°C`,
                    condition,
                    color,
                    icon
                };
            });
            setWeatherData(newForecast);
            setIsLiveForecast(true);
        }
    } catch (error) {
        console.error("Weather fetch failed", error);
        alert("天氣更新失敗，請檢查網路連線");
    } finally {
        setLoadingWeather(false);
    }
  };

  return (
    <div className="px-4 pt-14 pb-40 space-y-4 overflow-y-auto h-full bg-slate-50">
      <h2 className="text-xl font-bold text-gray-800 mb-4">更多功能</h2>

      {/* Weather Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center">
                <CloudRain className="text-blue-500 mr-2" />
                <div>
                    <h3 className="font-bold text-gray-700 leading-none">旅程天氣預報</h3>
                    <span className="text-[10px] text-gray-400">
                        {isLiveForecast ? '即時更新 (未來 5 天)' : '歷史氣候預估 (旅程日期)'}
                    </span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                 <span className="text-[10px] text-gray-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">新加坡</span>
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
                    <span className="text-[10px] text-gray-400 mb-2">{day.day}</span>
                    <div className={`mb-2 ${day.color}`}>{day.icon}</div>
                    <span className="text-xs font-black text-gray-700 whitespace-nowrap">{day.temp}</span>
                    <span className="text-[10px] text-gray-500 mt-1 scale-90 whitespace-nowrap">{day.condition}</span>
                </div>
            ))}
        </div>
        {!isLiveForecast && (
            <p className="text-[10px] text-gray-300 p-2 text-right italic border-t border-slate-50 bg-slate-50/50">
                點擊上方重新整理按鈕可查看目前即時天氣
            </p>
        )}
      </div>

      {/* Map & Copy */}
      <div className="space-y-2">
        <button 
            onClick={openMap}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center hover:bg-slate-50 active:scale-[0.98] transition-transform"
        >
            <div className="bg-green-100 p-2 rounded-lg text-green-600 mr-3">
                <Map size={24} />
            </div>
            <div className="text-left">
                <p className="font-bold text-gray-800">新加坡動物園地圖</p>
                <p className="text-xs text-gray-500">開啟園區導覽圖</p>
            </div>
        </button>

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
              <p className="text-xs text-red-600">密碼 0902 (慎用)</p>
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
