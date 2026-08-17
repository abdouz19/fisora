import React, { createContext, useContext, useState } from 'react';

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

export const PREDEFINED_PACKS = [
  {
    id: 'start',
    name: 'Start',
    videosCount: 1,
    videosLabel: 'Vidéo 1',
    price: 7500,
    priceUnit: 'DA',
    popular: false,
    features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'],
    badgeColor: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'echo',
    name: 'Echo',
    videosCount: 3,
    videosLabel: 'Vidéos 3',
    price: 18000,
    priceUnit: 'DA',
    popular: false,
    features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'],
    badgeColor: 'from-cyan-600 to-blue-700',
  },
  {
    id: 'impact',
    name: 'Impact',
    videosCount: 5,
    videosLabel: 'Vidéos 5',
    price: 27000,
    priceUnit: 'DA',
    popular: true,
    features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'],
    badgeColor: 'from-brand-orange to-brand-gold',
  },
  {
    id: 'presence',
    name: 'Présence',
    videosCount: 10,
    videosLabel: 'Vidéos 10',
    price: 49000,
    priceUnit: 'DA',
    popular: false,
    features: ['كتابة السيناريو (Script)', 'التصوير (Shooting)', 'التعليق الصوتي (Voix Off)'],
    badgeColor: 'from-red-600 to-brand-red',
  },
];

// Clean initial datasets (empty arrays)
const INITIAL_FREELANCERS = [];
const INITIAL_CLIENTS = [];
const INITIAL_CUSTOM_PACKS = [];
const INITIAL_WORKS = [];

