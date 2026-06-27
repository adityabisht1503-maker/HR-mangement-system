import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector }     from "react-redux";
import api from "./api";
import {
  setNotifications,
  markOneRead,
  markAllRead,
  removeNotification,
} from "./store/notificationSlice";

const TYPE_META = {
  leave_request   : { icon: "calendar-check",  color: "#a78bfa", label: "Leave Request"    },
  new_request     : { icon: "person-check",    color: "#60a5fa", label: "New Request"      },
  new_employee    : { icon: "person-plus",     color: "#34d399", label: "New Employee"     },
  leave_approved  : { icon: "calendar2-check", color: "#34d399", label: "Leave Approved"   },
  leave_rejected  : { icon: "calendar2-x",     color: "#f87171", label: "Leave Rejected"   },
  payroll_credited: { icon: "cash-coin",        color: "#fbbf24", label: "Salary Credited"  },
  request_approved: { icon: "check-circle",     color: "#34d399", label: "Account Approved" },
  request_rejected: { icon: "x-circle",         color: "#f87171", label: "Request Rejected" },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(s => s.notifications);

  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/notifications");
      if (res.data?.status === 1) dispatch(setNotifications(res.data.notifications));
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkOne = async (id) => {
    dispatch(markOneRead(id));
    try { await api.patch(`/api/notifications/${id}/read`); } catch (_) {}
  };

  const handleMarkAll = async () => {
    dispatch(markAllRead());
    try { await api.patch("/api/notifications/read-all"); } catch (_) {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    dispatch(removeNotification(id));
    try { await api.delete(`/api/notifications/${id}`); } catch (_) {}
  };

  return (
    <div className="position-relative" ref={ref}>

      {/* Bell button */}
      <button
        className="btn btn-sm btn-outline-secondary border-0 position-relative"
        onClick={() => setOpen(o => !o)}
        title="Notifications"
      >
        <i className={`bi bi-bell${unreadCount > 0 ? "-fill" : ""} fs-5`} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 end-0 translate-middle d-flex align-items-center justify-content-center border border-dark rounded-circle"
            style={{
              width      : 18,
              height     : 18,
              fontSize   : "0.6rem",
              fontWeight : 700,
              color      : "#fff",
              background : "#ef4444",          // ← red
              boxShadow  : "0 0 0 2px #ef444430", // ← soft red glow
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="position-absolute end-0 mt-2 rounded-3 shadow-lg"
          style={{ width: 340, background: "#161b22", border: "1px solid #30363d", zIndex: 1050 }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center justify-content-between px-3 py-2"
            style={{ borderBottom: "1px solid #30363d" }}
          >
            <span className="text-white fw-semibold" style={{ fontSize: "0.88rem" }}>
              Notifications
              {unreadCount > 0 && (
                <span
                  className="ms-2 rounded-pill px-2 py-0"
                  style={{
                    fontSize  : "0.65rem",
                    fontWeight: 700,
                    color     : "#fff",
                    background: "#ef4444",       // ← red badge in header too
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </span>
            <div className="d-flex align-items-center gap-2">
              {loading && (
                <div style={{
                  width: 12, height: 12,
                  border: "2px solid #444",
                  borderTopColor: "#a78bfa",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
              )}
              {unreadCount > 0 && (
                <button
                  className="btn btn-sm border-0 bg-transparent p-0"
                  style={{ fontSize: "0.75rem", color: "#a78bfa" }}
                  onClick={handleMarkAll}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4" style={{ color: "#8b949e", fontSize: "0.85rem" }}>
                <i className="bi bi-bell-slash d-block fs-3 mb-2" />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const meta = TYPE_META[n.type] || { icon: "bell", color: "#8b949e", label: "Notification" };
                return (
                  <div
                    key={n._id}
                    onClick={() => handleMarkOne(n._id)}
                    className="d-flex gap-2 align-items-start px-3 py-2 position-relative"
                    style={{
                      background : n.is_read ? "transparent" : "rgba(124,58,237,0.08)",
                      borderBottom: "1px solid #21262d",
                      cursor     : "pointer",
                      transition : "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "transparent" : "rgba(124,58,237,0.08)"}
                  >
                    {/* Icon bubble */}
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 34, height: 34, marginTop: 2, background: `${meta.color}20` }}
                    >
                      <i className={`bi bi-${meta.icon}`} style={{ color: meta.color, fontSize: "0.9rem" }} />
                    </div>

                    {/* Text */}
                    <div className="flex-grow-1 overflow-hidden pe-3">
                      <div style={{ fontSize: "0.8rem", color: "#e2e8f0", lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                        <span style={{
                          fontSize: "0.68rem", color: meta.color,
                          background: `${meta.color}20`, padding: "1px 7px", borderRadius: 4,
                        }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "#8b949e" }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot + delete */}
                    <div className="d-flex flex-column align-items-center gap-1 flex-shrink-0">
                      {!n.is_read && (
                        <div
                          className="rounded-circle"
                          style={{ width: 7, height: 7, background: "#ef4444", marginTop: 4 }} // ← red dot
                        />
                      )}
                      <button
                        className="btn btn-sm border-0 bg-transparent p-0"
                        style={{ color: "#444", fontSize: "0.75rem", lineHeight: 1 }}
                        onClick={(e) => handleDelete(e, n._id)}
                        title="Dismiss"
                      >
                        <i className="bi bi-x" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="text-center py-2" style={{ borderTop: "1px solid #30363d", fontSize: "0.75rem", color: "#8b949e" }}>
              Showing last {notifications.length} notifications
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
