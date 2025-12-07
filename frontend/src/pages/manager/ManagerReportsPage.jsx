/**
 * Copyright 2025 HaUI.DNK
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
      toast.error("Lỗi tải danh sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 👇 1. LOGIC DUYỆT THẬT (Dùng API PUT)
  const handleVerify = async (id) => {
    try {
      await reportService.verifyReport(id);

      // Cập nhật state ngay lập tức để giao diện phản hồi nhanh
      setReports((prevReports) =>
        prevReports.map((r) => (r.id === id ? { ...r, status: "VERIFIED" } : r))
      );

      toast.success("Đã xác nhận phản ánh! (Đã hiện lên bản đồ)");
    } catch (error) {
      console.error("Lỗi duyệt:", error);
      toast.error("Không thể duyệt báo cáo này.");
    }
  };

  // Logic Xóa (Giữ nguyên như cũ)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn?")) return;
    try {
      await reportService.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Đã xóa thành công!");
    } catch (error) {
      toast.error("Lỗi xóa báo cáo.");
    }
  };

  return (
    <div className="text-slate-100 font-sans pb-10">
      {/* Header giữ nguyên */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách Phản ánh từ Cộng đồng</h1>
        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2">
          <Filter size={16} /> Lọc trạng thái
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người báo / SĐT</th>
                <th className="px-6 py-4">Trạng thái</th>{" "}
                {/* Thêm cột trạng thái cho rõ */}
                <th className="px-6 py-4">Nội dung</th>
                <th className="px-6 py-4">Vị trí</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-slate-500 italic"
                  >
                    Chưa có phản ánh nào.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {report.time
                          ? new Date(report.time).toLocaleString("vi-VN")
                          : "Vừa xong"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">Người dân</div>
                      <div className="flex items-center gap-1 text-blue-400 text-xs mt-1">
                        <Phone size={12} /> {report.phone || "N/A"}
                      </div>
                    </td>

                    {/* 👇 Cột Trạng thái & Loại */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                            report.type === "FLOOD"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          }`}
                        >
                          {report.type === "FLOOD" ? "NGẬP LỤT" : "SẠT LỞ"}
                        </span>
                        {/* Hiển thị trạng thái VERIFIED/PENDING */}
                        {report.status === "VERIFIED" && (
                          <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle size={10} /> Đã duyệt
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      className="px-6 py-4 max-w-xs truncate text-slate-300"
                      title={report.desc}
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
                        {/* 👇 Chỉ hiện nút Duyệt nếu chưa duyệt */}
                        {report.status !== "VERIFIED" && (
                          <button
                            onClick={() => handleVerify(report.id)}
                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="Duyệt tin này"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

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
