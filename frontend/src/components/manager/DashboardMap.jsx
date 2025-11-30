import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Tooltip as LeafletTooltip,
  LayersControl,
  LayerGroup,
  GeoJSON,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

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

// Dữ liệu Vùng Rủi ro (ĐÃ SỬA TỌA ĐỘ VỀ TRONG THÀNH PHỐ)
const RISK_ZONES = [
  {
    id: 1,
    name: "Ngập lụt: Cầu Phủ",
    lat: 18.325,
    lng: 105.89,
    radius: 800, // Giảm bán kính chút cho gọn
    color: "#3b82f6", // Xanh dương
    level: "Báo động 2",
  },
  {
    id: 2,
    name: "Sạt lở: Núi Nài",
    lat: 18.315,
    lng: 105.91,
    radius: 600,
    color: "#ef4444", // Đỏ
    level: "Nguy hiểm cao",
  },
  {
    id: 3,
    name: "Lũ quét: Thạch Bình", // Đổi từ Hương Sơn -> Thạch Bình (Trong TP)
    lat: 18.355,
    lng: 105.92,
    radius: 700,
    color: "#f59e0b", // Cam
    level: "Cảnh báo sớm",
  },
];

// Component phụ: Tự động Zoom
const FitBoundsToData = ({ data }) => {
  const map = useMap();
  useEffect(() => {
    if (data) {
      const geoJsonLayer = L.geoJSON(data);
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
    }
  }, [data, map]);
  return null;
};

const DashboardMap = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        const response = await axios.get(
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
        if (response.data && response.data.length > 0) {
          setGeoJsonData(response.data[0].geojson);
        }
      } catch (error) {
        console.error("Lỗi tải bản đồ:", error);
      }
    };
    fetchBoundary();
  }, []);

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-600 shadow-inner">
      <MapContainer
        center={CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Bản đồ Sáng (Clean)">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ Đường phố (OSM)">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ Tối (Dark)">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          {/* Lớp Ranh giới (ĐÃ SỬA MÀU & TẮT INTERACTIVE) */}
          <LayersControl.Overlay checked name="Ranh giới Hành chính">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  interactive={false} // <--- QUAN TRỌNG: Tắt tương tác để click xuyên qua được
                  style={{
                    color: "#7e22ce", // Đổi sang Màu Tím Đậm (Purple-700) cho nổi bật
                    weight: 3, // Nét đậm hơn chút
                    fillColor: "#7e22ce",
                    fillOpacity: 0.05,
                    dashArray: "10, 5", // Nét đứt thưa hơn cho dễ nhìn
                  }}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Lớp dữ liệu cảnh báo */}
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
                  {/* Tooltip hiện khi hover */}
                  <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="text-center font-bold text-slate-800 bg-white/95 px-3 py-1.5 rounded shadow-md border border-slate-200 text-xs whitespace-nowrap z-[1000]">
                      {zone.name} <br />
                      <span
                        className={`text-[10px] uppercase ${
                          zone.color === "#ef4444"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      >
                        {zone.level}
                      </span>
                    </div>
                  </LeafletTooltip>

                  {/* Popup hiện khi click */}
                  <Popup>
                    <div className="text-slate-800">
                      <strong>{zone.name}</strong>
                      <p className="m-0 text-xs mt-1">
                        Mức độ:{" "}
                        <span className="font-bold text-red-600">
                          {zone.level}
                        </span>
                      </p>
                      <button className="mt-2 w-full bg-slate-800 text-white text-[10px] py-1 rounded hover:bg-slate-700">
                        Điều phối đội cứu hộ
                      </button>
                    </div>
                  </Popup>
                </Circle>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        <ZoomControl position="bottomright" />
        {geoJsonData && <FitBoundsToData data={geoJsonData} />}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm p-2.5 rounded-lg shadow-lg border border-slate-200 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-200"></span>{" "}
          Sạt lở đất
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-200"></span>{" "}
          Ngập lụt
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-200"></span>{" "}
          Lũ quét
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 border-t-2 border-purple-700 border-dashed"></span>{" "}
          Ranh giới TP
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
