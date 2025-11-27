import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  useMap,
  LayersControl,
  Circle,
  LayerGroup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { ShieldCheck, AlertTriangle } from "lucide-react";

// --- FIX LỖI ICON MARKER ---
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

// TỌA ĐỘ TRUNG TÂM TP HÀ TĨNH
const HA_TINH_CENTER = [18.3436, 105.9002];

// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
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

// Component phụ: Zoom vào dữ liệu
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

const CitizenHomePage = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy ranh giới TP Hà Tĩnh
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

  // Custom Icon
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
        center={HA_TINH_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* LAYERS CONTROL */}
        <LayersControl position="topright">
          {/* 1. Bản đồ nền duy nhất: OpenStreetMap */}
          <LayersControl.BaseLayer checked name="Bản đồ Tiêu chuẩn">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* 2. Các lớp phủ (Overlays) */}
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
                      <p className="text-xs text-slate-500">
                        Trạng thái: Sẵn sàng tiếp nhận
                      </p>
                      <button className="mt-2 w-full bg-emerald-500 text-white text-xs py-1 rounded hover:bg-emerald-600">
                        Chỉ đường
                      </button>
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
                  <Popup>
                    <div className="font-sans">
                      <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                        <AlertTriangle size={16} /> Cảnh báo {point.level}
                      </div>
                      <h3 className="font-bold text-slate-800">{point.name}</h3>
                      <p className="text-xs text-slate-500">
                        Bán kính ảnh hưởng: {point.radius}m
                      </p>
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
      <div className="absolute bottom-6 left-4 z-[400] bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-medium">Điểm An toàn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-medium">Vùng Nguy hiểm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-blue-500 rounded-sm"></span>
          <span className="text-slate-700 font-medium">Ranh giới TP</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-md z-[500] flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-primary">
            Đang tải dữ liệu...
          </span>
        </div>
      )}
    </div>
  );
};

export default CitizenHomePage;
