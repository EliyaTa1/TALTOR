import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
import {
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { ClientDetailModal } from './ClientDetailModal';
import { NewClientModal } from './NewClientModal';

export const ClientsList: React.FC<{ onOpenPortal: (clientId: string) => void }> = ({
  onOpenPortal,
}) => {
  const {
    businessClients,
    currentPlanFeatures,
    currentBusiness,
    activeBusinessId,
    setActiveClientId,
    setRole,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Filter and search
  const filteredClients = useMemo(() => {
    return businessClients.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (c.name || '').toLowerCase().includes(query) ||
        (c.phone || '').includes(searchQuery) ||
        (c.email || '').toLowerCase().includes(query) ||
        (c.tags && c.tags.some((t) => (t || '').toLowerCase().includes(query)));

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'vip') return c.vipStatus;
      return c.status === statusFilter;
    });
  }, [businessClients, searchQuery, statusFilter]);

  // Export to CSV for PRO & ULTIMATE
  const handleExportCSV = () => {
    if (!currentPlanFeatures.hasDataExport) {
      alert('ייצוא נתונים זמין בחבילות PRO ו-ULTIMATE בלבד.');
      return;
    }

    const headers = ['מזהה', 'שם מלא', 'טלפון', 'אימייל', 'סטטוס', 'שווי עסקה', 'VIP', 'תאריך יצירה'];
    const rows = filteredClients.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.phone}"`,
      c.email,
      c.status,
      c.dealValue,
      c.vipStatus ? 'כן' : 'לא',
      c.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `taltor-clients-${currentBusiness?.name || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clientLimit = currentPlanFeatures.maxClients;
  const currentCount = businessClients.length;
  const usagePercentage =
    clientLimit === 'unlimited' ? 0 : Math.min(100, Math.round((currentCount / clientLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Header & Limits Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">מאגר לקוחות CRM</h2>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredClients.length} מתוך {currentCount} לקוחות
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ניהול מלא של תיקי לקוחות, פרטי קשר, היסטוריית הערות וגישה לפורטל אישי.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Export CSV (if unlocked) */}
          {currentPlanFeatures.hasDataExport && (
            <button
              onClick={handleExportCSV}
              className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
              title="ייצא רשימת לקוחות ל-CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">ייצוא ל-Excel</span>
            </button>
          )}

          {/* Add Client Button */}
          <button
            id="add-client-btn"
            onClick={() => setIsNewClientOpen(true)}
            className="flex-1 sm:flex-none text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף לקוח חדש</span>
          </button>
        </div>
      </div>

      {/* Plan Capacity Visualizer */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">
              קיבולת חבילת {currentPlanFeatures.nameHe}:
            </span>
            <span className="text-slate-600">
              {clientLimit === 'unlimited' ? (
                <strong className="text-emerald-700 font-bold">ללא הגבלה (∞)</strong>
              ) : (
                <span>
                  <strong>{currentCount}</strong> מתוך <strong>{clientLimit}</strong> לקוחות מנוצלים
                </span>
              )}
            </span>
          </div>

          {clientLimit !== 'unlimited' && (
            <div className="flex items-center gap-3 w-full sm:w-64">
              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercentage > 85 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <span className="font-bold text-slate-700 text-[11px] shrink-0">
                {usagePercentage}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
          <input
            id="search-clients-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם לקוח, טלפון, אימייל או תגית..."
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            הכל ({businessClients.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            פעילים ({businessClients.filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('proposal')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'proposal'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            הצעת מחיר ({businessClients.filter((c) => c.status === 'proposal').length})
          </button>
          <button
            onClick={() => setStatusFilter('lead')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'lead'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            לידים ({businessClients.filter((c) => c.status === 'lead').length})
          </button>
          <button
            onClick={() => setStatusFilter('vip')}
            className={`px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              statusFilter === 'vip'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            VIP ({businessClients.filter((c) => c.vipStatus).length})
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">לא נמצאו לקוחות תואמים</h4>
            <p className="text-xs text-slate-500 mt-1">נסה לשנות את מונח החיפוש או הוסף לקוח חדש.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">שם הלקוח</th>
                  <th className="py-3.5 px-4">פרטי קשר</th>
                  <th className="py-3.5 px-4">סטטוס ושלב</th>
                  <th className="py-3.5 px-4">שווי עסקה</th>
                  <th className="py-3.5 px-4">פעולות מהירות</th>
                  {currentPlanFeatures.hasClientPortal && (
                    <th className="py-3.5 px-4 text-center">פורטל לקוח</th>
                  )}
                  <th className="py-3.5 px-4 text-left">תיק לקוח</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  const cleanPhone = client.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      {/* Name & VIP */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-xs">{client.name}</span>
                              {client.vipStatus && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            {client.tags && client.tags.length > 0 && (
                              <span className="text-[10px] text-slate-400">
                                {client.tags.slice(0, 2).join(' • ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="block font-mono text-slate-800" dir="ltr">{client.phone}</span>
                        <span className="text-[11px] text-slate-400 block">{client.email}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            client.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : client.status === 'proposal'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : client.status === 'contacted'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : client.status === 'lead'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {client.status === 'active'
                            ? 'לקוח פעיל'
                            : client.status === 'proposal'
                            ? 'הצעת מחיר'
                            : client.status === 'contacted'
                            ? 'שיחת היכרות'
                            : client.status === 'lead'
                            ? 'ליד חדש'
                            : 'לא פעיל'}
                        </span>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3 px-4 font-black text-slate-900">
                        ₪{(client.dealValue || 0).toLocaleString()}
                      </td>

                      {/* Quick Communication Actions */}
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/972${cleanPhone}?text=${encodeURIComponent(
                              `שלום ${client.name}, מדבר ${currentBusiness?.ownerName || 'TALTOR'}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="שלח WhatsApp ישיר"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a
                            href={`tel:${client.phone}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="חייג"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${client.email}`}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="שלח אימייל"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>

                      {/* Client Portal Button (ULTIMATE only) */}
                      {currentPlanFeatures.hasClientPortal && (
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setActiveClientId(client.id);
                              setRole('client');
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-emerald-300 transition-colors inline-flex items-center gap-1 shadow-xs"
                            title="צפה בפורטל הלקוח כפי שהלקוח רואה אותו"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>כניסה לפורטל</span>
                          </button>
                        </td>
                      )}

                      {/* View details */}
                      <td className="py-3 px-4 text-left">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-slate-400 hover:text-indigo-600 p-1"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientDetailModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onOpenPortal={(cId) => {
          setActiveClientId(cId);
          setRole('client');
        }}
      />

      <NewClientModal isOpen={isNewClientOpen} onClose={() => setIsNewClientOpen(false)} />
    </div>
  );
};
