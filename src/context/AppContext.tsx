import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Business,
  Client,
  Appointment,
  Invoice,
  DocumentItem,
  ClientMessage,
  PlatformAuditLog,
  PlanTier,
  UserRole,
  PLAN_CONFIGS,
  Task,
  CustomRole,
  Employee,
  RolePermissions,
  EmailIntegrationConfig,
  EmailCampaign,
  SubscriptionBillingRecord,
  MasterPaymentSettings,
  CalendarViewMode,
  AuthUser,
  MASTER_ADMIN_EMAIL,
} from '../types';
import {
  INITIAL_BUSINESSES,
  INITIAL_CLIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_INVOICES,
  INITIAL_DOCUMENTS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
  INITIAL_TASKS,
  INITIAL_CUSTOM_ROLES,
  INITIAL_EMPLOYEES,
  INITIAL_EMAIL_CONFIG,
  INITIAL_CAMPAIGNS,
  INITIAL_SUBSCRIPTION_BILLINGS,
  INITIAL_MASTER_PAYMENT_SETTINGS,
} from '../data/initialData';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

const OWNER_PERMISSIONS: RolePermissions = {
  viewClients: true,
  editClients: true,
  deleteClients: true,
  viewTasks: true,
  editTasks: true,
  viewFinancials: true,
  editInvoices: true,
  viewReports: true,
  manageMarketing: true,
  managePortal: true,
  manageEmployees: true,
};

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeBusinessId: string;
  setActiveBusinessId: (id: string) => void;
  activeClientId: string;
  setActiveClientId: (id: string) => void;

  // Active entities
  currentBusiness: Business | undefined;
  currentClient: Client | undefined;
  currentPlanFeatures: typeof PLAN_CONFIGS[PlanTier];

  // Collections
  businesses: Business[];
  clients: Client[];
  appointments: Appointment[];
  invoices: Invoice[];
  documents: DocumentItem[];
  messages: ClientMessage[];
  auditLogs: PlatformAuditLog[];
  tasks: Task[];
  customRoles: CustomRole[];
  employees: Employee[];
  campaigns: EmailCampaign[];
  emailConfig: EmailIntegrationConfig;
  subscriptionBillings: SubscriptionBillingRecord[];
  masterPaymentSettings: MasterPaymentSettings;

  // Filtered for current business
  businessClients: Client[];
  businessAppointments: Appointment[];
  businessInvoices: Invoice[];
  businessDocuments: DocumentItem[];
  businessMessages: ClientMessage[];
  businessTasks: Task[];
  businessRoles: CustomRole[];
  businessEmployees: Employee[];
  businessCampaigns: EmailCampaign[];
  businessSubscription: SubscriptionBillingRecord | undefined;

  // Tasks analytics & notifications
  overdueTasks: Task[];
  todayTasks: Task[];

  // RBAC for Business Team Simulation
  activeEmployeeId: string | 'owner';
  setActiveEmployeeId: (id: string | 'owner') => void;
  effectivePermissions: RolePermissions;

  // Calendar View
  calendarViewMode: CalendarViewMode;
  setCalendarViewMode: (mode: CalendarViewMode) => void;

  // Filtered for active client portal
  portalClientAppointments: Appointment[];
  portalClientInvoices: Invoice[];
  portalClientDocuments: DocumentItem[];
  portalClientMessages: ClientMessage[];

  // Status & Auth
  isFirebaseLoading: boolean;
  isFirebaseConnected: boolean;
  authUser: AuthUser | null;
  isMasterUser: boolean;
  isGoogleAuthModalOpen: boolean;
  setIsGoogleAuthModalOpen: (open: boolean) => void;
  isLoginScreenOpen: boolean;
  setIsLoginScreenOpen: (open: boolean) => void;

  // Discrete Universal Authentication Actions
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  authenticateUserByCredentials: (identifier: string, passcode?: string) => Promise<{
    success: boolean;
    detectedRole?: UserRole;
    error?: string;
  }>;
  registerNewBusiness: (registrationData: {
    businessName: string;
    ownerName: string;
    ownerEmail: string;
    phone: string;
    category: string;
    plan: PlanTier;
    passcode?: string;
  }) => Promise<{ success: boolean; businessId?: string; error?: string }>;
  signOutUser: () => Promise<void>;

  // Business Actions
  updateBusinessPlan: (businessId: string, newPlan: PlanTier) => Promise<void>;
  toggleBusinessStatus: (businessId: string, status: 'active' | 'suspended') => Promise<void>;
  createBusiness: (businessData: Partial<Business>) => Promise<string>;
  updateBusinessSettings: (businessId: string, updates: Partial<Business>) => Promise<void>;
  deleteBusiness: (businessId: string) => Promise<void>;

  addClient: (clientData: Omit<Client, 'id' | 'createdAt'>) => Promise<string>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;

  addAppointment: (appointmentData: Omit<Appointment, 'id'>) => Promise<string>;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => Promise<void>;

  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => Promise<string>;
  markInvoicePaid: (invoiceId: string) => Promise<void>;

  addDocument: (docData: Omit<DocumentItem, 'id' | 'date'>) => Promise<string>;
  sendMessage: (msgData: Omit<ClientMessage, 'id' | 'timestamp' | 'read'>) => Promise<string>;

  // Tasks actions
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  postponeTask: (taskId: string, days: number) => Promise<void>;

  // Roles & Employees actions
  addCustomRole: (roleData: Omit<CustomRole, 'id'>) => Promise<string>;
  updateCustomRole: (role: CustomRole) => Promise<void>;
  addEmployee: (empData: Omit<Employee, 'id'>) => Promise<string>;
  updateEmployee: (emp: Employee) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;

  // Email Marketing actions
  updateEmailConfig: (config: Partial<EmailIntegrationConfig>) => Promise<void>;
  createAndSendCampaign: (campaignData: Omit<EmailCampaign, 'id' | 'status' | 'sentAt' | 'openRate' | 'clickRate'>) => Promise<string>;

  // Billing actions
  updateMasterPaymentSettings: (settings: Partial<MasterPaymentSettings>) => Promise<void>;
  paySubscriptionInvoice: (billingId: string, paymentMethod?: string) => Promise<void>;
  processManualSubscriptionCharge: (businessId: string) => Promise<void>;

  resetToDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role State
  const [role, setRole] = useState<UserRole>('business_owner');
  const [activeBusinessId, setActiveBusinessId] = useState<string>('biz-tal-ultimate');
  const [activeClientId, setActiveClientId] = useState<string>('client-shira');
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | 'owner'>('owner');
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');

  // Master Data State
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('taltor_businesses');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('taltor_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('taltor_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('taltor_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('taltor_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [messages, setMessages] = useState<ClientMessage[]>(() => {
    const saved = localStorage.getItem('taltor_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>(() => {
    const saved = localStorage.getItem('taltor_auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taltor_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [customRoles, setCustomRoles] = useState<CustomRole[]>(() => {
    const saved = localStorage.getItem('taltor_customRoles');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_ROLES;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('taltor_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('taltor_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((c: EmailCampaign) => ({
            ...c,
            provider: c.provider || 'mailchimp',
            segmentName: c.segmentName || (c.segment === 'vip' ? 'לקוחות VIP' : c.segment === 'leads' ? 'לידים בלבד' : 'כל הלקוחות'),
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse taltor_campaigns', e);
    }
    return INITIAL_CAMPAIGNS;
  });

  const [emailConfig, setEmailConfig] = useState<EmailIntegrationConfig>(() => {
    try {
      const saved = localStorage.getItem('taltor_emailConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_EMAIL_CONFIG,
          ...parsed,
          provider: parsed.provider || 'mailchimp',
          senderName: parsed.senderName || parsed.fromName || INITIAL_EMAIL_CONFIG.senderName,
          senderEmail: parsed.senderEmail || parsed.fromEmail || INITIAL_EMAIL_CONFIG.senderEmail,
          fromName: parsed.fromName || parsed.senderName || INITIAL_EMAIL_CONFIG.senderName,
          fromEmail: parsed.fromEmail || parsed.senderEmail || INITIAL_EMAIL_CONFIG.senderEmail,
          apiKey: parsed.apiKey || INITIAL_EMAIL_CONFIG.apiKey,
        };
      }
    } catch (e) {
      console.warn('Failed to parse taltor_emailConfig', e);
    }
    return INITIAL_EMAIL_CONFIG;
  });

  const [subscriptionBillings, setSubscriptionBillings] = useState<SubscriptionBillingRecord[]>(() => {
    const saved = localStorage.getItem('taltor_subscriptionBillings');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_BILLINGS;
  });

  const [masterPaymentSettings, setMasterPaymentSettings] = useState<MasterPaymentSettings>(() => {
    const saved = localStorage.getItem('taltor_masterPaymentSettings');
    return saved ? JSON.parse(saved) : INITIAL_MASTER_PAYMENT_SETTINGS;
  });

  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Authentication State with Google
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('taltor_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load taltor_auth_user', e);
    }
    // Default to Tal Eliyahoo (Master Admin)
    return {
      uid: 'master-tal-eliyahoo',
      email: MASTER_ADMIN_EMAIL,
      displayName: 'טל אליהו',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isMaster: true,
    };
  });

  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState<boolean>(false);
  const [isLoginScreenOpen, setIsLoginScreenOpen] = useState<boolean>(false);

  const isMasterUser = useMemo(() => {
    if (!authUser) return role === 'master';
    return (
      authUser.isMaster ||
      (authUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) ||
      role === 'master'
    );
  }, [authUser, role]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isMaster = firebaseUser.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
        const userObj: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'משתמש Google',
          photoURL: firebaseUser.photoURL,
          isMaster,
        };
        setAuthUser(userObj);
        try {
          localStorage.setItem('taltor_auth_user', JSON.stringify(userObj));
        } catch (e) {
          console.warn('Failed to store auth user', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to LocalStorage as instant backup cache
  useEffect(() => {
    try {
      localStorage.setItem('taltor_businesses', JSON.stringify(businesses));
      localStorage.setItem('taltor_clients', JSON.stringify(clients));
      localStorage.setItem('taltor_appointments', JSON.stringify(appointments));
      localStorage.setItem('taltor_invoices', JSON.stringify(invoices));
      localStorage.setItem('taltor_documents', JSON.stringify(documents));
      localStorage.setItem('taltor_messages', JSON.stringify(messages));
      localStorage.setItem('taltor_auditLogs', JSON.stringify(auditLogs));
      localStorage.setItem('taltor_tasks', JSON.stringify(tasks));
      localStorage.setItem('taltor_customRoles', JSON.stringify(customRoles));
      localStorage.setItem('taltor_employees', JSON.stringify(employees));
      localStorage.setItem('taltor_campaigns', JSON.stringify(campaigns));
      localStorage.setItem('taltor_emailConfig', JSON.stringify(emailConfig));
      localStorage.setItem('taltor_subscriptionBillings', JSON.stringify(subscriptionBillings));
      localStorage.setItem('taltor_masterPaymentSettings', JSON.stringify(masterPaymentSettings));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [
    businesses,
    clients,
    appointments,
    invoices,
    documents,
    messages,
    auditLogs,
    tasks,
    customRoles,
    employees,
    campaigns,
    emailConfig,
    subscriptionBillings,
    masterPaymentSettings,
  ]);

  // Initialize and Seed Firestore on mount
  useEffect(() => {
    let isMounted = true;

    async function syncWithFirestore() {
      try {
        setIsFirebaseLoading(true);
        const bizCol = collection(db, 'businesses');
        const bizSnapshot = await getDocs(bizCol);

        if (bizSnapshot.empty) {
          // Seed database with initial data
          const batch = writeBatch(db);

          INITIAL_BUSINESSES.forEach((b) => batch.set(doc(db, 'businesses', b.id), b));
          INITIAL_CLIENTS.forEach((c) => batch.set(doc(db, 'clients', c.id), c));
          INITIAL_APPOINTMENTS.forEach((a) => batch.set(doc(db, 'appointments', a.id), a));
          INITIAL_INVOICES.forEach((inv) => batch.set(doc(db, 'invoices', inv.id), inv));
          INITIAL_DOCUMENTS.forEach((d) => batch.set(doc(db, 'documents', d.id), d));
          INITIAL_MESSAGES.forEach((m) => batch.set(doc(db, 'messages', m.id), m));
          INITIAL_AUDIT_LOGS.forEach((l) => batch.set(doc(db, 'auditLogs', l.id), l));
          INITIAL_TASKS.forEach((t) => batch.set(doc(db, 'tasks', t.id), t));
          INITIAL_CUSTOM_ROLES.forEach((r) => batch.set(doc(db, 'custom_roles', r.id), r));
          INITIAL_EMPLOYEES.forEach((e) => batch.set(doc(db, 'employees', e.id), e));
          INITIAL_CAMPAIGNS.forEach((c) => batch.set(doc(db, 'email_campaigns', c.id), c));
          INITIAL_SUBSCRIPTION_BILLINGS.forEach((s) => batch.set(doc(db, 'subscription_billings', s.id), s));

          await batch.commit();
          if (isMounted) {
            setIsFirebaseConnected(true);
            setIsFirebaseLoading(false);
          }
        } else {
          // Read from Firestore
          const loadedBusinesses = bizSnapshot.docs.map((d) => d.data() as Business);
          const clientsSnap = await getDocs(collection(db, 'clients'));
          const loadedClients = clientsSnap.docs.map((d) => d.data() as Client);
          const aptSnap = await getDocs(collection(db, 'appointments'));
          const loadedApts = aptSnap.docs.map((d) => d.data() as Appointment);
          const invSnap = await getDocs(collection(db, 'invoices'));
          const loadedInvoices = invSnap.docs.map((d) => d.data() as Invoice);
          const docSnap = await getDocs(collection(db, 'documents'));
          const loadedDocs = docSnap.docs.map((d) => d.data() as DocumentItem);
          const msgSnap = await getDocs(collection(db, 'messages'));
          const loadedMsgs = msgSnap.docs.map((d) => d.data() as ClientMessage);
          const logSnap = await getDocs(collection(db, 'auditLogs'));
          const loadedLogs = logSnap.docs.map((d) => d.data() as PlatformAuditLog);

          if (isMounted) {
            if (loadedBusinesses.length) setBusinesses(loadedBusinesses);
            if (loadedClients.length) setClients(loadedClients);
            if (loadedApts.length) setAppointments(loadedApts);
            if (loadedInvoices.length) setInvoices(loadedInvoices);
            if (loadedDocs.length) setDocuments(loadedDocs);
            if (loadedMsgs.length) setMessages(loadedMsgs);
            if (loadedLogs.length) setAuditLogs(loadedLogs);
            setIsFirebaseConnected(true);
            setIsFirebaseLoading(false);
          }
        }
      } catch (err) {
        console.warn('Firestore initial sync encountered an error, running in resilient cached mode:', err);
        if (isMounted) {
          setIsFirebaseConnected(false);
          setIsFirebaseLoading(false);
        }
      }
    }

    syncWithFirestore();

    return () => {
      isMounted = false;
    };
  }, []);

  // Current entity computations
  const currentBusiness = useMemo(() => {
    return businesses.find((b) => b.id === activeBusinessId) || businesses[0];
  }, [businesses, activeBusinessId]);

  const currentPlanFeatures = useMemo(() => {
    const tier = currentBusiness?.plan || 'BASIC';
    return PLAN_CONFIGS[tier];
  }, [currentBusiness]);

  const currentClient = useMemo(() => {
    return clients.find((c) => c.id === activeClientId) || clients[0];
  }, [clients, activeClientId]);

  // Filtered queries for active tenant business
  const businessClients = useMemo(() => {
    return clients.filter((c) => c.businessId === activeBusinessId);
  }, [clients, activeBusinessId]);

  const businessAppointments = useMemo(() => {
    return appointments.filter((a) => a.businessId === activeBusinessId);
  }, [appointments, activeBusinessId]);

  const businessInvoices = useMemo(() => {
    return invoices.filter((i) => i.businessId === activeBusinessId);
  }, [invoices, activeBusinessId]);

  const businessDocuments = useMemo(() => {
    return documents.filter((d) => d.businessId === activeBusinessId);
  }, [documents, activeBusinessId]);

  const businessMessages = useMemo(() => {
    return messages.filter((m) => m.businessId === activeBusinessId);
  }, [messages, activeBusinessId]);

  const businessTasks = useMemo(() => {
    return tasks.filter((t) => t.businessId === activeBusinessId);
  }, [tasks, activeBusinessId]);

  const businessRoles = useMemo(() => {
    return customRoles.filter((r) => r.businessId === activeBusinessId);
  }, [customRoles, activeBusinessId]);

  const businessEmployees = useMemo(() => {
    return employees.filter((e) => e.businessId === activeBusinessId);
  }, [employees, activeBusinessId]);

  const businessCampaigns = useMemo(() => {
    return campaigns.filter((c) => c.businessId === activeBusinessId);
  }, [campaigns, activeBusinessId]);

  const businessSubscription = useMemo(() => {
    return subscriptionBillings.find((s) => s.businessId === activeBusinessId);
  }, [subscriptionBillings, activeBusinessId]);

  // Tasks analytics & notifications
  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const overdueTasks = useMemo(() => {
    return businessTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate < todayStr
    );
  }, [businessTasks, todayStr]);

  const todayTasks = useMemo(() => {
    return businessTasks.filter(
      (t) => t.status !== 'completed' && t.dueDate === todayStr
    );
  }, [businessTasks, todayStr]);

  // Effective Permissions calculation for Team RBAC simulation
  const effectivePermissions = useMemo<RolePermissions>(() => {
    if (activeEmployeeId === 'owner') {
      return OWNER_PERMISSIONS;
    }
    const emp = employees.find((e) => e.id === activeEmployeeId);
    if (!emp) return OWNER_PERMISSIONS;
    const roleObj = customRoles.find((r) => r.id === emp.roleId);
    if (!roleObj) return OWNER_PERMISSIONS;
    return roleObj.permissions;
  }, [activeEmployeeId, employees, customRoles]);

  // Filtered queries for Client Portal
  const portalClientAppointments = useMemo(() => {
    return appointments.filter((a) => a.clientId === activeClientId);
  }, [appointments, activeClientId]);

  const portalClientInvoices = useMemo(() => {
    return invoices.filter((i) => i.clientId === activeClientId);
  }, [invoices, activeClientId]);

  const portalClientDocuments = useMemo(() => {
    return documents.filter((d) => d.clientId === activeClientId && d.sharedWithClient);
  }, [documents, activeClientId]);

  const portalClientMessages = useMemo(() => {
    return messages.filter((m) => m.clientId === activeClientId);
  }, [messages, activeClientId]);

  // Action: Update Plan (BASIC / PRO / ULTIMATE)
  const updateBusinessPlan = useCallback(
    async (businessId: string, newPlan: PlanTier) => {
      const planConfig = PLAN_CONFIGS[newPlan];
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === businessId
            ? { ...b, plan: newPlan, monthlyFee: planConfig.pricePerMonth }
            : b
        )
      );

      // Also update master subscription record
      setSubscriptionBillings((prev) =>
        prev.map((s) =>
          s.businessId === businessId
            ? { ...s, plan: newPlan, amount: planConfig.pricePerMonth }
            : s
        )
      );

      const target = businesses.find((b) => b.id === businessId);
      const newLog: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: `עדכון חבילה ל-${newPlan}`,
        performedBy: role === 'master' ? 'מנהל מאסטר (טל אליהו)' : `בעל עסק (${target?.ownerName || 'עצמי'})`,
        targetBusinessName: target?.name,
        details: `שודרג/עודכן מנוי ל-${planConfig.nameHe} (${planConfig.pricePerMonth} ₪/חודש)`,
        badgeType: newPlan === 'ULTIMATE' ? 'purple' : newPlan === 'PRO' ? 'info' : 'warning',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      try {
        await setDoc(
          doc(db, 'businesses', businessId),
          { plan: newPlan, monthlyFee: planConfig.pricePerMonth },
          { merge: true }
        );
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    },
    [businesses, role]
  );

  // Action: Freeze / Activate Business
  const toggleBusinessStatus = useCallback(
    async (businessId: string, status: 'active' | 'suspended') => {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, status } : b))
      );

      const target = businesses.find((b) => b.id === businessId);
      const newLog: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: status === 'active' ? 'הפעלת חשבון עסק' : 'הקפאת חשבון עסק',
        performedBy: 'מנהל מאסטר (טל אליהו)',
        targetBusinessName: target?.name,
        details: `סטטוס שונה ל-${status === 'active' ? 'פעיל' : 'מוקפא'}`,
        badgeType: status === 'active' ? 'success' : 'warning',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      try {
        await setDoc(doc(db, 'businesses', businessId), { status }, { merge: true });
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    },
    [businesses]
  );

  // Action: Create New Business
  const createBusiness = useCallback(
    async (businessData: Partial<Business>) => {
      const newId = 'biz-' + Date.now();
      const plan = businessData.plan || 'PRO';
      const fee = PLAN_CONFIGS[plan].pricePerMonth;
      const newBiz: Business = {
        id: newId,
        name: businessData.name || 'עסק חדש',
        ownerName: businessData.ownerName || 'בעל עסק',
        ownerEmail: businessData.ownerEmail || 'owner@example.com',
        phone: businessData.phone || '050-0000000',
        category: businessData.category || 'שירותים מקצועיים',
        plan: plan,
        monthlyFee: fee,
        status: 'active',
        createdAt: new Date().toISOString().substring(0, 10),
        brandColor: businessData.brandColor || '#4f46e5',
        customPortalMessage: businessData.customPortalMessage || 'ברוכים הבאים לפורטל הלקוחות שלנו.',
        paymentMethod: 'credit_card',
        cardLast4: '4242',
        billingStatus: 'paid',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        stats: {
          totalRevenue: 0,
          activeClientsCount: 0,
          satisfactionRate: 10,
        },
      };

      setBusinesses((prev) => [...prev, newBiz]);
      setActiveBusinessId(newId);

      // Create subscription billing record for Master Admin
      const newSub: SubscriptionBillingRecord = {
        id: 'sub-' + Date.now(),
        businessId: newId,
        businessName: newBiz.name,
        ownerName: newBiz.ownerName,
        ownerEmail: newBiz.ownerEmail,
        ownerPhone: newBiz.phone,
        plan: plan,
        amount: fee,
        billingCycle: 'monthly',
        paymentMethod: 'credit_card',
        cardLast4: '4242',
        status: 'paid',
        billingDate: newBiz.createdAt,
        paidDate: newBiz.createdAt,
        invoiceNumber: `TALTOR-SUB-2026-${Math.floor(100 + Math.random() * 900)}`,
      };
      setSubscriptionBillings((prev) => [newSub, ...prev]);

      const newLog: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'יצירת עסק חדש במערכת TALTOR',
        performedBy: 'מנהל מאסטר (טל אליהו)',
        targetBusinessName: newBiz.name,
        details: `הוקם עסק חדש בחבילת ${PLAN_CONFIGS[plan].nameHe} (${fee} ₪/חודש)`,
        badgeType: 'success',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      try {
        await setDoc(doc(db, 'businesses', newId), newBiz);
        await setDoc(doc(db, 'subscription_billings', newSub.id), newSub);
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      return newId;
    },
    []
  );

  // Action: Update Business Settings
  const updateBusinessSettings = useCallback(
    async (businessId: string, updates: Partial<Business>) => {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, ...updates } : b))
      );

      // If plan changed inside updates, sync monthly fee & subscription
      if (updates.plan) {
        const newFee = PLAN_CONFIGS[updates.plan]?.pricePerMonth || 99;
        setSubscriptionBillings((prev) =>
          prev.map((s) =>
            s.businessId === businessId
              ? { ...s, plan: updates.plan!, amount: newFee }
              : s
          )
        );
      }

      const target = businesses.find((b) => b.id === businessId);
      const newLog: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'עדכון פרטי עסק ע״י מאסטר',
        performedBy: 'מנהל מאסטר (טל אליהו)',
        targetBusinessName: updates.name || target?.name,
        details: `עודכנו הגדרות ופרטי עסק: ${updates.name || target?.name || businessId}`,
        badgeType: 'info',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      try {
        await setDoc(doc(db, 'businesses', businessId), updates, { merge: true });
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    },
    [businesses]
  );

  // Action: Delete / Archive Business (Master Admin)
  const deleteBusiness = useCallback(
    async (businessId: string) => {
      const target = businesses.find((b) => b.id === businessId);
      setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      setSubscriptionBillings((prev) => prev.filter((s) => s.businessId !== businessId));

      if (activeBusinessId === businessId) {
        const remaining = businesses.filter((b) => b.id !== businessId);
        if (remaining.length > 0) {
          setActiveBusinessId(remaining[0].id);
        }
      }

      const newLog: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'מחיקת עסק מהמערכת',
        performedBy: 'מנהל מאסטר (טל אליהו)',
        targetBusinessName: target?.name,
        details: `העסק "${target?.name || businessId}" נמחק בהצלחה מהמערכת`,
        badgeType: 'warning',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      try {
        await deleteDoc(doc(db, 'businesses', businessId));
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    },
    [businesses, activeBusinessId]
  );

  // Action: Discrete Universal Behind-the-Scenes Role Identification & Authentication
  const authenticateUserByCredentials = useCallback(
    async (
      identifier: string,
      passcode?: string
    ): Promise<{
      success: boolean;
      detectedRole?: UserRole;
      error?: string;
    }> => {
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = passcode?.trim();

      if (!cleanId) {
        return { success: false, error: 'נא להזין כתובת אימייל, טלפון או קוד גישה' };
      }

      // 1. Check if Master Admin
      if (cleanId === MASTER_ADMIN_EMAIL.toLowerCase() || cleanId === 'master' || cleanId === 'tal') {
        const masterUser: AuthUser = {
          uid: 'master-tal-eliyahoo',
          email: MASTER_ADMIN_EMAIL,
          displayName: 'טל אליהו (מנהל מאסטר)',
          photoURL:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
          isMaster: true,
          role: 'master',
        };
        setAuthUser(masterUser);
        localStorage.setItem('taltor_auth_user', JSON.stringify(masterUser));
        setRole('master');
        setActiveEmployeeId('owner');
        setIsLoginScreenOpen(false);

        const newLog: PlatformAuditLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'התחברות מערכתית: מנהל מאסטר',
          performedBy: 'טל אליהו (מנהל מאסטר)',
          details: `זיהוי תפקיד שקט מאחורי הקלעים: הרשאות מנהל על`,
          badgeType: 'purple',
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        return { success: true, detectedRole: 'master' };
      }

      // 2. Check if Business Owner (by email or phone)
      const matchedBiz = businesses.find(
        (b) =>
          b.ownerEmail?.toLowerCase() === cleanId ||
          b.phone?.replace(/[- ]/g, '') === cleanId.replace(/[- ]/g, '')
      );

      if (matchedBiz) {
        const ownerUser: AuthUser = {
          uid: 'owner-' + matchedBiz.id,
          email: matchedBiz.ownerEmail,
          displayName: `${matchedBiz.ownerName} (${matchedBiz.name})`,
          photoURL: null,
          isMaster: false,
          role: 'business_owner',
          businessId: matchedBiz.id,
        };
        setAuthUser(ownerUser);
        localStorage.setItem('taltor_auth_user', JSON.stringify(ownerUser));
        setActiveBusinessId(matchedBiz.id);
        setActiveEmployeeId('owner');
        setRole('business_owner');
        setIsLoginScreenOpen(false);

        const newLog: PlatformAuditLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'התחברות בעל עסק',
          performedBy: matchedBiz.ownerName,
          targetBusinessName: matchedBiz.name,
          details: `כניסה מזוהה לחשבון בעל עסק: ${matchedBiz.name}`,
          badgeType: 'success',
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        return { success: true, detectedRole: 'business_owner' };
      }

      // 3. Check if Team Member / Employee of ANY business (by email, phone, or loginAccessCode)
      const matchedEmp = employees.find(
        (e) =>
          e.email?.toLowerCase() === cleanId ||
          e.phone?.replace(/[- ]/g, '') === cleanId.replace(/[- ]/g, '') ||
          (cleanPass && e.loginAccessCode && e.loginAccessCode === cleanPass) ||
          (e.loginAccessCode && cleanId === e.loginAccessCode)
      );

      if (matchedEmp) {
        const parentBiz = businesses.find((b) => b.id === matchedEmp.businessId);
        const roleObj = customRoles.find((r) => r.id === matchedEmp.roleId);

        const empUser: AuthUser = {
          uid: 'emp-' + matchedEmp.id,
          email: matchedEmp.email,
          displayName: `${matchedEmp.name} [${matchedEmp.roleName}]`,
          photoURL: matchedEmp.avatar || null,
          isMaster: false,
          role: 'employee',
          businessId: matchedEmp.businessId,
          employeeId: matchedEmp.id,
        };

        setAuthUser(empUser);
        localStorage.setItem('taltor_auth_user', JSON.stringify(empUser));
        setActiveBusinessId(matchedEmp.businessId);
        setActiveEmployeeId(matchedEmp.id);
        setRole('business_owner'); // View is business workspace, scoped by role permissions
        setIsLoginScreenOpen(false);

        const newLog: PlatformAuditLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'התחברות איש צוות / עובד',
          performedBy: `${matchedEmp.name} (${matchedEmp.roleName})`,
          targetBusinessName: parentBiz?.name || 'עסק',
          details: `זיהוי אוטומטי של תפקיד עובד עם פרופיל הרשאות: ${roleObj?.nameHe || matchedEmp.roleName}`,
          badgeType: 'info',
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        return { success: true, detectedRole: 'employee' };
      }

      // 4. Check if End Client (by email, phone, or portalAccessPin)
      const matchedClient = clients.find(
        (c) =>
          c.email?.toLowerCase() === cleanId ||
          c.phone?.replace(/[- ]/g, '') === cleanId.replace(/[- ]/g, '') ||
          (cleanPass && c.portalAccessPin && c.portalAccessPin === cleanPass) ||
          (c.portalAccessPin && cleanId === c.portalAccessPin)
      );

      if (matchedClient) {
        const parentBiz = businesses.find((b) => b.id === matchedClient.businessId);

        const clientUser: AuthUser = {
          uid: 'client-' + matchedClient.id,
          email: matchedClient.email,
          displayName: `${matchedClient.name} (פורטל לקוח)`,
          photoURL: null,
          isMaster: false,
          role: 'client',
          businessId: matchedClient.businessId,
          clientId: matchedClient.id,
        };

        setAuthUser(clientUser);
        localStorage.setItem('taltor_auth_user', JSON.stringify(clientUser));
        setActiveClientId(matchedClient.id);
        setActiveBusinessId(matchedClient.businessId);
        setRole('client');
        setIsLoginScreenOpen(false);

        const newLog: PlatformAuditLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'כניסת לקוח לפורטל השירות',
          performedBy: matchedClient.name,
          targetBusinessName: parentBiz?.name || 'עסק',
          details: `זיהוי שקט של תיק לקוח אישי וניתוב לפורטל`,
          badgeType: 'info',
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        return { success: true, detectedRole: 'client' };
      }

      // Not found in existing records
      return {
        success: false,
        error:
          'פרטי המשתמש לא אותרו במערכת. באפשרותך להירשם כבעל עסק חדש למטה, או לבדוק את פרטי האימייל / קוד הגישה שקיבלת.',
      };
    },
    [businesses, employees, clients, customRoles]
  );

  // Action: Register New Business Owner Flow
  const registerNewBusiness = useCallback(
    async (regData: {
      businessName: string;
      ownerName: string;
      ownerEmail: string;
      phone: string;
      category: string;
      plan: PlanTier;
      passcode?: string;
    }): Promise<{ success: boolean; businessId?: string; error?: string }> => {
      try {
        if (!regData.businessName.trim() || !regData.ownerName.trim() || !regData.ownerEmail.trim()) {
          return { success: false, error: 'נא למלא את כל שדות החובה' };
        }

        // Check if business with this email already exists
        const exists = businesses.some(
          (b) => b.ownerEmail.toLowerCase() === regData.ownerEmail.trim().toLowerCase()
        );
        if (exists) {
          return {
            success: false,
            error: 'כבר קיים עסק רשום עם כתובת אימייל זו. אנא התחבר ישירות.',
          };
        }

        const fee = PLAN_CONFIGS[regData.plan]?.pricePerMonth || 99;
        const newBizId = 'biz-' + Date.now();
        const nowStr = new Date().toISOString().substring(0, 10);

        const newBiz: Business = {
          id: newBizId,
          name: regData.businessName.trim(),
          ownerName: regData.ownerName.trim(),
          ownerEmail: regData.ownerEmail.trim().toLowerCase(),
          phone: regData.phone.trim() || '050-1234567',
          plan: regData.plan,
          status: 'active',
          createdAt: nowStr,
          monthlyFee: fee,
          category: regData.category || 'שירותים מקצועיים',
          brandColor: '#4f46e5',
        };

        // Add default custom roles for the newly registered business
        const defaultRoles: CustomRole[] = [
          {
            id: `role-sales-${newBizId}`,
            businessId: newBizId,
            name: 'Sales & Service',
            nameHe: 'נציג מכירות ושירות',
            description: 'גישה ללקוחות, ניהול משימות וצפייה בהתקשרויות',
            color: '#6366f1',
            permissions: {
              viewClients: true,
              editClients: true,
              deleteClients: false,
              viewTasks: true,
              editTasks: true,
              viewFinancials: false,
              editInvoices: false,
              viewReports: false,
              manageMarketing: false,
              managePortal: true,
              manageEmployees: false,
            },
            isSystemDefault: true,
          },
          {
            id: `role-manager-${newBizId}`,
            businessId: newBizId,
            name: 'Operations Manager',
            nameHe: 'מנהל תפעול וצוות',
            description: 'גישה מלאה ללקוחות, פרויקטים, דוחות והפקת חשבוניות',
            color: '#059669',
            permissions: {
              viewClients: true,
              editClients: true,
              deleteClients: true,
              viewTasks: true,
              editTasks: true,
              viewFinancials: true,
              editInvoices: true,
              viewReports: true,
              manageMarketing: true,
              managePortal: true,
              manageEmployees: false,
            },
            isSystemDefault: true,
          },
        ];

        setBusinesses((prev) => [newBiz, ...prev]);
        setCustomRoles((prev) => [...defaultRoles, ...prev]);
        setActiveBusinessId(newBizId);

        // Subscription billing record
        const newSub: SubscriptionBillingRecord = {
          id: 'sub-' + Date.now(),
          businessId: newBizId,
          businessName: newBiz.name,
          ownerName: newBiz.ownerName,
          ownerEmail: newBiz.ownerEmail,
          ownerPhone: newBiz.phone,
          plan: regData.plan,
          amount: fee,
          billingCycle: 'monthly',
          paymentMethod: 'credit_card',
          cardLast4: '4242',
          status: 'paid',
          billingDate: nowStr,
          paidDate: `${nowStr} 10:00`,
          invoiceNumber: `TALTOR-SUB-2026-${Math.floor(100 + Math.random() * 900)}`,
        };
        setSubscriptionBillings((prev) => [newSub, ...prev]);

        // Auto authenticate as new Business Owner
        const ownerUser: AuthUser = {
          uid: 'owner-' + newBizId,
          email: newBiz.ownerEmail,
          displayName: `${newBiz.ownerName} (${newBiz.name})`,
          photoURL: null,
          isMaster: false,
          role: 'business_owner',
          businessId: newBizId,
        };
        setAuthUser(ownerUser);
        localStorage.setItem('taltor_auth_user', JSON.stringify(ownerUser));
        setActiveEmployeeId('owner');
        setRole('business_owner');
        setIsLoginScreenOpen(false);

        const newLog: PlatformAuditLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'הרשמת בעל עסק חדש עצמאית',
          performedBy: newBiz.ownerName,
          targetBusinessName: newBiz.name,
          details: `העסק ${newBiz.name} נרשם בהצלחה בחבילת ${PLAN_CONFIGS[regData.plan].nameHe}`,
          badgeType: 'success',
        };
        setAuditLogs((prev) => [newLog, ...prev]);

        try {
          await setDoc(doc(db, 'businesses', newBizId), newBiz);
          await setDoc(doc(db, 'subscription_billings', newSub.id), newSub);
          await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
          for (const role of defaultRoles) {
            await setDoc(doc(db, 'customRoles', role.id), role);
          }
        } catch (err) {
          console.warn('Firestore registration write warning:', err);
        }

        return { success: true, businessId: newBizId };
      } catch (e: any) {
        console.error('Registration failed:', e);
        return { success: false, error: e?.message || 'שגיאה ביצירת העסק' };
      }
    },
    [businesses]
  );

  // Action: Sign In With Google (Firebase Auth Popup + Automatic Role Detection Behind-the-Scenes)
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = user.email?.toLowerCase() || '';
      const isMaster = userEmail === MASTER_ADMIN_EMAIL.toLowerCase();

      // Check if Business Owner
      const owned = businesses.find(
        (b) => b.ownerEmail?.toLowerCase() === userEmail
      );

      // Check if Employee
      const empMatch = employees.find(
        (e) => e.email?.toLowerCase() === userEmail
      );

      // Check if Client
      const clientMatch = clients.find(
        (c) => c.email?.toLowerCase() === userEmail
      );

      let detectedRole: UserRole = 'business_owner';
      if (isMaster) {
        detectedRole = 'master';
      } else if (empMatch) {
        detectedRole = 'employee';
      } else if (clientMatch && !owned) {
        detectedRole = 'client';
      } else if (owned) {
        detectedRole = 'business_owner';
      }

      const newAuthUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'משתמש Google',
        photoURL: user.photoURL,
        isMaster,
        role: detectedRole,
        businessId: owned?.id || empMatch?.businessId || clientMatch?.businessId,
        clientId: clientMatch?.id,
        employeeId: empMatch?.id,
      };

      setAuthUser(newAuthUser);
      localStorage.setItem('taltor_auth_user', JSON.stringify(newAuthUser));

      if (isMaster) {
        setRole('master');
        setActiveEmployeeId('owner');
      } else if (empMatch) {
        setActiveBusinessId(empMatch.businessId);
        setActiveEmployeeId(empMatch.id);
        setRole('business_owner');
      } else if (clientMatch && !owned) {
        setActiveClientId(clientMatch.id);
        setActiveBusinessId(clientMatch.businessId);
        setRole('client');
      } else if (owned) {
        setActiveBusinessId(owned.id);
        setActiveEmployeeId('owner');
        setRole('business_owner');
      } else {
        // Unrecognized user: route to business owner default
        setRole('business_owner');
      }

      setIsLoginScreenOpen(false);

      const newLog: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: isMaster ? 'התחברות מנהל מאסטר (Google)' : `התחברות ${detectedRole} (Google)`,
        performedBy: user.displayName || user.email || 'משתמש Google',
        details: `זיהוי תפקיד אוטומטי מאחורי הקלעים: ${detectedRole} (${user.email})`,
        badgeType: isMaster ? 'purple' : 'success',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      return { success: true };
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      const errorMsg =
        err?.code === 'auth/popup-blocked'
          ? 'חלון ההתחברות נחסם ע״י הדפדפן. אנא אשר חלונות קופצים בדפדפן או השתמש בהזנת אימייל דיסקרטית.'
          : err?.code === 'auth/popup-closed-by-user'
          ? 'חלון ההתחברות נסגר ע״י המשתמש לפני השלמת התהליך.'
          : err?.message || 'שגיאה בהתחברות ל-Google';
      return { success: false, error: errorMsg };
    }
  }, [businesses, employees, clients]);

  // Action: Sign Out
  const signOutUser = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning', e);
    }
    setAuthUser(null);
    localStorage.removeItem('taltor_auth_user');
    setIsLoginScreenOpen(true);
  }, []);

  // Action: Add Client
  const addClient = useCallback(
    async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
      const newId = 'client-' + Date.now();
      const newClient: Client = {
        ...clientData,
        id: newId,
        createdAt: new Date().toISOString().substring(0, 10),
        portalAccessPin: clientData.portalAccessPin || Math.floor(1000 + Math.random() * 9000).toString(),
        notes: clientData.notes || [],
        tags: clientData.tags || [],
      };

      setClients((prev) => [newClient, ...prev]);

      try {
        await setDoc(doc(db, 'clients', newId), newClient);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      return newId;
    },
    []
  );

  // Action: Update Client
  const updateClient = useCallback(async (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    try {
      await setDoc(doc(db, 'clients', client.id), client, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  // Action: Delete Client
  const deleteClient = useCallback(async (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    try {
      await setDoc(doc(db, 'clients', clientId), { deleted: true }, { merge: true });
    } catch (err) {
      console.warn('Firestore delete warning:', err);
    }
  }, []);

  // Action: Add Appointment
  const addAppointment = useCallback(async (aptData: Omit<Appointment, 'id'>) => {
    const newId = 'apt-' + Date.now();
    const newApt: Appointment = {
      ...aptData,
      id: newId,
    };
    setAppointments((prev) => [newApt, ...prev]);
    try {
      await setDoc(doc(db, 'appointments', newId), newApt);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
    return newId;
  }, []);

  // Action: Update Appointment Status
  const updateAppointmentStatus = useCallback(
    async (appointmentId: string, status: Appointment['status']) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
      );
      try {
        await setDoc(doc(db, 'appointments', appointmentId), { status }, { merge: true });
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    },
    []
  );

  // Action: Add Invoice
  const addInvoice = useCallback(async (invData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newId = 'inv-' + Date.now();
    const newInv: Invoice = {
      ...invData,
      id: newId,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setInvoices((prev) => [newInv, ...prev]);
    try {
      await setDoc(doc(db, 'invoices', newId), newInv);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
    return newId;
  }, []);

  // Action: Mark Invoice as Paid
  const markInvoicePaid = useCallback(async (invoiceId: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: 'paid', paidDate: today } : i))
    );
    try {
      await setDoc(
        doc(db, 'invoices', invoiceId),
        { status: 'paid', paidDate: today },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  // Action: Add Document
  const addDocument = useCallback(async (docData: Omit<DocumentItem, 'id' | 'date'>) => {
    const newId = 'doc-' + Date.now();
    const newDoc: DocumentItem = {
      ...docData,
      id: newId,
      date: new Date().toISOString().substring(0, 10),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    try {
      await setDoc(doc(db, 'documents', newId), newDoc);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
    return newId;
  }, []);

  // Action: Send Message
  const sendMessage = useCallback(
    async (msgData: Omit<ClientMessage, 'id' | 'timestamp' | 'read'>) => {
      const newId = 'msg-' + Date.now();
      const now = new Date();
      const timeStr = `${now.toISOString().substring(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newMsg: ClientMessage = {
        ...msgData,
        id: newId,
        timestamp: timeStr,
        read: false,
      };
      setMessages((prev) => [...prev, newMsg]);
      try {
        await setDoc(doc(db, 'messages', newId), newMsg);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
      return newId;
    },
    []
  );

  // ----------------------------------------------------
  // Action: Tasks Management
  // ----------------------------------------------------
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newId = 'task-' + Date.now();
    const newTask: Task = {
      ...taskData,
      id: newId,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setTasks((prev) => [newTask, ...prev]);
    try {
      await setDoc(doc(db, 'tasks', newId), newTask);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
    return newId;
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    const completedAt = status === 'completed' ? new Date().toISOString().substring(0, 10) : undefined;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, completedAt } : t))
    );
    try {
      await setDoc(doc(db, 'tasks', taskId), { status, completedAt }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await setDoc(doc(db, 'tasks', taskId), { deleted: true }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const postponeTask = useCallback(async (taskId: string, days: number) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const current = new Date(target.dueDate);
    current.setDate(current.getDate() + days);
    const newDueDate = current.toISOString().substring(0, 10);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate } : t))
    );
    try {
      await setDoc(doc(db, 'tasks', taskId), { dueDate: newDueDate }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, [tasks]);

  // ----------------------------------------------------
  // Action: Custom Roles & Employees
  // ----------------------------------------------------
  const addCustomRole = useCallback(async (roleData: Omit<CustomRole, 'id'>) => {
    const newId = 'role-' + Date.now();
    const newRole: CustomRole = {
      ...roleData,
      id: newId,
    };
    setCustomRoles((prev) => [...prev, newRole]);
    try {
      await setDoc(doc(db, 'custom_roles', newId), newRole);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
    return newId;
  }, []);

  const updateCustomRole = useCallback(async (updatedRole: CustomRole) => {
    setCustomRoles((prev) =>
      prev.map((r) => (r.id === updatedRole.id ? updatedRole : r))
    );
    try {
      await setDoc(doc(db, 'custom_roles', updatedRole.id), updatedRole, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const addEmployee = useCallback(async (empData: Omit<Employee, 'id'>) => {
    const newId = 'emp-' + Date.now();
    const newEmp: Employee = {
      ...empData,
      id: newId,
    };
    setEmployees((prev) => [...prev, newEmp]);
    try {
      await setDoc(doc(db, 'employees', newId), newEmp);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
    return newId;
  }, []);

  const updateEmployee = useCallback(async (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
    );
    try {
      await setDoc(doc(db, 'employees', updatedEmp.id), updatedEmp, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    try {
      await setDoc(doc(db, 'employees', employeeId), { deleted: true }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  // ----------------------------------------------------
  // Action: Email Marketing Integrations
  // ----------------------------------------------------
  const updateEmailConfig = useCallback(async (configUpdates: Partial<EmailIntegrationConfig>) => {
    setEmailConfig((prev) => {
      const next = { ...prev, ...configUpdates };
      return next;
    });
    try {
      await setDoc(doc(db, 'business_configs', activeBusinessId), { emailConfig: configUpdates }, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, [activeBusinessId]);

  const createAndSendCampaign = useCallback(
    async (campaignData: Omit<EmailCampaign, 'id' | 'status' | 'sentAt' | 'openRate' | 'clickRate'>) => {
      const newId = 'camp-' + Date.now();
      const now = new Date();
      const sentTimeStr = `${now.toISOString().substring(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Simulate realistic initial metrics
      const newCamp: EmailCampaign = {
        ...campaignData,
        id: newId,
        status: 'sent',
        sentAt: sentTimeStr,
        openRate: Math.floor(45 + Math.random() * 40),
        clickRate: Math.floor(18 + Math.random() * 25),
        leadsGenerated: Math.floor(1 + Math.random() * 5),
      };

      setCampaigns((prev) => [newCamp, ...prev]);

      const log: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: sentTimeStr,
        action: 'שליחת קמפיין אימייל שיווקי',
        performedBy: currentBusiness?.name || 'בעל עסק',
        targetBusinessName: currentBusiness?.name,
        details: `קמפיין "${newCamp.title}" נשלח ל-${newCamp.recipientCount} נמענים דרך ${(emailConfig?.provider || 'mailchimp').toUpperCase()}`,
        badgeType: 'info',
      };
      setAuditLogs((prev) => [log, ...prev]);

      try {
        await setDoc(doc(db, 'email_campaigns', newId), newCamp);
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      return newId;
    },
    [currentBusiness, emailConfig]
  );

  // ----------------------------------------------------
  // Action: Master Payment Settings & Subscriptions
  // ----------------------------------------------------
  const updateMasterPaymentSettings = useCallback(async (settings: Partial<MasterPaymentSettings>) => {
    setMasterPaymentSettings((prev) => ({ ...prev, ...settings }));
    try {
      await setDoc(doc(db, 'platform_settings', 'payment_settings'), settings, { merge: true });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, []);

  const paySubscriptionInvoice = useCallback(async (billingId: string, paymentMethod = 'credit_card') => {
    const today = new Date().toISOString().substring(0, 10);
    setSubscriptionBillings((prev) =>
      prev.map((s) => (s.id === billingId ? { ...s, status: 'paid', paidDate: today } : s))
    );

    const sub = subscriptionBillings.find((s) => s.id === billingId);
    if (sub) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === sub.businessId
            ? {
                ...b,
                billingStatus: 'paid',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
              }
            : b
        )
      );

      const log: PlatformAuditLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        action: 'תשלום מנוי חודשי התקבל',
        performedBy: sub.businessName,
        targetBusinessName: sub.businessName,
        details: `חיוב מנוי ${sub.plan} בסך ₪${sub.amount} שולם בהצלחה (חשבונית מס׳ ${sub.invoiceNumber})`,
        badgeType: 'success',
      };
      setAuditLogs((prev) => [log, ...prev]);

      try {
        await setDoc(
          doc(db, 'subscription_billings', billingId),
          { status: 'paid', paidDate: today, paymentMethod },
          { merge: true }
        );
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    }
  }, [subscriptionBillings]);

  const processManualSubscriptionCharge = useCallback(async (businessId: string) => {
    const biz = businesses.find((b) => b.id === businessId);
    if (!biz) return;
    const newId = 'sub-' + Date.now();
    const today = new Date().toISOString().substring(0, 10);
    const newSub: SubscriptionBillingRecord = {
      id: newId,
      businessId: biz.id,
      businessName: biz.name,
      ownerName: biz.ownerName,
      ownerEmail: biz.ownerEmail,
      ownerPhone: biz.phone,
      plan: biz.plan,
      amount: biz.monthlyFee,
      billingCycle: 'monthly',
      paymentMethod: biz.paymentMethod || 'credit_card',
      cardLast4: biz.cardLast4 || '4580',
      status: 'paid',
      billingDate: today,
      paidDate: today,
      invoiceNumber: `TALTOR-SUB-2026-${Math.floor(100 + Math.random() * 900)}`,
    };

    setSubscriptionBillings((prev) => [newSub, ...prev]);
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === businessId
          ? {
              ...b,
              billingStatus: 'paid',
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
            }
          : b
      )
    );

    const log: PlatformAuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      action: 'חיוב מנוי יזום ע״י מנהל מאסטר',
      performedBy: 'מנהל מאסטר (טל אליהו)',
      targetBusinessName: biz.name,
      details: `בוצע חיוב יזום בסך ₪${biz.monthlyFee} באמצעות ${biz.paymentMethod || 'כרטיס אשראי'}`,
      badgeType: 'success',
    };
    setAuditLogs((prev) => [log, ...prev]);

    try {
      await setDoc(doc(db, 'subscription_billings', newId), newSub);
      await setDoc(doc(db, 'auditLogs', log.id), log);
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }, [businesses]);

  // Action: Reset Demo Data
  const resetToDemoData = useCallback(async () => {
    setBusinesses(INITIAL_BUSINESSES);
    setClients(INITIAL_CLIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setInvoices(INITIAL_INVOICES);
    setDocuments(INITIAL_DOCUMENTS);
    setMessages(INITIAL_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTasks(INITIAL_TASKS);
    setCustomRoles(INITIAL_CUSTOM_ROLES);
    setEmployees(INITIAL_EMPLOYEES);
    setCampaigns(INITIAL_CAMPAIGNS);
    setEmailConfig(INITIAL_EMAIL_CONFIG);
    setSubscriptionBillings(INITIAL_SUBSCRIPTION_BILLINGS);
    setMasterPaymentSettings(INITIAL_MASTER_PAYMENT_SETTINGS);
    setActiveBusinessId('biz-tal-ultimate');
    setActiveClientId('client-shira');
    setActiveEmployeeId('owner');

    try {
      const batch = writeBatch(db);
      INITIAL_BUSINESSES.forEach((b) => batch.set(doc(db, 'businesses', b.id), b));
      INITIAL_CLIENTS.forEach((c) => batch.set(doc(db, 'clients', c.id), c));
      INITIAL_APPOINTMENTS.forEach((a) => batch.set(doc(db, 'appointments', a.id), a));
      INITIAL_INVOICES.forEach((i) => batch.set(doc(db, 'invoices', i.id), i));
      INITIAL_DOCUMENTS.forEach((d) => batch.set(doc(db, 'documents', d.id), d));
      INITIAL_MESSAGES.forEach((m) => batch.set(doc(db, 'messages', m.id), m));
      INITIAL_AUDIT_LOGS.forEach((l) => batch.set(doc(db, 'auditLogs', l.id), l));
      INITIAL_TASKS.forEach((t) => batch.set(doc(db, 'tasks', t.id), t));
      INITIAL_CUSTOM_ROLES.forEach((r) => batch.set(doc(db, 'custom_roles', r.id), r));
      INITIAL_EMPLOYEES.forEach((e) => batch.set(doc(db, 'employees', e.id), e));
      INITIAL_CAMPAIGNS.forEach((c) => batch.set(doc(db, 'email_campaigns', c.id), c));
      INITIAL_SUBSCRIPTION_BILLINGS.forEach((s) => batch.set(doc(db, 'subscription_billings', s.id), s));
      await batch.commit();
    } catch (err) {
      console.warn('Error resetting to demo data:', err);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeBusinessId,
        setActiveBusinessId,
        activeClientId,
        setActiveClientId,

        currentBusiness,
        currentClient,
        currentPlanFeatures,

        businesses,
        clients,
        appointments,
        invoices,
        documents,
        messages,
        auditLogs,
        tasks,
        customRoles,
        employees,
        campaigns,
        emailConfig,
        subscriptionBillings,
        masterPaymentSettings,

        businessClients,
        businessAppointments,
        businessInvoices,
        businessDocuments,
        businessMessages,
        businessTasks,
        businessRoles,
        businessEmployees,
        businessCampaigns,
        businessSubscription,

        overdueTasks,
        todayTasks,

        activeEmployeeId,
        setActiveEmployeeId,
        effectivePermissions,

        calendarViewMode,
        setCalendarViewMode,

        portalClientAppointments,
        portalClientInvoices,
        portalClientDocuments,
        portalClientMessages,

        isFirebaseLoading,
        isFirebaseConnected,
        authUser,
        isMasterUser,
        isGoogleAuthModalOpen,
        setIsGoogleAuthModalOpen,
        isLoginScreenOpen,
        setIsLoginScreenOpen,

        signInWithGoogle,
        authenticateUserByCredentials,
        registerNewBusiness,
        signOutUser,

        updateBusinessPlan,
        toggleBusinessStatus,
        createBusiness,
        updateBusinessSettings,
        deleteBusiness,

        addClient,
        updateClient,
        deleteClient,

        addAppointment,
        updateAppointmentStatus,

        addInvoice,
        markInvoicePaid,

        addDocument,
        sendMessage,

        addTask,
        updateTaskStatus,
        deleteTask,
        postponeTask,

        addCustomRole,
        updateCustomRole,
        addEmployee,
        updateEmployee,
        deleteEmployee,

        updateEmailConfig,
        createAndSendCampaign,

        updateMasterPaymentSettings,
        paySubscriptionInvoice,
        processManualSubscriptionCharge,

        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
