/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import reportService from "../../services/reportService";
import {
  MapPin,
  Send,
  AlertTriangle,
  Phone,
  FileText,
  Navigation,
  Clock,
  Waves,
  Mountain,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";

const CitizenReportPage = () => {
  const { user, userLocation, refreshLocation } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State danh sách báo cáo công khai
  const [publicReports, setPublicReports] = useState([]);

  // State của Form
  const [formData, setFormData] = useState({
    type: "FLOOD",
    description: "",
    phone: user?.phone || "",
    lat: "",
    lon: "",
  });

  // 1. Lấy vị trí GPS khi vào trang
  useEffect(() => {
    if (userLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: userLocation[0],
        lon: userLocation[1],
      }));
    } else {
      refreshLocation();
    }
  }, [userLocation, refreshLocation]);

  // 2. Load danh sách phản ánh công khai (API MỚI)
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const data = await reportService.getPublicReports();
        if (Array.isArray(data)) {
          // Sắp xếp mới nhất lên đầu
          const sorted = data.sort(
            (a, b) => new Date(b.time) - new Date(a.time)
          );
          setPublicReports(sorted);
        }
      } catch (error) {
        console.error("Lỗi tải tin cộng đồng:", error);
      }
    };

    fetchPublicData();
    // Auto refresh mỗi 10s để cập nhật nếu Admin xóa/duyệt
    const interval = setInterval(fetchPublicData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lon) {
      toast.error("Chưa xác định được vị trí. Vui lòng bật GPS!");
      refreshLocation();
      return;
    }
    setIsLoading(true);
    try {
      await reportService.createReport(formData);
      toast.success("Đã gửi phản ánh! Đang chờ Admin duyệt.");
      // Reset form text nhưng giữ lại vị trí/sđt
      setFormData((prev) => ({ ...prev, description: "" }));
    } catch (error) {
      toast.error("Gửi thất bại. Thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 HÀM BAY ĐẾN BẢN ĐỒ
  const handleFlyToMap = (lat, lon) => {
    navigate("/citizen", {
      state: {
        destination: [lat, lon], // Truyền tọa độ sang trang Map
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" />
            Phản Ánh Sự Cố & Cộng Đồng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Chung tay báo cáo và theo dõi các điểm nóng thiên tai.
          </p>
        </div>

        {/* CHIA CỘT: TRÁI FORM - PHẢI LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* === CỘT TRÁI: FORM GỬI === */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6 sticky top-20">
            <h2 className="font-bold text-lg text-slate-800 border-b pb-2 mb-2">
              Gửi tin mới
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Loại sự cố */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Loại hình
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.type === "FLOOD"
                        ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="FLOOD"
                      checked={formData.type === "FLOOD"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <Waves size={20} />
                    <span className="font-bold text-sm">Ngập lụt</span>
                  </label>

                  <label
                    className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.type === "LANDSLIDE"
                        ? "bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value="LANDSLIDE"
                      checked={formData.type === "LANDSLIDE"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <Mountain size={20} />
                    <span className="font-bold text-sm">Sạt lở đất</span>
                  </label>
                </div>
              </div>

              {/* Vị trí */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Vị trí GPS
                </label>
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    formData.lat
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <Navigation
                    size={20}
                    className={formData.lat ? "animate-pulse" : ""}
                  />
                  <div className="flex-1">
                    {formData.lat ? (
                      <p className="font-mono text-sm font-bold">
                        {Number(formData.lat).toFixed(6)},{" "}
                        {Number(formData.lon).toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-sm font-bold">Đang dò tìm GPS...</p>
                    )}
                  </div>
                  {!formData.lat && (
                    <button
                      type="button"
                      onClick={refreshLocation}
                      className="text-xs bg-white border border-red-300 px-2 py-1 rounded shadow-sm hover:bg-red-50"
                    >
                      Thử lại
                    </button>
                  )}
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Chi tiết
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="3"
                    placeholder="Mô tả hiện trường..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none text-sm"
                  ></textarea>
                </div>
              </div>

              {/* SĐT */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Liên hệ
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="SĐT..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.lat}
                className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <Send size={18} /> GỬI PHẢN ÁNH
                  </>
                )}
              </button>
            </form>
          </div>

          {/* === CỘT PHẢI: DANH SÁCH TỪ API === */}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800">
                Tin đã duyệt ({publicReports.length})
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">
                  Live
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {" "}
              {/* Giảm khoảng cách giữa các item */}
              {publicReports.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-slate-100 border-dashed">
                  <p className="text-slate-400 text-sm italic">
                    Chưa có tin nào được duyệt.
                  </p>
                </div>
              ) : (
                publicReports.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white px-3 py-2.5 rounded-lg border border-slate-100 shadow-sm hover:border-primary/30 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Phần trái: Icon + Nội dung */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Icon nhỏ gọn */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.type === "FLOOD"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {item.type === "FLOOD" ? (
                          <Waves size={16} />
                        ) : (
                          <Mountain size={16} />
                        )}
                      </div>

                      {/* Text: Dòng 1 (Loại + Time), Dòng 2 (Mô tả cắt ngắn) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {item.type === "FLOOD" ? "Ngập lụt" : "Sạt lở đất"}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                            •{" "}
                            {new Date(item.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p
                          className="text-xs text-slate-500 truncate pr-2"
                          title={item.desc || item.description}
                        >
                          {item.desc || item.description}
                        </p>
                      </div>
                    </div>

                    {/* Phần phải: Nút MapPin nhỏ */}
                    <button
                      onClick={() => handleFlyToMap(item.lat, item.lon)}
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-primary hover:text-white transition-colors border border-slate-100"
                      title="Xem vị trí"
                    >
                      <MapPin size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenReportPage;
