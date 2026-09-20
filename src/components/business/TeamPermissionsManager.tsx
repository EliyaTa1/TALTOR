import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomRole, Employee, RolePermissions } from '../../types';
import {
  ShieldCheck,
  Users,
  Plus,
  Lock,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  BarChart3,
  Mail,
  CheckCircle2,
  XCircle,
  X,
  UserCheck,
  Info,
} from 'lucide-react';

export const TeamPermissionsManager: React.FC = () => {
  const {
    businessRoles,
    businessEmployees,
    activeBusinessId,
    addCustomRole,
    updateCustomRole,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    activeEmployeeId,
    setActiveEmployeeId,
    effectivePermissions,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'employees' | 'roles'>('employees');

  // New Role Modal
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleNameHe, setNewRoleNameHe] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('indigo');
  const [newPermissions, setNewPermissions] = useState<RolePermissions>({
    viewClients: true,
    editClients: true,
    deleteClients: false,
    viewTasks: true,
    editTasks: true,
    viewFinancials: false,
    editInvoices: false,
    viewReports: false,
    manageMarketing: false,
    managePortal: false,
    manageEmployees: false,
  });

  // New Employee Modal
  const [isNewEmpOpen, setIsNewEmpOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRoleId, setEmpRoleId] = useState(businessRoles[0]?.id || '');

  const handleTogglePermission = (key: keyof RolePermissions) => {
    setNewPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleNameHe.trim()) return;

    await addCustomRole({
      businessId: activeBusinessId,
      name: newRoleName.trim() || newRoleNameHe.trim(),
      nameHe: newRoleNameHe.trim(),
      description: newRoleDesc.trim(),
      color: newRoleColor,
      isSystem: false,
      permissions: newPermissions,
    });

    setIsNewRoleOpen(false);
    setNewRoleName('');
    setNewRoleNameHe('');
    setNewRoleDesc('');
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empEmail.trim()) return;

    const roleObj = businessRoles.find((r) => r.id === empRoleId);

    await addEmployee({
      businessId: activeBusinessId,
      name: empName.trim(),
      email: empEmail.trim(),
      phone: empPhone.trim() || '050-0000000',
      roleId: empRoleId,
      roleTitle: roleObj?.nameHe || 'תפקיד מותאם',
      active: true,
      createdAt: new Date().toISOString().substring(0, 10),
    });

    setIsNewEmpOpen(false);
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">
              ניהול הרשאות, תפקידים ועובדים
            </h2>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {businessEmployees.length} עובדים • {businessRoles.length} תפקידים
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            הגדרת תפקידים מותאמים (מכירות, תמיכה, הנהלת חשבונות) עם הרשאות צפייה ועריכה מדויקות.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'employees' ? (
            <button
              onClick={() => setIsNewEmpOpen(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף עובד לצוות</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewRoleOpen(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>צור תפקיד מותאם</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Simulator Toolbar */}
      <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold block text-sm">סימולטור הרשאות עובדים בזמן אמת:</span>
            <span className="text-slate-300 text-[11px]">
              בחר איש צוות כדי לבחון כיצד המערכת נראית ומתנהגת תחת ההרשאות שהוגדרו לו.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-semibold">צופה כעת בתור:</span>
          <select
            value={activeEmployeeId}
            onChange={(e) => setActiveEmployeeId(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
          >
            <option value="owner">👑 בעל עסק (Master Owner - כל ההרשאות)</option>
            {businessEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                👤 {emp.name} ({emp.roleTitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Switcher */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'employees'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>צוות ועובדים ({businessEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>תפקידים והרשאות ({businessRoles.length})</span>
        </button>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessEmployees.map((emp) => {
              const roleObj = businessRoles.find((r) => r.id === emp.roleId);
              const isSimulated = activeEmployeeId === emp.id;

              return (
                <div
                  key={emp.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                    isSimulated
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {emp.roleTitle}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {emp.active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{emp.name}</h3>
                    <div className="space-y-1 text-xs text-slate-500 mt-2">
                      <p>אימייל: {emp.email}</p>
                      <p>טלפון: {emp.phone}</p>
                      <p>הצטרף: {emp.createdAt}</p>
                    </div>

                    {/* Permissions summary pills */}
                    {roleObj && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1 text-[10px]">
                        {roleObj.permissions.viewClients && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">צפייה בלקוחות</span>
                        )}
                        {roleObj.permissions.editClients && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">עריכת לקוחות</span>
                        )}
                        {roleObj.permissions.viewFinancials && (
                          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">צפייה בכספים</span>
                        )}
                        {roleObj.permissions.viewReports && (
                          <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-bold">דוחות ואנליטיקה</span>
                        )}
                        {roleObj.permissions.manageMarketing && (
                          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">קמפיינים שיווקיים</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setActiveEmployeeId(emp.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isSimulated ? 'מסומלץ כעת' : 'בחן הרשאות עובד'}</span>
                    </button>

                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="הסר עובד"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessRoles.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">{role.nameHe}</h3>
                    <span className="text-slate-400 font-mono text-xs">({role.name})</span>
                    {role.isSystem && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        תפקיד מערכת מובנה
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{role.description}</p>
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.viewClients ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.viewClients ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>צפייה בלקוחות</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.editClients ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.editClients ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>עריכת נתוני לקוחות</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.deleteClients ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.deleteClients ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>מחיקת לקוחות</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.viewTasks ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.viewTasks ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>ניהול משימות ותזכורות</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.viewFinancials ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.viewFinancials ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>צפייה בכספים והכנסות</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.editInvoices ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.editInvoices ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>הפקת חשבוניות וקבלות</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.viewReports ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.viewReports ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>דוחות ואנליטיקה עסקית</span>
                </div>

                <div className={`p-2 rounded-xl border flex items-center gap-2 ${role.permissions.manageMarketing ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {role.permissions.manageMarketing ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-slate-300 shrink-0" />}
                  <span>שליחת דיוור שיווקי (Email)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Role Modal */}
      {isNewRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">הגדרת תפקיד מותאם אישית חדש</h3>
              <button onClick={() => setIsNewRoleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שם התפקיד בעברית *</label>
                  <input
                    type="text"
                    required
                    value={newRoleNameHe}
                    onChange={(e) => setNewRoleNameHe(e.target.value)}
                    placeholder="לדוגמה: מנהל לקוחות VIP"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">מזהה מערכת (אנגלית)</label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="vip_manager"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">תיאור התפקיד</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="אחראי על טיפול בלקוחות אסטרטגיים..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Permissions checkboxes */}
              <div>
                <span className="block font-bold text-slate-900 mb-2">הרשאות גישה ייעודיות לתפקיד:</span>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.viewClients}
                      onChange={() => handleTogglePermission('viewClients')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>צפייה בלקוחות</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.editClients}
                      onChange={() => handleTogglePermission('editClients')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>עריכת לקוחות</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.deleteClients}
                      onChange={() => handleTogglePermission('deleteClients')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>מחיקת לקוחות</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.viewTasks}
                      onChange={() => handleTogglePermission('viewTasks')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>ניהול משימות</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.viewFinancials}
                      onChange={() => handleTogglePermission('viewFinancials')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>צפייה בכספים והכנסות</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.editInvoices}
                      onChange={() => handleTogglePermission('editInvoices')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>הפקת חשבוניות</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.viewReports}
                      onChange={() => handleTogglePermission('viewReports')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>דוחות ואנליטיקה</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPermissions.manageMarketing}
                      onChange={() => handleTogglePermission('manageMarketing')}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>שליחת דיוור שיווקי</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRoleOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  שמור תפקיד
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Employee Modal */}
      {isNewEmpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">הוספת עובד חדש לצוות העסק</h3>
              <button onClick={() => setIsNewEmpOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">שם העובד המלא *</label>
                <input
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="לדוגמה: יובל לוי"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">כתובת אימייל *</label>
                <input
                  type="email"
                  required
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="yuval@business.co.il"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">טלפון</label>
                <input
                  type="tel"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="052-1234567"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">בחר תפקיד והרשאות *</label>
                <select
                  value={empRoleId}
                  onChange={(e) => setEmpRoleId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {businessRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nameHe} ({role.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewEmpOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  הוסף עובד
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
