import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  SlidersHorizontal,
  Zap,
  X,
  Pencil,
} from 'lucide-react';
import { useData } from '../context/DataContext';

const EMPTY_CUSTOM_FORM = {
  name: '',
  clientName: '',
  videosCount: 6,
  price: 35000,
  hasActors: true,
  description: '',
};

export default function Services() {
  const {
    customPacks,
    predefinedPacks,
    addCustomPack,
    updateCustomPack,
    updatePredefinedPack,
    clients,
  } = useData();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState(null);

  // Custom Pack Form State
  const [customForm, setCustomForm] = useState(EMPTY_CUSTOM_FORM);

  // Predefined pack editing
  const [editingPredefined, setEditingPredefined] = useState(null);
  const [predefinedForm, setPredefinedForm] = useState(null);

  const openCreateCustom = () => {
    setEditingCustomId(null);
    setCustomForm(EMPTY_CUSTOM_FORM);
    setIsCustomModalOpen(true);
  };

  const openEditCustom = (pack) => {
    setEditingCustomId(pack.id);
    setCustomForm({
      name: pack.name || '',
      clientName: pack.clientName || '',
      videosCount: pack.videosCount ?? 1,
      price: pack.price ?? 0,
      hasActors: !!pack.hasActors,
      description: pack.description || '',
    });
    setIsCustomModalOpen(true);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customForm.name) return;
    if (editingCustomId) {
      updateCustomPack(editingCustomId, customForm);
    } else {
      addCustomPack(customForm);
    }
    setCustomForm(EMPTY_CUSTOM_FORM);
    setEditingCustomId(null);
    setIsCustomModalOpen(false);
  };

  const openEditPredefined = (pack) => {
    setEditingPredefined(pack);
    setPredefinedForm({
      name: pack.name || '',
      videosLabel: pack.videosLabel || '',
      videosCount: pack.videosCount ?? 1,
      price: pack.price ?? 0,
      popular: !!pack.popular,
      features: (pack.features || []).join('\n'),
    });
  };

  const handlePredefinedSubmit = (e) => {
    e.preventDefault();
    if (!editingPredefined) return;
    updatePredefinedPack(editingPredefined.id, {
      name: predefinedForm.name,
      videosLabel: predefinedForm.videosLabel,
      videosCount: predefinedForm.videosCount,
      price: predefinedForm.price,
      popular: predefinedForm.popular,
      features: predefinedForm.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    });
    setEditingPredefined(null);
    setPredefinedForm(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Services Header Banner matching identity/111.png */}
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-8 bg-brand-gradient shadow-sm border border-gray-200 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-orange/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>


            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              خدمات وباقات الإنتاج المرئي (Services & Packs)
            </h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              باقات جاهزة مسبقاً (Start, Echo, Impact, Présence) بالإضافة إلى إمكانية إنشاء باقات مخصصة حسب اتفاقيات العملاء
            </p>
          </div>

          <button
            onClick={openCreateCustom}
            className="px-5 py-3 rounded-xl bg-brand-orange text-white font-extrabold text-sm shadow-sm hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal size={18} />
            <span>إنشاء باقة مخصصة جديدة</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Predefined Packs Grid matching 111.png */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Zap size={22} className="text-brand-orange" />
              <span>الباقات الأساسية المحددة مسبقاً (Predefined Packs)</span>
            </h2>
            <p className="text-xs text-gray-400">الباقات الرسمية لمنصة في صورة للإنتاج المرئي</p>
          </div>
          <span className="text-xs font-bold text-brand-orange px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20">
            4 باقات رسمية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {predefinedPacks.map((pack) => (
            <div
              key={pack.id}
              className={`glass-card rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                pack.popular
                  ? 'border-brand-orange shadow-sm bg-orange-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Tag Badge */}
              {pack.popular && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-orange text-white font-extrabold text-[10px] uppercase shadow-md">
                  الباقة الأكثر طلباً ⭐
                </div>
              )}

              {/* Edit button */}
              <button
                onClick={() => openEditPredefined(pack)}
                className={`absolute top-4 ${pack.popular ? 'left-auto right-4' : 'left-4'} p-1.5 rounded-lg bg-white/80 border border-gray-200 text-gray-500 hover:text-brand-orange hover:border-brand-orange transition-all`}
                title="تعديل الباقة"
              >
                <Pencil size={14} />
              </button>

              <div>
                {/* Big Number Pill Container matching 111.png visual */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-steel-card border border-gray-300 flex items-center justify-center text-3xl font-black text-gray-900 shadow-lg">
                    {pack.videosCount}
                  </div>
                  <span className="text-xs font-black text-brand-orange uppercase tracking-wider">
                    {pack.name}
                  </span>
                </div>

                {/* Pack Title & Price Pill matching 111.png */}
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {pack.videosLabel}
                </h3>

                {/* Orange Price Tag matching 111.png right-side orange box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-amber text-gray-900 font-black text-xl flex items-center justify-between mb-5 shadow-lg">
                  <span className="text-xs uppercase font-extrabold opacity-80">السعر الإجمالي:</span>
                  <span dir="ltr">{pack.price.toLocaleString()} {pack.priceUnit}</span>
                </div>

                {/* Features Included List */}
                <div className="space-y-2.5 mb-6 text-xs text-gray-700">
                  {pack.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Customized Packs (الباقات المخصصة) */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal size={22} className="text-blue-400" />
              <span>الباقات المخصصة (Customized Agreements)</span>
            </h2>
            <p className="text-xs text-gray-400">الاتفاقيات الخاصة المخصصة حسب طلبات العملاء</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customPacks.map((cPack) => (
            <div
              key={cPack.id}
              className="glass-card rounded-2xl p-5 border border-gray-200 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                    اتفاق مخصص
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{cPack.clientName}</span>
                    <button
                      onClick={() => openEditCustom(cPack)}
                      className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-blue-500 hover:border-blue-400 transition-all"
                      title="تعديل الباقة"
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{cPack.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{cPack.description || 'باقة مرئية مخصصة للعميل'}</p>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">عدد الفيديوهات:</span>
                    <span className="font-bold text-gray-900">{cPack.videosCount} فيديوهات</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الممثلين:</span>
                    <span className={`font-bold ${cPack.hasActors ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {cPack.hasActors ? 'مشمولين' : 'غير مشمولين'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">السعر الاتفاقي:</span>
                <span className="text-lg font-black text-gray-900" dir="ltr">
                  {cPack.price.toLocaleString()} DA
                </span>
              </div>
            </div>
          ))}

          {/* Create Custom Pack Card Trigger */}
          <div
            onClick={openCreateCustom}
            className="rounded-2xl p-6 border-2 border-dashed border-gray-200 hover:border-brand-orange/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 group-hover:bg-orange-50 text-brand-orange flex items-center justify-center mb-3 transition-colors">
              <Plus size={24} />
            </div>
            <h4 className="font-extrabold text-gray-900 text-sm">إنشاء اتفاقية باقة مخصصة جديدة</h4>
            <p className="text-xs text-gray-400 mt-1">تحديد عدد الفيديوهات، الممثلين، والسعر المطلوب</p>
          </div>
        </div>
      </div>

      {/* Modal: Create / Edit Customized Pack */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-gray-200 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-brand-orange" />
                <span>{editingCustomId ? 'تعديل الباقة المخصصة' : 'إنشاء باقة مخصصة جديدة'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCustomModalOpen(false);
                  setEditingCustomId(null);
                }}
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم الباقة المخصصة *</label>
                <input
                  type="text"
                  required
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  placeholder="مثال: باقة إعلانات الموسم المخصصة"
                  className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم العميل المقترن</label>
                  <select
                    value={customForm.clientName}
                    onChange={(e) => setCustomForm({ ...customForm, clientName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                  >
                    <option value="">اختر العميل...</option>
                    {clients
                      .filter((c) => !c.isArchived)
                      .map((c) => {
                        const fullName = `${c.firstName} ${c.lastName}`;
                        return (
                          <option key={c.id} value={fullName}>
                            {fullName}{c.company ? ` (${c.company})` : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">عدد الفيديوهات المطلوبة</label>
                  <input
                    type="number"
                    value={customForm.videosCount}
                    onChange={(e) => setCustomForm({ ...customForm, videosCount: e.target.value })}
                    placeholder="6"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">السعر المتفق عليه (DA) *</label>
                  <input
                    type="number"
                    required
                    value={customForm.price}
                    onChange={(e) => setCustomForm({ ...customForm, price: e.target.value })}
                    placeholder="35000"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 font-black text-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <label className="text-gray-700 font-bold">تضمين الممثلين والمؤثرين</label>
                <input
                  type="checkbox"
                  checked={customForm.hasActors}
                  onChange={(e) => setCustomForm({ ...customForm, hasActors: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 bg-gray-50 text-brand-orange focus:ring-brand-orange/30"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">وصف أو ملاحظات الإتفاقية</label>
                <textarea
                  rows={2}
                  value={customForm.description}
                  onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                  placeholder="ملاحظات تفصيلية عن المونتاج، التصوير، أو الشروط..."
                  className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomModalOpen(false);
                    setEditingCustomId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-extrabold shadow-sm hover:brightness-110"
                >
                  {editingCustomId ? 'حفظ التعديلات' : 'حفظ الباقة المخصصة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Predefined Pack */}
      {editingPredefined && predefinedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border border-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Zap size={20} className="text-brand-orange" />
                <span>تعديل باقة {editingPredefined.name}</span>
              </h3>
              <button
                onClick={() => {
                  setEditingPredefined(null);
                  setPredefinedForm(null);
                }}
                className="p-1 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePredefinedSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">اسم الباقة *</label>
                  <input
                    type="text"
                    required
                    value={predefinedForm.name}
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">وصف عدد الفيديوهات</label>
                  <input
                    type="text"
                    value={predefinedForm.videosLabel}
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, videosLabel: e.target.value })}
                    placeholder="مثال: Vidéos 5"
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">عدد الفيديوهات</label>
                  <input
                    type="number"
                    value={predefinedForm.videosCount}
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, videosCount: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">السعر (DA) *</label>
                  <input
                    type="number"
                    required
                    value={predefinedForm.price}
                    onChange={(e) => setPredefinedForm({ ...predefinedForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 font-black text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">المميزات (كل ميزة في سطر)</label>
                <textarea
                  rows={4}
                  value={predefinedForm.features}
                  onChange={(e) => setPredefinedForm({ ...predefinedForm, features: e.target.value })}
                  placeholder={'كتابة السيناريو (Script)\nالتصوير (Shooting)\nالتعليق الصوتي (Voix Off)'}
                  className="w-full p-3 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <label className="text-gray-700 font-bold">الباقة الأكثر طلباً (Popular)</label>
                <input
                  type="checkbox"
                  checked={predefinedForm.popular}
                  onChange={(e) => setPredefinedForm({ ...predefinedForm, popular: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 bg-gray-50 text-brand-orange focus:ring-brand-orange/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPredefined(null);
                    setPredefinedForm(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-orange text-white font-extrabold shadow-sm hover:brightness-110"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
