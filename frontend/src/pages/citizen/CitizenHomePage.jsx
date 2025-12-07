/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

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
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import weatherService from "../../services/weatherService";
import reportService from "../../services/reportService";

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

// --- 1. CẤU HÌNH DANH SÁCH (THÊM MỤC 'CURRENT') ---
const CITIES = [
  {
    id: "current", // ID đặc biệt
    name: "Vị trí của bạn",
    query: null, // Không cần query
    center: null, // Không có tâm cố định
  },
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

// --- 2. COMPONENT ĐIỀU KHIỂN ---

// Component: Bay về vị trí người dùng
// Chỉ hoạt động khi mode = 'current'
const UserLocationController = ({ userLocation, activeCityId }) => {
  const map = useMap();

  useEffect(() => {
    // Chỉ bay nếu đang chọn chế độ "Vị trí của bạn" VÀ có tọa độ
    if (activeCityId === "current" && userLocation) {
      console.log("Fly to User Location");
      map.flyTo(userLocation, 15, { duration: 2 });
    }
  }, [userLocation, activeCityId, map]);

  if (!userLocation) return null;

  // Marker người dùng luôn hiển thị dù ở chế độ nào (để biết mình đang ở đâu so với thành phố)
  const userIcon = new L.DivIcon({
    className: "relative",
    html: `<div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
           <div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>`,
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

// Component: Zoom theo ranh giới thành phố
const BoundaryController = ({ geoJsonData, shouldZoom, onZoomComplete }) => {
  const map = useMap();

  useEffect(() => {
    if (geoJsonData && shouldZoom) {
      try {
        const geoJsonLayer = L.geoJSON(geoJsonData);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          console.log("Zoom to City Boundary...");
          map.fitBounds(bounds, { padding: [20, 20], duration: 1.5 });
        }
        if (onZoomComplete) onZoomComplete();
      } catch (e) {
        console.error("Zoom Error:", e);
      }
    }
  }, [geoJsonData, shouldZoom, map, onZoomComplete]);

  return null;
};

// Component: Vẽ đường SOS (Giữ nguyên)
const RoutingController = ({ userLocation, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (userLocation && destination) {
      const bounds = L.latLngBounds([userLocation, destination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, destination, map]);

  if (!userLocation || !destination) return null;
  return (
    <Polyline
      positions={[userLocation, destination]}
      pathOptions={{
        color: "#0ea5e9",
        weight: 4,
        dashArray: "10, 10",
        opacity: 0.8,
      }}
    />
  );
};

// ... (Giữ nguyên createWeatherIcon, createReportIcon) ...
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

const CitizenHomePage = () => {
  const { userLocation } = useAuth();
  const location = useLocation();

  // --- STATE ---
  // Mặc định chọn "Vị trí của bạn" (CITIES[0])
  const [activeCity, setActiveCity] = useState(CITIES[0]);

  const [shouldZoomCity, setShouldZoomCity] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState(null);

  const [weatherStations, setWeatherStations] = useState([]);
  const [reports, setReports] = useState([]);
  const [destination, setDestination] = useState(null);

  // 1. Nhận lệnh chỉ đường SOS
  useEffect(() => {
    if (location.state?.destination) {
      setDestination(location.state.destination);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 2. Fetch Ranh giới (SỬA LẠI LOGIC KỸ LƯỠNG)
  useEffect(() => {
    const fetchBoundary = async () => {
      // 2.1. Nếu chọn "Vị trí của bạn": Xóa ranh giới ngay lập tức
      if (activeCity.id === "current") {
        setGeoJsonData(null);
        setShouldZoomCity(false);
        return;
      }

      // 2.2. Nếu đang dẫn đường SOS: Cũng không load ranh giới
      if (destination) return;

      try {
        // QUAN TRỌNG: Xóa dữ liệu cũ và tắt zoom TRƯỚC KHI gọi API mới
        // Để tránh map bị nhảy về dữ liệu cũ
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
          console.log(`Đã tải xong: ${activeCity.name}`);
          // CHỈ khi dữ liệu mới về đến nơi -> Mới Set Data và Bật Zoom
          setGeoJsonData(response.data[0].geojson);
          setShouldZoomCity(true);
        }
      } catch (error) {
        console.error("Lỗi lấy ranh giới:", error);
      }
    };
    fetchBoundary();
  }, [activeCity, destination]);

  // 3. Fetch dữ liệu khác
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

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      {/* UI DROPDOWN */}
      <div className="absolute top-4 left-4 z-[1000] group">
        <div className="relative flex items-center bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-1.5 pr-4 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-primary/10">
          {/* Đổi icon tùy theo mode */}
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
              Khu vực giám sát
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
                  setDestination(null); // Reset chỉ đường SOS nếu đổi thành phố
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

      <MapContainer
        // Mặc định center Hà Tĩnh, nhưng LocationMarker sẽ đè lên nếu chọn 'current'
        center={[18.3436, 105.9002]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        {/* 1. Component này chịu trách nhiệm bay về user khi activeCity là 'current' */}
        <UserLocationController
          userLocation={userLocation}
          activeCityId={activeCity.id}
        />

        <RoutingController
          userLocation={userLocation}
          destination={destination}
        />

        {/* 2. Component này chịu trách nhiệm zoom ranh giới khi activeCity là các tỉnh */}
        <BoundaryController
          geoJsonData={geoJsonData}
          shouldZoom={shouldZoomCity}
          onZoomComplete={() => setShouldZoomCity(false)}
        />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Bản đồ Tiêu chuẩn">
            <TileLayer
              attribution="&copy; OSM"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* Chỉ hiện layer ranh giới nếu có dữ liệu (tức là không phải mode 'current') */}
          {geoJsonData && (
            <LayersControl.Overlay checked name="Ranh giới Hành chính">
              <LayerGroup>
                <GeoJSON
                  key={activeCity.id} // Quan trọng: Force re-render khi đổi tỉnh
                  data={geoJsonData}
                  style={{
                    color: "#3b82f6",
                    weight: 3,
                    fillOpacity: 0.05,
                    dashArray: "5, 5",
                  }}
                />
              </LayerGroup>
            </LayersControl.Overlay>
          )}

          {/* ... (Các Overlay khác giữ nguyên) ... */}
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

          <LayersControl.Overlay checked name="Cảnh báo từ Cộng đồng">
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
