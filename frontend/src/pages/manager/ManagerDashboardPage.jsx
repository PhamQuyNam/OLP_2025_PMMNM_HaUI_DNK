import {
  AlertTriangle,
  Droplets,
  BellRing,
  Activity,
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
} from "recharts";

// --- MOCK DATA (Dữ liệu giả lập chuẩn OLP) ---

// 1. Lượng mưa theo giờ (24h)
const RAIN_DATA = [
  { time: "01:00", mm: 5 },
  { time: "04:00", mm: 12 },
  { time: "08:00", mm: 45 },
  { time: "12:00", mm: 95 }, // Đỉnh điểm mưa lớn
  { time: "16:00", mm: 60 },
  { time: "20:00", mm: 25 },
];

// 2. Mực nước trung bình tại các trạm (cm)
const WATER_LEVEL_DATA = [
  { name: "Sông La", level: 350 },
  { name: "Sông Gianh", level: 420 }, // Cao
  { name: "Kẻ Gỗ", level: 280 },
];

const ManagerDashboardPage = () => {
  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* === 1. HÀNG TRÊN CÙNG: 4 THẺ CHỈ SỐ QUAN TRỌNG === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lượng mưa trung bình */}
        <StatCard
          title="Lượng mưa (24h)"
          value="128"
          unit="mm"
          icon={Droplets}
          color="bg-blue-500"
          trend="+15%"
          trendUp={true}
        />

        {/* Card 2: Khu vực Cảnh báo (Sạt lở/Lũ) */}
        <StatCard
          title="Khu vực Cảnh báo"
          value="3"
          unit="Vùng"
          icon={AlertTriangle}
          color="bg-red-500"
          trend="+1"
          trendUp={true} // Tăng là xấu (Nguy hiểm tăng)
        />

        {/* Card 3: SOS Chưa xử lý */}
        <StatCard
          title="SOS Chờ xử lý"
          value="5"
          unit="Tin"
          icon={BellRing}
          color="bg-orange-500"
          trend="-2"
          trendUp={false} // Giảm là tốt
        />

        {/* Card 4: Mực nước trung bình */}
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

      {/* === 2. KHU VỰC CHÍNH (BẢN ĐỒ & BIỂU ĐỒ) === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        {/* CỘT TRÁI (2/3): BẢN ĐỒ GIÁM SÁT (Sẽ làm ở Bước sau) */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 relative overflow-hidden flex items-center justify-center">
          {/* Placeholder cho Map */}
          <div className="text-center opacity-50">
            <div className="animate-pulse mb-2 text-6xl">🗺️</div>
            <p>Bản đồ Cảnh báo Sạt lở & Lũ lụt</p>
            <p className="text-sm text-slate-400">
              (Sẽ tích hợp ở bước tiếp theo)
            </p>
          </div>
        </div>

        {/* CỘT PHẢI (1/3): BIỂU ĐỒ SỐ LIỆU */}
        <div className="flex flex-col gap-6 h-full">
          {/* Biểu đồ Lượng mưa */}
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

          {/* Biểu đồ Mực nước (Dạng cột) */}
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

      {/* === 3. DANH SÁCH BÁO CÁO (Sẽ làm ở bước sau) === */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 text-center text-slate-500 border-dashed">
        Phần Danh sách SOS & Thanh ngưỡng cảnh báo sẽ nằm ở đây...
      </div>
    </div>
  );
};

// Component Card nhỏ (Giữ nguyên logic cũ nhưng chỉnh style chút)
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
        {/* Logic mũi tên: Tăng (xấu) -> Đỏ, Giảm (tốt) -> Xanh (Tùy ngữ cảnh, tạm để vậy) */}
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

export default ManagerDashboardPage;
