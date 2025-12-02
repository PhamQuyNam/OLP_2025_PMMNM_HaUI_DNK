import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
  GeoJSON,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CloudRain } from "lucide-react"; // Icon cho Popup

// Fix lỗi icon marker mặc định
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

const CENTER = [18.3436, 105.9002]; // Trung tâm Hà Tĩnh

// --- HÀM TẠO ICON TRẠM QUAN TRẮC (Admin Style - Gọn hơn) ---
const createStationIcon = (color) => {
  let cssColor = "bg-emerald-500";
  let ringColor = "bg-emerald-500/30";

  if (color === "RED") {
    cssColor = "bg-red-500";
    ringColor = "bg-red-500/30";
  } else if (color === "YELLOW") {
    cssColor = "bg-amber-500";
    ringColor = "bg-amber-500/30";
  }

  return new L.DivIcon({
    className: "relative",
    html: `
      <div class="absolute -inset-1.5 ${ringColor} rounded-full animate-pulse"></div>
      <div class="w-4 h-4 ${cssColor} border-2 border-white rounded-full shadow-sm"></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

// Component Zoom vào dữ liệu
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

// 👇 NHẬN PROPS: stations (Dữ liệu thời tiết) & geoJsonData (Ranh giới)
const DashboardMap = ({ stations = [], geoJsonData }) => {
  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-600 shadow-inner bg-slate-900">
      <MapContainer
        center={CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <LayersControl position="topright">
          {/* Base Maps */}
          <LayersControl.BaseLayer checked name="Bản đồ Tối (Dark)">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Bản đồ Sáng (Light)">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* Layer Ranh giới TP */}
          <LayersControl.Overlay checked name="Ranh giới Hành chính">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  interactive={false}
                  style={{
                    color: "#a855f7", // Tím neon
                    weight: 2,
                    fillColor: "#a855f7",
                    fillOpacity: 0.1,
                    dashArray: "5, 5",
                  }}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* Layer Trạm Đo Mưa (Dữ liệu thật) */}
          <LayersControl.Overlay checked name="Trạm Quan Trắc (Real-time)">
            <LayerGroup>
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lon]}
                  icon={createStationIcon(station.displayColor)}
                >
                  <Popup className="custom-popup-dark">
                    <div className="text-slate-800 text-xs min-w-[150px]">
                      <div className="flex items-center gap-2 mb-1 border-b pb-1 border-slate-100">
                        <CloudRain size={14} className="text-blue-500" />
                        <strong className="truncate">{station.name}</strong>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span>Lượng mưa:</span>
                        <span className="font-bold text-blue-600">
                          {station.rain} mm
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Trạng thái:</span>
                        <span
                          className={`font-bold ${
                            station.status === "SAFE"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {station.status}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        <ZoomControl position="bottomright" />
        {geoJsonData && <FitBoundsToData data={geoJsonData} />}
      </MapContainer>

      {/* Legend nhỏ gọn */}
      <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/80 backdrop-blur p-2 rounded border border-slate-700 text-[10px] text-slate-300">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> An toàn
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Cảnh báo
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
