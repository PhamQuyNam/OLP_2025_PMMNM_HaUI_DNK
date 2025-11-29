import {
  AlertTriangle,
  Droplets,
  Users,
  Activity,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Dữ liệu giả lập cho biểu đồ
const RAIN_DATA = [
  { time: "00:00", mm: 12 },
  { time: "04:00", mm: 18 },
  { time: "08:00", mm: 45 },
  { time: "12:00", mm: 80 }, // Đỉnh điểm
  { time: "16:00", mm: 65 },
  { time: "20:00", mm: 30 },
];

const ALERT_STATS = [
  { name: "Sạt lở", count: 4, fill: "#f59e0b" }, // Cam
  { name: "Ngập lụt", count: 8, fill: "#3b82f6" }, // Xanh
  { name: "Lũ quét", count: 2, fill: "#ef4444" }, // Đỏ
];

const ManagerDashboardPage = () => {
  return (
    <div className="space-y-6 text-slate-100">
      {/* === 1. THỐNG KÊ TỔNG QUAN (STATS CARDS) === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cảnh báo Khẩn cấp"
          value="14"
          unit="Vụ"
          icon={AlertTriangle}
          color="bg-red-500"
          trend="+2"
          trendUp={true}
        />
        <StatCard
          title="Lượng mưa TB"
          value="128"
          unit="mm"
          icon={Droplets}
          color="bg-blue-500"
          trend="+15%"
          trendUp={true}
        />
        <StatCard
          title="Người dân Online"
          value="2,450"
          unit="User"
          icon={Users}
          color="bg-emerald-500"
          trend="Ổn định"
          trendUp={true}
        />
        <StatCard
          title="Trạng thái Sensor"
          value="98%"
          unit="Active"
          icon={Activity}
          color="bg-purple-500"
          trend="-1%"
          trendUp={false}
        />
      </div>

      {/* === 2. BIỂU ĐỒ & BẢN ĐỒ NHỎ === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Lượng mưa (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Diễn biến Mưa (24h qua)</h3>
            <button className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition-colors">
              Chi tiết
            </button>
          </div>
          <div className="h-64 w-full">
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
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
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
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRain)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê Loại Cảnh báo (Chiếm 1 cột) */}
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl">
          <h3 className="font-bold text-lg mb-6">Phân loại Rủi ro</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ALERT_STATS}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#fff"
                  width={80}
                  fontSize={13}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {/* Tự động fill màu theo data */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {ALERT_STATS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === 3. DANH SÁCH SỰ CỐ MỚI NHẤT === */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg">Báo cáo Mới nhất từ Người dân</h3>
          <button className="text-primary text-sm hover:underline">
            Xem tất cả
          </button>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Thời gian</th>
                <th className="px-6 py-4 font-semibold">Vị trí</th>
                <th className="px-6 py-4 font-semibold">Loại sự cố</th>
                <th className="px-6 py-4 font-semibold">Mức độ</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {[
                {
                  time: "10:45",
                  loc: "Cầu Phủ, TP Hà Tĩnh",
                  type: "Ngập lụt",
                  level: "Cao",
                  status: "red",
                },
                {
                  time: "10:30",
                  loc: "Xã Thạch Trung",
                  type: "Sạt lở đất",
                  level: "Trung bình",
                  status: "orange",
                },
                {
                  time: "09:15",
                  loc: "Phường Nam Hà",
                  type: "Tắc cống",
                  level: "Thấp",
                  status: "blue",
                },
              ].map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-300">{row.time}</td>
                  <td className="px-6 py-4 font-medium">{row.loc}</td>
                  <td className="px-6 py-4">{row.type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold bg-${row.status}-500/20 text-${row.status}-400 border border-${row.status}-500/30`}
                    >
                      {row.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-slate-600 rounded text-slate-400 hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Component Card nhỏ
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
          trendUp ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {trend}
        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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

export default ManagerDashboardPage;
