import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/Client';

const defaultValue = {
    notifications: [],
    unreadCount: 0,
    markAsRead: () => {},
    markAllAsRead: () => {},
    fetchNotifications: () => {},
};

const NotificationContext = createContext(defaultValue);

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    return ctx || defaultValue;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const wsRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const response = await api.get('notifications/');
            // DRF paginates responses, so data is usually in response.data.results
            const data = response.data.results || (Array.isArray(response.data) ? response.data : []);
            // Backend already orders by -created_at; sort client-side as safety net
            const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setNotifications(sorted);
            setUnreadCount(sorted.filter(n => !n.is_read).length);
        } catch {
            // silently fail – user may not be authenticated
        }
    }, []);

    const markAsRead = useCallback(async (id) => {
        try {
            await api.post(`notifications/${id}/read/`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* ignore */ }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.post('notifications/read-all/');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { /* ignore */ }
    }, []);

    // ─── WebSocket ────────────────────────────────────────────────────────────

    const disconnectWebSocket = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.onclose = null; // suppress the "WS disconnected" log
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const connectWebSocket = useCallback((token) => {
        disconnectWebSocket();

        try {
            const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
            wsRef.current = ws;

            ws.onopen = () => {
                // Sync any notifications that arrived between page navigations
                fetchNotifications();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'notification' && data.data) {
                        const n = data.data;

                        // Prepend new notification and recompute unread count from state
                        setNotifications(prev => {
                            // Avoid duplicates
                            const exists = prev.some(p => p.id === n.id);
                            if (exists) return prev;
                            return [n, ...prev];
                        });
                        if (!n.is_read) {
                            setUnreadCount(prev => prev + 1);
                        }

                        toast(
                            (t) => (
                                <div
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        if (n.related_link) window.location.href = n.related_link;
                                    }}
                                >
                                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                                        {n.title}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                                        {n.message}
                                    </div>
                                </div>
                            ),
                            { duration: 5000, icon: '🔔' }
                        );
                    }
                } catch { /* ignore parse errors */ }
            };

            ws.onerror = () => { /* suppress error noise */ };
            ws.onclose = (e) => { 
                console.log('WS disconnected'); 
                // Auto reconnect after 5s if still logged in
                if (localStorage.getItem('access_token')) {
                    setTimeout(() => {
                        const currentToken = localStorage.getItem('access_token');
                        if (currentToken) connectWebSocket(currentToken);
                    }, 5000);
                }
            };
        } catch { /* WebSocket not available */ }
    }, [fetchNotifications, disconnectWebSocket]);

    // ─── Auth state handling ──────────────────────────────────────────────────

    const handleLogin = useCallback((token) => {
        fetchNotifications();
        connectWebSocket(token);
    }, [fetchNotifications, connectWebSocket]);

    const handleLogout = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        disconnectWebSocket();
    }, [disconnectWebSocket]);

    useEffect(() => {
        // Initial load – token already in localStorage (e.g. page refresh)
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchNotifications();
            connectWebSocket(token);
        }

        // ── Cross-tab: localStorage storage event ─────────────────────────────
        const handleStorageEvent = (e) => {
            if (e.key === 'access_token') {
                if (e.newValue) {
                    handleLogin(e.newValue);
                } else {
                    handleLogout();
                }
            }
        };

        // ── Same-tab: custom DOM events dispatched by Login/Logout handlers ───
        const handleAuthLogin = (e) => handleLogin(e.detail?.token || localStorage.getItem('access_token'));
        const handleAuthLogout = () => handleLogout();

        window.addEventListener('storage', handleStorageEvent);
        window.addEventListener('auth:login', handleAuthLogin);
        window.addEventListener('auth:logout', handleAuthLogout);

        return () => {
            window.removeEventListener('storage', handleStorageEvent);
            window.removeEventListener('auth:login', handleAuthLogin);
            window.removeEventListener('auth:logout', handleAuthLogout);
            disconnectWebSocket();
        };
    }, [fetchNotifications, connectWebSocket, handleLogin, handleLogout, disconnectWebSocket]);

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
