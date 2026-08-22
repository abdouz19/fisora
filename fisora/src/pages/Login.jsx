import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Sparkles, ShieldCheck, Video, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, session } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Already signed in → go straight to the dashboard
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) {
      setError('بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.');
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row text-gray-900 overflow-hidden" dir="rtl">
      {/* Left Panel - Modern Branding & Hero Showcase */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden items-center justify-center p-12 bg-brand-gradient shadow-sm">
        {/* Background Ambient Glows & Geometric Patterns */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-brand-blue/20 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[350px] h-[350px] bg-brand-red/10 rounded-full filter blur-[90px] pointer-events-none" />

        {/* Geometric Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Brand Content Container */}
        <div className="relative z-10 max-w-xl text-right">


          {/* Fisora Main Brand Logo & Title */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              {/* Fisora Monogram Badge with Red/Orange Accent */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-gray-200 flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-black text-gray-900 tracking-tighter">F</span>
                <span className="absolute top-2 left-2 w-3 h-3 rounded-full bg-brand-orange shadow-sm" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight text-gray-900">
                  Fisora <span className="text-brand-orange font-semibold text-2xl">Agency</span>
                </h1>
                <p className="text-gray-500 text-base font-medium mt-0.5">
                  منصة إدارة الإنتاج المرئي وصنّاع المحتوى
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed font-normal">
              لوحة التحكم الشاملة لمتابعة المداخيل، المصاريف، الفريلانسرز، والباقات الإنتاجية بدقة فائقة وبطريقة عصرية.
            </p>
          </div>

          {/* Key Platform Highlights */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[
              { icon: Video, title: 'إنتاج المرئيات', desc: 'باقات Start, Echo, Impact, Présence' },
              { icon: Users, title: 'إدارة الفريلانسرز', desc: 'متابعة المستحقات والسحوبات' },
              { icon: ShieldCheck, title: 'إدارة العملاء', desc: 'حساب الأرباح والتقارير المالية' },
              { icon: Sparkles, title: 'تحليلات دقيقة', desc: 'مؤشرات أداء KPI لحظية' },
            ].map((item, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-4 border border-gray-200 flex items-start gap-3 hover:border-brand-orange/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/15 border border-brand-orange flex items-center justify-center text-brand-orange flex-shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Realtime Stats Pills */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
            <div>
              <div className="text-2xl font-black text-gray-900">100%</div>
              <div className="text-xs text-gray-500">دقة التحليلات المالية</div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <div className="text-2xl font-black text-brand-orange">4 باقات</div>
              <div className="text-xs text-gray-500">جاهزة للإنتاج المرئي</div>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div>
              <div className="text-2xl font-black text-blue-400">7 أدوار</div>
              <div className="text-xs text-gray-500">لصنّاع الفريلانسرز</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Ultra Modern Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12 relative bg-gray-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 border border-gray-200 flex items-center justify-center shadow-lg relative">
                <span className="text-2xl font-black text-gray-900">F</span>
                <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-brand-orange" />
              </div>
              <h1 className="text-3xl font-black text-gray-900">Fisora</h1>
            </div>
            <p className="text-gray-500 text-sm">منصة إدارة الإنتاج المرئي</p>
          </div>

          {/* Form Header */}
          <div className="mb-8 text-right">
            <h2 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm">أدخل بريدك الإلكتروني وكلمة المرور للوصول للوحة التحكم</p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left placeholder-white/20 focus:ring-2 focus:ring-brand-orange/40"
                placeholder="admin@fisora.com"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  كلمة المرور
                </label>
                <button type="button" className="text-xs text-brand-orange hover:text-gray-900 transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange text-gray-900 text-left placeholder-white/20 pl-12 focus:ring-2 focus:ring-brand-orange/40"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-brand-orange focus:ring-brand-orange/30"
                />
                <span className="text-sm text-gray-500">تذكر بيانات الدخول</span>
              </label>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 size={14} />
                <span>اتصال آمن SSL</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-brand-orange text-white font-extrabold text-base shadow-sm hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  <span>دخول إلى لوحة التحكم</span>
                </>
              )}
            </button>
          </form>

          {/* Copyright Footer */}
          <div className="mt-10 text-center text-xs text-gray-400">
            © 2026 Fisora Agency. جميع الحقوق محفوظة
          </div>
        </div>
      </div>
    </div>
  );
}
