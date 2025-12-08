/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Droplets,
  BellRing,
  Activity as ActivityIcon,
  CloudRain,
  MapPin,
  ChevronDown,
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
import { toast } from "react-toastify";

// Import Components & Services
import DashboardMap from "../../components/manager/DashboardMap";
import weatherService from "../../services/weatherService";
import reportService from "../../services/reportService";
import safetyService from "../../services/safetyService";

// --- CẤU HÌNH THÀNH PHỐ (Giống bên dân) ---
const CITIES = [
  {
    id: "hatinh",
    name: "TP. Hà Tĩnh",
    query: "Thành phố Hà Tĩnh",
    center: [18.3436, 105.9002],
  },
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    query: "Ho Chi Minh City",
    center: [10.8231, 106.6297],
  },
  {
    id: "thainguyen",
    name: "TP. Thái Nguyên",
    query: "Thành phố Thái Nguyên",
    center: [21.5942, 105.8481],
  },
];

const ManagerDashboardPage = () => {
  // State quản lý thành phố đang chọn
  const [activeCity, setActiveCity] = useState(CITIES[0]);

  // State dữ liệu gốc (Raw Data từ API)
  const [allWeatherStations, setAllWeatherStations] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [allSosSignals, setAllSosSignals] = useState([]);

  // State dữ liệu hiển thị (Đã lọc theo thành phố)
  const [filteredData, setFilteredData] = useState({
    stations: [],
    reports: [],
    sos: [],
    stats: {
      avgRain: 0,
      warningCount: 0,
      maxRainStation: "---",
      maxRainValue: 0,
    },
    historyRain: [], // Dữ liệu biểu đồ (Mock động)
  });

  const [geoJsonData, setGeoJsonData] = useState(null);

  // State để điều khiển bản đồ bay
  const location = useLocation();
  const [flyToCoords, setFlyToCoords] = useState(null);

  // --- 1. XỬ LÝ ĐIỀU HƯỚNG TỪ TRANG KHÁC TỚI ---
  useEffect(() => {
    if (location.state?.focusLocation) {
      setFlyToCoords(location.state.focusLocation);
      // Tự động tìm thành phố gần nhất với điểm focus để switch sang
      const focusLat = location.state.focusLocation[0];
      const bestCity = CITIES.find(
        (city) => Math.abs(city.center[0] - focusLat) < 1
      );
      if (bestCity && bestCity.id !== activeCity.id) {
        setActiveCity(bestCity);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- 2. GỌI API (Lấy tất cả dữ liệu) ---
  const fetchAllData = async () => {
    try {
      const [weatherRes, reportRes, sosRes] = await Promise.all([
        weatherService.getRealtimeStations(),
        reportService.getAllReports(),
        safetyService.getActiveSOS(),
      ]);

      if (Array.isArray(weatherRes)) setAllWeatherStations(weatherRes);
      if (Array.isArray(reportRes)) setAllReports(reportRes);
      if (Array.isArray(sosRes)) setAllSosSignals(sosRes);
    } catch (error) {
      console.error("Lỗi tải dữ liệu tổng hợp:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // 10s cập nhật 1 lần
    return () => clearInterval(interval);
  }, []);

  // --- 3. FETCH RANH GIỚI KHI ĐỔI THÀNH PHỐ ---
  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        setGeoJsonData(null); // Reset để kích hoạt hiệu ứng zoom lại
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: activeCity.query,
              countrycodes: "vn",
              polygon_geojson: 1,
              format: "json",
              limit: 1,
            },
          }
        );
        if (response.data?.[0]) {
          setGeoJsonData(response.data[0].geojson);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBoundary();
  }, [activeCity]);

  // --- 4. LOGIC BỘ LỌC THÔNG MINH (Filter Engine) ---
  useEffect(() => {
    // Hàm kiểm tra xem điểm có thuộc thành phố đang chọn không (Bán kính ~50km)
    // 1 độ vĩ độ ~ 111km. Lấy ngưỡng 0.5 độ là an toàn.
    const isInCity = (lat, lon) => {
      if (!lat || !lon) return false;
      const latDiff = Math.abs(lat - activeCity.center[0]);
      const lonDiff = Math.abs(lon - activeCity.center[1]);
      return latDiff < 1.0 && lonDiff < 1.0;
    };

    // 4.1 Lọc dữ liệu
    const cityStations = allWeatherStations.filter((s) =>
      isInCity(s.lat, s.lon)
    );
    const cityReports = allReports.filter(
      (r) => r.status === "VERIFIED" && isInCity(r.lat, r.lon)
    );
    const citySos = allSosSignals.filter((s) => isInCity(s.lat, s.lon));

    // 4.2 Tính toán thống kê mới
    const totalRain = cityStations.reduce((sum, s) => sum + s.rain, 0);
    const warnings = cityStations.filter((s) => s.status !== "SAFE").length;
    const maxStation = cityStations.reduce(
      (prev, current) => (prev.rain > current.rain ? prev : current),
      { name: "---", rain: 0 }
    );

    // 4.3 Tạo dữ liệu biểu đồ giả lập (Mock) cho sinh động
    // Mỗi thành phố sẽ có một "kiểu mưa" khác nhau dựa trên ID của nó
    const baseRain =
      activeCity.id === "hcm" ? 50 : activeCity.id === "hatinh" ? 20 : 10;
    const mockHistory = [
      { time: "01:00", mm: Math.max(0, baseRain - 10 + Math.random() * 10) },
      { time: "05:00", mm: Math.max(0, baseRain + Math.random() * 20) },
      { time: "09:00", mm: Math.max(0, baseRain + 20 + Math.random() * 30) }, // Đỉnh điểm
      { time: "13:00", mm: Math.max(0, baseRain + 10 + Math.random() * 10) },
      { time: "17:00", mm: Math.max(0, baseRain - 5 + Math.random() * 10) },
      { time: "21:00", mm: Math.max(0, baseRain - 15 + Math.random() * 5) },
    ];

    setFilteredData({
      stations: cityStations,
      reports: cityReports,
      sos: citySos,
      stats: {
        avgRain:
          cityStations.length > 0
            ? (totalRain / cityStations.length).toFixed(1)
            : 0,
        warningCount: warnings,
        maxRainStation: maxStation.rain > 0 ? maxStation.name : "Tạnh ráo",
        maxRainValue: maxStation.rain,
      },
      historyRain: mockHistory,
    });
  }, [activeCity, allWeatherStations, allReports, allSosSignals]);

  // Hàm xử lý SOS (Giữ nguyên)
  const handleResolveSos = async (id) => {
    if (!window.confirm("Xác nhận đã giải cứu nạn nhân này thành công?"))
      return;
    try {
      await safetyService.resolveSOS(id);
      // Update local state để UI phản hồi ngay
      setAllSosSignals((prev) => prev.filter((s) => s.id !== id));
      toast.success("Đã cập nhật trạng thái: GIẢI CỨU THÀNH CÔNG!");
    } catch (error) {
      toast.error("Lỗi cập nhật.");
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-20 relative">
      {/* === HEADER CÓ DROPDOWN === */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Trung tâm Điều hành
          </h2>
          <p className="text-slate-400 text-sm">
            Giám sát số liệu thời gian thực
          </p>
        </div>

        {/* Dropdown Chọn Thành Phố (Style Kính mờ + Hover) */}
        <div className="relative z-50 group">
          {/* 1. NÚT TRIGGER (Hiển thị tên TP đang chọn) */}
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur border border-slate-600 rounded-xl p-2 pr-4 shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <MapPin size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Khu vực
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{activeCity.name}</span>
                <ChevronDown
                  size={14}
                  className="text-slate-400 group-hover:rotate-180 transition-transform duration-300"
                />
              </div>
            </div>
          </div>

          {/* 2. DANH SÁCH THẢ XUỐNG */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
            <div className="py-1">
              {CITIES.map((city) => (
                <div
                  key={city.id}
                  onClick={() => setActiveCity(city)}
                  className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-50 last:border-0
                    ${
                      activeCity.id === city.id
                        ? "bg-primary/10"
                        : "hover:bg-slate-50"
                    }
                  `}
                >
                  {/* Icon chỉ thị */}
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activeCity.id === city.id ? "bg-primary" : "bg-slate-300"
                    }`}
                  ></div>

                  {/* Tên thành phố (Màu đen rõ ràng) */}
                  <span
                    className={`text-sm font-bold ${
                      activeCity.id === city.id
                        ? "text-primary"
                        : "text-slate-700"
                    }`}
                  >
                    {city.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === 1. THẺ CHỈ SỐ (Dùng filteredData) === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lượng mưa TB"
          value={filteredData.stats.avgRain}
          unit="mm"
          icon={Droplets}
          color="bg-blue-500"
          trend="Real-time"
          trendUp={true}
        />
        <StatCard
          title="Trạm đang mưa"
          value={filteredData.stats.warningCount}
          unit="Trạm"
          icon={CloudRain}
          color={
            filteredData.stats.warningCount > 0
              ? "bg-amber-500"
              : "bg-emerald-500"
          }
          trend={filteredData.stats.warningCount > 0 ? "Đang mưa" : "Tạnh ráo"}
          trendUp={filteredData.stats.warningCount > 0}
        />

        {/* Card SOS */}
        <StatCard
          title="SOS Khẩn cấp"
          value={filteredData.sos.length}
          unit="Ca"
          icon={BellRing}
          color={
            filteredData.sos.length > 0
              ? "bg-red-600 animate-pulse"
              : "bg-orange-500"
          }
          trend={
            filteredData.sos.length > 0 ? "CẦN ỨNG CỨU NGAY" : "Bình thường"
          }
          trendUp={false}
        />

        <StatCard
          title={
            filteredData.stats.maxRainValue > 0
              ? "Mưa lớn nhất tại"
              : "Tình hình chung"
          }
          value={filteredData.stats.maxRainStation}
          unit={
            filteredData.stats.maxRainValue > 0
              ? `${filteredData.stats.maxRainValue}mm`
              : ""
          }
          icon={ActivityIcon}
          color={
            filteredData.stats.maxRainValue > 0
              ? "bg-cyan-500"
              : "bg-emerald-500"
          }
          trend="Theo dõi"
          trendUp={true}
          isLongText={true}
        />
      </div>

      {/* === 2. BẢN ĐỒ + BIỂU ĐỒ === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Bản đồ (8 phần) */}
        <div className="lg:col-span-8 h-full min-h-0">
          <DashboardMap
            stations={filteredData.stations} // Truyền trạm đã lọc
            reports={filteredData.reports} // Truyền báo cáo đã lọc
            sosSignals={filteredData.sos} // Truyền SOS đã lọc
            geoJsonData={geoJsonData} // Ranh giới mới
            onResolveSos={handleResolveSos}
            flyToLocation={flyToCoords}
          />
        </div>

        {/* Biểu đồ (4 phần) */}
        {/* Cột phải (Chiếm 4 phần) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
          {/* --- BIỂU ĐỒ 1: DIỄN BIẾN MƯA --- */}
          <div className="h-1/2 bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex flex-col min-h-0">
            <h3 className="font-bold text-sm mb-2 text-slate-300">
              Diễn biến Mưa ({activeCity.name})
            </h3>
            {/* 👇 SỬA Ở ĐÂY: Thêm w-full h-full và min-h */}
            <div className="flex-1 w-full h-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData.historyRain}>
                  {/* ... (Giữ nguyên nội dung bên trong AreaChart) ... */}
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

          {/* --- BIỂU ĐỒ 2: MƯA HIỆN TẠI --- */}
          <div className="h-1/2 bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex flex-col min-h-0 overflow-hidden">
            <h3 className="font-bold text-sm mb-2 text-slate-300">
              Mưa hiện tại (mm)
            </h3>
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-2">
              {/* 👇 SỬA Ở ĐÂY: Đảm bảo chiều cao luôn > 0 */}
              <div
                style={{
                  height:
                    Math.max(200, filteredData.stations.length * 45) + "px",
                  width: "100%",
                }}
              >
                {filteredData.stations.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredData.stations}
                      layout="vertical"
                      margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
                      barCategoryGap={8}
                    >
                      {/* ... (Giữ nguyên nội dung bên trong BarChart) ... */}
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
                        {filteredData.stations.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.rain > 50 ? "#ef4444" : "#06b6d4"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 text-sm mt-10">
                    Không có dữ liệu trạm
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === 3. BẢNG DỮ LIỆU === */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[400px]">
        {/* Bảng dữ liệu (Chiếm 3 phần) */}
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
                {filteredData.stations.length > 0 ? (
                  filteredData.stations.map((station) => (
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
                      Khu vực này chưa có trạm đo
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
