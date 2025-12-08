/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
 */
import { useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import safetyService from "../../services/safetyService";
import { useNavigate } from "react-router-dom";
const ManagerSosPage = () => {
  const [sosList, setSosList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // Các trạng thái: ALL, ACTIVE, RESCUED
  const navigate = useNavigate();

  // Thêm hàm xử lý khi bấm vào vị trí
  const handleLocateOnMap = (sos) => {
    // Chuyển hướng về trang Dashboard (/manager)
    // Và gửi kèm "state" chứa thông tin cần focus
    navigate("/manager", {
      state: {
        focusLocation: [sos.lat, sos.lon],
        focusId: sos.id,
      },
    });
  };
  // Hàm tải dữ liệu lịch sử
  const fetchHistory = async () => {
    try {
      // 👇 GỌI API MỚI: Lấy tất cả (Cả Active và Rescued)
      const data = await safetyService.getAllSOS();

      if (Array.isArray(data)) {
        // Sắp xếp: Mới nhất lên đầu
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setSosList(sorted);
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử SOS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải dữ liệu khi vào trang và tự động refresh mỗi 5s
  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý nút "Xác nhận cứu"
  const handleResolve = async (id) => {
    if (!window.confirm("Xác nhận đã giải cứu nạn nhân này?")) return;
    try {
      // 1. Gọi API cập nhật trạng thái
      await safetyService.resolveSOS(id);

      // 2. Cập nhật giao diện ngay lập tức (Optimistic UI)
      setSosList((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, status: "RESCUED" } : item
        )
      );

      toast.success("Đã cập nhật: Cứu hộ thành công!");

      // 3. Load lại dữ liệu thật để đồng bộ
      fetchHistory();
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái.");
    }
  };

  // Logic lọc danh sách hiển thị
  const filteredList = sosList.filter((item) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  // Đếm số lượng để hiển thị lên các nút lọc
  const activeCount = sosList.filter((i) => i.status === "ACTIVE").length;
  const rescuedCount = sosList.filter((i) => i.status === "RESCUED").length;

  return (
    <div className="text-slate-100 font-sans pb-20">
      {/* === HEADER === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
            <ShieldAlert className="text-red-500 animate-pulse" size={32} />
            Quản lý Cứu hộ & SOS
          </h1>
          <p className="text-slate-400 text-sm mt-1 ml-11">
            Nhật ký tiếp nhận và xử lý sự cố khẩn cấp.
          </p>
        </div>

        {/* Bộ lọc nhanh */}
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-lg">
          <FilterButton
            label="Tất cả"
            count={sosList.length}
            isActive={filter === "ALL"}
            onClick={() => setFilter("ALL")}
          />
          <FilterButton
            label="Chưa xử lý"
            count={activeCount}
            isActive={filter === "ACTIVE"}
            color="text-red-400"
            activeColor="bg-red-600 text-white shadow-red-500/20"
            onClick={() => setFilter("ACTIVE")}
          />
          <FilterButton
            label="Đã cứu"
            count={rescuedCount}
            isActive={filter === "RESCUED"}
            color="text-emerald-400"
            activeColor="bg-emerald-600 text-white shadow-emerald-500/20"
            onClick={() => setFilter("RESCUED")}
          />
        </div>
      </div>

      {/* === TABLE === */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4">ID / Thời gian</th>
                <th className="px-6 py-4">Người dân</th>
                <th className="px-6 py-4 w-1/3">Tình trạng / Vị trí</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading && sosList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">
                    Đang đồng bộ dữ liệu...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-10 text-slate-500 italic"
                  >
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              ) : (
                filteredList.map((sos) => (
                  <tr
                    key={sos.id}
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    {/* Cột 1: ID & Thời gian */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-slate-500 text-xs mb-1">
                        #{sos.id}
                      </div>
                      <div className="flex items-center gap-2 text-slate-200 font-medium">
                        <Clock size={14} className="text-primary" />
                        {new Date(sos.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Cột 2: Thông tin liên hệ */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${
                            sos.status === "ACTIVE"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-emerald-500/20 text-emerald-500"
                          }`}
                        >
                          {sos.user_id ? `U${sos.user_id}` : "D"}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">
                            Người dân
                          </div>
                          <a
                            href={`tel:${sos.phone}`}
                            className="text-slate-400 text-xs flex items-center gap-1 hover:text-white hover:underline mt-0.5"
                          >
                            <Phone size={12} /> {sos.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Nội dung & Vị trí */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleLocateOnMap(sos)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-lg text-[10px] uppercase font-bold text-sky-400 hover:text-white hover:bg-sky-600 border border-slate-700 hover:border-sky-500 transition-all shadow-sm active:scale-95 group"
                        title="Xem trên bản đồ tác chiến"
                      >
                        <MapPin
                          size={12}
                          className="group-hover:animate-bounce"
                        />
                        {Number(sos.lat).toFixed(5)},{" "}
                        {Number(sos.lon).toFixed(5)}
                      </button>
                    </td>

                    {/* Cột 4: Trạng thái (Đỏ/Xanh) */}
                    <td className="px-6 py-4 text-center">
                      {sos.status === "ACTIVE" ? (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            CHƯA XỬ LÝ
                          </span>
                          <span className="text-[10px] text-red-400 font-medium">
                            Khẩn cấp
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle size={12} />
                            ĐÃ CỨU HỘ
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Hoàn thành
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Cột 5: Hành động */}
                    <td className="px-6 py-4 text-right">
                      {sos.status === "ACTIVE" ? (
                        <button
                          onClick={() => handleResolve(sos.id)}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-emerald-900/50 transition-all active:scale-95 flex items-center gap-2 ml-auto"
                        >
                          <CheckCircle size={16} />
                          Xác nhận cứu
                        </button>
                      ) : (
                        <span className="text-slate-600 text-xs italic pr-2">
                          Đã lưu hồ sơ
                        </span>
                      )}
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

// Component con: Nút lọc đẹp mắt
const FilterButton = ({
  label,
  count,
  isActive,
  onClick,
  color = "text-slate-400",
  activeColor = "bg-slate-700 text-white",
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
      isActive ? activeColor + " shadow-md" : color + " hover:bg-slate-700/50"
    }`}
  >
    {label}
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] min-w-[20px] text-center ${
        isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-400"
      }`}
    >
      {count}
    </span>
  </button>
);

export default ManagerSosPage;
