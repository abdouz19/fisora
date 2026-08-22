import React, { useState } from 'react';
import {
  UserCheck,
  UserPlus,
  Search,
  Phone,
  Building,
  Archive,
  X,
  List,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import InvoicePrint from '../components/InvoicePrint';
import ClientWorksModal from '../components/ClientWorksModal';
import ConfirmModal from '../components/ConfirmModal';

const INITIAL_CLIENT_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  company: '',
  pack: 'Start',
  packPrice: 7500,
  amountPaid: '',
  workDate: new Date().toISOString().split('T')[0],
  workNotes: '',
};

export default function Clients() {
  const { clients, addClient, archiveClient, kpis, customPacks, predefinedPacks, freelancers, works } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [worksModalClient, setWorksModalClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // --- Multi-client analytics ---
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [newForm, setNewForm] = useState(INITIAL_CLIENT_FORM);
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [workExpenses, setWorkExpenses] = useState([]);

  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  const filteredClients = clients.filter((c) => {
    if (!showArchived && c.isArchived) return false;
    if (showArchived && !c.isArchived) return false;
    
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = c.company.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || company.includes(query) || c.phone.includes(query);
  });

  // --- Selection handlers ---
  const toggleClientSelect = (id) =>
    setSelectedClientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  const clearSelection = () => setSelectedClientIds([]);
  const selectAllVisible = () => setSelectedClientIds(filteredClients.map((c) => c.id));

  // --- Date range handling ---
  const toISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const applyPreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'month') {
      setDateFrom(toISO(new Date(now.getFullYear(), now.getMonth(), 1)));
      setDateTo(toISO(now));
    } else if (preset === 'year') {
      setDateFrom(toISO(new Date(now.getFullYear(), 0, 1)));
      setDateTo(toISO(now));
    }
  };

  // --- Aggregate stats for selected clients within the date range ---
  const allPacks = [...predefinedPacks, ...customPacks];
  const videosForService = (service) => {
    const pack = allPacks.find((p) => p.name === service);
    return pack ? Number(pack.videosCount) || 0 : 0;
  };
  const selectedSet = new Set(selectedClientIds);
  const analyticsWorks = works.filter((w) => {
    if (!selectedSet.has(w.clientId)) return false;
    if (dateFrom && w.date < dateFrom) return false;
    if (dateTo && w.date > dateTo) return false;
    return true;
  });
  const stats = analyticsWorks.reduce(
    (acc, w) => {
      const arrayExpenses = (w.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const freelancerPay = (w.freelancers || []).reduce((s, f) => s + (Number(f.amount) || 0), 0);
      acc.works += 1;
      acc.videos += videosForService(w.service);
      acc.revenue += Number(w.priceFromClient) || 0;
      acc.paid += Number(w.amountPaid) || 0;
      acc.cost += arrayExpenses + freelancerPay + (w.externalExpenses || 0);
      return acc;
    },
    { works: 0, videos: 0, revenue: 0, paid: 0, cost: 0 }
  );
  const statsProfit = stats.revenue - stats.cost;

  const resetAddForm = () => {
    setNewForm(INITIAL_CLIENT_FORM);
    setSelectedFreelancers([]);
    setWorkExpenses([]);
  };

  const handleAddFreelancer = () => {
    setSelectedFreelancers([...selectedFreelancers, { id: '', amount: '' }]);
  };

  const handleFreelancerChange = (index, field, value) => {
    const updated = [...selectedFreelancers];
    updated[index][field] = value;
    setSelectedFreelancers(updated);
  };

  const handleRemoveFreelancer = (index) => {
    setSelectedFreelancers(selectedFreelancers.filter((_, i) => i !== index));
  };

  const handleAddExpense = () => {
    setWorkExpenses([...workExpenses, { id: `exp_${Date.now()}`, description: '', amount: '' }]);
  };

  const handleExpenseChange = (index, field, value) => {
    const updated = [...workExpenses];
    updated[index][field] = value;
    setWorkExpenses(updated);
  };

  const handleRemoveExpense = (index) => {
    setWorkExpenses(workExpenses.filter((_, i) => i !== index));
  };

  const buildClientPayload = () => {
    const remaining = Math.max(0, (Number(newForm.packPrice) || 0) - (Number(newForm.amountPaid) || 0));
    const validFreelancers = selectedFreelancers
      .filter((f) => f.id && f.amount !== '')
      .map((f) => ({ freelancerId: f.id, amount: Number(f.amount) }));
    const validExpenses = workExpenses
      .filter((e) => e.amount !== '')
      .map((e) => ({ id: e.id, description: e.description || 'مصروف', amount: Number(e.amount) }));

    return {
      ...newForm,
      remainingAmount: remaining,
      initialWork: {
        date: newForm.workDate,
        service: newForm.pack,
        priceFromClient: Number(newForm.packPrice) || 0,
        notes: newForm.workNotes,
        freelancers: validFreelancers,
        expenses: validExpenses,
      },
    };
  };

  const handleAddSubmit = (e, printInvoice = false) => {
    e.preventDefault();
    if (!newForm.firstName || !newForm.lastName) return;

    const payload = buildClientPayload();
    if (printInvoice) {
      setInvoiceToPrint(payload);
    }
    addClient(payload);
    resetAddForm();
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn print:hidden">
        {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-bold mb-2 border border-blue-500/30">
            <UserCheck size={14} />
            <span>إدارة عملاء ومشاريع في صورة</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">إدارة العملاء (Clients Management)</h1>
          <p className="text-gray-500 text-xs mt-1">
            متابعة المداخيل، المصاريف، عدد الأعمال، وصافي الربح لكل عميل
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-brand-orange text-white font-extrabold text-sm shadow-sm hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={18} />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Global Financial KPI Row for Clients */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-gray-200 bg-white">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المداخيل</span>
          <p className="text-xl font-black text-gray-900 mt-1" dir="ltr">
            {kpis.totalIncomes.toLocaleString()} DA
          </p>
          <span className="text-[10px] text-gray-400">مداخيل جميع العملاء</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gray-200 bg-white">
          <span className="text-xs text-gray-500 font-bold block">إجمالي المصاريف</span>
          <p className="text-xl font-black text-rose-400 mt-1" dir="ltr">
            {kpis.totalExpenses.toLocaleString()} DA
          </p>
          <span className="text-[10px] text-gray-400">تكاليف الإنتاج والسحوبات</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-gray-200 bg-white">
          <span className="text-xs text-gray-500 font-bold block">إجمالي العملاء</span>
          <p className="text-xl font-black text-blue-400 mt-1">
            {kpis.totalClientsCount} عملاء
          </p>
          <span className="text-[10px] text-gray-400">عملاء نشطين</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-brand-orange/40 bg-brand-orange/10">
          <span className="text-xs text-brand-orange font-extrabold block">إجمالي صافي الأرباح</span>
          <p className="text-xl font-black text-gray-900 mt-1" dir="ltr">
            {kpis.netProfit.toLocaleString()} DA
          </p>
          <span className="text-[10px] text-gray-500">المداخيل مطروحاً منها المصاريف</span>
        </div>
      </div>

      {/* Search Bar & Archive Toggle */}
      <div className="glass-card rounded-2xl p-4 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم العميل، الشركة، أو رقم الهاتف..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-xs text-gray-900 placeholder-white/40"
            />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${showArchived ? 'bg-brand-orange text-gray-900 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-50'}`}
          >
            <Archive size={14} />
            <span>{showArchived ? 'العملاء النشطين' : 'الأرشيف'}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          {selectedClientIds.length > 0 ? (
            <button
              onClick={clearSelection}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 whitespace-nowrap"
            >
              إلغاء التحديد ({selectedClientIds.length})
            </button>
          ) : (
            <button
              onClick={selectAllVisible}
              className="text-xs font-bold text-brand-orange hover:brightness-110 whitespace-nowrap"
            >
              تحديد الكل
            </button>
          )}
          <span className="text-xs font-bold text-gray-500 hidden sm:block">
            عرض {filteredClients.length} عميل
          </span>
        </div>
      </div>

      {/* Multi-client analytics summary */}
      {selectedClientIds.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-brand-orange/40 bg-brand-orange/5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-gray-900">
                ملخص {selectedClientIds.length} عملاء محددين
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                إجمالي العمل والفيديوهات والمداخيل خلال الفترة المحددة
              </p>
            </div>
            {/* Time filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={datePreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-bold"
              >
                <option value="all">كل الوقت</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
                <option value="custom">فترة مخصصة</option>
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setDatePreset('custom');
                }}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs"
                title="من"
              />
              <span className="text-gray-400 text-xs">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setDatePreset('custom');
                }}
                className="p-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs"
                title="إلى"
              />
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <span className="text-[11px] text-gray-400 block">عدد الأعمال</span>
              <span className="text-lg font-black text-gray-900">{stats.works}</span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <span className="text-[11px] text-gray-400 block">عدد الفيديوهات</span>
              <span className="text-lg font-black text-blue-500">{stats.videos}</span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <span className="text-[11px] text-gray-400 block">المداخيل</span>
              <span className="text-lg font-black text-emerald-500" dir="ltr">
                {stats.revenue.toLocaleString()} DA
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <span className="text-[11px] text-gray-400 block">المدفوع</span>
              <span className="text-lg font-black text-gray-900" dir="ltr">
                {stats.paid.toLocaleString()} DA
              </span>
            </div>
            <div className="bg-white rounded-xl p-3 border border-brand-orange/30 text-center">
              <span className="text-[11px] text-brand-orange font-bold block">الربح الصافي</span>
              <span
                className={`text-lg font-black ${statsProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
                dir="ltr"
              >
                {statsProfit.toLocaleString()} DA
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Clients Cards (full width) */}
      <div className="flex flex-col gap-4">
        {filteredClients.map((c) => {
          const total = Number(c.incomes) || 0;
          const paid = Number(c.amountPaid) || 0;
          const remaining = Number(c.remainingAmount) || 0;
          const profit = total - (Number(c.expenses) || 0);
          const isProfitable = profit >= 0;
          const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
          const isPaidUp = remaining <= 0 && total > 0;
          return (
            <div
              key={c.id}
              className={`glass-card rounded-2xl p-5 border glass-card-hover flex flex-col lg:flex-row lg:items-center gap-5 ${
                selectedClientIds.includes(c.id)
                  ? 'border-brand-orange ring-1 ring-brand-orange'
                  : 'border-gray-200'
              }`}
            >
              {/* Identity */}
              <div className="flex items-center gap-3 lg:w-64 lg:shrink-0">
                <input
                  type="checkbox"
                  checked={selectedClientIds.includes(c.id)}
                  onChange={() => toggleClientSelect(c.id)}
                  className="w-4 h-4 rounded accent-brand-orange cursor-pointer shrink-0"
                  title="تحديد للإحصائيات"
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  {c.firstName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-gray-900 truncate">
                      {c.firstName} {c.lastName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-orange-50 text-brand-orange border border-brand-orange shrink-0">
                      {c.pack}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Building size={12} className="text-brand-orange shrink-0" />
                    <span className="truncate">{c.company}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5" dir="ltr">
                    <Phone size={11} className="shrink-0" />
                    <span>{c.phone}</span>
                  </p>
                </div>
              </div>

              {/* Payment status */}
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-gray-400 block text-[11px]">الإجمالي</span>
                    <span className="font-extrabold text-gray-900 text-sm" dir="ltr">
                      {total.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 block text-[11px]">المدفوع</span>
                    <span className="font-extrabold text-emerald-500 text-sm" dir="ltr">
                      {paid.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="text-left">
                    <span className="text-gray-400 block text-[11px]">المتبقي</span>
                    <span
                      className={`font-extrabold text-sm ${isPaidUp ? 'text-emerald-500' : 'text-rose-500'}`}
                      dir="ltr"
                    >
                      {remaining.toLocaleString()} DA
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isPaidUp ? 'bg-emerald-500' : 'bg-brand-orange'}`}
                    style={{ width: `${paidPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  {isPaidUp ? 'تم السداد بالكامل ✓' : `${paidPct}% مدفوع`}
                </p>
              </div>

              {/* Business summary */}
              <div className="flex items-center justify-around gap-5 lg:gap-6 lg:shrink-0 px-1">
                <div className="text-center">
                  <span className="text-gray-400 block text-[11px]">المصاريف</span>
                  <span className="font-extrabold text-rose-400 text-sm" dir="ltr">
                    {(Number(c.expenses) || 0).toLocaleString()} DA
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-gray-500 block text-[11px] font-bold">الربح الصافي</span>
                  <span
                    className={`font-black text-base ${isProfitable ? 'text-emerald-500' : 'text-rose-500'}`}
                    dir="ltr"
                  >
                    {isProfitable ? '+' : ''}{profit.toLocaleString()} DA
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-gray-400 block text-[11px]">الأعمال</span>
                  <span className="font-extrabold text-gray-900 text-sm">{c.worksCount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-stretch lg:items-end gap-2 lg:shrink-0 lg:border-r lg:border-gray-200 lg:pr-5">
                <span className="text-[10px] text-gray-400 order-last lg:order-first">
                  {c.date || 'جديد'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWorksModalClient(c)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-orange-50 hover:bg-brand-orange/30 text-brand-orange transition-all cursor-pointer text-xs font-bold"
                    title="سجل الأعمال والمشاريع"
                  >
                    <List size={14} />
                    <span>الأعمال</span>
                  </button>
                  <button
                    onClick={() => setClientToDelete(c)}
                    className="p-2 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-brand-orange transition-all cursor-pointer"
                    title="أرشفة العميل"
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl border border-gray-200">
          <UserCheck size={40} className="mx-auto text-gray-900/20 mb-3" />
          <p className="text-gray-500 font-bold">لا يوجد عميل بهذه البيانات</p>
        </div>
      )}

      {/* Modal: Add New Client */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col glass-card rounded-3xl border border-gray-200 shadow-2xl relative">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 shrink-0">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-brand-orange" />
                <span>إضافة عميل جديد</span>
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => handleAddSubmit(e)} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">الاسم الأول *</label>
                  <input
                    type="text"
                    required
                    value={newForm.firstName}
                    onChange={(e) => setNewForm({ ...newForm, firstName: e.target.value })}
                    placeholder="مثال: أحمد"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">اللقب *</label>
                  <input
                    type="text"
                    required
                    value={newForm.lastName}
                    onChange={(e) => setNewForm({ ...newForm, lastName: e.target.value })}
                    placeholder="مثال: الزرقي"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="0555112233"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">اسم الشركة / المشروع</label>
                  <input
                    type="text"
                    value={newForm.company}
                    onChange={(e) => setNewForm({ ...newForm, company: e.target.value })}
                    placeholder="اسم العلامة التجارية"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">الباقة / العمل الأول *</label>
                <select
                    value={newForm.pack}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const allPacks = [...predefinedPacks, ...customPacks];
                      const pack = allPacks.find(p => p.name === selectedName);
                      setNewForm({
                        ...newForm,
                        pack: selectedName,
                        packPrice: pack ? pack.price : newForm.packPrice,
                      });
                    }}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange bg-gray-50 mb-4"
                  >
                    {predefinedPacks.map((p) => (
                      <option key={p.id} value={p.name} className="bg-gray-50 text-gray-900">
                        باقة {p.name} ({p.videosLabel} - {p.price.toLocaleString()} DA)
                      </option>
                    ))}
                    {customPacks && customPacks.map((p) => (
                      <option key={p.id} value={p.name} className="bg-gray-50 text-brand-orange">
                        باقة {p.name} (مخصصة - {p.price.toLocaleString()} DA)
                      </option>
                    ))}
                    <option value="باقة مخصصة" className="bg-gray-50 text-gray-900">
                      باقة مخصصة (Custom Agreement)
                    </option>
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">السعر الإجمالي (DA)</label>
                    <input
                      type="number"
                      value={newForm.packPrice}
                      onChange={(e) => setNewForm({ ...newForm, packPrice: e.target.value })}
                      disabled={newForm.pack !== 'باقة مخصصة'}
                      className="w-full p-2.5 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-left font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-orange font-bold mb-1">المبلغ المدفوع (DA)</label>
                    <input
                      type="number"
                      value={newForm.amountPaid}
                      onChange={(e) => setNewForm({ ...newForm, amountPaid: e.target.value })}
                      placeholder="0"
                      className="w-full p-2.5 rounded-lg border border-brand-orange bg-brand-orange/10 text-gray-900 text-left font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-red font-bold mb-1">المبلغ المتبقي (DA)</label>
                    <input
                      type="text"
                      value={Math.max(0, (Number(newForm.packPrice) || 0) - (Number(newForm.amountPaid) || 0))}
                      readOnly
                      disabled
                      className="w-full p-2.5 rounded-lg bg-white border-gray-200 shadow-sm text-brand-red text-left font-black opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">تاريخ العمل</label>
                    <input
                      type="date"
                      value={newForm.workDate}
                      onChange={(e) => setNewForm({ ...newForm, workDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">ملاحظات العمل</label>
                    <input
                      type="text"
                      value={newForm.workNotes}
                      onChange={(e) => setNewForm({ ...newForm, workNotes: e.target.value })}
                      placeholder="أي ملاحظات إضافية"
                      className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Freelancers */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h5 className="text-xs font-bold text-gray-700">مستحقات الفريلانسرز</h5>
                      <button
                        type="button"
                        onClick={handleAddFreelancer}
                        className="text-[10px] bg-orange-50 text-brand-orange px-2 py-1 rounded font-bold hover:bg-brand-orange/30"
                      >
                        + إضافة فريلانسر
                      </button>
                    </div>
                    {selectedFreelancers.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">لم يتم تحديد فريلانسرز.</p>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {selectedFreelancers.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={item.id}
                              onChange={(e) => handleFreelancerChange(idx, 'id', e.target.value)}
                              className="flex-1 p-2 rounded-lg bg-white border-gray-200 text-gray-900 text-[11px]"
                            >
                              <option value="">اختر فريلانسر...</option>
                              {freelancers.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.firstName} {f.lastName} ({f.role})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              placeholder="DA"
                              value={item.amount}
                              onChange={(e) => handleFreelancerChange(idx, 'amount', e.target.value)}
                              className="w-20 p-2 rounded-lg bg-white border-gray-200 text-[11px] font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFreelancer(idx)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expenses */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <h5 className="text-xs font-bold text-gray-700">المصاريف الخارجية</h5>
                      <button
                        type="button"
                        onClick={handleAddExpense}
                        className="text-[10px] bg-blue-500/20 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-500/30"
                      >
                        + إضافة مصروف
                      </button>
                    </div>
                    {workExpenses.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic">لا توجد مصاريف خارجية.</p>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {workExpenses.map((item, idx) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="وصف"
                              value={item.description}
                              onChange={(e) => handleExpenseChange(idx, 'description', e.target.value)}
                              className="flex-1 p-2 rounded-lg bg-white border-gray-200 text-[11px]"
                            />
                            <input
                              type="number"
                              placeholder="DA"
                              value={item.amount}
                              onChange={(e) => handleExpenseChange(idx, 'amount', e.target.value)}
                              className="w-20 p-2 rounded-lg bg-white border-gray-200 text-[11px] font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExpense(idx)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-6 px-6 pb-0">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}
                  className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={(e) => handleAddSubmit(e, true)}
                  className="px-5 py-2.5 rounded-xl border border-brand-orange text-brand-orange font-extrabold hover:bg-brand-orange/10 transition-all flex items-center gap-2"
                >
                  حفظ وطباعة الفاتورة
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-extrabold shadow-sm hover:brightness-110 flex items-center gap-2"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {worksModalClient && (
        <ClientWorksModal
          client={worksModalClient}
          onClose={() => setWorksModalClient(null)}
          onPrintInvoice={setInvoiceToPrint}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => {
          if (clientToDelete) archiveClient(clientToDelete.id);
        }}
        title="تأكيد أرشفة العميل"
        confirmText="تأكيد الأرشفة"
        message={`هل أنت متأكد من أنك تريد أرشفة العميل "${clientToDelete?.firstName} ${clientToDelete?.lastName}"؟ سيتم إخفاؤه من القائمة الرئيسية ولكن سيتم الاحتفاظ ببياناته ومشاريعه.`}
      />
    </div>

    <InvoicePrint 
      invoiceData={invoiceToPrint} 
      onPrinted={() => setInvoiceToPrint(null)} 
    />
    </>
  );
}
