import { io, Socket } from "socket.io-client";

let paymentSocket: Socket | null = null;

export const getSocketRootUrl = (): string =>
  "https://api.deluxe-market.com/api".replace(/\/+$/, "").replace(/\/api$/, "");

export const connectPaymentSocket = (
  _unused?: unknown,
  userId?: number | string
): Socket => {
  const rootUrl = getSocketRootUrl();
  const accessToken = localStorage.getItem("accessToken");

  if (paymentSocket) {
    if (paymentSocket.connected) {
      if (userId) {
        paymentSocket.emit("join_user", { userId, token: accessToken });
      }
      return paymentSocket;
    }
    paymentSocket.disconnect();
  }

  const namespaceUrl = `${rootUrl}/payments`;
  paymentSocket = io(namespaceUrl, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    auth: { token: accessToken },
    query: {
      userId: userId ? String(userId) : "",
      token: accessToken || "",
    },
  });

  paymentSocket.on("connect", () => {
    console.log("[Socket.IO] Connected to server:", paymentSocket?.id);
    if (userId) {
      paymentSocket?.emit("join_user", { userId, token: accessToken });
    }
  });

  paymentSocket.on("disconnect", (reason) => {
    console.log("[Socket.IO] Disconnected:", reason);
  });

  paymentSocket.on("connect_error", (err) => {
    console.warn("[Socket.IO] Connection error:", err?.message);
  });

  return paymentSocket;
};

export const disconnectPaymentSocket = () => {
  if (paymentSocket) {
    paymentSocket.disconnect();
    paymentSocket = null;
  }
};

export const connectActivitySocket = (): Socket => {
  const rootUrl = getSocketRootUrl();
  return io(`${rootUrl}/activity`, {
    transports: ["websocket"],
    reconnectionDelayMax: 10000,
  });
};

