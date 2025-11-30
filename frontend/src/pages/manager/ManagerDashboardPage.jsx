import {
  AlertTriangle,
  Droplets,
  BellRing,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  MapPin,
  MoreHorizontal,
  Filter,
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
} from "recharts";
import DashboardMap from "../../components/manager/DashboardMap";

// --- MOCK DATA ---
const RAIN_DATA = [
  { time: "01:00", mm: 5 },
  { time: "04:00", mm: 12 },
  { time: "08:00", mm: 45 },
  { time: "12:00", mm: 95 },
  { time: "16:00", mm: 60 },
  { time: "20:00", mm: 25 },
];

const WATER_LEVEL_DATA = [
  { name: "Sông La", level: 350 },
  { name: "Sông Gianh", level: 420 },
  { name: "Kẻ Gỗ", level: 280 },
];

const INCIDENTS = [
  {
    id: 1,
    time: "10:45",
    location: "Cầu Phủ, TP Hà Tĩnh",
    type: "Ngập lụt",
    level: "Cao",
    status: "pending",
    source: "Cảm biến",
  },
  {
    id: 2,
    time: "10:30",
    location: "Xã Thạch Trung",
    type: "Sạt lở đất",
    level: "Trung bình",
    status: "processing",
    source: "Người dân",
  },
  {
    id: 3,
    time: "09:15",
    location: "Phường Nam Hà",
    type: "Tắc cống",
    level: "Thấp",
    status: "confirmed",
    source: "Người dân",
  },
  {
    id: 4,
    time: "08:50",
    location: "Đường Phan Đình Phùng",
    type: "Ngập úng",
    level: "Thấp",
    status: "pending",
    source: "Cảm biến",
  },
];

