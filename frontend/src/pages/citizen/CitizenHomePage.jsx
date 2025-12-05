/**
 * Copyright 2025 HaUI.DNK
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
  LayerGroup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { CloudRain, Clock, User } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import weatherService from "../../services/weatherService";
import reportService from "../../services/reportService";

// Fix icon
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

// Component Vị trí của tôi
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

// Icon Trạm Mưa
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
    html: `
      <div class="absolute -inset-2 ${ringColor} rounded-full animate-pulse"></div>
      <div class="w-8 h-8 ${cssColor} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-2-2-2-4-3-3-3-6-5-10-2 4-2 7-5 10-2 2-2 2-2 4a7 7 0 0 0 7 7z"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
};

// 👇 ICON SỰ CỐ (Giống Manager)
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
    html: `
      <div class="relative">
        <div class="absolute -inset-2 ${
          isFlood ? "bg-blue-500/30" : "bg-amber-500/30"
        } rounded-full animate-ping"></div>
        <div class="w-8 h-8 ${bgClass} border-2 rounded-full shadow-lg flex items-center justify-center ${colorClass}">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
};

const CitizenHomePage = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [weatherStations, setWeatherStations] = useState([]);
  const [reports, setReports] = useState([]);

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

  // 👇 API Báo cáo: CHỈ LẤY CÁI ĐÃ DUYỆT
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getAllReports();
        if (Array.isArray(data)) {
          // Lọc: Chỉ hiển thị status = VERIFIED
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

          <LayersControl.Overlay checked name="Trạm đo mưa (Real-time)">
            <LayerGroup>
              {weatherStations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.lat, station.lon]}
                  icon={createWeatherIcon(station.displayColor)}
                >
                  <Popup>
                    {/* ... Popup trạm mưa giữ nguyên ... */}
                    <div className="text-sm font-bold text-center">
                      {station.name}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* 👇 LỚP CẢNH BÁO CỘNG ĐỒNG (Đã lọc Verified) */}
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
        {geoJsonData && <FitBoundsToData data={geoJsonData} />}
      </MapContainer>
    </div>
  );
};

export default CitizenHomePage;
