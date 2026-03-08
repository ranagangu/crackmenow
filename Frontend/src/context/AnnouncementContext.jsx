import React, { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { SOCKET_URL } from "../config/runtime";

export const AnnouncementContext = createContext();

export const AnnouncementProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);

  // ✅ Fetch existing announcements from DB
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAnnouncements(res.data))
      .catch((err) => console.error("Error fetching announcements:", err));
  }, [token]);

  // ✅ Setup socket.io connection for live updates
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.emit("join", user.id);

    socket.on("announcement:new", (announcement) => {
      console.log("📢 New Announcement:", announcement);
      setAnnouncements((prev) => [announcement, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  return (
    <AnnouncementContext.Provider value={{ announcements }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = () => useContext(AnnouncementContext);
