// import React, { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import axios from "axios";
// import { useAuth } from "../AuthContext"; // your existing auth context

// const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const { token, user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [socket, setSocket] = useState(null);

//   // ✅ Fetch user notifications from backend
//   const fetchNotifications = async () => {
//     if (!token) return;
//     try {
//       const res = await axios.get("http://localhost:5000/api/notifications", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = res.data || [];
//       setNotifications(data);
//       setUnreadCount(data.filter((n) => !n.isRead).length);
//     } catch (err) {
//       console.error("Error fetching notifications:", err);
//     }
//   };

//   // ✅ Connect to Socket.IO on login
//   useEffect(() => {
//     if (!user || !token) return;

//     const newSocket = io("http://localhost:5000", {
//       transports: ["websocket"],
//     });
//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("🟢 Connected to Socket.IO:", newSocket.id);
//       newSocket.emit("join", user.id);
//     });

//     // Listen for real-time notifications
//     newSocket.on("notification:new", (notif) => {
//       console.log("📨 New notification:", notif);
//       setNotifications((prev) => [notif, ...prev]);
//       setUnreadCount((prev) => prev + 1);
//     });

//     newSocket.on("disconnect", () => console.log("🔴 Disconnected"));

//     return () => newSocket.disconnect();
//   }, [user, token]);

//   // ✅ Mark a single notification as read
//   const markAsRead = async (id) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/notifications/${id}/read`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
//       );
//       setUnreadCount((prev) => Math.max(prev - 1, 0));
//     } catch (err) {
//       console.error("Error marking as read:", err);
//     }
//   };

//   // ✅ Mark all as read
//   const markAllRead = async () => {
//     try {
//       await axios.put(
//         "http://localhost:5000/api/notifications/read-all",
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//       setUnreadCount(0);
//     } catch (err) {
//       console.error("Error marking all as read:", err);
//     }
//   };

//   // ✅ Fetch initial data
//   useEffect(() => {
//     if (token) fetchNotifications();
//   }, [token]);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         unreadCount,
//         markAsRead,
//         markAllRead,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);



import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { AuthContext } from "../AuthContext"; // ✅ import context directly
import { SOCKET_URL } from "../config/runtime";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // ✅ Access token and user directly via useContext
  const { token, user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // ✅ Fetch user notifications from backend
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.notifications || []; // fixed key
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // ✅ Connect to Socket.IO when user logs in
  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 Connected to Socket.IO:", newSocket.id);
      if (user?.id) newSocket.emit("join", user.id);
    });

    // ✅ Listen for new notifications in real time
    newSocket.on("notification:new", (notif) => {
      console.log("📨 New notification:", notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("disconnect", () => console.log("🔴 Disconnected from Socket.IO"));

    return () => newSocket.disconnect();
  }, [user, token]);

  // ✅ Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // ✅ Mark all as read
  const markAllRead = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // ✅ Fetch initial notifications
  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Hook for easy access
export const useNotifications = () => useContext(NotificationContext);
