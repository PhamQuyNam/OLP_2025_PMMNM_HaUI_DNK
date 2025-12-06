/**
 * Copyright 2025 HaUI.DNK
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 */

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
import {
  CloudRain,
  AlertTriangle,
  Phone,
  Clock,
  MapPin,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";

// Fix icon marker mặc định của Leaflet
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

const CENTER = [18.3436, 105.9002];
// 👇 1. TẠO ICON SOS (RADAR EFFECT)
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
// --- 1. ICON TRẠM ĐO MƯA (Giữ nguyên) ---
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

// --- 2. ICON SỰ CỐ MỚI (Sóng & Núi) ---
const createReportIcon = (type) => {
  const isFlood = type === "FLOOD";
  const colorClass = isFlood ? "text-blue-600" : "text-amber-700";
  const bgClass = isFlood
    ? "bg-blue-100 border-blue-500"
    : "bg-amber-100 border-amber-600";

  // SVG Icon trực tiếp
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

// --- 3. COMPONENT ĐIỀU KHIỂN ZOOM/FLY ---
const MapController = ({ geoJsonData, flyToLocation }) => {
  const map = useMap();

  // Logic 1: Xử lý Zoom toàn cảnh ranh giới
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

  // Logic 2: Xử lý Bay đến điểm SOS (Ưu tiên cao nhất)
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
  sosSignals = [], // Danh sách SOS
  onResolveSos, // Hàm xử lý khi bấm nút "Đã cứu"
  geoJsonData,
  flyToLocation,
}) => {
  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-600 shadow-inner bg-slate-900">
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

        <LayersControl position="topright">
          {/* Mặc định Sáng */}
          <LayersControl.BaseLayer checked name="Bản đồ Sáng (Light)">
            <TileLayer
              attribution="&copy; OSM"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

          {/* REPORT TỪ DÂN (Dùng Icon Mới & Popup Gọn) */}
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
                      <div className="text-[10px] font-normal text-slate-500 normal-case mt-1">
                        {report.desc || report.description}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
          {/* 👇 3. LAYER MỚI: TÍN HIỆU SOS (LUÔN CHECKED) */}
          <LayersControl.Overlay checked name="🆘 Tín hiệu Cầu cứu (SOS)">
            <LayerGroup>
              {sosSignals.map((sos) => (
                <Marker
                  key={sos.id}
                  position={[sos.lat, sos.lon]}
                  icon={createSosIcon()}
                  zIndexOffset={1000} // Luôn nổi lên trên cùng
                >
                  <Popup className="custom-popup-sos">
                    {/* UI Popup Khẩn cấp */}
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

                      {/* Nút Xử lý ngay trong Popup */}
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
