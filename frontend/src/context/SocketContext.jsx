import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

// Địa chỉ Gateway (Nơi Socket Backend đang lắng nghe)
// Nếu chạy Docker, localhost:8000 map vào api-gateway -> alert-service
const SOCKET_URL = "http://localhost:8000";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Khởi tạo kết nối
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // Bắt buộc dùng Websocket cho nhanh
      reconnectionAttempts: 5, // Thử lại 5 lần nếu mất mạng
    });

    setSocket(newSocket);

    // Log để debug
    newSocket.on("connect", () => {
      console.log("🟢 Socket Connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });

    // Cleanup khi tắt app
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
