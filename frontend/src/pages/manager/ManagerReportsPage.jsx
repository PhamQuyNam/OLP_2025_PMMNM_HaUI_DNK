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

const ManagerReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchReports();
  }, []);

  return (
    <div className="text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách Báo cáo Cộng đồng</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center gap-2">
            <Filter size={16} /> Lọc trạng thái
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
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
                  <td colSpan="6" className="text-center py-8">
                    Đang tải...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    Chưa có báo cáo nào.
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {report.time
                          ? new Date(report.time).toLocaleString()
                          : "Vừa xong"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">Người dân</div>
                      <div className="flex items-center gap-1 text-blue-400 text-xs mt-1">
                        <Phone size={12} /> {report.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          report.type === "FLOOD"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {report.type === "FLOOD" ? "Ngập lụt" : "Sạt lở"}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 max-w-xs truncate"
                      title={report.desc || report.description}
                    >
                      {report.desc || report.description}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        {Number(report.lat).toFixed(4)},{" "}
                        {Number(report.lon).toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="p-2 hover:bg-emerald-500/20 text-emerald-500 rounded transition-colors"
                          title="Xác minh"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                          title="Từ chối"
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