const ManagerDashboardPage = () => {
  return (
    <div className="space-y-6 text-slate-100 font-sans pb-10">
      {/* === 1. THẺ CHỈ SỐ (STATS) === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lượng mưa (24h)"
          value="128"
          unit="mm"
          icon={Droplets}
          color="bg-blue-500"
          trend="+15%"
          trendUp={true}
        />
        <StatCard
          title="Khu vực Cảnh báo"
          value="3"
          unit="Vùng"
          icon={AlertTriangle}
          color="bg-red-500"
          trend="+1"
          trendUp={true}
        />
        <StatCard
          title="SOS Chờ xử lý"
          value="5"
          unit="Tin"
          icon={BellRing}
          color="bg-orange-500"
          trend="-2"
          trendUp={false}
        />
        <StatCard
          title="Mực nước TB"
          value="3.5"
          unit="m"
          icon={Activity}
          color="bg-cyan-500"
          trend="Báo động 2"
          trendUp={true}
        />
      </div>

      {/* === 2. BẢN ĐỒ & BIỂU ĐỒ === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* Cột trái: Bản đồ */}
        <div className="lg:col-span-2 h-full min-h-[400px]">
          <DashboardMap />
        </div>

        {/* Cột phải: Biểu đồ */}
        <div className="flex flex-col gap-6 h-full">
          <div className="flex-1 bg-slate-800/50 border border-slate-700 p-5 rounded-2xl min-h-0">
            <h3 className="font-bold text-sm mb-4 text-slate-300">
              Diễn biến Mưa (mm)
            </h3>
            <div className="h-[calc(100%-2rem)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={RAIN_DATA}>
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

          <div className="flex-1 bg-slate-800/50 border border-slate-700 p-5 rounded-2xl min-h-0">
            <h3 className="font-bold text-sm mb-4 text-slate-300">
              Mực nước Trạm (cm)
            </h3>
            <div className="h-[calc(100%-2rem)] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WATER_LEVEL_DATA} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    width={70}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                    }}
                  />
                  <Bar
                    dataKey="level"
                    fill="#06b6d4"
                    radius={[0, 4, 4, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* === 3. PHẦN MỚI: DANH SÁCH SỰ CỐ & THANH NGƯỠNG === */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CỘT TRÁI (3/4): Bảng Quản lý Sự kiện */}
        <div className="lg:col-span-3 bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BellRing className="text-red-500 animate-pulse" size={20} />
              <h3 className="font-bold text-lg text-white">
                Sự kiện & Cảnh báo Mới
              </h3>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors">
                <Filter size={14} /> Lọc: Tất cả
              </button>
              <button className="text-primary text-sm hover:underline px-2">
                Xem toàn bộ
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-6 py-4 font-semibold">Vị trí</th>
                  <th className="px-6 py-4 font-semibold">Loại / Nguồn</th>
                  <th className="px-6 py-4 font-semibold">Mức độ</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {INCIDENTS.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-500" />{" "}
                        {item.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-500" />{" "}
                        {item.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">
                        {item.type}
                      </div>
                      <div className="text-xs text-slate-500">
                        Nguồn: {item.source}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
                          item.level === "Cao"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : item.level === "Trung bình"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20" // Đổi sang Amber cho sáng rõ hơn Orange
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {item.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === "pending" && (
                        <span className="text-orange-400 flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>{" "}
                          Chờ xử lý
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="text-blue-400 flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>{" "}
                          Đang xử lý
                        </span>
                      )}
                      {item.status === "confirmed" && (
                        <span className="text-emerald-400 flex items-center gap-1 text-xs">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>{" "}
                          Đã xác nhận
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button className="bg-primary hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-sky-500/20">
                            Tiếp nhận
                          </button>
                          <button className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1.5 rounded-lg transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      ) : (
                        <button className="text-slate-500 hover:text-white px-3 py-1.5 text-xs font-medium border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                          Chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI (1/4): Thanh Ngưỡng Cảnh báo & Hướng dẫn */}
        <div className="lg:col-span-1 space-y-6">
          {/* Thanh Ngưỡng Cảnh Báo */}
          <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
            <h3 className="font-bold text-sm text-slate-300 mb-4">
              Ngưỡng Cảnh Báo
            </h3>

            <div className="space-y-4">
              <div className="relative pt-2 pb-6">
                {/* Gradient Bar */}
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-600 mb-2"></div>

                {/* Mốc chỉ số */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono absolute w-full top-6">
                  <span>0mm</span>
                  <span>50mm</span>
                  <span>100mm+</span>
                </div>
              </div>

              <div className="space-y-3">
                <LevelItem
                  color="bg-emerald-500"
                  level="Cấp 1"
                  desc="An toàn / Mưa nhỏ"
                  range="< 25mm"
                />
                <LevelItem
                  color="bg-blue-500"
                  level="Cấp 2"
                  desc="Mưa vừa / Chú ý"
                  range="25-50mm"
                />
                <LevelItem
                  color="bg-yellow-500"
                  level="Cấp 3"
                  desc="Mưa to / Cảnh báo"
                  range="50-100mm"
                />
                <LevelItem
                  color="bg-red-600"
                  level="Cấp 4"
                  desc="Nguy hiểm / Sạt lở"
                  range="> 100mm"
                  isAlert
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-5 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-white mb-1">Xác nhận Cảnh báo</h3>
            <p className="text-xs text-indigo-200 mb-4">
              Gửi thông báo SOS đến 2,450 người dân trong vùng ảnh hưởng.
            </p>
            <button className="w-full bg-white text-indigo-700 font-bold py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors shadow-md">
              Kích hoạt Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
  trendUp,
}) => (
  <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-600 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white`}>
        <Icon size={24} />
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-bold ${
          trendUp ? "text-red-400" : "text-emerald-400"
        }`}
      >
        {trend}
        {trend.includes("+") ? (
          <ArrowUpRight size={14} />
        ) : (
          <ArrowDownRight size={14} />
        )}
      </div>
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <h4 className="text-3xl font-bold text-white">{value}</h4>
        <span className="text-sm text-slate-500">{unit}</span>
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
