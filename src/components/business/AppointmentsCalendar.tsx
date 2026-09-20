import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, CalendarViewMode } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  User,
  X,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  CalendarRange,
  View,
} from 'lucide-react';

export const AppointmentsCalendar: React.FC = () => {
  const {
    businessAppointments,
    businessClients,
    activeBusinessId,
    addAppointment,
    updateAppointmentStatus,
    calendarViewMode,
    setCalendarViewMode,
    effectivePermissions,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 2, 15)); // March 15, 2026
  const [selectedDay, setSelectedDay] = useState<string>('2026-03-18');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(businessClients[0]?.id || '');
  const [date, setDate] = useState(new Date(2026, 2, 18).toISOString().substring(0, 10));
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('משרד / זום');
  const [notes, setNotes] = useState('');

  // Days of week in Hebrew
  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const hebrewMonths = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  // Navigation handlers
  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (calendarViewMode === 'day') {
      newD.setDate(newD.getDate() - 1);
    } else if (calendarViewMode === 'week') {
      newD.setDate(newD.getDate() - 7);
    } else {
      newD.setMonth(newD.getMonth() - 1);
    }
    setCurrentDate(newD);
    setSelectedDay(newD.toISOString().substring(0, 10));
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (calendarViewMode === 'day') {
      newD.setDate(newD.getDate() + 1);
    } else if (calendarViewMode === 'week') {
      newD.setDate(newD.getDate() + 7);
    } else {
      newD.setMonth(newD.getMonth() + 1);
    }
    setCurrentDate(newD);
    setSelectedDay(newD.toISOString().substring(0, 10));
  };

  const handleToday = () => {
    const now = new Date(2026, 2, 15);
    setCurrentDate(now);
    setSelectedDay(now.toISOString().substring(0, 10));
  };

  const formattedCurrentPeriod = useMemo(() => {
    const monthName = hebrewMonths[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    if (calendarViewMode === 'day') {
      const dayName = hebrewDays[currentDate.getDay()];
      return `${dayName}, ${currentDate.getDate()} ב${monthName} ${year}`;
    }
    if (calendarViewMode === 'week') {
      return `שבוע של ${currentDate.getDate()} ב${monthName} ${year}`;
    }
    return `${monthName} ${year}`;
  }, [currentDate, calendarViewMode]);

  // Appointments grouped by date string (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    businessAppointments.forEach((apt) => {
      if (!map[apt.date]) map[apt.date] = [];
      map[apt.date].push(apt);
    });
    return map;
  }, [businessAppointments]);

  // Month calculation
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthTotal = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotal - i;
      const mStr = String(month === 0 ? 12 : month).padStart(2, '0');
      const yStr = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${yStr}-${mStr}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const mStr = String(month + 1).padStart(2, '0');
      days.push({
        dateStr: `${year}-${mStr}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const mStr = String(month + 2 > 12 ? 1 : month + 2).padStart(2, '0');
      const yStr = month + 2 > 12 ? year + 1 : year;
      days.push({
        dateStr: `${yStr}-${mStr}-${String(i).padStart(2, '0')}`,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  // Week calculation (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days: { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().substring(0, 10);
      days.push({
        dateStr,
        dayName: hebrewDays[i],
        dayNum: d.getDate(),
        isToday: dateStr === '2026-03-15',
      });
    }
    return days;
  }, [currentDate]);

  // Hourly slots for Day View (08:00 - 20:00)
  const dayHours = useMemo(() => {
    const hours: string[] = [];
    for (let h = 8; h <= 20; h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
    }
    return hours;
  }, []);

  const activeDayAppointments = useMemo(() => {
    const target = calendarViewMode === 'day' ? currentDate.toISOString().substring(0, 10) : selectedDay;
    return (appointmentsByDate[target] || []).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointmentsByDate, calendarViewMode, currentDate, selectedDay]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;

    const client = businessClients.find((c) => c.id === clientId);

    await addAppointment({
      businessId: activeBusinessId,
      clientId,
      clientName: client?.name || 'לקוח',
      title: title.trim(),
      date,
      time,
      durationMinutes: Number(duration),
      price: 0,
      status: 'scheduled',
      location: location.trim() || 'פגישה מקוונת',
      notes: notes.trim(),
    });

    setIsNewOpen(false);
    setTitle('');
    setNotes('');
  };

  const openNewForDate = (dateStr: string, timeStr = '10:00') => {
    setDate(dateStr);
    setTime(timeStr);
    setIsNewOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & View Modes Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900">יומן פגישות ומפגשים</h2>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {businessAppointments.length} פגישות
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            תצוגה גמישה לפי יום, שבוע או חודש עם סנכרון ישיר לפורטל הלקוחות.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Day / Week / Month Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setCalendarViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                calendarViewMode === 'day'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>יום</span>
            </button>

            <button
              onClick={() => setCalendarViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                calendarViewMode === 'week'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>שבוע</span>
            </button>

            <button
              onClick={() => setCalendarViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                calendarViewMode === 'month'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>חודש</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewOpen(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>קבע פגישה חדשה</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="הקודם"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="הבא"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-black text-slate-900 px-2">{formattedCurrentPeriod}</span>
        </div>

        <button
          onClick={handleToday}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
        >
          היום
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. MONTH VIEW */}
      {/* ---------------------------------------------------- */}
      {calendarViewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
            {/* Hebrew Day Names Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 mb-2 pb-2 border-b border-slate-100">
              {hebrewDays.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthDays.map((item, idx) => {
                const dayApts = appointmentsByDate[item.dateStr] || [];
                const isSelected = item.dateStr === selectedDay;
                const isToday = item.dateStr === '2026-03-15';

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDay(item.dateStr)}
                    className={`min-h-[85px] sm:min-h-[100px] p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                        : item.isCurrentMonth
                        ? 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50/80'
                        : 'border-transparent bg-slate-50/40 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : isSelected
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-slate-700'
                        }`}
                      >
                        {item.dayNum}
                      </span>
                      {dayApts.length > 0 && (
                        <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full">
                          {dayApts.length}
                        </span>
                      )}
                    </div>

                    {/* Mini Chips */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayApts.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded font-medium ${
                            apt.status === 'completed'
                              ? 'bg-slate-100 text-slate-600 line-through'
                              : 'bg-indigo-50 text-indigo-900 border border-indigo-100'
                          }`}
                        >
                          {apt.time} {apt.title}
                        </div>
                      ))}
                      {dayApts.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-bold block">
                          +{dayApts.length - 2} נוספות
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block">סדר יום למועד הנבחר:</span>
                <h3 className="font-extrabold text-slate-900 text-sm">{selectedDay}</h3>
              </div>
              <button
                onClick={() => openNewForDate(selectedDay)}
                className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>הוסף</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {activeDayAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>אין פגישות במועד זה.</p>
                  <button
                    onClick={() => openNewForDate(selectedDay)}
                    className="mt-2 text-indigo-600 hover:underline font-bold text-xs"
                  >
                    + קבע פגישה לתאריך זה
                  </button>
                </div>
              ) : (
                activeDayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all space-y-2 ${
                      apt.status === 'completed'
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-indigo-100 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                        {apt.time} ({apt.durationMinutes} דק׳)
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {apt.status === 'completed' ? 'הושלם' : 'מתוכנן'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs">{apt.title}</h4>
                    <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{apt.clientName}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] truncate max-w-[150px]">
                        {apt.location}
                      </span>
                      {apt.status === 'scheduled' ? (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                          className="text-emerald-700 hover:underline font-bold text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>הושלם</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'scheduled')}
                          className="text-indigo-600 hover:underline text-[11px]"
                        >
                          פתח מחדש
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. WEEK VIEW */}
      {/* ---------------------------------------------------- */}
      {calendarViewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[760px]">
            {weekDays.map((day) => {
              const dayApts = appointmentsByDate[day.dateStr] || [];
              return (
                <div
                  key={day.dateStr}
                  className={`rounded-2xl border p-3 min-h-[420px] flex flex-col justify-between ${
                    day.isToday
                      ? 'border-indigo-500 bg-indigo-50/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div>
                    {/* Day Header */}
                    <div className="text-center pb-2 border-b border-slate-200 mb-3">
                      <span className="text-xs font-bold text-slate-600 block">{day.dayName}</span>
                      <span
                        className={`text-sm font-black inline-block mt-0.5 px-2 py-0.5 rounded-full ${
                          day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-900'
                        }`}
                      >
                        {day.dayNum}
                      </span>
                    </div>

                    {/* Day's appointments */}
                    <div className="space-y-2">
                      {dayApts.map((apt) => (
                        <div
                          key={apt.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-xs hover:border-indigo-300 transition-all space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {apt.time}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                apt.status === 'completed' ? 'bg-slate-400' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <p className="font-bold text-slate-900 text-[11px] leading-tight line-clamp-2">
                            {apt.title}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{apt.clientName}</p>
                        </div>
                      ))}

                      {dayApts.length === 0 && (
                        <p className="text-center text-[11px] text-slate-400 pt-6">אין פגישות</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openNewForDate(day.dateStr)}
                    className="mt-3 w-full py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 bg-indigo-50 rounded-xl transition-colors border border-indigo-200 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>הוסף</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. DAY VIEW */}
      {/* ---------------------------------------------------- */}
      {calendarViewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-900 text-base">{formattedCurrentPeriod}</h3>
              <span className="text-xs text-slate-500">
                {activeDayAppointments.length} פגישות מתוזמנות ביום זה
              </span>
            </div>
            <button
              onClick={() => openNewForDate(currentDate.toISOString().substring(0, 10))}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>קבע פגישה לשעה זו</span>
            </button>
          </div>

          {/* Hourly Timeline */}
          <div className="space-y-2 divide-y divide-slate-100">
            {dayHours.map((hour) => {
              const hourApts = activeDayAppointments.filter((a) => a.time.startsWith(hour.substring(0, 2)));

              return (
                <div key={hour} className="pt-2.5 flex items-start gap-4">
                  <span className="w-14 font-mono font-bold text-xs text-slate-400 pt-1 shrink-0 text-left">
                    {hour}
                  </span>

                  <div className="flex-1 min-h-[44px]">
                    {hourApts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {hourApts.map((apt) => (
                          <div
                            key={apt.id}
                            className={`p-3 rounded-xl border text-xs shadow-xs flex items-center justify-between ${
                              apt.status === 'completed'
                                ? 'bg-slate-50 border-slate-200 text-slate-500'
                                : 'bg-indigo-50/50 border-indigo-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{apt.title}</span>
                                <span className="font-mono text-[10px] bg-white text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {apt.time}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-600 block mt-0.5">
                                לקוח: <strong>{apt.clientName}</strong> • מיקום: {apt.location}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  apt.id,
                                  apt.status === 'completed' ? 'scheduled' : 'completed'
                                )
                              }
                              className={`p-1.5 rounded-lg border text-xs font-bold transition-colors ${
                                apt.status === 'completed'
                                  ? 'bg-white text-slate-600 border-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        onClick={() => openNewForDate(currentDate.toISOString().substring(0, 10), hour)}
                        className="h-9 rounded-lg border border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-between px-3 cursor-pointer group text-slate-300 hover:text-indigo-600"
                      >
                        <span className="text-[11px] group-hover:inline-block hidden">
                          + לחץ לקביעת פגישה ב-{hour}
                        </span>
                        <span className="text-[11px] group-hover:hidden text-slate-300 font-mono">
                          פנוי
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">תיאום פגישה חדשה</h3>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">נושא / כותרת הפגישה *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: פגישת אפיון והצגת סקיצות"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">בחר לקוח מהמאגר *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {businessClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">תאריך</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">שעה</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">משך (בדקות)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות (שעה)</option>
                    <option value={90}>90 דקות (שעה וחצי)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">מיקום / לינק</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="זום, משרד, קליניקה..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">הערות נוספות</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="נקודות מרכזיות לשיחה..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-colors shadow-xs"
                >
                  קבע פגישה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
