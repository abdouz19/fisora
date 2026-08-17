import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  UserCheck,
  LogOut,
  Menu,
  TrendingUp,
  Search,
} from 'lucide-react';
import { useData } from '../context/DataContext';

const navItems = [
  { path: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/freelancers', label: 'الفريلانسرز (الصناع)', icon: Users },
  { path: '/services', label: 'الخدمات والباقات', icon: Package },
  { path: '/clients', label: 'إدارة العملاء', icon: UserCheck },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { kpis } = useData();

  const handleLogout = () => {
    navigate('/login');
  };

  const currentNav = navItems.find((n) => n.path === location.pathname);
  const pageTitle = currentNav ? currentNav.label : 'Fisora';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-sm">
            <span className="text-xl font-black">F</span>
          </div>
          {sidebarOpen && (
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Fisora</h1>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Production Agency</p>
            </div>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div className="mx-4 mt-5 p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500 font-medium">صافي الأرباح الحالية</div>
            <div className="text-sm font-extrabold text-brand-orange mt-0.5" dir="ltr">
              {kpis.netProfit.toLocaleString()} DA
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-orange flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1.5 mt-2">
        <div className="text-[11px] font-semibold text-gray-400 px-3 mb-2">
          {sidebarOpen && 'القائمة الرئيسية'}
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-orange-50 text-brand-orange font-bold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {sidebarOpen && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center relative overflow-hidden">
          <p className="text-xs font-bold text-gray-800 mb-1">باقات الإنتاج المرئي</p>
          <p className="text-[11px] text-gray-500 mb-3">Start, Echo, Impact, Présence</p>
          <button
            onClick={() => navigate('/services')}
            className="w-full py-2 rounded-lg bg-white text-brand-orange hover:bg-orange-50 text-xs font-bold transition-all border border-gray-200 shadow-sm"
          >
            عرض الباقات
          </button>
        </div>
      )}

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 font-bold transition-all"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-arabic text-gray-900" dir="rtl">
      <aside
        className={`hidden md:flex flex-col fixed top-0 bottom-0 right-0 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:mr-64' : 'md:mr-20'
        }`}
      >
        {/* Header */}
        <header className="h-20 items-center justify-between px-4 sm:px-8 bg-[#F4F7FE] z-10 sticky top-0 flex">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileOpen(true);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-2 rounded-xl bg-white shadow-sm hover:bg-gray-50 text-gray-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block h-6 w-px bg-gray-200 mx-2" />
            <h2 className="hidden sm:block text-2xl font-bold text-gray-900">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none pr-3">
                <Search size={18} className="text-gray-400 group-focus-within:text-brand-orange transition-colors" />
              </div>
              <input
                type="text"
                placeholder="بحث عام..."
                className="w-64 pl-4 pr-10 py-2.5 bg-white shadow-sm border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all text-gray-800"
              />
            </div>
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">إدارة منصة فيسورا</p>
                <p className="text-[10px] text-gray-500">admin@fisora.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-orange text-white font-bold flex items-center justify-center shadow-sm">
                إ
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
