/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
      <div className="bg-red-100 p-4 rounded-full mb-6">
        <ShieldAlert size={64} className="text-red-500" />
      </div>
      <h1 className="text-4xl font-black text-slate-800 mb-2">
        403 - Cấm truy cập!
      </h1>
      <p className="text-slate-500 text-lg mb-8 max-w-md">
        Xin lỗi, bạn không có quyền truy cập vào khu vực này. Đây là khu vực
        dành riêng cho Quản lý.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transition-all"
      >
        Quay về Trang chủ
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
