import { useState } from "react";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Viet Resilience Hub
        </h1>
        <p className="text-gray-600 mb-6">
          Hệ thống cảnh báo thiên tai & Dữ liệu mở (Vite + Tailwind)
        </p>
        <button className="bg-danger hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg">
          Test Nút SOS
        </button>
        <div className="mt-6 text-sm text-green-600 font-semibold bg-green-50 py-2 rounded-lg border border-green-200">
          ✅ Đã cài đặt thành công!
        </div>
      </div>
    </div>
  );
}

export default App;
