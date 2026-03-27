import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  LayersControl,
  LayerGroup,
  useMap,
  Polyline,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import {
  User,
  Clock,
  Map as MapIcon,
  ChevronDown,
  Navigation,
  LocateFixed,
  Info,
  Waves,
  Mountain,
} from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import weatherService from "../../services/weatherService";
import reportService from "../../services/reportService";
import alertService from "../../services/alertService";
import { STATIC_STATIONS } from "../../constants/stations";
import { useSocket } from "../../context/SocketContext";
import SovereigntyMarker from "../../components/common/SovereigntyMarker";

// Fix icon marker
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

// CẤU HÌNH THÀNH PHỐ
const CITIES = [
  { id: "current", name: "Vị trí của bạn", query: null, center: null },
  {
    id: "hatinh",
    name: "TP. Hà Tĩnh",
    query: "Thành phố Hà Tĩnh",
    center: [18.3436, 105.9002],
  },
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    query: "Ho Chi Minh City",
    center: [10.8231, 106.6297],
  },
  {
    id: "thainguyen",
    name: "TP. Thái Nguyên",
    query: "Thành phố Thái Nguyên",
    center: [21.5942, 105.8481],
  },
];

// --- COMPONENT CHÚ GIẢI (LEGEND BAR) - ĐÃ CẬP NHẬT ICON ---
const AlertLegend = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-8 left-4 z-[1000] flex flex-col items-start gap-2">
      {/* Nút bật tắt */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-primary transition-colors"
        title="Chú giải cảnh báo"
      >
        <Info size={20} />
      </button>

      {/* Bảng chú giải */}
      <div
        className={`bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 origin-bottom-left ${
          isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 h-0"
        }`}
      >
        <div className="p-3 w-48">
          {" "}
          {/* Thêm w-48 để bảng rộng hơn chút cho đẹp */}
          {/* PHẦN 1: MỨC ĐỘ */}
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
            Mức độ Cảnh báo
          </h4>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold text-slate-700">
                Khẩn cấp (Cấp 3)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></span>
              <span className="text-xs font-medium text-slate-600">
                Nguy hiểm (Cấp 2)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></span>
              <span className="text-xs font-medium text-slate-600">
                Cảnh báo (Cấp 1)
              </span>
            </div>
          </div>
          {/* PHẦN 2: LOẠI SỰ CỐ (MỚI THÊM) */}
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
            Loại sự cố
          </h4>
          <div className="space-y-2">
            {/* Ngập lụt */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-600">
                <Waves size={12} />
              </div>
              <span className="text-xs text-slate-600">Ngập lụt / Lũ quét</span>
            </div>

            {/* Sạt lở */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-100 text-amber-600">
                <Mountain size={12} />
              </div>
              <span className="text-xs text-slate-600">Sạt lở đất</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT ĐIỀU KHIỂN ---
const UserLocationController = ({ userLocation, activeCityId }) => {
  const map = useMap();
  useEffect(() => {
    if (activeCityId === "current" && userLocation) {
      map.stop();
      map.flyTo(userLocation, 15, { duration: 2.5, easeLinearity: 0.25 });
    }
  }, [userLocation, activeCityId, map]);

  if (!userLocation) return null;
  const userIcon = new L.DivIcon({
    className: "relative",
    html: `<div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div><div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  return (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>
        <div className="font-bold text-center">📍 Vị trí của bạn</div>
      </Popup>
    </Marker>
  );
};

const BoundaryController = ({ geoJsonData, shouldZoom, onZoomComplete }) => {
  const map = useMap();
  useEffect(() => {
    if (geoJsonData && shouldZoom) {
      try {
        const geoJsonLayer = L.geoJSON(geoJsonData);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          map.stop();
          map.fitBounds(bounds, {
            padding: [20, 20],
            animate: true,
            duration: 3,
            easeLinearity: 0.5,
          });
        }
        if (onZoomComplete) onZoomComplete();
      } catch (e) {
        console.error("Zoom Error:", e);
      }
    }
  }, [geoJsonData, shouldZoom, map, onZoomComplete]);
  return null;
};

const RoutingController = ({ userLocation, destination, isSafeZone }) => {
  const map = useMap();

  // 1. Luôn luôn bay đến đích (cho cả 2 trường hợp)
  useEffect(() => {
    if (destination) {
      map.flyTo(destination, 16, { duration: 2, easeLinearity: 0.25 });
    }
  }, [destination, map]);

  // 2. Chỉ vẽ đường Polyline nếu là Điểm an toàn (SOS)
  if (isSafeZone && userLocation && destination) {
    return (
      <Polyline
        positions={[userLocation, destination]}
        pathOptions={{
          color: "#0ea5e9", // Màu xanh
          weight: 4,
          dashArray: "10, 10",
          opacity: 0.8,
        }}
      />
    );
  }

  // Nếu là xem cảnh báo bình thường -> Không vẽ gì cả
  return null;
};

// --- HELPERS ---
const createWeatherIcon = (color) => {
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
    className: "relative group",
    html: `<div class="absolute -inset-2 ${ringColor} rounded-full animate-pulse"></div><div class="w-8 h-8 ${cssColor} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-2-2-2-4-3-3-3-6-5-10-2 4-2 7-5 10-2 2-2 2-2 4a7 7 0 0 0 7 7z"/></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
};

const createReportIcon = (type) => {
  const isFlood = type === "FLOOD";
  const colorClass = isFlood ? "text-blue-600" : "text-amber-700";
  const bgClass = isFlood
    ? "bg-blue-100 border-blue-500"
    : "bg-amber-100 border-amber-600";
  const iconSvg = isFlood
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`;
  return new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="relative"><div class="absolute -inset-2 ${
      isFlood ? "bg-blue-500/30" : "bg-amber-500/30"
    } rounded-full animate-ping"></div><div class="w-8 h-8 ${bgClass} border-2 rounded-full shadow-lg flex items-center justify-center ${colorClass}">${iconSvg}</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
};

const getAlertRadius = (type, levelString) => {
  const t = String(type).toUpperCase();
  const l = String(levelString).toUpperCase();
  if (t === "FLOOD") {
    if (l.includes("CRITICAL") || l == "3") return 3000;
    if (l.includes("VERY") || l == "2") return 1500;
    return 800;
  }
  if (t === "LANDSLIDE") {
    if (l.includes("CRITICAL") || l == "3") return 1000;
    if (l.includes("VERY") || l == "2") return 600;
    return 300;
  }
  return 500;
};

const getAlertColor = (levelString) => {
  const l = String(levelString).toUpperCase();
  if (l.includes("CRITICAL") || l == "3") return "#dc2626";
  if (l.includes("VERY") || l == "2") return "#f97316";
  return "#eab308";
};

const CitizenHomePage = () => {
  const { userLocation } = useAuth();
  const location = useLocation();
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [shouldZoomCity, setShouldZoomCity] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [weatherStations, setWeatherStations] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [destination, setDestination] = useState(null);
  const socket = useSocket();
  const alertsRef = useRef(activeAlerts);
  const [isSafeZone, setIsSafeZone] = useState(false);

  useEffect(() => {
    alertsRef.current = activeAlerts;
  }, [activeAlerts]);

  useEffect(() => {
    if (!socket) return;
    socket.on("alert:broadcast", (newAlert) => {
      const isExist = alertsRef.current.some(
        (a) => a.station_name === newAlert.station_name
      );
      if (!isExist) toast.error(`CẢNH BÁO: ${newAlert.station_name}`);
      setActiveAlerts((prev) => {
        const unique = prev.filter(
          (a) => a.station_name !== newAlert.station_name
        );
        return [newAlert, ...unique];
      });
    });
    socket.on("alert:resolved", (data) => {
      const exists = alertsRef.current.find(
        (a) => a.station_name === data.station_name
      );
      if (exists) {
        toast.success(`An toàn: ${data.station_name} đã bình thường.`);
        setActiveAlerts((prev) =>
          prev.filter((a) => a.station_name !== data.station_name)
        );
      }
    });
    return () => {
      socket.off("alert:broadcast");
      socket.off("alert:resolved");
    };
  }, [socket]);

  useEffect(() => {
    if (location.state?.destination) {
      setDestination(location.state.destination);

      // Kiểm tra type có phải SAFE_ZONE không (SOSModal có gửi cái này)
      if (location.state?.type === "SAFE_ZONE") {
        setIsSafeZone(true);
      } else {
        setIsSafeZone(false);
      }

      // Xóa state lịch sử để F5 không bị lỗi (Optional)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchBoundary = async () => {
      if (activeCity.id === "current") {
        setGeoJsonData(null);
        setShouldZoomCity(false);
        return;
      }
      if (destination) return;
      try {
        setGeoJsonData(null);
        setShouldZoomCity(false);
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: activeCity.query,
              countrycodes: "vn",
              polygon_geojson: 1,
              format: "json",
              limit: 1,
            },
          }
        );
        if (response.data?.[0]) {
          setGeoJsonData(response.data[0].geojson);
          setShouldZoomCity(true);
        }
      } catch (error) {
        console.error("Lỗi lấy ranh giới:", error);
      }
    };
    fetchBoundary();
  }, [activeCity, destination]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await weatherService.getRealtimeStations();
        if (Array.isArray(data)) setWeatherStations(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getAllReports();
        if (Array.isArray(data)) {
          const verifiedReports = data.filter((r) => r.status === "VERIFIED");
          setReports(verifiedReports);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReports();
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getCitizenAlerts();
        if (Array.isArray(data)) {
          const uniqueAlertsMap = new Map();
          data.forEach((alert) => {
            const existing = uniqueAlertsMap.get(alert.station_name);
            if (
              !existing ||
              new Date(alert.created_at) > new Date(existing.created_at)
            ) {
              uniqueAlertsMap.set(alert.station_name, alert);
            }
          });
          setActiveAlerts(Array.from(uniqueAlertsMap.values()));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      {/* UI DROPDOWN (GÓC TRÊN TRÁI) - GIỮ NGUYÊN */}
      <div className="absolute top-4 left-4 z-[1000] group">
        <div className="relative flex items-center bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-1.5 pr-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-primary/10">
          <div
            className={`p-2 rounded-xl text-white shadow-md mr-3 transition-colors ${
              activeCity.id === "current"
                ? "bg-emerald-500"
                : "bg-gradient-to-br from-primary to-sky-500"
            }`}
          >
            {activeCity.id === "current" ? (
              <LocateFixed size={18} />
            ) : (
              <MapIcon size={18} />
            )}
          </div>
          <div className="flex flex-col relative">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Lựa chọn khu vực
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 w-[140px] truncate">
                {activeCity.name}
              </span>
              <ChevronDown
                size={14}
                className="text-slate-400 group-hover:text-primary transition-colors"
              />
            </div>
            <select
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              value={activeCity.id}
              onChange={(e) => {
                const city = CITIES.find((c) => c.id === e.target.value);
                if (city) {
                  setActiveCity(city);
                  setDestination(null);
                }
              }}
            >
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 👇 THANH CHÚ GIẢI (LEGEND BAR) - MỚI THÊM Ở GÓC DƯỚI TRÁI */}
      <AlertLegend />

      <MapContainer
        center={[18.3436, 105.9002]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <UserLocationController
          userLocation={userLocation}
          activeCityId={activeCity.id}
        />
        <RoutingController
          userLocation={userLocation}
          destination={destination}
          isSafeZone={isSafeZone}
        />
        <BoundaryController
          geoJsonData={geoJsonData}
          shouldZoom={shouldZoomCity}
          onZoomComplete={() => setShouldZoomCity(false)}
        />

        {/* Marker Chủ Quyền */}
        <SovereigntyMarker />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Bản đồ Tiêu chuẩn">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          {/* ... (Các Overlay giữ nguyên) */}
          <LayersControl.Overlay checked name="Ranh giới Hành chính">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  key={activeCity.id}
                  data={geoJsonData}
                  style={{
                    color: "#3b82f6",
                    weight: 3,
                    fillOpacity: 0.05,
                    dashArray: "5, 5",
                  }}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="⚠️ Vùng Cảnh báo Thiên tai">
            <LayerGroup>
              {activeAlerts.map((alert) => {
                let lat = alert.lat;
                let lon = alert.lon;
                if (!lat || !lon) {
                  const matchedLive = weatherStations.find(
                    (s) =>
                      s.name === alert.station_name || s.id === alert.station_id
                  );
                  if (matchedLive) {
                    lat = matchedLive.lat;
                    lon = matchedLive.lon;
                  }
                }
                if (!lat || !lon) {
                  const matchedStatic = STATIC_STATIONS.find(
                    (s) => s.name === alert.station_name
                  );
                  if (matchedStatic) {
                    lat = matchedStatic.lat;
                    lon = matchedStatic.lon;
                  }
                }
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
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="text-center font-sans">
                        <strong className="text-red-600 uppercase text-xs block mb-1">
                          {alert.alert_level === "CRITICAL"
                            ? "KHẨN CẤP"
                            : "CẢNH BÁO"}
                        </strong>
                        <div className="font-bold text-sm text-slate-800">
                          {alert.station_name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {alert.risk_type === "FLOOD" ? "Ngập lụt" : "Sạt lở"}{" "}
                          <span className="mx-1">•</span> Bán kính{" "}
                          {getAlertRadius(alert.risk_type, alert.alert_level) /
                            1000}
                          km
                        </div>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Trạm đo mưa (Real-time)">
            <LayerGroup>
              {weatherStations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lon]}
                  icon={createWeatherIcon(station.displayColor)}
                >
                  <Popup>
                    <div className="text-sm font-bold text-center">
                      {station.name}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Phản ánh từ Cộng đồng">
            <LayerGroup>
              {reports.map((report) => (
                <Marker
                  key={report.id}
                  position={[report.lat, report.lon]}
                  icon={createReportIcon(report.type)}
                >
                  <Popup>
                    <div className="font-sans min-w-[180px]">
                      <div className="flex items-center gap-2 mb-2 border-b pb-1 border-slate-100">
                        <strong className="text-slate-800 uppercase text-xs">
                          {report.type === "FLOOD" ? "Ngập lụt" : "Sạt lở đất"}
                        </strong>
                      </div>
                      <p className="text-sm text-slate-600 italic mb-2">
                        "{report.desc || report.description}"
                      </p>
                      <div className="flex justify-between items-end text-[10px] text-slate-400 mt-2 bg-slate-50 p-2 rounded">
                        <div className="flex items-center gap-1">
                          <User size={10} /> <span>Người dân</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span>
                            {report.time
                              ? new Date(report.time).toLocaleTimeString()
                              : "Vừa xong"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>

        <ZoomControl position="bottomright" />
        {destination && (
          <Marker
            position={destination}
            icon={
              new L.DivIcon({
                className: "bg-transparent",
                html: `<div class="relative"><div class="absolute -inset-3 bg-emerald-500/30 rounded-full animate-ping"></div><div class="w-8 h-8 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg></div></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              })
            }
          >
            <Popup autoClose={false} closeOnClick={false}>
              <div className="text-center font-bold text-emerald-600">
                ĐIỂM AN TOÀN
                <br />
                (Di chuyển đến đây)
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default CitizenHomePage;
