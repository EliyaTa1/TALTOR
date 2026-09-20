import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  BarChart3,
  GitBranch,
  Calendar,
  CreditCard,
  Globe,
  Sparkles,
  Lock,
  Crown,
  Zap,
  Shield,
  Phone,
  Mail,
  Building,
  CheckSquare,
  ShieldCheck,
  Send,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { SmartAnalytics } from './SmartAnalytics';
import { ClientsList } from './ClientsList';
import { PipelineBoard } from './PipelineBoard';
import { AppointmentsCalendar } from './AppointmentsCalendar';
import { InvoicesView } from './InvoicesView';
import { PortalHub } from './PortalHub';
import { AiInsights } from './AiInsights';
import { TasksManagement } from './TasksManagement';
import { TeamPermissionsManager } from './TeamPermissionsManager';
import { EmailMarketingHub } from './EmailMarketingHub';
import { BusinessBillingView } from './BusinessBillingView';
import { TaskNotificationBanner } from './TaskNotificationBanner';

type BusinessTab =
  | 'analytics'
  | 'clients'
  | 'pipeline'
  | 'tasks'
  | 'calendar'
  | 'invoices'
  | 'team'
  | 'marketing'
  | 'billing'
  | 'portal'
  | 'ai';

export const BusinessDashboard: React.FC<{
  onOpenUpgrade: () => void;
  onOpenPortal: (clientId: string) => void;
}> = ({ onOpenUpgrade, onOpenPortal }) => {
  const {
    currentBusiness,
    currentPlanFeatures,
    effectivePermissions,
    activeEmployeeId,
    businessEmployees,
    setActiveEmployeeId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<BusinessTab>('analytics');

  if (!currentBusiness) {
    return <div className="p-8 text-center text-slate-500">עסק לא נמצא</div>;
  }

  const rawNavItems: {
    id: BusinessTab;
    label: string;
    icon: React.ReactNode;
    tierRequired: 'BASIC' | 'PRO' | 'ULTIMATE';
    isUnlocked: boolean; // Unlocked by plan
    hasPermission: boolean; // Allowed by employee role
  }[] = [
    {
      id: 'analytics',
      label: 'דשבורד אנליטי חכם',
      icon: <BarChart3 className="w-4 h-4" />,
      tierRequired: 'PRO',
      isUnlocked: currentPlanFeatures.hasSmartAnalytics,
      hasPermission: effectivePermissions.viewReports,
    },
    {
      id: 'clients',
      label: 'ניהול לקוחות CRM',
      icon: <Users className="w-4 h-4" />,
      tierRequired: 'BASIC',
      isUnlocked: true,
      hasPermission: effectivePermissions.viewClients,
    },
    {
      id: 'tasks',
      label: 'משימות ותזכורות',
      icon: <CheckSquare className="w-4 h-4" />,
      tierRequired: 'BASIC',
      isUnlocked: true,
      hasPermission: effectivePermissions.viewTasks,
    },
    {
      id: 'pipeline',
      label: 'משפך מכירות Kanban',
      icon: <GitBranch className="w-4 h-4" />,
      tierRequired: 'PRO',
      isUnlocked: currentPlanFeatures.hasPipeline,
      hasPermission: effectivePermissions.viewClients,
    },
    {
      id: 'calendar',
      label: 'יומן פגישות',
      icon: <Calendar className="w-4 h-4" />,
      tierRequired: 'BASIC',
      isUnlocked: true,
      hasPermission: effectivePermissions.viewTasks || effectivePermissions.viewClients,
    },
    {
      id: 'invoices',
      label: 'כספים ודרישות תשלום',
      icon: <CreditCard className="w-4 h-4" />,
      tierRequired: 'PRO',
      isUnlocked: currentPlanFeatures.hasInvoicing,
      hasPermission: effectivePermissions.viewFinancials,
    },
    {
      id: 'team',
      label: 'תפקידים והרשאות צוות',
      icon: <ShieldCheck className="w-4 h-4" />,
      tierRequired: 'PRO',
      isUnlocked: true,
      hasPermission: effectivePermissions.manageEmployees,
    },
    {
      id: 'marketing',
      label: 'דיוור שיווקי Mailchimp',
      icon: <Send className="w-4 h-4" />,
      tierRequired: 'PRO',
      isUnlocked: true, // Note: Always available but might need integrations setup
      hasPermission: effectivePermissions.manageMarketing,
    },
    {
      id: 'billing',
      label: 'מנוי TALTOR ותשלומים',
      icon: <Receipt className="w-4 h-4" />,
      tierRequired: 'BASIC',
      isUnlocked: true,
      hasPermission: activeEmployeeId === 'owner',
    },
    {
      id: 'portal',
      label: 'פורטל לקוחות ומסמכים',
      icon: <Globe className="w-4 h-4" />,
      tierRequired: 'ULTIMATE',
      isUnlocked: currentPlanFeatures.hasClientPortal,
      hasPermission: effectivePermissions.managePortal,
    },
    {
      id: 'ai',
      label: 'תובנות AI ושימור',
      icon: <Sparkles className="w-4 h-4" />,
      tierRequired: 'ULTIMATE',
      isUnlocked: currentPlanFeatures.hasAiInsights,
      hasPermission: effectivePermissions.viewReports,
    },
  ];

  // Compartmentalization (מידור): Filter out tabs if the user is an employee and lacks permission.
  // Master/Owner sees all tabs to allow upgrading locked plans.
  const navItems = rawNavItems.filter((item) => {
    if (activeEmployeeId === 'owner') return true;
    return item.hasPermission;
  });

  // Ensure active tab is valid
  React.useEffect(() => {
    if (!navItems.find((item) => item.id === activeTab)) {
      if (navItems.length > 0) setActiveTab(navItems[0].id);
    }
  }, [navItems, activeTab]);


  return (
    <div className="space-y-6">
      {/* Business Profile Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-indigo-500/20">
              {currentBusiness.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900">{currentBusiness.name}</h1>
                <span
                  className={`text-xs font-bold px-3 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    currentBusiness.plan === 'ULTIMATE'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : currentBusiness.plan === 'PRO'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {currentBusiness.plan === 'ULTIMATE' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                  ) : currentBusiness.plan === 'PRO' ? (
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>חבילת {currentPlanFeatures.nameHe}</span>
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                  עסק פעיל
                </span>

                {/* If simulated as employee */}
                {activeEmployeeId !== 'owner' && (
                  <span className="text-xs bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      מחובר בתור:{' '}
                      {businessEmployees.find((e) => e.id === activeEmployeeId)?.name || 'עובד'}
                    </span>
                    <button
                      onClick={() => setActiveEmployeeId('owner')}
                      className="underline text-[10px] text-amber-800 mr-1"
                    >
                      (חזור לבעל עסק)
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentBusiness.category}</span>
                </span>
                <span>•</span>
                <span>בעלים: {currentBusiness.ownerName}</span>
                <span>•</span>
                <span dir="ltr">{currentBusiness.phone}</span>
                <span>•</span>
                <span>{currentBusiness.ownerEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Upgrade CTA */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenUpgrade}
              className="bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>שדרג / החלף חבילה</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Tasks & Reminders Notification Banner */}
      <TaskNotificationBanner onViewAllTasks={() => setActiveTab('tasks')} />

      {/* Mobile Tab Selector (sm:hidden) */}
      <div className="sm:hidden bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 block">עבור למודול מערכת:</label>
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as BusinessTab)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} {!item.isUnlocked ? `(נעול - דורש ${item.tierRequired})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs Bar (Desktop and tablet, horizontal scroll on mobile) */}
      <div className="hidden sm:flex bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs items-center gap-1 overflow-x-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>

              {/* Status or lock indicator */}
              {!item.isUnlocked && (
                <span
                  className="p-0.5 rounded-md bg-slate-100 text-slate-400"
                  title={`נעול בהרשאה זו או דורש חבילת ${item.tierRequired}`}
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Active Tab Content View */}
      <div>
        {navItems.find(item => item.id === activeTab) ? (
          <>
            {activeTab === 'analytics' && <SmartAnalytics onOpenUpgrade={onOpenUpgrade} />}
            {activeTab === 'clients' && <ClientsList onOpenPortal={onOpenPortal} />}
            {activeTab === 'tasks' && <TasksManagement />}
            {activeTab === 'pipeline' && <PipelineBoard onOpenUpgrade={onOpenUpgrade} />}
            {activeTab === 'calendar' && <AppointmentsCalendar />}
            {activeTab === 'invoices' && <InvoicesView onOpenUpgrade={onOpenUpgrade} />}
            {activeTab === 'team' && <TeamPermissionsManager />}
            {activeTab === 'marketing' && <EmailMarketingHub />}
            {activeTab === 'billing' && <BusinessBillingView onOpenUpgrade={onOpenUpgrade} />}
            {activeTab === 'portal' && (
              <PortalHub onOpenUpgrade={onOpenUpgrade} onOpenPortal={onOpenPortal} />
            )}
            {activeTab === 'ai' && <AiInsights onOpenUpgrade={onOpenUpgrade} />}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">אין הרשאות זמינות</h3>
            <p className="text-slate-500 mt-2">אין לך הרשאות לצפות באף אחד ממודולי המערכת. פנה למנהל העסק.</p>
          </div>
        )}
      </div>
    </div>
  );
};
