import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/navigation/TopBar';
import { BusinessDashboard } from './components/business/BusinessDashboard';
import { MasterDashboard } from './components/master/MasterDashboard';
import { ClientPortalView } from './components/portal/ClientPortalView';
import { PlanUpgradeModal } from './components/business/PlanUpgradeModal';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { Crown, Zap, Shield, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    role,
    setRole,
    setActiveBusinessId,
    setActiveClientId,
    currentPlanFeatures,
    currentBusiness,
    authUser,
    isLoginScreenOpen,
    setIsLoginScreenOpen,
  } = useApp();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // If user explicitly opened the dedicated login screen or is not authenticated
  if (isLoginScreenOpen || !authUser) {
    return <LoginScreen onDismiss={authUser ? () => setIsLoginScreenOpen(false) : undefined} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col" dir="rtl">
      {/* Universal TopBar with Role, Business & Client Switchers */}
      <TopBar onOpenUpgradeModal={() => setIsUpgradeOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Role: Master Admin (Tal Eliyahoo) */}
        {role === 'master' && (
          <MasterDashboard
            onSelectBusinessToManage={(bizId) => {
              setActiveBusinessId(bizId);
              setRole('business_owner');
            }}
          />
        )}

        {/* Role: Business Owner */}
        {role === 'business_owner' && (
          <BusinessDashboard
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onOpenPortal={(cId) => {
              setActiveClientId(cId);
              setRole('client');
            }}
          />
        )}

        {/* Role: End Client Portal */}
        {role === 'client' && <ClientPortalView />}
      </main>

      {/* Global Plan Upgrade / Tier Switcher Modal */}
      <PlanUpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      {/* Global Google Authentication Modal */}
      <GoogleAuthModal />

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 tracking-wider">TALTOR CRM</span>
            <span>•</span>
            <span>מערכת ניהול לקוחות ב-3 מצבים: BASIC, PRO, ו-ULTIMATE</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>מאובטח ע״י Firebase Firestore</span>
            <span>•</span>
            <span>מופרד רב-עסקי (Multi-Tenant)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
