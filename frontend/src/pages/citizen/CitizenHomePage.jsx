import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios"; // Dùng để gọi dữ liệu bản đồ mở

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

// CẤU HÌNH KHU VỰC: HÀ TĨNH
const HA_TINH_COORDS = [18.3436, 105.9002]; // Trung tâm TP Hà Tĩnh

// Component phụ để tự động Zoom vào khu vực Hà Tĩnh khi có dữ liệu
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

  // Gọi API lấy ranh giới hành chính Hà Tĩnh từ OpenStreetMap (Nominatim)
  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        // API Dữ liệu mở (Open Data) - Chuẩn OLP
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: "Hà Tĩnh",
              country: "Vietnam",
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

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      <MapContainer
        center={HA_TINH_COORDS}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* 1. BẢN ĐỒ NỀN (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 2. LỚP RANH GIỚI HÀ TĨNH (Highlight) */}
        {geoJsonData && (
          <>
            <GeoJSON
              data={geoJsonData}
              style={{
                color: "#ef4444", // Viền màu đỏ cảnh báo
                weight: 2, // Độ đậm viền
                fillColor: "#ef4444",
                fillOpacity: 0.1, // Nền đỏ nhạt bên trong tỉnh
              }}
            />
            <FitBoundsToData data={geoJsonData} />
          </>
        )}

        {/* Marker: Vị trí của bạn (Giả lập) */}
        <Marker position={HA_TINH_COORDS}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-primary">Vị trí của bạn</h3>
              <p className="text-xs text-slate-500">Trung tâm TP. Hà Tĩnh</p>
            </div>
          </Popup>
        </Marker>

        <ZoomControl position="topright" />
      </MapContainer>

      {/* Widget Loading (Khi đang tải bản đồ) */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[500] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-primary">
              Đang tải dữ liệu Hà Tĩnh...
            </span>
          </div>
        </div>
      )}

      {/* Widget Thời tiết nổi */}
      <div className="absolute top-4 left-4 right-14 z-[400]">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/20 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19c0-1.7-1.3-3-3-3h-11a3 3 0 0 0-3 3h17z" />
              <path d="M17.5 19a3 3 0 0 0 0-6h-11" />
              <path d="M17.5 13a3 3 0 0 0 0-6h-4a3 3 0 0 0-3 3" />
              <path d="M6.5 13a3 3 0 0 0 0-6h4" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">
              Thời tiết Hà Tĩnh
            </p>
            <p className="text-sm font-bold text-slate-800">24°C • Mưa nhẹ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenHomePage;
