import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX LỖI ICON MARKER ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
// ---------------------------

const CENTER_POSITION = [18.3436, 105.9002];

const CitizenHomePage = () => {
  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      <MapContainer
        center={CENTER_POSITION}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false} // Tắt zoom mặc định
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={CENTER_POSITION}>
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-primary">Vị trí của bạn</h3>
              <p className="text-xs text-slate-500">TP. Hà Tĩnh</p>
            </div>
          </Popup>
        </Marker>

        {/* 👇 ĐÃ SỬA LẠI ĐÚNG CÚ PHÁP: topright (không gạch nối) */}
        <ZoomControl position="topright" />
      </MapContainer>

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
