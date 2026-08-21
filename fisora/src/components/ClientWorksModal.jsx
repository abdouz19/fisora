import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Edit2, ArrowLeftRight, Printer, Wallet } from 'lucide-react';
import { useData, PREDEFINED_PACKS } from '../context/DataContext';
import ConfirmModal from './ConfirmModal';

// Remaining amount still owed on a single work
const workRemaining = (work) =>
  Math.max(0, (Number(work.priceFromClient) || 0) - (Number(work.amountPaid) || 0));

export default function ClientWorksModal({ client, onClose, onPrintInvoice }) {
  const { addWork, updateWork, deleteWork, getClientWorks, freelancers, customPacks, recordWorkPayment } = useData();
  const clientWorks = getClientWorks(client.id);

  const [isAdding, setIsAdding] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workToDelete, setWorkToDelete] = useState(null);
  const [selectedWorkIds, setSelectedWorkIds] = useState([]);
  const [replaceContext, setReplaceContext] = useState(null);
  const [replaceForm, setReplaceForm] = useState({ freelancerId: '', amount: '' });

  // --- Payment modal state ---
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentEntries, setPaymentEntries] = useState([]); // { workId, selected, amount }
  const [printReceipt, setPrintReceipt] = useState(true);

  const [newWork, setNewWork] = useState({
    date: new Date().toISOString().split('T')[0],
    service: 'Start',
    priceFromClient: '7500',
    notes: '',
  });

  // State for dynamic arrays
  const [selectedFreelancers, setSelectedFreelancers] = useState([]); // Array of { id, amount }
  const [expenses, setExpenses] = useState([]); // Array of { id, description, amount }

  // --- Handlers for Expenses ---
  const handleAddExpense = () => {
    setExpenses([...expenses, { id: `exp_${Date.now()}`, description: '', amount: '' }]);
  };

  const handleExpenseChange = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const handleRemoveExpense = (index) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    setExpenses(updated);
  };

  // --- Handlers for Freelancers ---
  const handleAddFreelancer = () => {
    setSelectedFreelancers([...selectedFreelancers, { id: '', amount: '' }]);
  };

  const handleFreelancerChange = (index, field, value) => {
    const updated = [...selectedFreelancers];
    updated[index][field] = value;
    setSelectedFreelancers(updated);
  };

  const handleRemoveFreelancer = (index) => {
    const updated = [...selectedFreelancers];
    updated.splice(index, 1);
    setSelectedFreelancers(updated);
  };

  const getFreelancerName = (freelancerId) => {
    const f = freelancers.find((item) => item.id === freelancerId);
    return f ? `${f.firstName} ${f.lastName}` : 'غير معروف';
  };

  const getAvailableFreelancers = (work, excludeIndex = null) => {
    const assignedIds = (work?.freelancers || [])
      .map((f, idx) => (idx === excludeIndex ? null : f.freelancerId))
      .filter(Boolean);
    return freelancers.filter((f) => !f.isArchived && !assignedIds.includes(f.id));
  };

  const openReplaceModal = (work, index) => {
    const current = work.freelancers[index];
    setReplaceContext({ work, index });
    setReplaceForm({
      freelancerId: '',
      amount: current?.amount?.toString() || '',
    });
  };

  const closeReplaceModal = () => {
    setReplaceContext(null);
    setReplaceForm({ freelancerId: '', amount: '' });
  };

  const handleReplaceSubmit = (e) => {
    e.preventDefault();
    if (!replaceContext || !replaceForm.freelancerId || replaceForm.amount === '') return;

    const { work, index } = replaceContext;
    const updatedFreelancers = [...(work.freelancers || [])];
    updatedFreelancers[index] = {
      freelancerId: replaceForm.freelancerId,
      amount: Number(replaceForm.amount),
    };

    updateWork(work.id, {
      ...work,
      freelancers: updatedFreelancers,
    });

    closeReplaceModal();
  };

  // --- Form Actions ---
  const resetForm = () => {
    setIsAdding(false);
    setEditingWorkId(null);
    setNewWork({
      date: new Date().toISOString().split('T')[0],
      service: 'Start',
      priceFromClient: '7500',
      notes: '',
    });
    setSelectedFreelancers([]);
    setExpenses([]);
  };

  const handleEditWork = (work) => {
    setEditingWorkId(work.id);
    setIsAdding(true);
    setNewWork({
      date: work.date,
      service: work.service,
      priceFromClient: work.priceFromClient || '',
      notes: work.notes || '',
    });

    // Populate freelancers
    if (work.freelancers && work.freelancers.length > 0) {
      setSelectedFreelancers(
        work.freelancers.map((f) => ({ id: f.freelancerId, amount: f.amount }))
      );
    } else {
      setSelectedFreelancers([]);
    }

    // Populate expenses
    if (work.expenses && work.expenses.length > 0) {
      setExpenses(
        work.expenses.map((e) => ({ id: e.id || `exp_${Date.now()}_${Math.random()}`, description: e.description, amount: e.amount }))
      );
    } else if (work.externalExpenses) {
      // Legacy support if they had an old work entry
      setExpenses([
        { id: `exp_${Date.now()}`, description: work.expenseDescription || 'مصروف عام', amount: work.externalExpenses }
      ]);
    } else {
      setExpenses([]);
    }
  };

  const buildWorkData = () => {
    // Filter valid entries
    const validFreelancers = selectedFreelancers
      .filter((f) => f.id && f.amount !== '')
      .map((f) => ({ freelancerId: f.id, amount: Number(f.amount) }));

    const validExpenses = expenses
      .filter((e) => e.amount !== '')
      .map((e) => ({ id: e.id, description: e.description || 'مصروف', amount: Number(e.amount) }));

    return {
      clientId: client.id,
      ...newWork,
      priceFromClient: Number(newWork.priceFromClient) || 0,
      freelancers: validFreelancers,
      expenses: validExpenses,
    };
  };

  // Client account balance — derived from live works so it updates after a payment
  // (the `client` prop is a snapshot from when the modal opened and can go stale)
  const clientTotal = clientWorks.reduce((s, w) => s + (Number(w.priceFromClient) || 0), 0);
  const clientAmountPaid = clientWorks.reduce((s, w) => s + (Number(w.amountPaid) || 0), 0);
  const clientRemaining = Math.max(0, clientTotal - clientAmountPaid);

  // Build the invoice payload consumed by <InvoicePrint />
  const buildWorkInvoice = (work) => ({
    firstName: client.firstName,
    lastName: client.lastName,
    company: client.company,
    phone: client.phone,
    date: work.date,
    pack: work.service,
    packPrice: Number(work.priceFromClient) || 0,
    notes: work.notes,
    amountPaid: clientAmountPaid,
    remainingAmount: clientRemaining,
  });

  const buildInvoiceItem = (work) => ({
    description:
      work.service === 'باقة مخصصة' ? 'باقة مخصصة (Custom Agreement)' : `باقة ${work.service}`,
    quantity: 1,
    amount: Number(work.priceFromClient) || 0,
    notes: work.notes,
    date: work.date,
  });

  // Combined invoice for several selected works
  const buildMultiWorkInvoice = (worksList) => ({
    firstName: client.firstName,
    lastName: client.lastName,
    company: client.company,
    phone: client.phone,
    items: worksList.map(buildInvoiceItem),
    amountPaid: clientAmountPaid,
    remainingAmount: clientRemaining,
  });

  // --- Selection handlers ---
  const toggleWorkSelection = (id) => {
    setSelectedWorkIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allSelected =
    clientWorks.length > 0 && selectedWorkIds.length === clientWorks.length;

  const toggleSelectAll = () => {
    setSelectedWorkIds(allSelected ? [] : clientWorks.map((w) => w.id));
  };

  const handlePrintSelected = () => {
    const selectedWorks = clientWorks.filter((w) => selectedWorkIds.includes(w.id));
    if (selectedWorks.length === 0) return;
    if (onPrintInvoice) onPrintInvoice(buildMultiWorkInvoice(selectedWorks));
  };

  // --- Payment handlers ---
  const unpaidWorks = clientWorks.filter((w) => workRemaining(w) > 0);

  const openPaymentModal = () => {
    setPaymentEntries(
      unpaidWorks.map((w) => ({
        workId: w.id,
        selected: false,
        amount: String(workRemaining(w)), // default to paying the full remaining
      }))
    );
    setPrintReceipt(true);
    setIsPaymentOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentOpen(false);
    setPaymentEntries([]);
  };

  const togglePaymentEntry = (workId) => {
    setPaymentEntries((prev) =>
      prev.map((e) => (e.workId === workId ? { ...e, selected: !e.selected } : e))
    );
  };

  const changePaymentAmount = (workId, value) => {
    setPaymentEntries((prev) =>
      prev.map((e) => (e.workId === workId ? { ...e, amount: value, selected: true } : e))
    );
  };

  const paymentSelected = paymentEntries.filter(
    (e) => e.selected && Number(e.amount) > 0
  );
  const paymentTotal = paymentSelected.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleSubmitPayment = () => {
    if (paymentSelected.length === 0) return;

    // Snapshot the works being paid before state updates, for the optional receipt
    const paidWorks = paymentSelected.map((e) => ({
      work: clientWorks.find((w) => w.id === e.workId),
      amount: Number(e.amount),
    }));

    paymentSelected.forEach((e) => recordWorkPayment(e.workId, Number(e.amount)));

    if (printReceipt && onPrintInvoice) {
      const newPaid = clientAmountPaid + paymentTotal;
      onPrintInvoice({
        firstName: client.firstName,
        lastName: client.lastName,
        company: client.company,
        phone: client.phone,
        isReceipt: true,
        items: paidWorks.map(({ work, amount }) => ({
          description:
            work.service === 'باقة مخصصة'
              ? 'باقة مخصصة (Custom Agreement)'
              : `باقة ${work.service}`,
          quantity: 1,
          amount, // amount paid now for this work
          date: work.date,
        })),
        amountPaid: newPaid,
        remainingAmount: Math.max(0, clientTotal - newPaid),
        paymentTotal,
      });
    }

    closePaymentModal();
  };

  const persistWork = (workData) => {
    if (editingWorkId) {
      updateWork(editingWorkId, workData);
    } else {
      addWork(workData);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newWork.service) return;

    persistWork(buildWorkData());
    resetForm();
  };

  const handleSaveAndPrint = () => {
    if (!newWork.service) return;

    const workData = buildWorkData();
    persistWork(workData);
    if (onPrintInvoice) onPrintInvoice(buildWorkInvoice(workData));
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[90vh] flex flex-col glass-card rounded-3xl border border-gray-200 shadow-2xl relative bg-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              الأعمال والمشاريع - {client.firstName} {client.lastName}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              جدول تتبع الأعمال والمصاريف وربح المؤسسة للعميل ({client.company})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Table & Add Form) */}
        <div className="flex-1 overflow-auto p-6 space-y-6 text-sm">
          {/* Client balance + record payment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-gray-400 block text-[11px]">الإجمالي</span>
                <span className="font-extrabold text-gray-900 text-sm" dir="ltr">
                  {clientTotal.toLocaleString()} DA
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">المدفوع</span>
                <span className="font-extrabold text-emerald-500 text-sm" dir="ltr">
                  {clientAmountPaid.toLocaleString()} DA
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">المتبقي</span>
                <span
                  className={`font-extrabold text-sm ${clientRemaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`}
                  dir="ltr"
                >
                  {clientRemaining.toLocaleString()} DA
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openPaymentModal}
              disabled={unpaidWorks.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Wallet size={16} />
              <span>{unpaidWorks.length === 0 ? 'تم تحصيل كل المستحقات' : 'تسجيل دفعة'}</span>
            </button>
          </div>

          {/* Selection toolbar */}
          {selectedWorkIds.length > 0 && (
            <div className="flex items-center justify-between bg-orange-50 border border-brand-orange/30 rounded-xl px-4 py-2.5">
              <span className="text-xs font-bold text-gray-700">
                تم تحديد {selectedWorkIds.length} عمل
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWorkIds([])}
                  className="px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 font-bold text-xs"
                >
                  إلغاء التحديد
                </button>
                <button
                  type="button"
                  onClick={handlePrintSelected}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-900 text-white font-bold text-xs shadow-md hover:bg-gray-800"
                >
                  <Printer size={14} />
                  <span>طباعة فاتورة ({selectedWorkIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50/30">
            <table className="w-full text-right whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 text-xs font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-brand-orange cursor-pointer"
                      title="تحديد الكل"
                    />
                  </th>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">الخدمة</th>
                  <th className="px-4 py-3">السعر من الزبون</th>
                  <th className="px-4 py-3">حالة الدفع</th>
                  <th className="px-4 py-3">إجمالي المصاريف</th>
                  <th className="px-4 py-3">تفاصيل المصاريف</th>
                  <th className="px-4 py-3">مستحقات الفريلانسرز</th>
                  <th className="px-4 py-3 text-brand-orange">ربح المؤسسة</th>
                  <th className="px-4 py-3">ملاحظات</th>
                  <th className="px-4 py-3 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientWorks.map((work) => {
                  const totalFreelancerPay = (work.freelancers || []).reduce(
                    (sum, f) => sum + (f.amount || 0),
                    0
                  );
                  
                  // Calculate total expenses for this work
                  const totalExpenses = (work.expenses || []).reduce(
                    (sum, e) => sum + (e.amount || 0), 
                    0
                  ) + (work.externalExpenses || 0); // fallback for legacy data

                  const netProfit = work.priceFromClient - totalExpenses - totalFreelancerPay;

                  return (
                    <tr
                      key={work.id}
                      className={`hover:bg-gray-50 transition-colors text-xs text-gray-900/90 ${
                        selectedWorkIds.includes(work.id) ? 'bg-orange-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedWorkIds.includes(work.id)}
                          onChange={() => toggleWorkSelection(work.id)}
                          className="w-4 h-4 rounded accent-brand-orange cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{work.date}</td>
                      <td className="px-4 py-3 font-bold">{work.service}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold" dir="ltr">
                        {Number(work.priceFromClient || 0).toLocaleString()} DA
                      </td>
                      <td className="px-4 py-3">
                        {workRemaining(work) <= 0 ? (
                          <span className="inline-block px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold text-[10px]">
                            مدفوع بالكامل
                          </span>
                        ) : (
                          <div className="text-[10px] space-y-0.5">
                            <div className="flex justify-between gap-2">
                              <span className="text-gray-400">مدفوع</span>
                              <span className="text-emerald-500 font-bold" dir="ltr">
                                {(Number(work.amountPaid) || 0).toLocaleString()} DA
                              </span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="text-gray-400">متبقي</span>
                              <span className="text-rose-500 font-bold" dir="ltr">
                                {workRemaining(work).toLocaleString()} DA
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-rose-400 font-bold" dir="ltr">
                        {totalExpenses.toLocaleString()} DA
                      </td>
                      <td className="px-4 py-3">
                        {work.expenses && work.expenses.length > 0 ? (
                           <div className="space-y-1">
                             {work.expenses.map((e, idx) => (
                               <div key={idx} className="flex justify-between gap-2 text-[10px] bg-gray-50/60 px-2 py-1 rounded">
                                 <span className="text-gray-600 truncate max-w-[100px]" title={e.description}>{e.description}</span>
                                 <span className="text-rose-300" dir="ltr">{e.amount} DA</span>
                               </div>
                             ))}
                           </div>
                        ) : work.externalExpenses ? (
                          <span className="text-gray-500">{work.expenseDescription || 'مصروف عام'}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {work.freelancers && work.freelancers.length > 0 ? (
                          <div className="space-y-1">
                            {work.freelancers.map((fPay, idx) => {
                              const fObj = freelancers.find((f) => f.id === fPay.freelancerId);
                              return (
                                <div key={idx} className="flex items-center justify-between gap-2 text-[10px] bg-gray-50/60 px-2 py-1 rounded">
                                  <span>{fObj ? `${fObj.firstName} ${fObj.lastName}` : 'غير معروف'}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-amber-300 font-bold" dir="ltr">
                                      {fPay.amount.toLocaleString()} DA
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => openReplaceModal(work, idx)}
                                      className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                                      title="استبدال الفريلانسر"
                                    >
                                      <ArrowLeftRight size={11} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-black text-brand-orange" dir="ltr">
                        {netProfit.toLocaleString()} DA
                      </td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]" title={work.notes}>
                        {work.notes || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onPrintInvoice && onPrintInvoice(buildWorkInvoice(work))}
                            className="p-1.5 rounded-lg bg-gray-900/10 text-gray-700 hover:bg-gray-900/20"
                            title="طباعة فاتورة"
                          >
                            <Printer size={14} />
                          </button>
                          <button
                            onClick={() => handleEditWork(work)}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            title="تعديل"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setWorkToDelete(work)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {clientWorks.length === 0 && (
                  <tr>
                    <td colSpan="11" className="px-4 py-8 text-center text-gray-400">
                      لا توجد أعمال مسجلة لهذا العميل.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add / Edit Work Form Area */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white font-bold text-sm shadow-sm hover:brightness-110 transition-all w-full sm:w-auto justify-center"
            >
              <Plus size={18} />
              <span>إضافة عمل جديد</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  {editingWorkId ? <Edit2 size={16} className="text-blue-400" /> : <Plus size={16} className="text-brand-orange" />}
                  <span>{editingWorkId ? 'تعديل بيانات العمل' : 'تفاصيل العمل الجديد'}</span>
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={newWork.date}
                    onChange={(e) => setNewWork({ ...newWork, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">الخدمة *</label>
                  <select
                    value={newWork.service}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const allPacks = [...PREDEFINED_PACKS, ...customPacks];
                      const pack = allPacks.find(p => p.name === selectedName);
                      setNewWork({
                        ...newWork,
                        service: selectedName,
                        priceFromClient: pack ? pack.price : newWork.priceFromClient,
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-xs bg-gray-50"
                  >
                    {PREDEFINED_PACKS.map((p) => (
                      <option key={p.id} value={p.name} className="bg-gray-50 text-gray-900">
                        باقة {p.name}
                      </option>
                    ))}
                    {customPacks && customPacks.map((p) => (
                      <option key={p.id} value={p.name} className="bg-gray-50 text-brand-orange">
                        باقة {p.name} (مخصصة)
                      </option>
                    ))}
                    <option value="باقة مخصصة" className="bg-gray-50 text-gray-900">
                      باقة مخصصة (Custom Agreement)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">السعر من الزبون (DA)</label>
                  <input
                    type="number"
                    placeholder="7500"
                    value={newWork.priceFromClient}
                    onChange={(e) => setNewWork({ ...newWork, priceFromClient: e.target.value })}
                    disabled={newWork.service !== 'باقة مخصصة' && [...PREDEFINED_PACKS, ...customPacks].some(p => p.name === newWork.service)}
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs font-bold mb-1">ملاحظات</label>
                  <input
                    type="text"
                    placeholder="أي ملاحظات إضافية"
                    value={newWork.notes}
                    onChange={(e) => setNewWork({ ...newWork, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expenses Section */}
                <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h5 className="text-xs font-bold text-gray-700">المصاريف الخارجية</h5>
                    <button
                      type="button"
                      onClick={handleAddExpense}
                      className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-bold hover:bg-blue-500/30"
                    >
                      + إضافة مصروف
                    </button>
                  </div>
                  
                  {expenses.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">لا توجد مصاريف خارجية مسجلة.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {expenses.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="وصف (مثال: أكل، نقل)"
                            value={item.description}
                            onChange={(e) => handleExpenseChange(idx, 'description', e.target.value)}
                            className="flex-1 p-2 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-[11px]"
                          />
                          <input
                            type="number"
                            placeholder="المبلغ (DA)"
                            value={item.amount}
                            onChange={(e) => handleExpenseChange(idx, 'amount', e.target.value)}
                            className="w-24 p-2 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-[11px] font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExpense(idx)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Freelancers Section */}
                <div className="bg-gray-100/50 p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <h5 className="text-xs font-bold text-gray-700">مستحقات الفريلانسرز (الفريق)</h5>
                      {editingWorkId && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          يمكنك تغيير أو استبدال أي فريلانسر إذا لم ينجز العمل
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFreelancer}
                      className="text-[10px] bg-orange-50 text-brand-orange px-2 py-1 rounded font-bold hover:bg-brand-orange/30"
                    >
                      + إضافة فريلانسر
                    </button>
                  </div>
                  
                  {selectedFreelancers.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">لم يتم تحديد فريلانسرز. اضغط للإضافة.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {selectedFreelancers.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <select
                            value={item.id}
                            onChange={(e) => handleFreelancerChange(idx, 'id', e.target.value)}
                            className="flex-1 p-2 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-[11px] bg-gray-50"
                          >
                            <option value="">اختر فريلانسر...</option>
                            {freelancers.filter((f) => !f.isArchived).map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.firstName} {f.lastName} ({f.role})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="المبلغ (DA)"
                            value={item.amount}
                            onChange={(e) => handleFreelancerChange(idx, 'amount', e.target.value)}
                            className="w-24 p-2 rounded-lg bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-[11px] font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFreelancer(idx)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="إزالة"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs shadow-md hover:bg-gray-800"
                >
                  <Printer size={14} />
                  <span>{editingWorkId ? 'تحديث وطباعة فاتورة' : 'حفظ وطباعة فاتورة'}</span>
                </button>
                <button
                  type="submit"
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-gray-900 font-bold text-xs shadow-md ${editingWorkId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-brand-orange text-white shadow-sm hover:brightness-110'}`}
                >
                  <Save size={14} />
                  <span>{editingWorkId ? 'تحديث العمل' : 'حفظ العمل'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Wallet size={16} className="text-emerald-600" />
                  <span>تسجيل دفعة - {client.firstName} {client.lastName}</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  اختر الأعمال التي دفع عنها العميل وحدد المبلغ
                </p>
              </div>
              <button
                type="button"
                onClick={closePaymentModal}
                className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar">
              {paymentEntries.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  لا توجد مستحقات غير مدفوعة.
                </p>
              ) : (
                paymentEntries.map((entry) => {
                  const work = clientWorks.find((w) => w.id === entry.workId);
                  if (!work) return null;
                  const remaining = workRemaining(work);
                  return (
                    <div
                      key={entry.workId}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        entry.selected ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={entry.selected}
                        onChange={() => togglePaymentEntry(entry.workId)}
                        className="w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-xs truncate">{work.service}</p>
                        <p className="text-[10px] text-gray-400">
                          {work.date} · متبقي{' '}
                          <span className="text-rose-500 font-bold" dir="ltr">
                            {remaining.toLocaleString()} DA
                          </span>
                        </p>
                      </div>
                      <input
                        type="number"
                        value={entry.amount}
                        max={remaining}
                        min="0"
                        onChange={(e) => changePaymentAmount(entry.workId, e.target.value)}
                        className="w-28 p-2 rounded-lg bg-white border border-gray-200 text-gray-900 text-xs font-bold text-left"
                        dir="ltr"
                        placeholder="المبلغ"
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-600">إجمالي الدفعة:</span>
                <span className="font-black text-emerald-600 text-lg" dir="ltr">
                  {paymentTotal.toLocaleString()} DA
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  className="w-4 h-4 rounded accent-gray-900 cursor-pointer"
                />
                <span>طباعة إيصال الدفع</span>
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-4 py-2 rounded-xl text-gray-500 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={paymentSelected.length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Wallet size={14} />
                  <span>تسجيل الدفعة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replace Freelancer Modal */}
      {replaceContext && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <ArrowLeftRight size={16} className="text-blue-500" />
                <span>استبدال فريلانسر</span>
              </h4>
              <button
                type="button"
                onClick={closeReplaceModal}
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              استبدال{' '}
              <span className="font-bold text-gray-900">
                {getFreelancerName(replaceContext.work.freelancers[replaceContext.index]?.freelancerId)}
              </span>{' '}
              في عمل <span className="font-bold text-gray-900">{replaceContext.work.service}</span>
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">الفريلانسر الجديد *</label>
                <select
                  required
                  value={replaceForm.freelancerId}
                  onChange={(e) => setReplaceForm({ ...replaceForm, freelancerId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs"
                >
                  <option value="">اختر فريلانسر بديل...</option>
                  {getAvailableFreelancers(replaceContext.work, replaceContext.index).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.firstName} {f.lastName} ({f.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">المبلغ (DA) *</label>
                <input
                  type="number"
                  required
                  value={replaceForm.amount}
                  onChange={(e) => setReplaceForm({ ...replaceForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 text-xs font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReplaceModal}
                  className="px-4 py-2 rounded-xl text-gray-500 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                >
                  تأكيد الاستبدال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!workToDelete}
        onClose={() => setWorkToDelete(null)}
        onConfirm={() => {
          if (workToDelete) deleteWork(workToDelete.id);
        }}
        title="تأكيد حذف العمل"
        message={`هل أنت متأكد من أنك تريد حذف العمل "${workToDelete?.service}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </div>
  );
}
