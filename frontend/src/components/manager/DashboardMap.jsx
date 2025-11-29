import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX LỖI ICON (Bắt buộc) ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Tọa độ Hà Tĩnh
const CENTER = [18.3436, 105.9002];

// Dữ liệu Vùng Rủi ro Giả lập (Mock Data)
const RISK_ZONES = [
  {
    id: 1,
    name: "Ngập lụt: Cầu Phủ",
    lat: 18.325,
    lng: 105.89,
    radius: 1200,
    color: "#3b82f6", // Xanh dương
    level: "Báo động 2",
  },
  {
    id: 2,
    name: "Sạt lở: Núi Nài",
    lat: 18.315,
    lng: 105.91,
    radius: 800,
    color: "#ef4444", // Đỏ
    level: "Nguy hiểm cao",
  },
  {
    id: 3,
    name: "Lũ quét: Hương Sơn",
    lat: 18.36,
    lng: 105.85,
    radius: 1000,
    color: "#f59e0b", // Cam
    level: "Cảnh báo sớm",
  },
];

const DashboardMap = () => {
  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-600">
      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={false} // Tắt lăn chuột để không bị rối khi cuộn trang
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* 1. Dùng Bản đồ Nền Tối (Dark Matter) cho hợp Dashboard */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 2. Vẽ các Vùng Nguy cơ */}
        {RISK_ZONES.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.4,
              weight: 1,
            }}
          >
            {/* Tooltip hiện tên khi di chuột vào */}
            <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-center font-bold text-slate-800">
                {zone.name} <br />
                <span
                  className={`text-xs ${
                    zone.color === "#ef4444" ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {zone.level}
                </span>
              </div>
            </LeafletTooltip>

            <Popup>
              <div className="text-slate-800">
                <strong>{zone.name}</strong>
                <p>Bán kính: {zone.radius}m</p>
                <button className="bg-slate-800 text-white px-2 py-1 rounded text-xs mt-1">
                  Xem chi tiết
                </button>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Chú thích nhanh (Legend) nổi trên bản đồ */}
      <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700 text-[10px] text-slate-300">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Sạt lở
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Ngập lụt
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Lũ quét
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
