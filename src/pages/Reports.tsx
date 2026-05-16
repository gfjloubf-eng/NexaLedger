import React from 'react';
import StatsCard from '../components/StatsCard';
import DashboardCard from '../components/DashboardCard';

const Reports: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          التقارير والإحصائيات
        </h1>
        <div className="flex space-x-4">
          <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
            هذا الشهر
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            هذا العام
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatsCard label="إجمالي الدخل" value="45,800 ر.س" change="+18%" isPositive />
        <StatsCard label="إجمالي النفقات" value="22,400 ر.س" change="+5%" />
        <StatsCard label="صافي الربح" value="23,400 ر.س" change="+25%" isPositive />
        <StatsCard label="معدل التوفير" value="51%" change="+3%" isPositive />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard title="توزيع النفقات" gradientBg="from-purple-500 to-pink-600" iconColor="text-purple-500" borderHover="border-purple-200">
          <svg viewBox="0 0 20 20" className="w-16 h-16 mb-4">
            <path fill="currentColor" d="M2 11a1 1 0 011-1h12a1 1 0 110 2H3a1 1 0 01-1-1zm0-4a1 1 0 011-1h6a1 1 0 110 2H3a1 1 0 01-1-1zm0 8a1 1 0 011-1h12a1 1 0 110 2H3a1 1 0 01-1-1z" />
          </svg>
          <p className="text-gray-600 mt-2">توزيع النفقات حسب الفئات خلال الشهر الحالي</p>
        </DashboardCard>

        <DashboardCard title="الاتجاه الزمني" gradientBg="from-orange-500 to-red-500" iconColor="text-orange-500" borderHover="border-orange-200">
          <svg viewBox="0 0 20 20" className="w-16 h-16 mb-4">
            <path fill="currentColor" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 mt-2">تطور الرصيد والإنفاق خلال 12 شهراً</p>
        </DashboardCard>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900">النشاط الأخير</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { date: 'اليوم', activity: 'تم تحديث فئة الطعام', trend: '↗️' },
            { date: 'أمس', activity: 'إضافة حساب جديد', trend: '➡️' },
            { date: '2 أيام', activity: 'استيراد معاملات بنك', trend: '↗️' },
          ].map((item, idx) => (
            <div key={idx} className="px-8 py-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <div>
                  <p className="font-medium text-gray-900">{item.activity}</p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                </div>
              </div>
              <span className="text-green-600 font-medium">{item.trend}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
