import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Tooltip as LeafletTooltip,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX LỖI ICON ---
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

// Dữ liệu Vùng Rủi ro
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
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-600 shadow-inner">
      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        zoomControl={false} // Tắt zoom mặc định
      >
        {/* BỘ ĐIỀU KHIỂN LỚP BẢN ĐỒ (Góc trên phải) */}
        <LayersControl position="topright">
          {/* 1. Bản đồ Sáng (Mặc định - Dễ nhìn nhất) */}
          <LayersControl.BaseLayer checked name="Bản đồ Sáng (Clean)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          {/* 2. Bản đồ Tiêu chuẩn (Chi tiết đường xá) */}
          <LayersControl.BaseLayer name="Bản đồ Đường phố (OSM)">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* 3. Bản đồ Tối (Cho ai thích Dark Mode) */}
          <LayersControl.BaseLayer name="Bản đồ Tối (Dark)">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          {/* Lớp dữ liệu cảnh báo (Luôn bật) */}
          <LayersControl.Overlay checked name="Vùng Cảnh báo">
            <LayerGroup>
              {RISK_ZONES.map((zone) => (
                <Circle
                  key={zone.id}
                  center={[zone.lat, zone.lng]}
                  radius={zone.radius}
                  pathOptions={{
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.4,
                    weight: 2,
                  }}
                >
                  <LeafletTooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                    permanent
                  >
                    <div className="text-center font-bold text-slate-800 bg-white/80 px-2 py-1 rounded shadow-sm border border-slate-200 text-xs whitespace-nowrap">
                      {zone.name}
                    </div>
                  </LeafletTooltip>

                  <Popup>
                    <div className="text-slate-800">
                      <strong>{zone.name}</strong>
                      <p className="m-0 text-xs">
                        Mức độ:{" "}
                        <span className="font-bold text-red-600">
                          {zone.level}
                        </span>
                      </p>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      {/* Chú thích (Legend) - Cập nhật giao diện sáng sủa hơn */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-slate-200 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-200"></span>{" "}
          Sạt lở đất
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-200"></span>{" "}
          Ngập lụt
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-200"></span>{" "}
          Lũ quét
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
