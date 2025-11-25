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
import axios from "axios";

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

// Component phụ: Tự động Zoom vào ranh giới khi tải xong
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

  useEffect(() => {
    const fetchBoundary = async () => {
      try {
        // API Nominatim - Lấy ranh giới THÀNH PHỐ
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: "Thành phố Hà Tĩnh", // <--- ĐỔI TỪ KHÓA TẠI ĐÂY (Chính xác nhất cho OSM VN)
              countrycodes: "vn",
              polygon_geojson: 1,
              format: "json",
              limit: 1,
            },
          }
        );

        if (response.data && response.data.length > 0) {
          console.log("Dữ liệu TP Hà Tĩnh:", response.data[0]);
          setGeoJsonData(response.data[0].geojson);
        } else {
          console.warn("Không tìm thấy ranh giới TP Hà Tĩnh");
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
        center={HA_TINH_CENTER}
        zoom={13} // Zoom lớn hơn (13) vì Thành phố nhỏ hơn Tỉnh
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* Bản đồ nền OpenStreetMap */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Lớp ranh giới THÀNH PHỐ Hà Tĩnh */}
        {geoJsonData && (
          <>
            <GeoJSON
              data={geoJsonData}
              style={{
                color: "#3b82f6", // Đổi sang viền Xanh dương (Blue) cho ra chất "Đô thị thông minh"
                weight: 3,
                fillColor: "#3b82f6",
                fillOpacity: 0.05, // Nền rất nhạt để không che đường phố
              }}
            />
            <FitBoundsToData data={geoJsonData} />
          </>
        )}

        {/* Marker vị trí trung tâm */}
        <Marker position={HA_TINH_CENTER}>
          <Popup>
            <div className="text-center font-sans">
              <h3 className="font-bold text-primary">TP. Hà Tĩnh</h3>
              <p className="text-xs text-slate-500">Trung tâm hành chính</p>
            </div>
          </Popup>
        </Marker>

        <ZoomControl position="topright" />
      </MapContainer>

      {/* Loading Widget */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[1000] flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col items-center animate-fade-in-up">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm font-bold text-slate-600">
              Đang tải dữ liệu Đô thị...
            </span>
          </div>
        </div>
      )}

      {/* Widget Thời tiết */}
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
              Thời tiết TP. Hà Tĩnh
            </p>
            <p className="text-sm font-bold text-slate-800">24°C • Mưa nhẹ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenHomePage;
