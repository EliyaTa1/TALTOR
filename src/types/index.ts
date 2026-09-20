export type PlanTier = 'BASIC' | 'PRO' | 'ULTIMATE';

export type UserRole = 'master' | 'business_owner' | 'employee' | 'client';

export const MASTER_ADMIN_EMAIL = 'tal.eliyahoo31@gmail.com';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isMaster: boolean;
  role?: UserRole;
  businessId?: string;
  clientId?: string;
  employeeId?: string;
}

export interface PlanFeatures {
  tier: PlanTier;
  name: string;
  nameHe: string;
  pricePerMonth: number;
  maxClients: number | 'unlimited';
  hasPipeline: boolean;
  hasInvoicing: boolean;
  hasSmartAnalytics: boolean;
  hasClientPortal: boolean;
  hasAiInsights: boolean;
  hasDocumentSharing: boolean;
  hasCustomBranding: boolean;
  hasDataExport: boolean;
  hasEmailMarketing: boolean;
  hasCustomRoles: boolean;
  description: string;
  highlightBadge?: string;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanFeatures> = {
  BASIC: {
    tier: 'BASIC',
    name: 'Basic',
    nameHe: 'בסיסי',
    pricePerMonth: 99,
    maxClients: 50,
    hasPipeline: false,
    hasInvoicing: false,
    hasSmartAnalytics: false,
    hasClientPortal: false,
    hasAiInsights: false,
    hasDocumentSharing: false,
    hasCustomBranding: false,
    hasDataExport: false,
    hasEmailMarketing: false,
    hasCustomRoles: false,
    description: 'לבעלי עסקים מתחילים - ניהול לקוחות מהיר, אנשי קשר, יומן פגישות ומשימות בסיסי.',
  },
  PRO: {
    tier: 'PRO',
    name: 'Professional',
    nameHe: 'מקצועי (PRO)',
    pricePerMonth: 249,
    maxClients: 500,
    hasPipeline: true,
    hasInvoicing: true,
    hasSmartAnalytics: true,
    hasClientPortal: false,
    hasAiInsights: false,
    hasDocumentSharing: false,
    hasCustomBranding: false,
    hasDataExport: true,
    hasEmailMarketing: true,
    hasCustomRoles: true,
    description: 'לעסקים צומחים - כולל משפך מכירות Kanban, הרשאות עובדים, קמפיינים באימייל, ניהול גבייה ודשבורד חכם.',
    highlightBadge: 'הכי פופולרי',
  },
  ULTIMATE: {
    tier: 'ULTIMATE',
    name: 'Ultimate',
    nameHe: 'אולטימייט (ULTIMATE)',
    pricePerMonth: 499,
    maxClients: 'unlimited',
    hasPipeline: true,
    hasInvoicing: true,
    hasSmartAnalytics: true,
    hasClientPortal: true,
    hasAiInsights: true,
    hasDocumentSharing: true,
    hasCustomBranding: true,
    hasDataExport: true,
    hasEmailMarketing: true,
    hasCustomRoles: true,
    description: 'חבילת הדגל - פורטל אישי ללקוחות הקצה, AI לחיזוי נטישה, ניהול חוזים ומסמכים, ומיתוג אישי יוקרתי.',
    highlightBadge: 'הכל כלול VIP',
  },
};

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  category: string;
  plan: PlanTier;
  monthlyFee: number;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  brandColor: string;
  logoUrl?: string;
  customPortalMessage?: string;
  paymentMethod?: 'credit_card' | 'standing_order' | 'bank_transfer' | 'bit';
  cardLast4?: string;
  billingStatus?: 'paid' | 'pending' | 'overdue' | 'failed';
  nextBillingDate?: string;
  stats?: {
    totalRevenue: number;
    activeClientsCount: number;
    satisfactionRate: number;
  };
}

export type ClientStatus = 'lead' | 'contacted' | 'proposal' | 'active' | 'inactive';

export interface ClientNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface Client {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  dealValue: number;
  tags: string[];
  notes: ClientNote[];
  createdAt: string;
  portalAccessPin: string;
  vipStatus: boolean;
  churnRisk: 'low' | 'medium' | 'high';
  satisfactionScore: number; // 1-10
  lastContactDate: string;
  address?: string;
  assignedEmployeeId?: string;
}

export type CalendarViewMode = 'day' | 'week' | 'month';

export interface Appointment {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'requested_by_client';
  location: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  number: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  title: string;
  category: 'contract' | 'brief' | 'receipt' | 'report' | 'other';
  fileSize: string;
  date: string;
  sharedWithClient: boolean;
}

export interface ClientMessage {
  id: string;
  businessId: string;
  clientId: string;
  sender: 'client' | 'business';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PlatformAuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  targetBusinessName?: string;
  details: string;
  badgeType: 'info' | 'success' | 'warning' | 'purple';
}

// ----------------------------------------------------
// NEW: Tasks & Reminders
// ----------------------------------------------------
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  businessId: string;
  clientId?: string;
  clientName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

// ----------------------------------------------------
// NEW: Custom Roles & Granular Permissions
// ----------------------------------------------------
export interface RolePermissions {
  viewClients: boolean;
  editClients: boolean;
  deleteClients: boolean;
  viewTasks: boolean;
  editTasks: boolean;
  viewFinancials: boolean;
  editInvoices: boolean;
  viewReports: boolean;
  manageMarketing: boolean;
  managePortal: boolean;
  manageEmployees: boolean;
}

export interface CustomRole {
  id: string;
  businessId: string;
  name: string;
  nameHe: string;
  description: string;
  color: string;
  permissions: RolePermissions;
  isSystemDefault?: boolean;
}

export interface Employee {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'inactive';
  assignedClientIds?: string[];
  avatar?: string;
  loginAccessCode?: string; // Discrete 4-6 digit passcode for fast direct team login
}

// ----------------------------------------------------
// NEW: Email Marketing & Campaign Integrations
// ----------------------------------------------------
export type EmailProvider = 'mailchimp' | 'sendgrid' | 'direct';

export interface EmailIntegrationConfig {
  provider: EmailProvider;
  apiKey: string;
  audienceId?: string; // List ID
  audienceListId?: string; // alias
  senderEmail: string;
  fromEmail?: string; // alias
  senderName: string;
  fromName?: string; // alias
  isConnected: boolean;
  connected?: boolean; // alias
  lastSyncDate?: string;
  businessId?: string;
}

export interface EmailCampaign {
  id: string;
  businessId: string;
  title: string;
  subject: string;
  content: string;
  segment: 'all' | 'leads' | 'active' | 'vip' | 'high_value';
  segmentName?: string;
  previewText?: string;
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: string;
  openRate?: number; // 0-100
  clickRate?: number; // 0-100
  leadsGenerated?: number;
  provider?: EmailProvider;
}

// ----------------------------------------------------
// NEW: Master Subscription Billing & Payment System
// ----------------------------------------------------
export interface SubscriptionBillingRecord {
  id: string;
  businessId: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  plan: PlanTier;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: 'credit_card' | 'standing_order' | 'bank_transfer' | 'bit';
  cardLast4?: string;
  status: 'paid' | 'pending' | 'overdue' | 'failed';
  billingDate: string; // YYYY-MM-DD
  paidDate?: string;
  invoiceNumber: string;
}

export interface MasterPaymentSettings {
  payoutBank: string;
  payoutBranch: string;
  payoutAccount: string;
  payoutPayeeName: string;
  gatewayProvider: 'meshulam' | 'tranzila' | 'morning_green' | 'stripe';
  gatewayApiKey?: string;
  gatewayTerminalId?: string;
  autoChargeEnabled: boolean;
}
