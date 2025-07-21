import React, { useState } from 'react';
import { useToast } from './hooks/useToast';
import Layout from './components/Layout';
import ToastContainer from './components/ToastContainer';
import EmployeesView from './views/EmployeesView';
import AttendanceView from './views/AttendanceView';
import AdvancesView from './views/AdvancesView';
import BonusesView from './views/BonusesView';
import DiscountsView from './views/DiscountsView';
import OvertimeView from './views/OvertimeView';
import LeavesView from './views/LeavesView';
import SummaryView from './views/SummaryView';
import SettingsView from './views/SettingsView';

function App() {
  const [currentView, setCurrentView] = useState('employees');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'employees':
        return <EmployeesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'advances':
        return <AdvancesView />;
      case 'bonuses':
        return <BonusesView />;
      case 'discounts':
        return <DiscountsView />;
      case 'overtime':
        return <OvertimeView />;
      case 'leaves':
        return <LeavesView />;
      case 'summary':
        return <SummaryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <EmployeesView />;
    }
  };

  return (
    <div className="App">
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </Layout>
      <ToastContainer />
    </div>
  );
}

export default App;