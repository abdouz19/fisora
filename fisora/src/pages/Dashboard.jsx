import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  UserCheck,
  PlusCircle,
  ArrowUpRight,
  PieChart,
  Activity,
  Inbox,
  Trash2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { kpis, clients, freelancers, clearAllData } = useData();
  const [confirmClear, setConfirmClear] = useState(false);

  // 4 Core KPIs requested by user
  const kpiCards = [
    {
      id: 'incomes',
      title: 'إجمالي المداخيل',
      subTitle: 'إجمالي المدخول المسجل',
      value: `${kpis.totalIncomes.toLocaleString()} DA`,
      icon: DollarSign,
      trend: kpis.totalIncomes > 0 ? '+100%' : '0%',
      isPositive: true,
      color: 'bg-white border-gray-200 text-gray-900',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 'expenses',
      title: 'إجمالي المصاريف',
      subTitle: 'المصاريف ومستحقات الفريلانسرز',
      value: `${kpis.totalExpenses.toLocaleString()} DA`,
      icon: TrendingDown,
      trend: '0%',
      isPositive: false,
      color: 'bg-white border-gray-200 text-gray-900',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    {
      id: 'clients',
      title: 'إجمالي العملاء',
      subTitle: 'العملاء المسجلين بالمنصة',
      value: `${kpis.totalClientsCount} عميل`,
      icon: UserCheck,
      trend: `${clients.length}`,
      isPositive: true,
      color: 'bg-white border-gray-200 text-gray-900',
      iconBg: 'bg-blue-500/20 text-blue-400',
    },
    {
      id: 'profit',
      title: 'صافي الأرباح',
      subTitle: 'المداخيل مطروحاً منها المصاريف',
      value: `${kpis.netProfit.toLocaleString()} DA`,
      icon: TrendingUp,
      trend: kpis.netProfit >= 0 ? '+Net' : '-Net',
      isPositive: kpis.netProfit >= 0,
      color: 'bg-white border-gray-200 text-gray-900',
      iconBg: 'bg-orange-50 text-brand-orange shadow-sm',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-8 bg-brand-gradient shadow-sm border border-gray-200 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-orange/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-red/10 rounded-full filter blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              مرحباً بك في منصة <span className="text-brand-orange">Fisora Production</span>
            </h1>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/clients')}
              className="px-4 py-2.5 rounded-xl bg-brand-orange text-white font-bold text-xs shadow-sm hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>إضافة عميل جديد</span>
            </button>
            <button
              onClick={() => navigate('/freelancers')}
              className="px-4 py-2.5 rounded-xl glass-card text-gray-900 hover:bg-gray-50 font-bold text-xs transition-all flex items-center gap-2 border border-gray-200 cursor-pointer"
            >
              <Users size={16} />
              <span>إضافة فريلانسر</span>
            </button>
            {(clients.length > 0 || freelancers.length > 0) && (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                title="تفريغ جميع البيانات المسجلة"
              >
                <Trash2 size={16} />
                <span>مسح البيانات</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core KPIs Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Activity size={20} className="text-brand-orange" />
            <span>مؤشرات الأداء المالية (KPIs)</span>
          </h2>
          <span className="text-xs text-gray-400 font-medium">تحديث لحظي تلقائي</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((card) => (
            <div
              key={card.id}
              className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${card.color} glass-card-hover relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${card.isPositive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {card.trend}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-semibold">{card.title}</p>
              <p className="text-2xl font-black text-gray-900 mt-1 tracking-tight" dir="ltr">
                {card.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{card.subTitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Revenue vs Expenses Chart Preview */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">التحليلات المالية والتدفقات</h3>
              <p className="text-xs text-gray-400">مقارنة المداخيل مقابل المصاريف</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>المداخيل</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>المصاريف</span>
              </span>
            </div>
          </div>

          {/* Dynamic bar chart based on clients data */}
          {clients.length > 0 ? (
            <div className="space-y-4 pt-2">
              {clients.map((c) => {
                const total = (c.incomes || 1) + (c.expenses || 0);
                const incPct = Math.round((c.incomes / total) * 100);
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-700">{c.firstName} {c.lastName} ({c.company || 'عميل'})</span>
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="text-emerald-400" dir="ltr">+{c.incomes.toLocaleString()} DA</span>
                        <span className="text-rose-400" dir="ltr">-{c.expenses.toLocaleString()} DA</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${incPct}%` }}
                      />
                      <div
                        className="h-full bg-rose-500/80 rounded-full transition-all duration-500"
                        style={{ width: `${100 - incPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 space-y-3">
              <Inbox size={36} className="mx-auto text-gray-900/20" />
              <p className="text-sm font-bold text-gray-500">لا توجد مداخيل ومصاريف مسجلة حتى الآن</p>
              <p className="text-xs text-gray-400">قم بإضافة أول عميل لتظهر الرسوم البيانية التفاعلية فوراً</p>
              <button
                onClick={() => navigate('/clients')}
                className="px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow-sm mt-2"
              >
                + إضافة أول عميل
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>نسبة الربحية الحالية: <strong className="text-brand-orange">{kpis.totalIncomes > 0 ? `${Math.round((kpis.netProfit / kpis.totalIncomes) * 100)}%` : '0%'}</strong></span>
            <button onClick={() => navigate('/clients')} className="text-brand-orange font-bold flex items-center gap-1 hover:underline">
              <span>عرض تفاصيل العملاء</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Col: Active Packs Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <PieChart size={18} className="text-brand-orange" />
                <span>توزيع الباقات</span>
              </h3>
              <button onClick={() => navigate('/services')} className="text-xs text-brand-orange hover:underline font-bold">
                الباقات
              </button>
            </div>

            <div className="space-y-3.5 my-4">
              {[
                { name: 'Présence (10 Vidéos)', color: 'bg-red-500' },
                { name: 'Impact (5 Vidéos)', color: 'bg-brand-orange' },
                { name: 'Echo (3 Vidéos)', color: 'bg-cyan-500' },
                { name: 'Start (1 Vidéo)', color: 'bg-blue-500' },
              ].map((pack, idx) => {
                const count = clients.filter((c) => c.pack?.toLowerCase().includes(pack.name.split(' ')[0].toLowerCase())).length;
                const totalC = clients.length || 1;
                const pct = clients.length > 0 ? Math.round((count / totalC) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-gray-100/60 border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-900 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${pack.color}`} />
                        {pack.name}
                      </span>
                      <span className="text-gray-500">{count} عملاء</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div className={`h-full ${pack.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-orange/10 border border-brand-orange text-xs text-gray-700">
            <span className="font-bold text-brand-orange">ملاحظة الهوية:</span> الباقات تشمل كلاً من (Script, Shooting, Voix Off) مع إمكانية تحويل كل فيديو لصيغتين مختلفين.
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Clients & Freelancers Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-400" />
              <span>العملاء المسجلين</span>
            </h3>
            <button onClick={() => navigate('/clients')} className="text-xs text-brand-orange font-bold hover:underline">
              عرض الكل ({clients.length})
            </button>
          </div>

          {clients.length > 0 ? (
            <div className="space-y-3">
              {clients.slice(0, 4).map((client) => {
                const profit = client.incomes - client.expenses;
                return (
                  <div key={client.id} className="p-3.5 rounded-xl bg-gray-100/70 border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                        {client.firstName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{client.firstName} {client.lastName}</h4>
                        <p className="text-xs text-gray-400">{client.company}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-emerald-400 block" dir="ltr">
                        +{profit.toLocaleString()} DA
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-brand-orange font-bold">
                        {client.pack}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              <p>لا يوجد عملاء بعد. أضف أول عميل لتجربة المنصة!</p>
              <button
                onClick={() => navigate('/clients')}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-orange text-white font-bold"
              >
                + إضافة عميل
              </button>
            </div>
          )}
        </div>

        {/* Freelancers Financial Summary */}
        <div className="glass-card rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Users size={18} className="text-brand-orange" />
              <span>الفريلانسرز</span>
            </h3>
            <button onClick={() => navigate('/freelancers')} className="text-xs text-brand-orange font-bold hover:underline">
              عرض الكل ({freelancers.length})
            </button>
          </div>

          {freelancers.length > 0 ? (
            <div className="space-y-3">
              {freelancers.slice(0, 4).map((f) => {
                const remaining = f.dues - f.withdrawals;
                return (
                  <div key={f.id} className="p-3.5 rounded-xl bg-gray-100/70 border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-brand-orange flex items-center justify-center text-brand-orange font-black">
                        {f.firstName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{f.firstName} {f.lastName}</h4>
                        <p className="text-xs text-gray-400">{f.phone}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-amber-400 block" dir="ltr">
                        متبقي: {remaining.toLocaleString()} DA
                      </span>
                      <span className="text-[10px] text-gray-400 block" dir="ltr">
                        سحب: {f.withdrawals.toLocaleString()} DA
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-xs">
              <p>لا يوجد فريلانسرز مسجلين بعد. أضف أول فريلانسر!</p>
              <button
                onClick={() => navigate('/freelancers')}
                className="mt-3 px-4 py-2 rounded-xl bg-brand-orange text-gray-900 font-bold"
              >
                + إضافة فريلانسر
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAllData}
        title="مسح جميع البيانات"
        confirmText="نعم، امسح الكل"
        message="سيتم حذف جميع العملاء والأعمال والفريلانسرز والباقات المخصصة نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟"
      />
    </div>
  );
}
