/**
 * Copyright 2025 Haui.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */
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
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { ShieldCheck, CloudRain, Droplets } from "lucide-react"; // Thêm icon CloudRain
import { useAuth } from "../../context/AuthContext";
import weatherService from "../../services/weatherService"; // 👈 Import Service mới

// ... (Giữ nguyên phần fix icon Marker mặc định cũ) ...
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

const HA_TINH_CENTER = [18.3436, 105.9002];

// ... (Giữ nguyên component LocationMarker và FitBoundsToData cũ) ...
const LocationMarker = () => {
  const { userLocation } = useAuth();
  const map = useMap();
  useEffect(() => {
    if (userLocation) map.flyTo(userLocation, 15, { duration: 2 });
  }, [userLocation, map]);

  if (!userLocation) return null;
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

const FitBoundsToData = ({ data }) => {
  const map = useMap();
  const { userLocation } = useAuth();
  useEffect(() => {
    if (data && !userLocation) {
      const geoJsonLayer = L.geoJSON(data);
      map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
    }
  }, [data, map, userLocation]);
  return null;
};

// --- HÀM TẠO ICON THỜI TIẾT ĐỘNG (Dựa trên màu API trả về) ---
const createWeatherIcon = (color) => {
  // Map màu từ API (GREEN, RED...) sang Tailwind/CSS color
  let cssColor = "bg-emerald-500"; // Mặc định GREEN
  let ringColor = "bg-emerald-500/30";

  if (color === "RED") {
    cssColor = "bg-red-500";
    ringColor = "bg-red-500/30";
  } else if (color === "YELLOW" || color === "ORANGE") {
    cssColor = "bg-amber-500";
    ringColor = "bg-amber-500/30";
  }

  return new L.DivIcon({
    className: "relative group",
    html: `
      <div class="absolute -inset-2 ${ringColor} rounded-full animate-pulse"></div>
      <div class="w-8 h-8 ${cssColor} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-2-2-2-4-3-3-3-6-5-10-2 4-2 7-5 10-2 2-2 2-2 4a7 7 0 0 0 7 7z"/>
        </svg>
      </div>
      <div class="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap font-bold">
         Trạm đo mưa
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Căn giữa đáy
    popupAnchor: [0, -34],
  });
};

const CitizenHomePage = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);

  // 1. State lưu danh sách trạm thời tiết
  const [weatherStations, setWeatherStations] = useState([]);

  // Lấy Ranh giới thành phố (Giữ nguyên)
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
        if (response.data?.[0]) setGeoJsonData(response.data[0].geojson);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBoundary();
  }, []);

  // 2. Lấy dữ liệu Thời tiết Realtime
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Gọi API qua Service
        const data = await weatherService.getRealtimeStations();
        console.log("Dữ liệu trạm đo mưa:", data);

        // API trả về mảng trực tiếp hoặc data.data tùy cấu hình axiosClient
        // Giả sử axiosClient bạn đã setup interceptor trả về response.data
        if (Array.isArray(data)) {
          setWeatherStations(data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu thời tiết:", error);
      }
    };
    fetchWeather();

    // Nâng cao: Có thể setInteval gọi lại mỗi 60s để cập nhật real-time thật
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      <MapContainer
        center={HA_TINH_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <LocationMarker />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Bản đồ Tiêu chuẩn">
            <TileLayer
              attribution="&copy; OSM"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* Lớp Ranh giới */}
          <LayersControl.Overlay checked name="Ranh giới Thành phố">
            <LayerGroup>
              {geoJsonData && (
                <GeoJSON
                  data={geoJsonData}
                  style={{ color: "#3b82f6", weight: 3, fillOpacity: 0.05 }}
                />
              )}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* 👇 LỚP MỚI: TRẠM ĐO MƯA REALTIME */}
          <LayersControl.Overlay checked name="Trạm đo mưa (Real-time)">
            <LayerGroup>
              {weatherStations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lon]} // API trả về lat/lon
                  icon={createWeatherIcon(station.displayColor)}
                >
                  <Popup>
                    <div className="min-w-[200px] font-sans">
                      {/* Header Popup */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div
                          className={`p-1.5 rounded-lg text-white ${
                            station.displayColor === "RED"
                              ? "bg-red-500"
                              : "bg-emerald-500"
                          }`}
                        >
                          <CloudRain size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Trạm đo mưa
                          </p>
                          <h3 className="font-bold text-slate-800 text-sm leading-tight">
                            {station.name}
                          </h3>
                        </div>
                      </div>

                      {/* Body Popup */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="bg-slate-50 p-2 rounded-lg text-center">
                          <p className="text-[10px] text-slate-500">
                            Lượng mưa
                          </p>
                          <p className="text-lg font-black text-blue-600">
                            {station.rain}
                            <span className="text-xs font-normal text-slate-400 ml-0.5">
                              mm
                            </span>
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-center flex flex-col justify-center items-center">
                          <p className="text-[10px] text-slate-500">
                            Trạng thái
                          </p>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              station.status === "SAFE"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {station.status}
                          </span>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="text-xs text-slate-600 bg-yellow-50 p-2 rounded border border-yellow-100 italic">
                        "{station.message}"
                      </div>

                      <p className="text-[9px] text-slate-300 mt-2 text-right font-mono">
                        ID: {station.id.split(":").pop()}
                      </p>
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

      {/* Legend - Chú thích */}
      <div className="absolute bottom-6 left-4 z-[400] bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-bold">Vị trí của bạn</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-medium">
            Trạm đo mưa (An toàn)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white shadow-sm"></span>
          <span className="text-slate-700 font-medium">Cảnh báo Mưa lớn</span>
        </div>
      </div>
    </div>
  );
};

export default CitizenHomePage;
