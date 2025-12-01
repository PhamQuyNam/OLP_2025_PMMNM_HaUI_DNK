import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  LayersControl,
  Circle,
  LayerGroup,
  useMap, // Import hook này để điều khiển map
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

// ... (Giữ nguyên phần fix icon Marker cũ) ...
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

// Tọa độ mặc định (Hà Tĩnh) nếu người dùng từ chối GPS
const HA_TINH_CENTER = [18.3436, 105.9002];

// ... (Giữ nguyên SAFE_POINTS, RISK_POINTS) ...
const SAFE_POINTS = [
  {
    id: 1,
    name: "BV Đa Khoa Tỉnh Hà Tĩnh",
    lat: 18.3485,
    lng: 105.897,
    type: "Y tế",
  },
  {
    id: 2,
    name: "Trường THPT Chuyên Hà Tĩnh",
    lat: 18.335,
    lng: 105.905,
    type: "Sơ tán",
  },
  {
    id: 3,
    name: "UBND Thành phố Hà Tĩnh",
    lat: 18.342,
    lng: 105.902,
    type: "Chính quyền",
  },
];

const RISK_POINTS = [
  {
    id: 1,
    name: "Ngập lụt: Cầu Phủ",
    lat: 18.325,
    lng: 105.89,
    radius: 800,
    level: "Cao",
  },
  {
    id: 2,
    name: "Sạt lở: Núi Nài",
    lat: 18.315,
    lng: 105.91,
    radius: 500,
    level: "Trung bình",
  },
];

// --- COMPONENT MỚI: Tự động bay đến vị trí người dùng ---
const LocationMarker = () => {
  const { userLocation } = useAuth();
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      // Nếu có vị trí, bay đến đó (Zoom 15)
      map.flyTo(userLocation, 15, { duration: 2 });
    }
  }, [userLocation, map]);

  // Nếu chưa có vị trí, không vẽ gì cả
  if (!userLocation) return null;

  // Icon chấm xanh đại diện cho "Tôi"
  const userIcon = new L.DivIcon({
    className: "relative",
    html: `
      <div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
      <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div className="font-bold text-center">
          📍 Vị trí của bạn <br />
          <span className="text-xs font-normal text-slate-500">
            Đang trực tuyến
          </span>
        </div>
      </Popup>
    </Marker>
  );
};

// Component FitBounds (Giữ nguyên)
const FitBoundsToData = ({ data }) => {
  const map = useMap();
  // Chỉ fitBounds khi KHÔNG có userLocation (để ưu tiên vị trí người dùng)
  const { userLocation } = useAuth();

  useEffect(() => {
    if (data && !userLocation) {
      const geoJsonLayer = L.geoJSON(data);
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
    }
  }, [data, map, userLocation]);
  return null;
};

const CitizenHomePage = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy vị trí từ Context để check xem có đang loading vị trí không
  const { userLocation } = useAuth();

  // ... (Giữ nguyên useEffect fetchBoundary) ...
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
      } finally {
        setLoading(false);
      }
    };
    fetchBoundary();
  }, []);

  // Icon Definitions (Giữ nguyên safeIcon, riskIcon...)
  const safeIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const riskIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      <MapContainer
        center={HA_TINH_CENTER} // Mặc định ở đây, nhưng LocationMarker sẽ fly đi chỗ khác
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* Component xử lý vị trí người dùng */}
        <LocationMarker />

        <LayersControl position="topright">
          {/* ... (Giữ nguyên các LayersControl BaseLayer và Overlay cũ) ... */}
          <LayersControl.BaseLayer checked name="Bản đồ Tiêu chuẩn">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Ranh giới Thành phố">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  style={{
                    color: "#3b82f6",
                    weight: 3,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.05,
                  }}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Điểm An toàn (Shelter)">
            <LayerGroup>
              {SAFE_POINTS.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.lat, point.lng]}
                  icon={safeIcon}
                >
                  <Popup>
                    <div className="font-sans">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
                        <ShieldCheck size={16} /> {point.type}
                      </div>
                      <h3 className="font-bold text-slate-800">{point.name}</h3>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Vùng Nguy cơ (Risk)">
            <LayerGroup>
              {RISK_POINTS.map((point) => (
                <Circle
                  key={point.id}
                  center={[point.lat, point.lng]}
                  radius={point.radius}
                  pathOptions={{
                    color: "red",
                    fillColor: "#ef4444",
                    fillOpacity: 0.4,
                  }}
                >
                  {/* Popup giữ nguyên */}
                </Circle>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        <ZoomControl position="bottomright" />
        {geoJsonData && <FitBoundsToData data={geoJsonData} />}
      </MapContainer>

      {/* Legend (Thêm chú thích vị trí của bạn) */}
      <div className="absolute bottom-6 left-4 z-[400] bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-bold">Vị trí của bạn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-medium">Điểm An toàn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-medium">Vùng Nguy hiểm</span>
        </div>
      </div>

      {/* ... (Loading giữ nguyên) ... */}
    </div>
  );
};

export default CitizenHomePage;
