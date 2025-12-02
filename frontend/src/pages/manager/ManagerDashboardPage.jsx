import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Droplets,
  BellRing,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  MapPin,
  Clock,
  MoreHorizontal,
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

// Import Components & Services
import DashboardMap from "../../components/manager/DashboardMap";
import weatherService from "../../services/weatherService";
import reportService from "../../services/reportService";

const MOCK_HISTORY_RAIN = [
  { time: "01:00", mm: 2 },
  { time: "05:00", mm: 15 },
  { time: "09:00", mm: 45 },
  { time: "13:00", mm: 30 },
  { time: "17:00", mm: 10 },
  { time: "21:00", mm: 5 },
];

const ManagerDashboardPage = () => {
  const [weatherStations, setWeatherStations] = useState([]);
  const [reports, setReports] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);

  const [stats, setStats] = useState({
    avgRain: 0,
    warningCount: 0,
    maxRainStation: "---",
    maxRainValue: 0, // Thêm state lưu giá trị mưa lớn nhất
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await weatherService.getRealtimeStations();
        if (Array.isArray(data)) {
          setWeatherStations(data);

          const totalRain = data.reduce((sum, s) => sum + s.rain, 0);
          const warnings = data.filter((s) => s.status !== "SAFE").length;

          // Logic mới: Tìm trạm lớn nhất
          const maxStation = data.reduce(
            (prev, current) => (prev.rain > current.rain ? prev : current),
            { name: "---", rain: 0 }
          );

          setStats({
            avgRain: (totalRain / data.length).toFixed(1),
            warningCount: warnings,
            // 👇 LOGIC FIX: Nếu lượng mưa = 0 thì hiện "Không mưa"
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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  //2. useEffect mới: Lấy danh sách Báo cáo
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getAllReports();
        console.log("Dữ liệu báo cáo:", data);

        if (Array.isArray(data)) {
          setReports(data);

          // (Tùy chọn) Cập nhật số liệu vào thẻ StatCard "SOS Chờ xử lý"
          // Bạn có thể setStats tại đây nếu muốn số SOS nhảy realtime
        }
      } catch (error) {
        console.error("Lỗi lấy báo cáo:", error);
      }
    };

    fetchReports();
    // Gọi lại mỗi 10 giây để cập nhật nhanh
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  // Lấy bản đồ ranh giới
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

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-10">
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
          title="Điểm Cảnh báo"
          value={stats.warningCount}
          unit="Trạm"
          icon={AlertTriangle}
          color={stats.warningCount > 0 ? "bg-red-500" : "bg-emerald-500"}
          trend={stats.warningCount > 0 ? "Cần xử lý" : "An toàn"}
          trendUp={stats.warningCount > 0}
        />
        <StatCard
          title="SOS Chờ xử lý"
          value={reports.length} // Hiển thị số lượng thật
          unit="Tin"
          icon={BellRing}
          color="bg-orange-500"
          trend="Cần kiểm tra"
          trendUp={reports.length > 0}
        />
        {/* Thẻ Mưa lớn nhất: Hiện tên trạm hoặc thông báo tạnh ráo */}
        <StatCard
          title={
            stats.maxRainValue > 0 ? "Mưa lớn nhất tại" : "Tình hình chung"
          }
          value={stats.maxRainStation}
          unit={stats.maxRainValue > 0 ? `${stats.maxRainValue}mm` : ""}
          icon={Activity}
          color={stats.maxRainValue > 0 ? "bg-cyan-500" : "bg-emerald-500"}
          trend="Theo dõi"
          trendUp={true}
          isLongText={true}
        />
      </div>

      {/* === 2. BẢN ĐỒ & BIỂU ĐỒ === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        <div className="lg:col-span-2 h-full min-h-[400px]">
          <DashboardMap
            stations={weatherStations}
            reports={reports}
            geoJsonData={geoJsonData}
          />
        </div>

        <div className="flex flex-col gap-6 h-full">
          {/* Biểu đồ 1: Diễn biến (Mock) */}
          <div className="flex-1 bg-slate-800/50 border border-slate-700 p-5 rounded-2xl min-h-0 flex flex-col">
            <h3 className="font-bold text-sm mb-2 text-slate-300">
              Diễn biến Mưa (Dự báo)
            </h3>
            <div className="flex-1 w-full min-h-0">
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
                    }}
                    itemStyle={{ color: "#fff" }}
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

          {/* Biểu đồ 2: So sánh trạm (Real-time) */}
          <div className="flex-1 bg-slate-800/50 border border-slate-700 p-5 rounded-2xl min-h-0 flex flex-col">
            <h3 className="font-bold text-sm mb-2 text-slate-300">
              Mưa hiện tại theo Trạm (mm)
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weatherStations}
                  layout="vertical"
                  margin={{ left: 0, right: 20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={130}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) =>
                      val.length > 20 ? val.substring(0, 20) + "..." : val
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

                  {/* 👇 SỬA LỖI 2: Thêm background để hiện vệt mờ khi giá trị = 0 */}
                  <Bar
                    dataKey="rain"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                    background={{
                      fill: "rgba(255, 255, 255, 0.05)",
                      radius: [0, 4, 4, 0],
                    }} // Vệt mờ nền
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

      {/* === 3. BẢNG DỮ LIỆU === */}
      {/* (Giữ nguyên phần bảng bên dưới không đổi) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Activity className="text-emerald-500" size={20} />
              <h3 className="font-bold text-lg text-white">
                Trạng thái Trạm đo mưa
              </h3>
            </div>
            <div className="px-3 py-1 bg-slate-700 rounded text-xs text-slate-300">
              Cập nhật: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tên trạm</th>
                  <th className="px-6 py-4 font-semibold">Lượng mưa</th>
                  <th className="px-6 py-4 font-semibold">Tọa độ</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">
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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            station.status === "SAFE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {station.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-slate-500 text-xs italic">
                          {station.message}
                        </span>
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

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
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

// --- SUB-COMPONENTS (Giữ nguyên) ---
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
  <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-600 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white`}>
        <Icon size={24} />
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-bold ${
          trendUp ? "text-emerald-400" : "text-slate-400"
        }`}
      >
        {trend}
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
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
