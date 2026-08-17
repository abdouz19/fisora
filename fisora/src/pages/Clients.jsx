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
import { useData, PREDEFINED_PACKS } from '../context/DataContext';
import InvoicePrint from '../components/InvoicePrint';
import ClientWorksModal from '../components/ClientWorksModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Clients() {
  const { clients, addClient, archiveClient, kpis, customPacks } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [worksModalClient, setWorksModalClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form State
  const [newForm, setNewForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    pack: 'Start',
    packPrice: 7500, // Default for 'Start'
    amountPaid: '',
    incomes: '',
    expenses: '',
    worksCount: '1',
  });

  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  const filteredClients = clients.filter((c) => {
    if (!showArchived && c.isArchived) return false;
    if (showArchived && !c.isArchived) return false;
    
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = c.company.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || company.includes(query) || c.phone.includes(query);
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newForm.firstName || !newForm.lastName) return;
    addClient(newForm);
    setNewForm({
      firstName: '',
      lastName: '',
      phone: '',
      company: '',
      pack: 'Start',
      packPrice: 7500,
      amountPaid: '',
      incomes: '',
      expenses: '',
      worksCount: '1',
    });
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
            <span>إدارة عملاء ومشاريع فيسورا</span>
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
        <span className="text-xs font-bold text-gray-500 hidden sm:block">
          عرض {filteredClients.length} عميل
        </span>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((c) => {
          const profit = c.incomes - c.expenses;
          const isProfitable = profit >= 0;
          return (
            <div
              key={c.id}
              className="glass-card rounded-2xl p-5 border border-gray-200 glass-card-hover flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Client Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-lg text-gray-900 shadow-md">
                      {c.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900">
                        {c.firstName} {c.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building size={12} className="text-brand-orange" />
                        <span>{c.company}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 text-brand-orange border border-brand-orange">
                    {c.pack}
                  </span>
                </div>

                {/* Contact Phone */}
                <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-4" dir="ltr">
                  <Phone size={12} className="text-gray-400" />
                  <span>{c.phone}</span>
                </div>

                {/* Client Financials Breakdown explicitly requested by user */}
                <div className="grid grid-cols-2 gap-2 my-2 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block">المداخيل</span>
                    <span className="font-extrabold text-emerald-400 text-sm" dir="ltr">
                      {c.incomes.toLocaleString()} DA
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">المصاريف</span>
                    <span className="font-extrabold text-rose-400 text-sm" dir="ltr">
                      {c.expenses.toLocaleString()} DA
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 mt-1 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 font-bold block">الربح الصافي</span>
                      <span
                        className={`font-black text-base ${
                          isProfitable ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                        dir="ltr"
                      >
                        {isProfitable ? '+' : ''}{profit.toLocaleString()} DA
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-gray-400 block text-[10px]">الأعمال / المشروعات</span>
                      <span className="font-extrabold text-gray-900 text-xs">{c.worksCount} أعمال</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-200">
                <span className="text-[11px] text-gray-400">تاريخ الإضافة: {c.date || 'جديد'}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWorksModalClient(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-brand-orange/30 text-brand-orange transition-all cursor-pointer text-xs font-bold"
                    title="سجل الأعمال والمشاريع"
                  >
                    <List size={14} />
                    <span>الأعمال</span>
                  </button>
                  <button
                    onClick={() => setClientToDelete(c)}
                    className="p-1.5 rounded-lg bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-brand-orange transition-all cursor-pointer"
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
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-gray-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-brand-orange" />
                <span>إضافة عميل جديد</span>
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
                <label className="block text-gray-600 font-bold mb-1">الباقة المختارة</label>
                <select
                    value={newForm.pack}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const allPacks = [...PREDEFINED_PACKS, ...customPacks];
                      const pack = allPacks.find(p => p.name === selectedName);
                      setNewForm({
                        ...newForm,
                        pack: selectedName,
                        packPrice: pack ? pack.price : '',
                      });
                    }}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 bg-gray-50 mb-4"
                  >
                    {PREDEFINED_PACKS.map((p) => (
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
                  <option value="باقة مخصصة" className="bg-gray-50 text-gray-900">
                    باقة مخصصة (Custom Agreement)
                  </option>
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">السعر الإجمالي (DA)</label>
                    <input
                      type="number"
                      value={newForm.packPrice}
                      onChange={(e) => setNewForm({ ...newForm, packPrice: e.target.value })}
                      disabled={newForm.pack !== 'باقة مخصصة'}
                      className="w-full p-2.5 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full p-2.5 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-brand-red text-left font-black opacity-80 cursor-not-allowed"
                    />
                  </div>
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
                  type="button"
                  onClick={(e) => {
                    const remaining = Math.max(0, (Number(newForm.packPrice) || 0) - (Number(newForm.amountPaid) || 0));
                    const clientData = { ...newForm, remainingAmount: remaining };
                    setInvoiceToPrint(clientData);
                    handleAddSubmit(e);
                  }}
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
