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
import { toast } from "react-toastify"; // Import thêm Toast để báo kết quả

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 👇 HÀM XỬ LÝ XÓA BÁO CÁO
  const handleDelete = async (id) => {
    // 1. Hỏi xác nhận
    if (!window.confirm("Bạn có chắc muốn xóa báo cáo này?")) {
      return;
    }

    try {
      // 2. Gọi API xóa (Cứ gọi thử, có thể lỗi 404)
      await reportService.deleteReport(id);
      toast.success("Đã xóa báo cáo thành công!"); // Nếu BE có API thì chạy dòng này
    } catch (error) {
      console.warn("Backend chưa có API xóa, thực hiện xóa giả lập trên UI.");
      // 3. Nếu lỗi (do BE chưa làm), ta thông báo nhẹ
      toast.info("Đã ẩn báo cáo khỏi giao diện (Database chưa xóa).");
    } finally {
      // 4. QUAN TRỌNG: Dù thành công hay thất bại, TA VẪN XÓA KHỎI STATE
      // Việc này giúp icon tam giác trên bản đồ và dòng trong bảng biến mất ngay lập tức
      setReports((prev) => prev.filter((report) => report.id !== id));
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
                    {/* Cột Thời gian */}
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {report.time
                          ? new Date(report.time).toLocaleString("vi-VN")
                          : "Vừa xong"}
                      </div>
                    </td>

                    {/* 👇 Cột Người báo & SĐT (Đã sửa theo yêu cầu) */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base">
                          Người dân
                        </span>
                        <div className="flex items-center gap-1.5 text-blue-400 font-mono text-sm mt-0.5">
                          <Phone size={12} />
                          {report.phone || "Không có SĐT"}
                        </div>
                      </div>
                    </td>

                    {/* Cột Loại sự cố */}
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

                    {/* Cột Nội dung */}
                    <td
                      className="px-6 py-4 max-w-xs truncate text-slate-300"
                      title={report.desc || report.description}
                    >
                      {report.desc || report.description}
                    </td>

                    {/* Cột Vị trí */}
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-1 bg-slate-900/50 w-fit px-2 py-1 rounded">
                        <MapPin size={12} />
                        {Number(report.lat).toFixed(4)},{" "}
                        {Number(report.lon).toFixed(4)}
                      </div>
                    </td>

                    {/* 👇 Cột Hành động (Nút X đỏ đã gắn logic xóa) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="Xác nhận xử lý"
                        >
                          <CheckCircle size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(report.id)} // Gọi hàm xóa
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Xóa báo cáo"
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
