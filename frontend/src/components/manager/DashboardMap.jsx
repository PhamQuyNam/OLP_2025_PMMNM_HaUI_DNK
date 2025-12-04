/**
 * Copyright 2025 Haui.DNK
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
// 👇 Import thêm các icon mới
import { CloudRain, AlertTriangle, Phone, Clock } from "lucide-react";

// ... (Giữ nguyên phần DefaultIcon cũ) ...
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

// 1. Icon Trạm đo mưa (Giữ nguyên)
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

// 2. 👇 HÀM MỚI: Tạo Icon Sự cố (Hình tam giác)
const createReportIcon = (type) => {
  // FLOOD: Xanh dương, LANDSLIDE: Cam
  const colorClass = type === "FLOOD" ? "text-blue-600" : "text-orange-600";

  // SVG Icon Tam giác cảnh báo
  const iconHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${colorClass} drop-shadow-md animate-bounce">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="3" />
    </svg>
  `;

  return new L.DivIcon({
    className: "bg-transparent",
    html: iconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

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

// 👇 NHẬN THÊM PROP: reports
const DashboardMap = ({ stations = [], reports = [], geoJsonData }) => {
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
          <LayersControl.BaseLayer name="Bản đồ Tối (Dark)">
            <TileLayer
              attribution="&copy; CARTO"
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked name="Bản đồ Sáng (Light)">
            <TileLayer
              attribution="&copy; OSM"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          {/* Lớp Ranh giới */}
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

          {/* Lớp Trạm Đo Mưa */}
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
                      <div className="flex items-center gap-1 font-bold border-b pb-1 mb-1">
                        <CloudRain size={14} className="text-blue-500" />{" "}
                        {station.name}
                      </div>
                      <div>
                        Mưa:{" "}
                        <span className="font-bold text-blue-600">
                          {station.rain}mm
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          {/* 👇 LỚP MỚI: BÁO CÁO TỪ DÂN (Crowdsourcing) */}
          <LayersControl.Overlay checked name="Sự cố từ Người dân">
            <LayerGroup>
              {reports.map((report) => (
                <Marker
                  key={report.id || Math.random()}
                  position={[report.lat, report.lon]}
                  icon={createReportIcon(report.type)}
                >
                  <Popup className="custom-popup-dark">
                    <div className="text-slate-800 text-xs min-w-[180px] font-sans">
                      {/* Header Popup */}
                      <div className="flex items-center gap-2 mb-2 border-b pb-1 border-red-100">
                        <AlertTriangle size={16} className="text-red-500" />
                        <strong className="text-red-600 uppercase">
                          {report.type === "FLOOD" ? "Ngập lụt" : "Sạt lở đất"}
                        </strong>
                      </div>

                      {/* Nội dung báo cáo */}
                      <p className="mb-2 italic text-slate-600">
                        "{report.desc || report.description}"
                      </p>

                      {/* Thời gian */}
                      <div className="flex items-center gap-1 justify-end text-[10px] text-slate-400">
                        <Clock size={10} />
                        {report.time
                          ? new Date(report.time).toLocaleTimeString()
                          : "Vừa xong"}
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

      {/* Legend cập nhật */}
      <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/80 backdrop-blur p-2.5 rounded border border-slate-700 text-[10px] text-slate-300 shadow-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>{" "}
          Trạm đo mưa
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle size={12} className="text-orange-500" /> Báo cáo từ Dân
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
