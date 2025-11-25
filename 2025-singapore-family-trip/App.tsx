import React, { useState } from 'react';
import { Tab, PrintMode, TicketCategory } from './types';
import { useAppData } from './hooks/useAppData';
import Layout from './components/Layout';
import Overview from './components/Overview';
import Itinerary from './components/Itinerary';
import Tickets from './components/Tickets';
import More from './components/More';
import PrintView from './components/PrintView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Overview);
  const [selectedTicketCategory, setSelectedTicketCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const [printMode, setPrintMode] = useState<PrintMode>(PrintMode.All);
  
  const { data, updateItinerary, addTicket, updateTicket, removeTicket, resetData, importData } = useAppData();

  const handleTabChange = (tab: Tab, category?: TicketCategory | 'ALL') => {
    setActiveTab(tab);
    if (category) {
      setSelectedTicketCategory(category);
    }
  };

  const handlePrint = (mode: PrintMode) => {
      setPrintMode(mode);
      setTimeout(() => {
          window.print();
      }, 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Overview:
        return <Overview data={data} onChangeTab={handleTabChange} />;
      case Tab.Itinerary:
        return <Itinerary data={data} onUpdate={updateItinerary} />;
      case Tab.Tickets:
        return (
          <Tickets 
            data={data} 
            selectedCategory={selectedTicketCategory}
            onSelectCategory={setSelectedTicketCategory}
            onAddTicket={addTicket} 
            onUpdateTicket={updateTicket} 
            onRemoveTicket={removeTicket} 
          />
        );
      case Tab.More:
        return <More data={data} onReset={resetData} onImport={importData} onPrint={handlePrint} />;
      default:
        return <Overview data={data} onChangeTab={handleTabChange} />;
    }
  };

  return (
    <>
      <div className="h-full w-full bg-slate-200 flex justify-center no-print">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </Layout>
      </div>
      <PrintView data={data} mode={printMode} />
    </>
  );
};

export default App;