import React, { useState } from 'react';
import {
  Users,
  Search,
  DollarSign,
  Wallet,
  ArrowDownCircle,
  X,
  Phone,
  Archive,
  UserPlus,
  TrendingDown,
  Award,
} from 'lucide-react';
import { useData, FREELANCER_ROLES } from '../context/DataContext';
import ConfirmModal from '../components/ConfirmModal';

export default function Freelancers() {
  const { freelancers, works, addFreelancer, recordWithdrawal, archiveFreelancer, kpis } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showArchived, setShowArchived] = useState(false);

  // --- Spending analytics over time ---
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [freelancerToDelete, setFreelancerToDelete] = useState(null);

  // New Freelancer Form
  const [newForm, setNewForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'editor',
    dues: '',
    withdrawals: '',
    total: '1',
  });

  // Withdraw Amount Form
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Filtering
  const filteredFreelancers = freelancers.filter((f) => {
    if (!showArchived && f.isArchived) return false;
    if (showArchived && !f.isArchived) return false;
    
    const matchesRole = selectedRole === 'all' || f.role === selectedRole;
    const matchesSearch =
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.phone.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newForm.firstName || !newForm.lastName) return;
    addFreelancer(newForm);
    setNewForm({
      firstName: '',
      lastName: '',
      phone: '',
      role: 'editor',
      dues: '',
      withdrawals: '',
      total: '1',
    });
    setIsAddModalOpen(false);
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    if (!selectedFreelancer || !withdrawAmount) return;
    recordWithdrawal(selectedFreelancer.id, withdrawAmount);
    setWithdrawAmount('');
    setSelectedFreelancer(null);
    setIsWithdrawModalOpen(false);
  };

  const getRoleObj = (roleId) => {
    return FREELANCER_ROLES.find((r) => r.id === roleId) || FREELANCER_ROLES[6];
  };

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

  // --- Spending within the selected range ---
  const rangeWorks = works.filter((w) => {
    if (dateFrom && w.date < dateFrom) return false;
    if (dateTo && w.date > dateTo) return false;
    return true;
  });
  const freelancerSpend = rangeWorks.reduce(
    (sum, w) => sum + (w.freelancers || []).reduce((a, f) => a + (Number(f.amount) || 0), 0),
    0
  );
  const otherSpend = rangeWorks.reduce(
    (sum, w) => sum + (w.expenses || []).reduce((a, e) => a + (Number(e.amount) || 0), 0),
    0
  );

  // --- Top freelancers by money (with their work count) in the range ---
  const freelancerAgg = {};
  rangeWorks.forEach((w) => {
    (w.freelancers || []).forEach((f) => {
      if (!freelancerAgg[f.freelancerId]) freelancerAgg[f.freelancerId] = { amount: 0, works: 0 };
      freelancerAgg[f.freelancerId].amount += Number(f.amount) || 0;
      freelancerAgg[f.freelancerId].works += 1;
    });
  });
  const topFreelancers = Object.entries(freelancerAgg)
    .map(([id, v]) => {
      const f = freelancers.find((x) => x.id === id);
      return {
        id,
        name: f ? `${f.firstName} ${f.lastName}` : 'غير معروف',
        role: f ? f.role : 'other',
        amount: v.amount,
        works: v.works,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const maxTopAmount = topFreelancers.length ? topFreelancers[0].amount : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-gray-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/15 text-brand-orange text-xs font-bold mb-2 border border-brand-orange">
            <Users size={14} />
            <span>إدارة صناع المحتوى بالفريق</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">الفريلانسرز (Freelancers)</h1>
          <p className="text-gray-500 text-xs mt-1">
            متابعة أدوار الفريلانسرز، المستحقات المالية، عمليات السحب، والمتبقي من الرصيد
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-brand-orange text-white font-extrabold text-sm shadow-sm hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={18} />
          <span>إضافة فريلانسر جديد</span>
        </button>
      </div>

      {/* Global Freelancers Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Dues Card */}
        <div className="glass-card rounded-2xl p-5 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-bold">إجمالي المستحقات</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2" dir="ltr">
            {kpis.totalDuesAll.toLocaleString()} DA
          </p>
          <p className="text-[11px] text-gray-400 mt-1">إجمالي المستحقات لجميع الفريلانسرز</p>
        </div>

        {/* Total Payouts / Withdrawals Card */}
        <div className="glass-card rounded-2xl p-5 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-bold">إجمالي السحب</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownCircle size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2" dir="ltr">
            {kpis.totalWithdrawalsAll.toLocaleString()} DA
          </p>
          <p className="text-[11px] text-gray-400 mt-1">إجمالي ما تم دفعه وسحبه فعلياً</p>
        </div>

        {/* Total Remaining Card */}
        <div className="glass-card rounded-2xl p-5 border border-brand-orange/40 bg-brand-orange/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-orange font-extrabold">المتبقي / الباقي للإعادة</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center shadow-sm">
              <Wallet size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2" dir="ltr">
            {kpis.totalRemainingAll.toLocaleString()} DA
          </p>
          <p className="text-[11px] text-gray-500 mt-1">المستحقات المتبقية غير المسحوبة</p>
        </div>
      </div>

      {/* Spending analytics over time */}
      <div className="glass-card rounded-2xl p-5 border border-gray-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <TrendingDown size={18} className="text-rose-500" />
              <span>تحليلات المصاريف عبر الوقت</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              كم أنفقنا على الفريلانسرز والمصاريف الأخرى خلال الفترة المحددة
            </p>
          </div>
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

        {/* Spending tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 block">مصاريف الفريلانسرز</span>
            <span className="text-lg font-black text-amber-500" dir="ltr">
              {freelancerSpend.toLocaleString()} DA
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 block">مصاريف أخرى</span>
            <span className="text-lg font-black text-rose-500" dir="ltr">
              {otherSpend.toLocaleString()} DA
            </span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <span className="text-[11px] text-gray-400 block">إجمالي المصاريف</span>
            <span className="text-lg font-black text-gray-900" dir="ltr">
              {(freelancerSpend + otherSpend).toLocaleString()} DA
            </span>
          </div>
        </div>

        {/* Top freelancers */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2 mb-3">
            <Award size={15} className="text-brand-orange" />
            <span>الأكثر تحصيلاً (Top Freelancers)</span>
          </h4>
          {topFreelancers.length === 0 ? (
            <p className="text-[11px] text-gray-400 italic">لا توجد مستحقات مسجلة في هذه الفترة.</p>
          ) : (
            <div className="space-y-2">
              {topFreelancers.map((t, idx) => {
                const role = getRoleObj(t.role);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                        idx === 0 ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {t.name}
                          <span className="text-[10px] text-gray-400 font-normal"> · {role.label}</span>
                          <span className="text-[10px] text-gray-400 font-normal"> · {t.works} أعمال</span>
                        </span>
                        <span className="text-xs font-black text-amber-500 shrink-0" dir="ltr">
                          {t.amount.toLocaleString()} DA
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-orange rounded-full"
                          style={{ width: `${maxTopAmount ? (t.amount / maxTopAmount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search Controls Bar */}
      <div className="glass-card rounded-2xl p-4 border border-gray-200 flex flex-col gap-4">
        {/* Search Bar & Archive */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="relative flex-1 md:max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث عن اسم أو رقم هاتف..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-xs text-gray-900 placeholder-white/40"
            />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${showArchived ? 'bg-brand-orange text-gray-900 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-50'}`}
          >
            <Archive size={14} />
            <span className="hidden sm:inline">{showArchived ? 'النشطين' : 'الأرشيف'}</span>
          </button>
        </div>

        {/* Roles Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedRole('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedRole === 'all'
                ? 'bg-brand-orange text-gray-900 shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            الكل ({freelancers.length})
          </button>
          {FREELANCER_ROLES.map((role) => {
            const count = freelancers.filter((f) => f.role === role.id).length;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedRole === role.id
                    ? 'bg-brand-orange text-gray-900 shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {role.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Freelancers Cards & Data Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFreelancers.map((f) => {
          const roleObj = getRoleObj(f.role);
          const remaining = f.dues - f.withdrawals;
          return (
            <div
              key={f.id}
              className="glass-card rounded-2xl p-5 border border-gray-200 glass-card-hover flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Row: Name, Phone & Role Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 border border-gray-200 flex items-center justify-center font-black text-lg text-brand-orange shadow-md">
                      {f.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900">
                        {f.firstName} {f.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5" dir="ltr">
                        <Phone size={12} className="text-brand-orange" />
                        <span>{f.phone}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleObj.color}`}>
                    {roleObj.label}
                  </span>
                </div>

                {/* Financial Fields Breakdown as required by user prompt */}
                <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-xl bg-gray-100/70 border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block">المستحقات</span>
                    <span className="font-extrabold text-gray-900 text-sm" dir="ltr">
                      {f.dues.toLocaleString()} DA
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">السحب</span>
                    <span className="font-extrabold text-emerald-400 text-sm" dir="ltr">
                      {f.withdrawals.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 mt-1 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-brand-orange font-bold block">المتبقي / الباقي</span>
                      <span className="font-black text-gray-900 text-base" dir="ltr">
                        {remaining.toLocaleString()} DA
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-400 block text-[10px]">إجمالي المشاريع</span>
                      <span className="font-bold text-gray-900 text-xs">{f.total} أعمال</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Payout & Delete */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedFreelancer(f);
                    setIsWithdrawModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-orange-50 hover:bg-brand-orange hover:text-gray-900 text-brand-orange text-xs font-bold transition-all border border-brand-orange flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowDownCircle size={15} />
                  <span>تسجيل سحب مالـي</span>
                </button>

                <button
                  onClick={() => setFreelancerToDelete(f)}
                  className="p-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-brand-orange transition-all border border-gray-100 cursor-pointer"
                  title="أرشفة الفريلانسر"
                >
                  <Archive size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFreelancers.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl border border-gray-200">
          <Users size={40} className="mx-auto text-gray-900/20 mb-3" />
          <p className="text-gray-500 font-bold">لا يوجد فريلانسر يتطابق مع شروط البحث</p>
          <p className="text-xs text-gray-400 mt-1">جرب تغيير التخصص أو إضافة فريلانسر جديد</p>
        </div>
      )}

      {/* Modal 1: Add New Freelancer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-gray-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-brand-orange" />
                <span>إضافة فريلانسر جديد</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">الاسم الأول *</label>
                  <input
                    type="text"
                    required
                    value={newForm.firstName}
                    onChange={(e) => setNewForm({ ...newForm, firstName: e.target.value })}
                    placeholder="مثال: أيمن"
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
                    placeholder="مثال: بن علي"
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
                    placeholder="0550123456"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-bold mb-1">الدور / التخصص *</label>
                  <select
                    value={newForm.role}
                    onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 bg-gray-50"
                  >
                    {FREELANCER_ROLES.map((r) => (
                      <option key={r.id} value={r.id} className="bg-gray-50 text-gray-900">
                        {r.label} ({r.labelFr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Attributes Initial Input */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <label className="block text-gray-500 font-medium mb-1">المستحقات (DA)</label>
                  <input
                    type="number"
                    value={newForm.dues}
                    onChange={(e) => setNewForm({ ...newForm, dues: e.target.value })}
                    placeholder="50000"
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">السحب (DA)</label>
                  <input
                    type="number"
                    value={newForm.withdrawals}
                    onChange={(e) => setNewForm({ ...newForm, withdrawals: e.target.value })}
                    placeholder="20000"
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-1">إجمالي الأعمال</label>
                  <input
                    type="number"
                    value={newForm.total}
                    onChange={(e) => setNewForm({ ...newForm, total: e.target.value })}
                    placeholder="5"
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-extrabold shadow-sm hover:brightness-110"
                >
                  حفظ الفريلانسر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Withdrawal / Payout */}
      {isWithdrawModalOpen && selectedFreelancer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-gray-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-black text-gray-900">تسجيل عملية سحب جديدة</h3>
                <p className="text-xs text-brand-orange font-bold mt-0.5">
                  {selectedFreelancer.firstName} {selectedFreelancer.lastName}
                </p>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="flex justify-between text-gray-500">
                  <span>المستحقات الإجمالية:</span>
                  <span className="font-bold text-gray-900" dir="ltr">{selectedFreelancer.dues.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>السحوبات السابقة:</span>
                  <span className="font-bold text-emerald-400" dir="ltr">{selectedFreelancer.withdrawals.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-brand-orange font-bold pt-1 border-t border-gray-100">
                  <span>المتبقي حالياً:</span>
                  <span dir="ltr">{(selectedFreelancer.dues - selectedFreelancer.withdrawals).toLocaleString()} DA</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">المبلغ المسحوب الجديد (DA) *</label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="أدخل المبلغ المسحوب"
                  className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left font-extrabold text-base"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-extrabold shadow-sm hover:brightness-110"
                >
                  تأكيد تسجيل السحب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!freelancerToDelete}
        onClose={() => setFreelancerToDelete(null)}
        onConfirm={() => {
          if (freelancerToDelete) archiveFreelancer(freelancerToDelete.id);
        }}
        title="تأكيد أرشفة الفريلانسر"
        confirmText="تأكيد الأرشفة"
        message={`هل أنت متأكد من أنك تريد أرشفة الفريلانسر "${freelancerToDelete?.firstName} ${freelancerToDelete?.lastName}" من الفريق؟ سيتم إخفاؤه من القائمة ولكن ستبقى أعماله ومشاريعه محفوظة.`}
      />
    </div>
  );
}
