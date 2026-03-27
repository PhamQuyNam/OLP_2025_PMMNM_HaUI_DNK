import { useEffect, useState } from "react";
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
import { Phone, Clock, ShieldAlert, CheckCircle, Info } from "lucide-react";
import { Circle } from "react-leaflet";

// Fix icon marker mặc định
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import SovereigntyMarker from "../common/SovereigntyMarker";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const CENTER = [18.3436, 105.9002];

const getAlertRadius = (type, level) => {
  /* logic 3000/1500/800... */
};
const getAlertColor = (level) => {
  /* logic red/orange/yellow */
};
// --- 1. COMPONENT CHÚ GIẢI MINI (MANAGER LEGEND) ---
const ManagerLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-20 left-4 z-[400] flex flex-col items-start gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/90 backdrop-blur border border-slate-600 p-2 rounded-lg text-slate-300 hover:text-white hover:border-primary transition-colors shadow-lg"
        title="Chú giải bản đồ"
      >
        <Info size={18} />
      </button>

      {/* Bảng chú giải mini */}
      <div
        className={`bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg shadow-xl overflow-hidden transition-all duration-300 origin-bottom-left ${
          isOpen ? "w-40 opacity-100 scale-100" : "w-0 h-0 opacity-0 scale-95"
        }`}
      >
        <div className="p-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700 pb-1">
            Cảnh báo
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            Cấp 3 (Khẩn)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            Cấp 2 (Nguy)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            Cấp 1 (Cao)
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700 pb-1 mt-2">
            Phản ánh (Đã duyệt)
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500 flex items-center justify-center text-[8px] text-blue-400">
              🌊
            </div>
            Ngập lụt
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500 flex items-center justify-center text-[8px] text-orange-400">
              ⛰️
            </div>
            Sạt lở
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. ICON HELPER (ĐÃ ĐỒNG BỘ VỚI BÊN DÂN) ---
const createSosIcon = () => {
  return new L.DivIcon({
    className: "bg-transparent",
    html: `
      <div class="relative flex items-center justify-center w-full h-full">
        <div class="absolute w-16 h-16 bg-red-600/50 rounded-full animate-ping opacity-75"></div>
        <div class="absolute w-8 h-8 bg-red-600/80 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,1)]"></div>
        <div class="relative z-10 w-5 h-5 bg-red-700 border-2 border-white rounded-full shadow-lg"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

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
    html: `<div class="absolute -inset-1.5 ${ringColor} rounded-full animate-pulse"></div>
           <div class="w-4 h-4 ${cssColor} border-2 border-white rounded-full shadow-sm"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
};

const createReportIcon = (type) => {
  const isFlood = type === "FLOOD";
  // Icon SVG
  const iconSvg = isFlood
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;

  const bgClass = isFlood
    ? "bg-blue-100 border-blue-600 text-blue-600"
    : "bg-orange-100 border-orange-600 text-orange-600";
  const ringClass = isFlood ? "bg-blue-500/30" : "bg-orange-500/30";

  return new L.DivIcon({
    className: "bg-transparent",
    html: `
      <div class="relative group">
        <div class="absolute -inset-2 ${ringClass} rounded-full animate-ping opacity-75"></div>
        <div class="w-8 h-8 ${bgClass} border-2 rounded-lg shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
          ${iconSvg}
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${bgClass} border-r-2 border-b-2 rotate-45 bg-white"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
};

// --- 3. MAP CONTROLLER ---
const MapController = ({ geoJsonData, flyToLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData && !flyToLocation) {
      try {
        const geoJsonLayer = L.geoJSON(geoJsonData);
        if (geoJsonLayer.getLayers().length > 0) {
          map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        }
      } catch (e) {
        console.error("Lỗi parse GeoJSON:", e);
      }
    }
  }, [geoJsonData, map, flyToLocation]);

  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(flyToLocation, 16, {
        duration: 2,
        easeLinearity: 0.25,
      });
    }
  }, [flyToLocation, map]);

  return null;
};

const DashboardMap = ({
  stations = [],
  reports = [],
  sosSignals = [],
  onResolveSos,
  geoJsonData,
  flyToLocation,
  activeAlerts = [],
}) => {
  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-600 shadow-inner bg-slate-900">
      <ManagerLegend />

      <MapContainer
        center={CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <MapController
          geoJsonData={geoJsonData}
          flyToLocation={flyToLocation}
        />

        {/* Marker Chủ Quyền */}
        <SovereigntyMarker />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="⚠️ Vùng Cảnh báo">
            <LayerGroup>
              {activeAlerts.map((alert) => {
                let lat = alert.lat;
                let lon = alert.lon;
                // Logic fallback nếu API thiếu tọa độ (như yêu cầu 3 lớp)
                // (Ở map thì thường API alert/citizen đã trả về đủ lat/lon rồi, nếu không thì bỏ qua)
                if (!lat || !lon) return null;

                return (
                  <Circle
                    key={`alert-${alert.id}`}
                    center={[lat, lon]}
                    radius={getAlertRadius(alert.risk_type, alert.alert_level)}
                    pathOptions={{
                      color: getAlertColor(alert.alert_level),
                      fillColor: getAlertColor(alert.alert_level),
                      fillOpacity: 0.2,
                    }}
                  >
                    <Popup>
                      <div className="text-center font-bold text-red-600">
                        {alert.station_name} <br /> {alert.alert_level}
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.BaseLayer checked name="Bản đồ Sáng (Light)">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ Tối (Dark)">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked name="Ranh giới Hành chính">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  interactive={false}
                  style={{
                    color: "#a855f7",
                    weight: 2,
                    fillOpacity: 0.1,
                    dashArray: "5, 5",
                  }}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Trạm Quan Trắc">
            <LayerGroup>
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lon]}
                  icon={createStationIcon(station.displayColor)}
                >
                  <Popup className="custom-popup-dark">
                    <div className="text-slate-800 text-xs min-w-[150px]">
                      <strong>{station.name}</strong>
                      <br />
                      Mưa: {station.rain}mm
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* REPORT TỪ DÂN - Icon đồng bộ */}
          <LayersControl.Overlay checked name="Sự cố Đã xác minh">
            <LayerGroup>
              {reports.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.lat, report.lon]}
                  icon={createReportIcon(report.type)}
                >
                  <Popup className="custom-popup-dark">
                    <div className="text-slate-800 text-xs font-bold uppercase text-center px-2 py-1">
                      {report.type === "FLOOD"
                        ? "🌊 Khu vực Ngập lụt"
                        : "⛰️ Khu vực Sạt lở"}
                      <div className="text-[10px] font-normal text-slate-500 normal-case mt-1 border-t border-slate-200 pt-1">
                        {report.desc || report.description}
                      </div>
                      <div className="text-[9px] text-slate-400 italic mt-1">
                        Đã xác minh
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🆘 Tín hiệu Cầu cứu (SOS)">
            <LayerGroup>
              {sosSignals.map((sos) => (
                <Marker
                  key={sos.id}
                  position={[sos.lat, sos.lon]}
                  icon={createSosIcon()}
                  zIndexOffset={1000}
                >
                  <Popup className="custom-popup-sos">
                    <div className="min-w-[220px] font-sans">
                      <div className="bg-red-600 -mx-4 -mt-3 p-3 flex items-center gap-2 text-white mb-3 rounded-t-lg">
                        <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
                          <ShieldAlert size={16} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">
                          CẦU CỨU KHẨN CẤP
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-base font-bold text-slate-800 border-l-4 border-red-500 pl-2">
                          "{sos.message}"
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-red-500" />
                          <a
                            href={`tel:${sos.phone}`}
                            className="font-bold hover:underline hover:text-red-600"
                          >
                            {sos.phone}
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={12} />
                          <span>
                            {new Date(sos.created_at).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onResolveSos(sos.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <CheckCircle size={14} />
                        XÁC NHẬN ĐÃ CỨU
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
