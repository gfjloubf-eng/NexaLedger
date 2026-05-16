import React, { useState } from 'react';

const Hero: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <section className="text-center mb-20">
      <div className="relative mx-auto mb-12 max-w-md">
        <div className="w-48 h-48 mx-auto shadow-2xl rounded-3xl bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center text-4xl">
          💰
        </div>
      </div>
      <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 bg-clip-text text-transparent mb-6 leading-tight">
        مرحباً بك في NexaLedger
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed dir='rtl'">
        تطبيق إدارة المال الرقمي الأكثر أناقة وأماناً. تتبع معاملاتك، تحليلاتك، وأهدافك المالية بسهولة وأناقة.
      </p>
      <button
        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-12 py-6 rounded-2xl text-xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        onClick={() => setCount((c) => c + 1)}
        aria-label="زيادة العداد"
      >
        ابدأ الآن - {count}
      </button>
    </section>
  );
};

export default Hero;

