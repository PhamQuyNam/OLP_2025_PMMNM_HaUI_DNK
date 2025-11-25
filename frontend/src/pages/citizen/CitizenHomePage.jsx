import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix lỗi icon marker mặc định của Leaflet trong React
import iconMarker from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

// TỌA ĐỘ HÀ TĨNH (Trung tâm thành phố)
const CENTER_POSITION = [18.3436, 105.9002];

const CitizenHomePage = () => {
  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      {/* Bản đồ Full màn hình */}
      <MapContainer
        center={CENTER_POSITION}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false} // Tắt nút zoom mặc định để tự custom hoặc dùng tay
      >
        {/* Lớp bản đồ nền (OpenStreetMap - Chuẩn OLP) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker ví dụ tại trung tâm Hà Tĩnh */}
        <Marker position={CENTER_POSITION}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-primary">Bạn đang ở đây</h3>
              <p className="text-xs text-slate-500">TP. Hà Tĩnh</p>
            </div>
          </Popup>
        </Marker>

        <ZoomControl position="top-right" />
      </MapContainer>

      {/* Widget Nổi: Thông tin thời tiết nhanh */}
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
