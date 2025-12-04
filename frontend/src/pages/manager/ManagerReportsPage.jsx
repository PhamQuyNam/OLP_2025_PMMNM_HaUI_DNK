/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
import { useEffect, useState } from "react";
import reportService from "../../services/reportService";
import {
  Phone,
  MapPin,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";

const ManagerReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm load dữ liệu
  const fetchReports = async () => {
    try {
      const data = await reportService.getAllReports();
      if (Array.isArray(data)) setReports(data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // Polling tự động cập nhật mỗi 15 giây (tùy chọn)
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, []);

  // 👇 HÀM XỬ LÝ XÓA THẬT (Đã cập nhật)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa báo cáo này vĩnh viễn?")) {
      return;
    }

    try {
      // 1. Gọi API Xóa thật
      await reportService.deleteReport(id);

      // 2. Nếu thành công (không lọt vào catch), xóa trên giao diện
      setReports((prev) => prev.filter((report) => report.id !== id));
      toast.success("Đã xóa báo cáo thành công!");
    } catch (error) {
      console.error("Xóa thất bại:", error);
      // Hiển thị lỗi từ Backend nếu có
      const msg = error.response?.data?.message || "Không thể xóa báo cáo này.";
      toast.error(msg);
    }
  };

  return (
    <div className="text-slate-100 font-sans pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách Báo cáo Cộng đồng</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2 transition-colors">
            <Filter size={16} /> Lọc trạng thái
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người báo / SĐT</th>
                <th className="px-6 py-4">Loại sự cố</th>
                <th className="px-6 py-4">Nội dung chi tiết</th>
                <th className="px-6 py-4">Vị trí</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-slate-500 italic"
                  >
                    Chưa có báo cáo nào.
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr
                    key={report.id || index}
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {report.time
                          ? new Date(report.time).toLocaleString("vi-VN")
                          : "Vừa xong"}
                      </div>
                    </td>

                    {/* 👇 CỘT SĐT (Đã sửa lại gọn gàng vì có dữ liệu thật) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">
                          Người dân
                        </span>
                        <div className="flex items-center gap-1.5 text-blue-400 font-mono text-sm mt-0.5">
                          <Phone size={12} />
                          {/* Hiển thị trực tiếp, fallback nếu null */}
                          {report.phone || (
                            <span className="text-slate-600 italic">
                              Không có SĐT
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          report.type === "FLOOD"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                        }`}
                      >
                        {report.type === "FLOOD" ? "🌊 Ngập lụt" : "⛰️ Sạt lở"}
                      </span>
                    </td>

                    <td
                      className="px-6 py-4 max-w-xs truncate text-slate-300"
                      title={report.desc || report.description}
                    >
                      {report.desc || report.description}
                    </td>

                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-1 bg-slate-900/50 w-fit px-2 py-1 rounded">
                        <MapPin size={12} />
                        {Number(report.lat).toFixed(4)},{" "}
                        {Number(report.lon).toFixed(4)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="Xác nhận xử lý"
                        >
                          <CheckCircle size={18} />
                        </button>

                        {/* Nút Xóa gọi hàm handleDelete */}
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Xóa vĩnh viễn"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerReportsPage;