export function DataProvider({ children }) {
  const [freelancers, setFreelancers] = useState(INITIAL_FREELANCERS);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [customPacks, setCustomPacks] = useState(INITIAL_CUSTOM_PACKS);
  const [works, setWorks] = useState(INITIAL_WORKS);

  // Freelancer Handlers
  const addFreelancer = (data) => {
    const newFreelancer = {
      id: `f_${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role || 'other',
      dues: Number(data.dues) || 0,
      withdrawals: Number(data.withdrawals) || 0,
      total: Number(data.total) || 1,
      isArchived: false,
    };
    setFreelancers((prev) => [newFreelancer, ...prev]);
  };

  const updateFreelancer = (id, updatedData) => {
    setFreelancers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updatedData } : f))
    );
  };

  const recordWithdrawal = (id, amount) => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;
    setFreelancers((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            withdrawals: f.withdrawals + numericAmount,
          };
        }
        return f;
      })
    );
  };

  const archiveFreelancer = (id) => {
    setFreelancers((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isArchived: true } : f))
    );
  };

  // Client Handlers
  const addClient = (data) => {
    const clientId = `c_${Date.now()}`;
    const newClient = {
      id: clientId,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      company: data.company,
      pack: data.pack || 'Start',
      packPrice: Number(data.packPrice) || 0,
      amountPaid: Number(data.amountPaid) || 0,
      remainingAmount: Number(data.remainingAmount) || 0,
      incomes: Number(data.incomes) || 0,
      expenses: Number(data.expenses) || 0,
      worksCount: Number(data.worksCount) || 1,
      date: new Date().toISOString().split('T')[0],
      isArchived: false,
    };
    setClients((prev) => [newClient, ...prev]);

    if (data.initialWork) {
      const newWork = {
        id: `w_${Date.now()}`,
        clientId,
        date: data.initialWork.date || new Date().toISOString().split('T')[0],
        service: data.initialWork.service || data.pack || 'Start',
        priceFromClient: Number(data.initialWork.priceFromClient ?? data.packPrice) || 0,
        expenses: data.initialWork.expenses || [],
        freelancers: data.initialWork.freelancers || [],
        notes: data.initialWork.notes || '',
      };
      setWorks((prev) => [newWork, ...prev]);
    }
  };

  const recordClientPayment = (id, paymentAmount) => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) return;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newPaid = (c.amountPaid || 0) + amount;
          const newRemaining = Math.max(0, (c.packPrice || 0) - newPaid);
          return {
            ...c,
            amountPaid: newPaid,
            remainingAmount: newRemaining,
          };
        }
        return c;
      })
    );
  };

  const updateClient = (id, updatedData) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
  };

  const archiveClient = (id) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c))
    );
  };

  // Custom Pack Handlers
  const addCustomPack = (packData) => {
    const newPack = {
      id: `cp_${Date.now()}`,
      name: packData.name,
      clientName: packData.clientName || 'عميل مخصص',
      videosCount: Number(packData.videosCount) || 1,
      price: Number(packData.price) || 0,
      hasActors: packData.hasActors || false,
      formatsCount: Number(packData.formatsCount) || 2,
      description: packData.description || '',
    };
    setCustomPacks((prev) => [newPack, ...prev]);
  };

  // Works Handlers
  const addWork = (workData) => {
    const newWork = {
      id: `w_${Date.now()}`,
      clientId: workData.clientId,
      date: workData.date || new Date().toISOString().split('T')[0],
      service: workData.service,
      priceFromClient: Number(workData.priceFromClient) || 0,
      expenses: workData.expenses || [], // Array of { id, amount, description }
      freelancers: workData.freelancers || [], // Array of { freelancerId, amount }
      notes: workData.notes || '',
    };
    setWorks((prev) => [newWork, ...prev]);
  };

  const updateWork = (id, updatedData) => {
    setWorks((prev) => prev.map((w) => (w.id === id ? { ...w, ...updatedData } : w)));
  };

  const deleteWork = (id) => {
    setWorks((prev) => prev.filter((w) => w.id !== id));
  };

  const clearAllData = () => {
    setFreelancers([]);
    setClients([]);
    setCustomPacks([]);
    setWorks([]);
  };

  // Derived Data from Works
  const getClientWorks = (clientId) => works.filter((w) => w.clientId === clientId);
  
  const getClientDerivedStats = (clientId) => {
    const clientWorks = getClientWorks(clientId);
    const incomes = clientWorks.reduce((sum, w) => sum + (w.priceFromClient || 0), 0);
    const expenses = clientWorks.reduce((sum, w) => {
      // Handle legacy externalExpenses if any exist from before, or sum up the new expenses array
      const legacyExpense = w.externalExpenses || 0;
      const arrayExpenses = (w.expenses || []).reduce((eSum, e) => eSum + (Number(e.amount) || 0), 0);
      const freelancerPay = (w.freelancers || []).reduce((fSum, f) => fSum + (Number(f.amount) || 0), 0);
      return sum + legacyExpense + arrayExpenses + freelancerPay;
    }, 0);
    const worksCount = clientWorks.length;
    return { incomes, expenses, worksCount };
  };

  const getFreelancerDerivedDues = (freelancerId) => {
    return works.reduce((sum, w) => {
      const fPay = w.freelancers.find((f) => f.freelancerId === freelancerId);
      return sum + (fPay ? (Number(fPay.amount) || 0) : 0);
    }, 0);
  };

  // Combine static initial values with derived values
  const augmentedClients = clients.map((c) => {
    const derived = getClientDerivedStats(c.id);
    return {
      ...c,
      incomes: (Number(c.incomes) || 0) + derived.incomes,
      expenses: (Number(c.expenses) || 0) + derived.expenses,
      worksCount: (Number(c.worksCount) || 1) + derived.worksCount - (c.worksCount ? 1 : 0),
    };
  });

  const augmentedFreelancers = freelancers.map((f) => {
    const derivedDues = getFreelancerDerivedDues(f.id);
    return {
      ...f,
      dues: (Number(f.dues) || 0) + derivedDues,
    };
  });

  // Dynamic KPI Calculations (Only count active entities)
  const activeClients = augmentedClients.filter(c => !c.isArchived);
  const activeFreelancers = augmentedFreelancers.filter(f => !f.isArchived);

  const totalIncomes = activeClients.reduce((acc, c) => acc + (Number(c.incomes) || 0), 0);
  const clientExpenses = activeClients.reduce((acc, c) => acc + (Number(c.expenses) || 0), 0);
  const freelancerPayouts = activeFreelancers.reduce((acc, f) => acc + (Number(f.withdrawals) || 0), 0);
  const totalExpenses = clientExpenses + freelancerPayouts;
  const totalClientsCount = activeClients.length;
  const netProfit = totalIncomes - totalExpenses;

  // Freelancers global sums
  const totalDuesAll = activeFreelancers.reduce((acc, f) => acc + (Number(f.dues) || 0), 0);
  const totalWithdrawalsAll = activeFreelancers.reduce((acc, f) => acc + (Number(f.withdrawals) || 0), 0);
  const totalRemainingAll = totalDuesAll - totalWithdrawalsAll;

  return (
    <DataContext.Provider
      value={{
        freelancers: augmentedFreelancers,
        clients: augmentedClients,
        customPacks,
        works,
        addFreelancer,
        updateFreelancer,
        archiveFreelancer,
        recordWithdrawal,
        addClient,
        updateClient,
        archiveClient,
        recordClientPayment,
        addCustomPack,
        addWork,
        updateWork,
        deleteWork,
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
