import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Package, Truck, CheckCircle, XCircle, ShoppingCart, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const typeIcon = (type) => {
    const s = { width: 16, height: 16 };
    switch (type) {
        case 'order_placed':    return <ShoppingCart {...s} />;
        case 'order_status':   return <Truck {...s} />;
        case 'order_cancelled':return <XCircle {...s} />;
        case 'payment_success':return <CheckCircle {...s} />;
        case 'new_user':       return <Package {...s} />;
        default:               return <Info {...s} />;
    }
};

const typeColor = (type) => {
    switch (type) {
        case 'order_placed':    return '#10B981';   // emerald
        case 'order_status':   return '#3B82F6';   // blue
        case 'order_cancelled':return '#EF4444';   // red
        case 'payment_success':return '#8B5CF6';   // purple
        case 'new_user':       return '#F59E0B';   // amber
        default:               return '#6B7280';   // gray
    }
};

const timeAgo = (dateStr) => {
    try {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)  return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24)  return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    } catch { return ''; }
};

/* ─── component ────────────────────────────────────────────────────────────── */

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen]         = useState(false);
    const [dropPos, setDropPos]       = useState({ top: 0, left: 0, flipLeft: false });
    const bellRef                     = useRef(null);
    const dropdownRef                 = useRef(null);
    const navigate                    = useNavigate();

    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const safeCount         = typeof unreadCount === 'number' ? unreadCount : 0;

    /* position the dropdown using fixed coords so it escapes any overflow/stacking context */
    const openDropdown = useCallback(() => {
        if (!bellRef.current) return;
        const rect   = bellRef.current.getBoundingClientRect();
        const dropW  = 340;
        const spaceRight = window.innerWidth - rect.left;
        const flipLeft   = spaceRight < dropW + 16; // not enough space on the right

        setDropPos({
            top:      rect.bottom + 8,
            left:     flipLeft ? rect.right - dropW : rect.left,
            flipLeft,
        });
        setIsOpen(true);
    }, []);

    /* close on outside click */
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (
                bellRef.current && !bellRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    /* reposition if window resizes while open */
    useEffect(() => {
        if (!isOpen) return;
        const handler = () => openDropdown();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [isOpen, openDropdown]);

    const handleBellClick = () => {
        if (isOpen) { setIsOpen(false); return; }
        openDropdown();
    };

    const handleNotificationClick = (n) => {
        if (!n.is_read) markAsRead(n.id);
        setIsOpen(false);
        if (n.related_link) navigate(n.related_link);
    };

    return (
        <>
            {/* ── Bell button ─────────────────────────────────────────── */}
            <button
                ref={bellRef}
                id="notification-bell-btn"
                onClick={handleBellClick}
                title="Notifications"
                style={{
                    position: 'relative',
                    padding: '8px',
                    background: isOpen ? '#FEF3F2' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isOpen ? '#B37869' : '#6B7280',
                    transition: 'background 0.2s, color 0.2s',
                    outline: 'none',
                }}
                onMouseEnter={e => {
                    if (!isOpen) {
                        e.currentTarget.style.background = '#FEF3F2';
                        e.currentTarget.style.color = '#B37869';
                    }
                }}
                onMouseLeave={e => {
                    if (!isOpen) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6B7280';
                    }
                }}
            >
                <Bell size={22} />

                {/* unread badge */}
                {safeCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        boxShadow: '0 1px 4px rgba(239,68,68,0.5)',
                        animation: 'notifPulse 2s infinite',
                    }}>
                        {safeCount > 99 ? '99+' : safeCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown (fixed position = escapes overflow clipping) ── */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: dropPos.top,
                        left: dropPos.left,
                        width: '340px',
                        maxHeight: '480px',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                        border: '1px solid #F3E8E4',
                        zIndex: 99999,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'linear-gradient(135deg, #B37869 0%, #C89080 100%)',
                        flexShrink: 0,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={16} color="white" />
                            <span style={{ fontWeight: 700, fontSize: '15px', color: 'white', letterSpacing: '0.01em' }}>
                                Notifications
                            </span>
                            {safeCount > 0 && (
                                <span style={{
                                    background: 'rgba(255,255,255,0.25)',
                                    color: 'white',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '1px 8px',
                                    borderRadius: '9999px',
                                }}>
                                    {safeCount} new
                                </span>
                            )}
                        </div>
                        {safeCount > 0 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    color: 'white',
                                    fontWeight: 600,
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            >
                                <CheckCheck size={12} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {safeNotifications.length === 0 ? (
                            <div style={{
                                padding: '48px 24px',
                                textAlign: 'center',
                                color: '#9CA3AF',
                            }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: '#FEF3F2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 12px',
                                }}>
                                    <Bell size={24} color="#B37869" />
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>
                                    All caught up!
                                </p>
                                <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            safeNotifications.map((n, idx) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderBottom: idx < safeNotifications.length - 1 ? '1px solid #F9FAFB' : 'none',
                                        cursor: 'pointer',
                                        backgroundColor: n.is_read ? 'white' : '#FEF7F5',
                                        borderLeft: n.is_read ? '3px solid transparent' : '3px solid #B37869',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9F3F1'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = n.is_read ? 'white' : '#FEF7F5'}
                                >
                                    {/* icon circle */}
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        backgroundColor: typeColor(n.notification_type) + '18',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: typeColor(n.notification_type),
                                        flexShrink: 0,
                                        marginTop: '2px',
                                    }}>
                                        {typeIcon(n.notification_type)}
                                    </div>

                                    {/* text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                            <span style={{
                                                fontWeight: n.is_read ? 500 : 700,
                                                fontSize: '13px',
                                                color: '#111827',
                                                lineHeight: '1.3',
                                            }}>
                                                {n.title}
                                            </span>
                                            {!n.is_read && (
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#B37869',
                                                    flexShrink: 0,
                                                    marginTop: '4px',
                                                }} />
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6B7280',
                                            margin: '3px 0 4px',
                                            lineHeight: '1.4',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {n.message}
                                        </p>
                                        <span style={{ fontSize: '11px', color: '#B37869', fontWeight: 500 }}>
                                            {timeAgo(n.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {safeNotifications.length > 0 && (
                        <div style={{
                            padding: '10px 16px',
                            borderTop: '1px solid #F3F4F6',
                            textAlign: 'center',
                            flexShrink: 0,
                            background: '#FAFAFA',
                        }}>
                            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                {safeNotifications.length} notification{safeNotifications.length !== 1 ? 's' : ''} total
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* pulse animation for badge */}
            <style>{`
                @keyframes notifPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.18); }
                }
            `}</style>
        </>
    );
};

export default NotificationBell;
