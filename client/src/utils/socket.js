import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(URL, { autoConnect: false });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect();
};
