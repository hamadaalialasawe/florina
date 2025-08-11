import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthForm from './components/AuthForm';
import EmployeeAuthForm from './components/EmployeeAuthForm';
import EmployeeRegistration from './components/EmployeeRegistration';
import EmployeeAttendanceView from './components/EmployeeAttendanceView';
import ToastContainer from './components/ToastContainer';
import LoadingSpinner from './components/LoadingSpinner';
import EmployeesView from './views/EmployeesView';
import AttendanceView from './views/AttendanceView';
import AdvancesView from './views/AdvancesView';
import BonusesView from './views/BonusesView';
import DiscountsView from './views/DiscountsView';
import OvertimeView from './views/OvertimeView';
import LeavesView from './views/LeavesView';
import SummaryView from './views/SummaryView';
import SettingsView from './views/SettingsView';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('employees');
  const [isEmployeeMode, setIsEmployeeMode] = useState(false);
  const [showEmployeeRegistration, setShowEmployeeRegistration] = useState(false);
  const [loggedInEmployee, setLoggedInEmployee] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    if (isEmployeeMode) {
      if (loggedInEmployee) {
        return (
          <EmployeeAttendanceView 
            employee={loggedInEmployee}
            onLogout={() => {
              setLoggedInEmployee(null);
              setIsEmployeeMode(false);
              setShowEmployeeRegistration(false);
            }}
          />
        );
      } else if (showEmployeeRegistration) {
        return (
          <EmployeeRegistration
            onBackToLogin={() => setShowEmployeeRegistration(false)}
            onRegistrationSuccess={() => {
              setShowEmployeeRegistration(false);
              showToast('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول', 'success');
            }}
          />
        );
      } else {
        return (
          <EmployeeAuthForm
            onEmployeeLogin={setLoggedInEmployee}
            onBackToAdmin={() => {
              setIsEmployeeMode(false);
              setShowEmployeeRegistration(false);
            }}
            onShowRegistration={() => setShowEmployeeRegistration(true)}
          />
        );
      }
    } else {
      return <AuthForm onEmployeeMode={() => setIsEmployeeMode(true)} />;
    }
  }

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
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;