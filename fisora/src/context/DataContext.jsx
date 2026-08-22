import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const FREELANCER_ROLES = [
  { id: 'writer', label: 'كاتب', labelFr: 'Writer', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'editor', label: 'مخرج / مونتير', labelFr: 'Editor', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'designer', label: 'مصمم', labelFr: 'Designer', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'actor', label: 'ممثل', labelFr: 'Actor', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'filmaker', label: 'صانع أفلام', labelFr: 'Filmmaker', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { id: 'voix off', label: 'معلق صوتي', labelFr: 'Voix Off', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { id: 'other', label: 'آخر', labelFr: 'Other', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
];

// Fallback seed used only if the DB fetch returns nothing (kept for reference/labels)
export const PREDEFINED_PACKS = [
  { id: 'start', name: 'Start', videosCount: 1, videosLabel: 'Vidéo 1', price: 7500, priceUnit: 'DA', popular: false, features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'], badgeColor: 'from-blue-600 to-indigo-700' },
  { id: 'echo', name: 'Echo', videosCount: 3, videosLabel: 'Vidéos 3', price: 18000, priceUnit: 'DA', popular: false, features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'], badgeColor: 'from-cyan-600 to-blue-700' },
  { id: 'impact', name: 'Impact', videosCount: 5, videosLabel: 'Vidéos 5', price: 27000, priceUnit: 'DA', popular: true, features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'], badgeColor: 'from-brand-orange to-brand-gold' },
  { id: 'presence', name: 'Présence', videosCount: 10, videosLabel: 'Vidéos 10', price: 49000, priceUnit: 'DA', popular: false, features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'], badgeColor: 'from-red-600 to-brand-red' },
];

// ---- row → app-shape mappers (snake_case DB → camelCase UI) ----
const mapClient = (r) => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  phone: r.phone || '',
  company: r.company || '',
  pack: r.pack || 'Start',
  packPrice: Number(r.pack_price) || 0,
  isArchived: !!r.is_archived,
  date: r.created_at ? r.created_at.split('T')[0] : '',
});

const mapWork = (r) => ({
  id: r.id,
  clientId: r.client_id,
  date: r.date,
  service: r.service,
  priceFromClient: Number(r.price_from_client) || 0,
  amountPaid: Number(r.amount_paid) || 0,
  priceAdjustment: r.price_adjustment || null,
  notes: r.notes || '',
  expenses: (r.work_expenses || []).map((e) => ({
    id: e.id,
    description: e.description || 'مصروف',
    amount: Number(e.amount) || 0,
  })),
  freelancers: (r.work_freelancers || []).map((f) => ({
    freelancerId: f.freelancer_id,
    amount: Number(f.amount) || 0,
  })),
});

const mapFreelancer = (r) => ({
  id: r.id,
  firstName: r.first_name,
  lastName: r.last_name,
  phone: r.phone || '',
  role: r.role || 'other',
  withdrawals: Number(r.withdrawals) || 0,
  isArchived: !!r.is_archived,
});

const mapCustomPack = (r) => ({
  id: r.id,
  name: r.name,
  clientName: r.client_name || '',
  videosCount: Number(r.videos_count) || 0,
  price: Number(r.price) || 0,
  hasActors: !!r.has_actors,
  description: r.description || '',
});

const mapPredefinedPack = (r) => ({
  id: r.id,
  name: r.name,
  videosCount: Number(r.videos_count) || 0,
  videosLabel: r.videos_label || '',
  price: Number(r.price) || 0,
  priceUnit: r.price_unit || 'DA',
  popular: !!r.popular,
  features: r.features || [],
  badgeColor: r.badge_color || '',
});

export function DataProvider({ children }) {
  const { session } = useAuth();

  const [freelancers, setFreelancers] = useState([]);
  const [clients, setClients] = useState([]);
  const [customPacks, setCustomPacks] = useState([]);
  const [predefinedPacks, setPredefinedPacks] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [cl, wk, fr, cp, pp] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('works').select('*, work_expenses(*), work_freelancers(*)').order('date', { ascending: false }),
      supabase.from('freelancers').select('*').order('created_at', { ascending: false }),
      supabase.from('custom_packs').select('*').order('created_at', { ascending: false }),
      supabase.from('predefined_packs').select('*').order('sort_order', { ascending: true }),
    ]);

    if (cl.error || wk.error || fr.error || cp.error || pp.error) {
      // eslint-disable-next-line no-console
      console.error('Supabase fetch error', { cl: cl.error, wk: wk.error, fr: fr.error, cp: cp.error, pp: pp.error });
    }

    setClients((cl.data || []).map(mapClient));
    setWorks((wk.data || []).map(mapWork));
    setFreelancers((fr.data || []).map(mapFreelancer));
    setCustomPacks((cp.data || []).map(mapCustomPack));
    setPredefinedPacks(
      pp.data && pp.data.length ? pp.data.map(mapPredefinedPack) : PREDEFINED_PACKS
    );
    setLoading(false);
  }, []);

  // Load when authenticated, clear when logged out
  useEffect(() => {
    if (session) {
      refreshAll();
    } else {
      setClients([]);
      setWorks([]);
      setFreelancers([]);
      setCustomPacks([]);
      setPredefinedPacks([]);
    }
  }, [session, refreshAll]);

  // ---- Freelancer Handlers ----
  const addFreelancer = async (data) => {
    await supabase.from('freelancers').insert({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || null,
      role: data.role || 'other',
      withdrawals: Number(data.withdrawals) || 0,
    });
    await refreshAll();
  };

  const updateFreelancer = async (id, data) => {
    const patch = {};
    if ('firstName' in data) patch.first_name = data.firstName;
    if ('lastName' in data) patch.last_name = data.lastName;
    if ('phone' in data) patch.phone = data.phone;
    if ('role' in data) patch.role = data.role;
    if ('withdrawals' in data) patch.withdrawals = Number(data.withdrawals) || 0;
    if ('isArchived' in data) patch.is_archived = data.isArchived;
    await supabase.from('freelancers').update(patch).eq('id', id);
    await refreshAll();
  };

  const recordWithdrawal = async (id, amount) => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;
    const f = freelancers.find((x) => x.id === id);
    const newWithdrawals = (f?.withdrawals || 0) + numericAmount;
    await supabase.from('freelancers').update({ withdrawals: newWithdrawals }).eq('id', id);
    await refreshAll();
  };

  const archiveFreelancer = async (id) => {
    await supabase.from('freelancers').update({ is_archived: true }).eq('id', id);
    await refreshAll();
  };

  // ---- Client Handlers ----
  const addClient = async (data) => {
    const { data: inserted, error } = await supabase
      .from('clients')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || null,
        company: data.company || null,
        pack: data.pack || 'Start',
        pack_price: Number(data.packPrice) || 0,
      })
      .select()
      .single();

    if (error || !inserted) {
      // eslint-disable-next-line no-console
      console.error('addClient error', error);
      return;
    }

    if (data.initialWork) {
      const price = Number(data.initialWork.priceFromClient ?? data.packPrice) || 0;
      const { data: workRow } = await supabase
        .from('works')
        .insert({
          client_id: inserted.id,
          date: data.initialWork.date || new Date().toISOString().split('T')[0],
          service: data.initialWork.service || data.pack || 'Start',
          price_from_client: price,
          amount_paid: Math.min(price, Number(data.amountPaid) || 0),
          price_adjustment: data.initialWork.priceAdjustment || null,
          notes: data.initialWork.notes || '',
        })
        .select()
        .single();

      if (workRow) {
        await syncWorkChildren(workRow.id, data.initialWork.expenses, data.initialWork.freelancers);
      }
    }

    await refreshAll();
  };

  const updateClient = async (id, data) => {
    const patch = {};
    if ('firstName' in data) patch.first_name = data.firstName;
    if ('lastName' in data) patch.last_name = data.lastName;
    if ('phone' in data) patch.phone = data.phone;
    if ('company' in data) patch.company = data.company;
    if ('pack' in data) patch.pack = data.pack;
    if ('packPrice' in data) patch.pack_price = Number(data.packPrice) || 0;
    if ('isArchived' in data) patch.is_archived = data.isArchived;
    await supabase.from('clients').update(patch).eq('id', id);
    await refreshAll();
  };

  const archiveClient = async (id) => {
    await supabase.from('clients').update({ is_archived: true }).eq('id', id);
    await refreshAll();
  };

  // ---- Custom Pack Handlers ----
  const addCustomPack = async (packData) => {
    await supabase.from('custom_packs').insert({
      name: packData.name,
      client_name: packData.clientName || null,
      videos_count: Number(packData.videosCount) || 1,
      price: Number(packData.price) || 0,
      has_actors: !!packData.hasActors,
      description: packData.description || null,
    });
    await refreshAll();
  };

  const updateCustomPack = async (id, data) => {
    const patch = {};
    if ('name' in data) patch.name = data.name;
    if ('clientName' in data) patch.client_name = data.clientName;
    if ('videosCount' in data) patch.videos_count = Number(data.videosCount) || 0;
    if ('price' in data) patch.price = Number(data.price) || 0;
    if ('hasActors' in data) patch.has_actors = !!data.hasActors;
    if ('description' in data) patch.description = data.description;
    await supabase.from('custom_packs').update(patch).eq('id', id);
    await refreshAll();
  };

  // ---- Predefined Pack editing ----
  const updatePredefinedPack = async (id, data) => {
    const patch = {};
    if ('name' in data) patch.name = data.name;
    if ('videosLabel' in data) patch.videos_label = data.videosLabel;
    if ('videosCount' in data) patch.videos_count = Number(data.videosCount) || 0;
    if ('price' in data) patch.price = Number(data.price) || 0;
    if ('popular' in data) patch.popular = !!data.popular;
    if ('features' in data) patch.features = data.features;
    await supabase.from('predefined_packs').update(patch).eq('id', id);
    await refreshAll();
  };

  // ---- Works Handlers ----
  // Replace a work's expenses/freelancers child rows with the provided arrays
  const syncWorkChildren = async (workId, expenses, freelancers2) => {
    if (Array.isArray(expenses)) {
      await supabase.from('work_expenses').delete().eq('work_id', workId);
      const rows = expenses
        .filter((e) => e.amount !== '' && e.amount != null)
        .map((e) => ({ work_id: workId, description: e.description || 'مصروف', amount: Number(e.amount) || 0 }));
      if (rows.length) await supabase.from('work_expenses').insert(rows);
    }
    if (Array.isArray(freelancers2)) {
      await supabase.from('work_freelancers').delete().eq('work_id', workId);
      const rows = freelancers2
        .filter((f) => f.freelancerId && f.amount !== '' && f.amount != null)
        .map((f) => ({ work_id: workId, freelancer_id: f.freelancerId, amount: Number(f.amount) || 0 }));
      if (rows.length) await supabase.from('work_freelancers').insert(rows);
    }
  };

  const addWork = async (workData) => {
    const price = Number(workData.priceFromClient) || 0;
    const { data: workRow, error } = await supabase
      .from('works')
      .insert({
        client_id: workData.clientId,
        date: workData.date || new Date().toISOString().split('T')[0],
        service: workData.service,
        price_from_client: price,
        amount_paid: Math.min(price, Number(workData.amountPaid) || 0),
        price_adjustment: workData.priceAdjustment || null,
        notes: workData.notes || '',
      })
      .select()
      .single();

    if (error || !workRow) {
      // eslint-disable-next-line no-console
      console.error('addWork error', error);
      return;
    }
    await syncWorkChildren(workRow.id, workData.expenses, workData.freelancers);
    await refreshAll();
  };

  const updateWork = async (id, data) => {
    const patch = {};
    if ('date' in data) patch.date = data.date;
    if ('service' in data) patch.service = data.service;
    if ('priceFromClient' in data) patch.price_from_client = Number(data.priceFromClient) || 0;
    if ('amountPaid' in data) patch.amount_paid = Number(data.amountPaid) || 0;
    if ('priceAdjustment' in data) patch.price_adjustment = data.priceAdjustment || null;
    if ('notes' in data) patch.notes = data.notes;
    if (Object.keys(patch).length) {
      await supabase.from('works').update(patch).eq('id', id);
    }
    await syncWorkChildren(id, data.expenses, data.freelancers);
    await refreshAll();
  };

  const deleteWork = async (id) => {
    await supabase.from('works').delete().eq('id', id);
    await refreshAll();
  };

  const recordWorkPayment = async (workId, amount) => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;
    const w = works.find((x) => x.id === workId);
    if (!w) return;
    const price = Number(w.priceFromClient) || 0;
    const newPaid = Math.min(price, (Number(w.amountPaid) || 0) + numericAmount);
    await supabase.from('works').update({ amount_paid: newPaid }).eq('id', workId);
    await refreshAll();
  };

  const clearAllData = async () => {
    // Deleting clients cascades to their works, expenses, and work_freelancers.
    await supabase.from('clients').delete().not('id', 'is', null);
    await supabase.from('freelancers').delete().not('id', 'is', null);
    await supabase.from('custom_packs').delete().not('id', 'is', null);
    await refreshAll();
  };

  // ---- Derived data ----
  const getClientWorks = (clientId) => works.filter((w) => w.clientId === clientId);

  const getClientDerivedStats = (clientId) => {
    const clientWorks = getClientWorks(clientId);
    const incomes = clientWorks.reduce((sum, w) => sum + (w.priceFromClient || 0), 0);
    const paid = clientWorks.reduce((sum, w) => sum + (Number(w.amountPaid) || 0), 0);
    const expenses = clientWorks.reduce((sum, w) => {
      const arrayExpenses = (w.expenses || []).reduce((eSum, e) => eSum + (Number(e.amount) || 0), 0);
      const freelancerPay = (w.freelancers || []).reduce((fSum, f) => fSum + (Number(f.amount) || 0), 0);
      return sum + arrayExpenses + freelancerPay;
    }, 0);
    return { incomes, expenses, worksCount: clientWorks.length, paid };
  };

  const getFreelancerDerivedDues = (freelancerId) =>
    works.reduce((sum, w) => {
      const fPay = (w.freelancers || []).find((f) => f.freelancerId === freelancerId);
      return sum + (fPay ? Number(fPay.amount) || 0 : 0);
    }, 0);

  const augmentedClients = clients.map((c) => {
    const derived = getClientDerivedStats(c.id);
    const incomes = derived.incomes;
    const amountPaid = derived.paid;
    return {
      ...c,
      incomes,
      expenses: derived.expenses,
      amountPaid,
      remainingAmount: Math.max(0, incomes - amountPaid),
      worksCount: derived.worksCount,
    };
  });

  const augmentedFreelancers = freelancers.map((f) => ({
    ...f,
    dues: getFreelancerDerivedDues(f.id),
  }));

  // ---- KPIs ----
  const activeClients = augmentedClients.filter((c) => !c.isArchived);
  const activeFreelancers = augmentedFreelancers.filter((f) => !f.isArchived);

  const totalIncomes = activeClients.reduce((acc, c) => acc + (Number(c.incomes) || 0), 0);
  const clientExpenses = activeClients.reduce((acc, c) => acc + (Number(c.expenses) || 0), 0);
  const freelancerPayouts = activeFreelancers.reduce((acc, f) => acc + (Number(f.withdrawals) || 0), 0);
  const totalExpenses = clientExpenses + freelancerPayouts;
  const totalClientsCount = activeClients.length;
  const netProfit = totalIncomes - totalExpenses;

  const totalDuesAll = activeFreelancers.reduce((acc, f) => acc + (Number(f.dues) || 0), 0);
  const totalWithdrawalsAll = activeFreelancers.reduce((acc, f) => acc + (Number(f.withdrawals) || 0), 0);
  const totalRemainingAll = totalDuesAll - totalWithdrawalsAll;

  return (
    <DataContext.Provider
      value={{
        loading,
        freelancers: augmentedFreelancers,
        clients: augmentedClients,
        customPacks,
        predefinedPacks,
        works,
        refreshAll,
        addFreelancer,
        updateFreelancer,
        archiveFreelancer,
        recordWithdrawal,
        addClient,
        updateClient,
        archiveClient,
        addCustomPack,
        updateCustomPack,
        updatePredefinedPack,
        addWork,
        updateWork,
        deleteWork,
        recordWorkPayment,
        getClientWorks,
        clearAllData,
        kpis: {
          totalIncomes,
          totalExpenses,
          totalClientsCount,
          netProfit,
          totalDuesAll,
          totalWithdrawalsAll,
          totalRemainingAll,
        },
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
