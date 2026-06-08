import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="min-h-[70vh] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-4xl leading-none">⛔</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100">
              لا تملك صلاحية الوصول
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              تم منعك من الوصول إلى هذه الصفحة. في حال كنت تعتقد أن ذلك خطأ، تواصل مع المسؤول لتحديث صلاحيات حسابك.
            </p>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-center">
            <div className="text-xs text-rose-200 font-semibold">Security</div>
            <div className="mt-1 text-xl font-extrabold text-rose-200">DENIED</div>
          </div>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 font-semibold hover:brightness-110 transition shadow"
          >
            العودة إلى لوحة التحكم
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-slate-100 font-semibold hover:bg-white/10 transition"
          >
            رجوع
          </button>
        </div>

        <div className="mt-6 text-xs text-slate-500 leading-relaxed">
          * يتم تطبيق الصلاحيات على مستوى المسار والخدمة لضمان عدم تجاوزها عبر تعديل الواجهة.
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;

