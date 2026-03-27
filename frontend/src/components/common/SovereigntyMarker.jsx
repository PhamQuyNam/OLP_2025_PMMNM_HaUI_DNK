import { Marker } from "react-leaflet";
import L from "leaflet";

// Tọa độ các điểm chủ quyền
const HOANG_SA_COORDS = [16.78, 112.77];
const TRUONG_SA_COORDS = [10.77, 115.5];
const BIEN_DONG_COORDS = [13.5, 120.5];

// 1. Icon cho tên Đảo (Như cũ)
const createIslandIcon = (label) => {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `<div style="
      color: #dc2626; 
      font-weight: 900; 
      font-size: 13px; 
      text-transform: uppercase; 
      text-shadow: 2px 2px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
      white-space: nowrap;
      text-align: center;
      transform: translate(-50%, -50%);
    ">
       ${label} 
    </div>`,
    iconSize: [200, 40],
    iconAnchor: [100, 20],
  });
};

const createSeaIcon = () => {
  return L.divIcon({
    className: "bg-transparent border-none",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 400px; /* Tăng kích thước vùng che rộng hơn chút */
      height: 120px;
      
      /* 👇 THAY ĐỔI 2: Màu nền trùng khít với màu biển Carto Voyager (#d6eaf0) */
      /* Tăng opacity (0.8) để che chữ bên dưới kỹ hơn nhưng vẫn dùng blur để hòa viền */
      background: rgba(214, 234, 240, 0.85); 
      backdrop-filter: blur(8px);
      border-radius: 100%; /* Hình bầu dục hoàn hảo */
      
      /* Mask làm mờ viền cực mạnh để không lộ vết cắt */
      mask-image: radial-gradient(circle, black 30%, transparent 70%); 
      -webkit-mask-image: radial-gradient(circle, black 30%, transparent 70%);

      /* Style chữ BIỂN ĐÔNG */
      color: #dc2626; 
      font-weight: 900; 
      font-size: 20px; /* Chữ to hơn chút cho oai */
      letter-spacing: 4px;
      text-transform: uppercase; 
      text-shadow: 3px 3px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white, 1px 1px 0px white;
      white-space: nowrap;
      
      transform: translate(-50%, -50%);
    ">
       BIỂN ĐÔNG
    </div>`,
    iconSize: [400, 120],
    iconAnchor: [200, 60],
  });
};
const SovereigntyMarker = () => {
  return (
    <>
      {/* Marker Hoàng Sa */}
      <Marker
        position={HOANG_SA_COORDS}
        icon={createIslandIcon("Q.Đ Hoàng Sa (Việt Nam)")}
        interactive={false}
        zIndexOffset={1000}
      />

      {/* Marker Trường Sa */}
      <Marker
        position={TRUONG_SA_COORDS}
        icon={createIslandIcon("Q.Đ Trường Sa (Việt Nam)")}
        interactive={false}
        zIndexOffset={1000}
      />
      <Marker
        position={BIEN_DONG_COORDS}
        icon={createSeaIcon()}
        interactive={false}
        zIndexOffset={900} // Thấp hơn đảo một chút nhưng cao hơn bản đồ nền
      />
    </>
  );
};

export default SovereigntyMarker;
