import { Marker } from "react-leaflet";
import L from "leaflet";

// Tọa độ các điểm chủ quyền
const HOANG_SA_COORDS = [16.78, 112.77];
const TRUONG_SA_COORDS = [10.77, 115.5];

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
    </>
  );
};

export default SovereigntyMarker;
