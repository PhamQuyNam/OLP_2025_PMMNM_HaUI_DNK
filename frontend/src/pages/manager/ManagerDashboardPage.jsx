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
import {
  AlertTriangle,
  Droplets,
  BellRing,
  Activity as ActivityIcon,
  CloudRain,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  YAxis,
  Cell,
} from "recharts";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toast

// Import Components & Services
import DashboardMap from "../../components/manager/DashboardMap";
import weatherService from "../../services/weatherService";
import reportService from "../../services/reportService";
import safetyService from "../../services/safetyService"; // Import Safety Service

// Dữ liệu giả cho biểu đồ Diễn biến
const MOCK_HISTORY_RAIN = [
  { time: "01:00", mm: 2 },
  { time: "05:00", mm: 15 },
  { time: "09:00", mm: 45 },
  { time: "13:00", mm: 30 },
  { time: "17:00", mm: 10 },
  { time: "21:00", mm: 5 },
];

const ManagerDashboardPage = () => {
  // --- 1. KHAI BÁO STATE ---
  const [weatherStations, setWeatherStations] = useState([]);
  const [reports, setReports] = useState([]);
  const [sosSignals, setSosSignals] = useState([]); // State chứa SOS
  const [geoJsonData, setGeoJsonData] = useState(null);

  const [stats, setStats] = useState({
    avgRain: 0,
    warningCount: 0,
    maxRainStation: "---",
    maxRainValue: 0,
  });

  // --- 2. GỌI API THỜI TIẾT (Real-time) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await weatherService.getRealtimeStations();
        if (Array.isArray(data)) {
          setWeatherStations(data);

          // Tính toán thống kê
          const totalRain = data.reduce((sum, s) => sum + s.rain, 0);
          const warnings = data.filter((s) => s.status !== "SAFE").length;
          const maxStation = data.reduce(
            (prev, current) => (prev.rain > current.rain ? prev : current),
            { name: "---", rain: 0 }
          );

          setStats({
            avgRain: data.length > 0 ? (totalRain / data.length).toFixed(1) : 0,
            warningCount: warnings,
            maxRainStation:
              maxStation.rain > 0 ? maxStation.name : "Trời tạnh ráo",
            maxRainValue: maxStation.rain,
          });
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu thời tiết:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Cập nhật mỗi 30s
    return () => clearInterval(interval);
  }, []);

  // --- 3. GỌI API BÁO CÁO (Reports) ---
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getAllReports();
        if (Array.isArray(data)) {
          setReports(data);
        }
      } catch (error) {
        console.error("Lỗi lấy báo cáo:", error);
      }
    };
    fetchReports();
    const interval = setInterval(fetchReports, 10000); // Cập nhật mỗi 10s
    return () => clearInterval(interval);
  }, []);

  // --- 4. GỌI API SOS (Safety Service) ---
  useEffect(() => {
    const fetchSos = async () => {
      try {
        const data = await safetyService.getActiveSOS();
        if (Array.isArray(data)) {
          setSosSignals(data);
        }
      } catch (error) {
        console.error("Lỗi tải SOS:", error);
      }
    };

    fetchSos();
    const interval = setInterval(fetchSos, 5000); // Quét SOS liên tục 5s (Ưu tiên cao)
    return () => clearInterval(interval);
  }, []);

  // --- 5. GỌI API BẢN ĐỒ (Ranh giới) ---
  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: "Thành phố Hà Tĩnh",
              countrycodes: "vn",
              polygon_geojson: 1,
              format: "json",
              limit: 1,
            },
          }
        );
        if (res.data?.[0]) setGeoJsonData(res.data[0].geojson);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBoundary();
  }, []);

  // --- 6. HÀM XỬ LÝ: XÁC NHẬN ĐÃ CỨU HỘ ---
  const handleResolveSos = async (id) => {
    if (!window.confirm("Xác nhận đã giải cứu nạn nhân này thành công?"))
      return;

    try {
      await safetyService.resolveSOS(id);
      // Optimistic UI Update: Xóa ngay khỏi list hiển thị
      setSosSignals((prev) => prev.filter((s) => s.id !== id));
      toast.success("Đã cập nhật trạng thái: GIẢI CỨU THÀNH CÔNG!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật trạng thái.");
    }
  };

  // --- 7. LOGIC LỌC DỮ LIỆU ---
  const verifiedReports = reports.filter((r) => r.status === "VERIFIED");

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-20">
      {/* === 1. THẺ CHỈ SỐ === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lượng mưa TB"
          value={stats.avgRain}
          unit="mm"
          icon={Droplets}
          color="bg-blue-500"
          trend="Real-time"
          trendUp={true}
        />
        <StatCard
          title="Trạm đang mưa"
          value={stats.warningCount}
          unit="Trạm"
          icon={CloudRain}
          color={stats.warningCount > 0 ? "bg-amber-500" : "bg-emerald-500"}
          trend={stats.warningCount > 0 ? "Đang mưa" : "Tạnh ráo"}
          trendUp={stats.warningCount > 0}
        />

        {/* CARD SOS KHẨN CẤP (Cập nhật số lượng thật) */}
        <StatCard
          title="SOS Khẩn cấp"
          value={sosSignals.length}
          unit="Ca"
          icon={BellRing}
          // Nếu có SOS -> Màu đỏ nhấp nháy, Không có -> Màu cam tĩnh
          color={
            sosSignals.length > 0 ? "bg-red-600 animate-pulse" : "bg-orange-500"
          }
          trend={sosSignals.length > 0 ? "CẦN ỨNG CỨU NGAY" : "Bình thường"}
          trendUp={false}
        />

        <StatCard
          title={
            stats.maxRainValue > 0 ? "Mưa lớn nhất tại" : "Tình hình chung"
          }
          value={stats.maxRainStation}
          unit={stats.maxRainValue > 0 ? `${stats.maxRainValue}mm` : ""}
          icon={ActivityIcon}
          color={stats.maxRainValue > 0 ? "bg-cyan-500" : "bg-emerald-500"}
          trend="Theo dõi"
          trendUp={true}
          isLongText={true}
        />
      </div>

      {/* === 2. BẢN ĐỒ + 2 BIỂU ĐỒ === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Bản đồ (Chiếm 8 phần) */}
        <div className="lg:col-span-8 h-full min-h-0">
          <DashboardMap
            stations={weatherStations}
            reports={verifiedReports}
            geoJsonData={geoJsonData}
            // 👇 Props mới cho SOS
            sosSignals={sosSignals}
            onResolveSos={handleResolveSos}
          />
        </div>

        {/* Cột phải (Chiếm 4 phần) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
          {/* Biểu đồ 1: Diễn biến Mưa */}
          <div className="h-1/2 bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex flex-col min-h-0">
            <h3 className="font-bold text-sm mb-2 text-slate-300">
              Diễn biến Mưa
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HISTORY_RAIN}>
                  <defs>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mm"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRain)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biểu đồ 2: Mưa hiện tại (Scroll) */}
          <div className="h-1/2 bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex flex-col min-h-0 overflow-hidden">
            <h3 className="font-bold text-sm mb-2 text-slate-300">
              Mưa hiện tại (mm)
            </h3>
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-2">
              <div
                style={{
                  height: Math.max(200, weatherStations.length * 45) + "px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weatherStations}
                    layout="vertical"
                    margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
                    barCategoryGap={8}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      width={110}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val.length > 15 ? val.substring(0, 15) + "..." : val
                      }
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="rain"
                      radius={[0, 4, 4, 0]}
                      barSize={10}
                      background={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    >
                      {weatherStations.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.rain > 50 ? "#ef4444" : "#06b6d4"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === 3. BẢNG DỮ LIỆU + HƯỚNG DẪN === */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[400px]">
        {/* Bảng dữ liệu */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <ActivityIcon className="text-emerald-500" size={20} />
              <h3 className="font-bold text-lg text-white">
                Trạng thái Trạm đo mưa
              </h3>
            </div>
            <div className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300">
              Cập nhật: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-sm relative border-collapse">
              <thead className="bg-slate-900 text-slate-400 uppercase text-xs sticky top-0 z-10 shadow-lg ring-1 ring-slate-700/50">
                <tr>
                  <th className="px-6 py-4 bg-slate-900">Tên trạm</th>
                  <th className="px-6 py-4 bg-slate-900">Lượng mưa</th>
                  <th className="px-6 py-4 bg-slate-900">Tọa độ</th>
                  <th className="px-6 py-4 bg-slate-900">Trạng thái</th>
                  <th className="px-6 py-4 text-right bg-slate-900">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {weatherStations.length > 0 ? (
                  weatherStations.map((station) => (
                    <tr
                      key={station.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {station.name}
                      </td>
                      <td className="px-6 py-4 text-blue-400 font-bold">
                        {station.rain} mm
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                        {station.lat.toFixed(3)}, {station.lon.toFixed(3)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            station.status === "SAFE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {station.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs italic">
                        {station.message}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-slate-500 italic"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hướng dẫn chỉ số */}
        <div className="lg:col-span-1 h-full">
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl h-full overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-sm text-slate-300 mb-4">
              Hướng dẫn Chỉ số
            </h3>
            <div className="space-y-3">
              <LevelItem
                color="bg-emerald-500"
                level="Safe"
                desc="An toàn / Không mưa"
                range="0mm"
              />
              <LevelItem
                color="bg-red-600"
                level="Warning"
                desc="Mưa lớn / Ngập lụt"
                range="> 50mm"
                isAlert
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === SUB-COMPONENTS ===
const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
  trendUp,
  isLongText,
}) => (
  <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col h-full hover:border-slate-600 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white`}>
        <Icon size={24} />
      </div>
      <div
        className={`text-xs font-bold ${
          trendUp ? "text-emerald-400" : "text-slate-400"
        }`}
      >
        {trend}
      </div>
    </div>
    <p className="text-slate-400 text-sm">{title}</p>
    <div className="flex items-baseline gap-2 mt-1">
      <h4
        className={`${
          isLongText ? "text-lg md:text-xl truncate w-full" : "text-2xl"
        } font-bold text-white`}
        title={value}
      >
        {value}
      </h4>
      <span className="text-xs text-slate-500">{unit}</span>
    </div>
  </div>
);

const LevelItem = ({ color, level, desc, range, isAlert }) => (
  <div
    className={`flex items-center justify-between p-2 rounded-lg ${
      isAlert
        ? "bg-red-500/10 border border-red-500/20"
        : "hover:bg-slate-700/30"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-2 h-8 rounded-full ${color}`}></div>
      <div>
        <p
          className={`text-xs font-bold ${
            isAlert ? "text-red-400" : "text-slate-200"
          }`}
        >
          {level}
        </p>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
    </div>
    <span className="text-xs font-mono text-slate-400">{range}</span>
  </div>
);

export default ManagerDashboardPage;
