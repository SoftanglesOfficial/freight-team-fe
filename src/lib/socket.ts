"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const anonId = localStorage.getItem("anon_id");
    const token = localStorage.getItem("auth_token");

    // Connect to backend
    const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    socket = io(URL, {
      query: {
        anon_id: anonId || "",
        token: token || "", // Pass token for admin authentication
      },
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const updateSocketAuth = () => {
  // Reconnect with new query params if anon_id changes or login happens
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
};
