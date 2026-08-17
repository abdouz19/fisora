import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { useData, PREDEFINED_PACKS } from '../context/DataContext';
import ConfirmModal from './ConfirmModal';

export default function ClientWorksModal({ client, onClose }) {
  const { addWork, updateWork, deleteWork, getClientWorks, freelancers, customPacks } = useData();
  const clientWorks = getClientWorks(client.id);

  const [isAdding, setIsAdding] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [workToDelete, setWorkToDelete] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newWork.service) return;

    // Filter valid entries
    const validFreelancers = selectedFreelancers
      .filter((f) => f.id && f.amount !== '')
      .map((f) => ({ freelancerId: f.id, amount: Number(f.amount) }));

    const validExpenses = expenses
      .filter((e) => e.amount !== '')
      .map((e) => ({ id: e.id, description: e.description || 'مصروف', amount: Number(e.amount) }));

    const workData = {
      clientId: client.id,
      ...newWork,
      priceFromClient: Number(newWork.priceFromClient) || 0,
      freelancers: validFreelancers,
      expenses: validExpenses,
    };

    if (editingWorkId) {
      updateWork(editingWorkId, workData);
    } else {
      addWork(workData);
    }

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
          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50/30">
            <table className="w-full text-right whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 text-xs font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">الخدمة</th>
                  <th className="px-4 py-3">السعر من الزبون</th>
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
                    <tr key={work.id} className="hover:bg-gray-50 transition-colors text-xs text-gray-900/90">
                      <td className="px-4 py-3 font-medium">{work.date}</td>
                      <td className="px-4 py-3 font-bold">{work.service}</td>
                      <td className="px-4 py-3 text-emerald-400 font-bold" dir="ltr">
                        {Number(work.priceFromClient || 0).toLocaleString()} DA
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
                                  <span>{fObj ? `${fObj.firstName}` : 'غير معروف'}</span>
                                  <span className="text-amber-300 font-bold" dir="ltr">
                                    {fPay.amount.toLocaleString()} DA
                                  </span>
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
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-400">
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
                    <h5 className="text-xs font-bold text-gray-700">مستحقات الفريلانسرز (الفريق)</h5>
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
                            {freelancers.map((f) => (
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
