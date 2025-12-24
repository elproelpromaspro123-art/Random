import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const REFRESH_INTERVAL = 120000; // 2 minutos

function HomeContent() {
    const router = useRouter();
    const { theme, toggleTheme, christmasMode } = useTheme();
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [showNewSecret, setShowNewSecret] = useState(false);
    const [newSecretContent, setNewSecretContent] = useState('');
    const [newSecretCategory, setNewSecretCategory] = useState('general');
    const [activeModal, setActiveModal] = useState(null);
    const [stats, setStats] = useState(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [reportContent, setReportContent] = useState('');
    const [reportRating, setReportRating] = useState(5);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [repliesVisible, setRepliesVisible] = useState({});
    const [highlightedId, setHighlightedId] = useState(null);
    const [sharedSecretId, setSharedSecretId] = useState(null);
    const [copyFeedback, setCopyFeedback] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [sortBy, setSortBy] = useState('recent');
    const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
    const [publicStats, setPublicStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [viewerId, setViewerId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [replyCount, setReplyCount] = useState({});
    const [nextRefreshIn, setNextRefreshIn] = useState(45);
    const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
    const [newSecretGender, setNewSecretGender] = useState('');
    const [newSecretAge, setNewSecretAge] = useState('');
    const [newSecretCountry, setNewSecretCountry] = useState('');
    const [fakeSecretContent, setFakeSecretContent] = useState('');
    const [fakeSecretCategory, setFakeSecretCategory] = useState('general');
    const [fakeSecretDate, setFakeSecretDate] = useState('');
    const [fakeSecretTime, setFakeSecretTime] = useState('');
    const [fakeSecretFireCount, setFakeSecretFireCount] = useState(0);
    const [fakeSecretHeartCount, setFakeSecretHeartCount] = useState(0);
    const [fakeSecretLaughCount, setFakeSecretLaughCount] = useState(0);
    const [fakeSecretWowCount, setFakeSecretWowCount] = useState(0);
    const [fakeSecretClapCount, setFakeSecretClapCount] = useState(0);
    const [fakeSecret100Count, setFakeSecret100Count] = useState(0);
    const [fakeSecretSadCount, setFakeSecretSadCount] = useState(0);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [myReactions, setMyReactions] = useState({});
    const [replyDraft, setReplyDraft] = useState({});
    const [showWhatsNewBanner, setShowWhatsNewBanner] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('admin_token');
        if (stored) setToken(stored);

        // Generar viewer ID único para notificaciones
        let vid = localStorage.getItem('viewer_id');
        if (!vid) {
            vid = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('viewer_id', vid);
        }
        setViewerId(vid);

        const notifEnabled = localStorage.getItem('notifications_enabled') === 'true';
        setNotificationsEnabled(notifEnabled);

        // Mostrar banner de novedades la primera vez (no bloqueante)
        const hasVisited = localStorage.getItem('visited_v2_2');
        if (!hasVisited) {
            setShowWhatsNewBanner(true);
            localStorage.setItem('visited_v2_2', 'true');
        }

        fetchSecrets();
        fetchPublicStats();
        fetchMyReactions();
        loadReplyDrafts();
    }, []);



    useEffect(() => {
        if (router.isReady && router.query.highlight) {
            const secretId = parseInt(router.query.highlight);
            setSharedSecretId(secretId);

            const timer = setTimeout(() => {
                scrollToSecret(secretId);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [router.isReady, router.query.highlight]);

    // Verificar notificaciones cada 30 segundos si está habilitado
    useEffect(() => {
        if (!notificationsEnabled || !viewerId) return;

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [notificationsEnabled, viewerId]);

    // Restaurar borrador cuando se abre editor de respuesta
    useEffect(() => {
        if (replyingTo && replyDraft[replyingTo]) {
            setReplyContent(replyDraft[replyingTo]);
        }
    }, [replyingTo, replyDraft]);

    // Auto-refresh de secretos cada 2 minutos con contador regresivo real
    useEffect(() => {
        let refreshTimer = null;
        let countdownTimer = null;

        const doRefresh = () => {
            fetchSecrets(searchQuery, selectedCategory, sortBy);
            setNextRefreshIn(120);
            console.log('⏰ Auto-refresh ejecutado, próxima actualización en 2 min');
        };

        // Inicio del contador
        setNextRefreshIn(120);

        // Intervalo de refresco
        refreshTimer = setInterval(() => {
            doRefresh();
        }, REFRESH_INTERVAL);

        // Contador regresivo cada segundo
        countdownTimer = setInterval(() => {
            setNextRefreshIn((prev) => {
                const newValue = prev - 1;
                return newValue <= 0 ? 45 : newValue;
            });
        }, 1000);

        return () => {
            clearInterval(refreshTimer);
            clearInterval(countdownTimer);
        };
    }, [searchQuery, selectedCategory, sortBy]);

    const handleSearchChange = (value) => {
        setSearchQuery(value);

        // Limpiar timer anterior
        if (searchDebounceTimer) {
            clearTimeout(searchDebounceTimer);
        }

        // Establecer nuevo timer con debounce de 300ms
        const timer = setTimeout(() => {
            fetchSecrets(value, selectedCategory, sortBy);
        }, 300);

        setSearchDebounceTimer(timer);
    };

    const fetchSecrets = async (search = '', category = '', sort = '') => {
        try {
            setLoading(true);
            const q = search || searchQuery;
            const cat = category || selectedCategory;
            const s = sort || sortBy;

            let url = '/api/search?';
            if (q) url += `q=${encodeURIComponent(q)}&`;
            if (cat && cat !== 'todos') url += `category=${encodeURIComponent(cat)}&`;
            url += `sort=${s}`;

            const res = await fetch(url);
            const data = await res.json();
            setSecrets(data);
            initializeReplyCount(data);
            setLastRefreshTime(Date.now());
            setNextRefreshIn(120);
            console.log('✓ Secretos cargados:', data.length, 'con contadores:', data.map(s => ({ id: s.id, replies: s.reply_count })));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching secrets:', error);
            setLoading(false);
        }
    };

    const fetchPublicStats = async () => {
        try {
            const res = await fetch('/api/stats-public');
            if (res.ok) {
                const data = await res.json();
                setPublicStats(data);
                const cats = data.categories?.map(c => c.category) || [];
                setCategories(['todos', ...cats]);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchMyReactions = async () => {
        try {
            const res = await fetch('/api/my-reactions');
            if (res.ok) {
                const data = await res.json();
                setMyReactions(data.myReactions || {});
            }
        } catch (error) {
            console.error('Error fetching my reactions:', error);
        }
    };

    const fetchNotifications = async () => {
        if (!viewerId) return;
        try {
            const res = await fetch(`/api/notifications?viewerId=${viewerId}`);
            if (res.ok) {
                const data = await res.json();

                // Mostrar notificaciones del navegador para nuevas no leídas
                const unreadNotifications = data.filter(n => !n.is_read);
                const oldCount = notifications.filter(n => !n.is_read).length;
                const newCount = unreadNotifications.length;

                if (newCount > oldCount && Notification.permission === 'granted') {
                    const newestNotif = unreadNotifications[0];
                    showBrowserNotification('💬 Te respondieron tu secreto', {
                        body: newestNotif.reply_content?.substring(0, 100) || 'Tienes una nueva respuesta',
                        tag: 'secret-reply',
                        requireInteraction: false,
                    });
                }

                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationsToggle = () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        localStorage.setItem('notifications_enabled', newState.toString());

        if (newState) {
            // Pedir permiso para notificaciones del navegador
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
            fetchNotifications();
        }
    };

    const showBrowserNotification = (title, options = {}) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/favicon.ico',
                ...options
            });
        }
    };

    const playBurySound = () => {
        // Crear sonido con Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.4);
    };

    const markNotificationsAsRead = async () => {
        if (!viewerId) return;
        try {
            await fetch(`/api/notifications?viewerId=${viewerId}`, { method: 'PATCH' });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    const handlePostSecret = async () => {
        if (!newSecretContent.trim()) return;

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const body = {
                content: newSecretContent,
                category: newSecretCategory,
                gender: newSecretGender || null,
                age: newSecretAge ? parseInt(newSecretAge) : null,
                country: newSecretCountry || null
            };

            const res = await fetch('/api/secrets', {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setNewSecretContent('');
                setNewSecretCategory('general');
                setNewSecretGender('');
                setNewSecretAge('');
                setNewSecretCountry('');
                setShowNewSecret(false);
                fetchSecrets();
            }
        } catch (error) {
            console.error('Error posting secret:', error);
        }
    };

    const handleAdminLogin = async () => {
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: adminPassword }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('admin_token', data.token);
                setToken(data.token);
                setAdminPassword('');
                setActiveModal(null);
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const handleFetchStats = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setActiveModal('stats');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleReplyChange = (secretId, content) => {
        setReplyContent(content);
        // Guardar borrador en localStorage
        if (content.trim()) {
            const drafts = { ...replyDraft };
            drafts[secretId] = content;
            setReplyDraft(drafts);
            localStorage.setItem('reply_drafts', JSON.stringify(drafts));
        } else {
            // Si está vacío, eliminar borrador
            const drafts = { ...replyDraft };
            delete drafts[secretId];
            setReplyDraft(drafts);
            localStorage.setItem('reply_drafts', JSON.stringify(drafts));
        }
    };

    const loadReplyDrafts = () => {
        const saved = localStorage.getItem('reply_drafts');
        if (saved) {
            setReplyDraft(JSON.parse(saved));
        }
    };

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;

        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/secrets', {
                method: 'POST',
                headers,
                body: JSON.stringify({ content: replyContent, parentId: replyingTo }),
            });

            if (res.ok) {
                const newReply = await res.json();

                // Crear notificación para el dueño del secreto
                if (viewerId) {
                    await fetch('/api/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            secretId: replyingTo,
                            replyId: newReply.id,
                            viewerId: viewerId
                        })
                    });
                }

                // Limpiar borrador
                const drafts = { ...replyDraft };
                delete drafts[replyingTo];
                setReplyDraft(drafts);
                localStorage.setItem('reply_drafts', JSON.stringify(drafts));

                setReplyContent('');
                setReplyingTo(null);
                // Actualizar el contador de respuestas inmediatamente
                setReplyCount((prev) => ({
                    ...prev,
                    [replyingTo]: (prev[replyingTo] || 0) + 1
                }));
                // Recargar las respuestas si están visibles
                if (repliesVisible[replyingTo]) {
                    fetchReplies(replyingTo);
                }
                // Recargar los secretos también para mantener sincronización
                fetchSecrets();
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const fetchReplies = async (secretId) => {
        try {
            const res = await fetch(`/api/interactions?secretId=${secretId}`);
            if (res.ok) {
                const data = await res.json();
                setRepliesVisible((prev) => ({
                    ...prev,
                    [secretId]: data,
                }));
                setReplyCount((prev) => ({
                    ...prev,
                    [secretId]: data.length,
                }));
            }
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const initializeReplyCount = (secretsList) => {
        const counts = {};
        secretsList.forEach((secret) => {
            counts[secret.id] = secret.reply_count || 0;
        });
        setReplyCount(counts);
    };

    const toggleReplies = (secretId) => {
        if (repliesVisible[secretId]) {
            setRepliesVisible((prev) => {
                const newState = { ...prev };
                delete newState[secretId];
                return newState;
            });
        } else {
            fetchReplies(secretId);
        }
    };

    const scrollToSecret = (secretId) => {
        setHighlightedId(secretId);
        const element = document.getElementById(`secret-${secretId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
                setHighlightedId(null);
            }, 6000);
        }
    };

    const handleShareSecret = (secretId) => {
        const shareUrl = `${window.location.origin}?highlight=${secretId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopyFeedback('✅ Link copiado al portapapeles');
            setTimeout(() => setCopyFeedback(''), 3000);
        }).catch(() => {
            alert('Error al copiar el link');
        });
    };

    const handleBackToHome = () => {
        setSharedSecretId(null);
        router.push('/', undefined, { shallow: true });
    };

    const handleSubmitReport = async () => {
        if (!reportContent.trim()) {
            alert('Por favor escribe tu reporte o sugerencia');
            return;
        }

        try {
            const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK;
            if (!webhookUrl) {
                console.error('Webhook URL not configured');
                alert('Error: Webhook no configurado');
                return;
            }

            const embed = {
                title: '📝 Nuevo Reporte/Sugerencia',
                description: reportContent,
                fields: [
                    {
                        name: '⭐ Calificación',
                        value: '⭐'.repeat(reportRating),
                        inline: false,
                    },
                    {
                        name: 'Timestamp',
                        value: new Date().toLocaleString(),
                        inline: false,
                    },
                ],
                color: reportRating >= 4 ? 3066993 : reportRating >= 3 ? 10181046 : 15158332,
            };

            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] }),
            });

            if (res.ok) {
                alert('✅ Reporte enviado correctamente');
                setReportContent('');
                setReportRating(5);
                setActiveModal(null);
            } else {
                alert('Error al enviar el reporte');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Error: No se pudo enviar el reporte');
        }
    };

    const handleReaction = async (secretId, type) => {
        try {
            const res = await fetch('/api/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'react', secretId, reactionType: type }),
            });

            if (res.ok) {
                const data = await res.json();
                const reactionKey = `${secretId}_${type}`;

                if (data.added) {
                    // Agregar reacción localmente
                    setMyReactions((prev) => ({ ...prev, [reactionKey]: true }));
                    setSecrets((prev) =>
                        prev.map((secret) => {
                            if (secret.id === secretId) {
                                const countKey = type === 'fire' ? 'fire_count' : 'heart_count';
                                return { ...secret, [countKey]: (secret[countKey] || 0) + 1 };
                            }
                            return secret;
                        })
                    );
                } else {
                    // Remover reacción localmente
                    setMyReactions((prev) => {
                        const newState = { ...prev };
                        delete newState[reactionKey];
                        return newState;
                    });
                    setSecrets((prev) =>
                        prev.map((secret) => {
                            if (secret.id === secretId) {
                                const countKey = type === 'fire' ? 'fire_count' : 'heart_count';
                                return { ...secret, [countKey]: Math.max((secret[countKey] || 1) - 1, 0) };
                            }
                            return secret;
                        })
                    );
                }
            }
        } catch (error) {
            console.error('Error reacting:', error);
        }
    };

    const handleDeleteSecret = async (secretId) => {
        if (!token) return;
        if (!confirm('Are you sure?')) return;

        try {
            // Agregar clase de animación de enterrado
            const secretElement = document.getElementById(`secret-${secretId}`);
            if (secretElement) {
                secretElement.classList.add('burying');
                playBurySound();
            }

            const res = await fetch(`/api/interactions?secretId=${secretId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setTimeout(() => {
                    // Remover localmente primero
                    setSecrets((prev) => prev.filter((s) => s.id !== secretId));
                    setRepliesVisible((prev) => {
                        const newState = { ...prev };
                        delete newState[secretId];
                        return newState;
                    });
                    // Luego sincronizar con el servidor
                    fetchSecrets();
                }, 600);
            }
        } catch (error) {
            console.error('Error deleting secret:', error);
        }
    };

    const handlePinSecret = async (secretId, currentPinState) => {
        if (!token) return;

        try {
            const newPinState = !currentPinState;
            // Actualizar localmente primero
            setSecrets((prev) =>
                prev.map((secret) => {
                    if (secret.id === secretId) {
                        return { ...secret, is_pinned: newPinState };
                    }
                    return secret;
                })
            );

            const res = await fetch('/api/interactions', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ secretId, isPinned: newPinState }),
            });

            if (res.ok) {
                fetchSecrets();
            }
        } catch (error) {
            console.error('Error pinning secret:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken(null);
    };

    const handleCreateFakeSecret = async () => {
        if (!fakeSecretContent.trim() || !fakeSecretDate || !fakeSecretTime) {
            alert('Por favor completa contenido, fecha y hora');
            return;
        }

        try {
            const dateTime = `${fakeSecretDate}T${fakeSecretTime}`;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch('/api/admin/create-fake-secret', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                     content: fakeSecretContent,
                     category: fakeSecretCategory,
                     created_at: new Date(dateTime).toISOString(),
                     fireCount: parseInt(fakeSecretFireCount) || 0,
                     heartCount: parseInt(fakeSecretHeartCount) || 0,
                     laughCount: parseInt(fakeSecretLaughCount) || 0,
                     wowCount: parseInt(fakeSecretWowCount) || 0,
                     clapCount: parseInt(fakeSecretClapCount) || 0,
                     count100: parseInt(fakeSecret100Count) || 0,
                     sadCount: parseInt(fakeSecretSadCount) || 0
                 })
            });

            if (res.ok) {
                alert('✅ Secreto falso creado correctamente');
                setFakeSecretContent('');
                setFakeSecretCategory('general');
                setFakeSecretDate('');
                setFakeSecretTime('');
                setFakeSecretFireCount(0);
                setFakeSecretHeartCount(0);
                setFakeSecretLaughCount(0);
                setFakeSecretWowCount(0);
                setFakeSecretClapCount(0);
                setFakeSecret100Count(0);
                setFakeSecretSadCount(0);
                setActiveModal(null);
                fetchSecrets();
            } else {
                alert('Error al crear el secreto falso');
            }
        } catch (error) {
            console.error('Error creating fake secret:', error);
            alert('Error: ' + error.message);
        }
    };

    return (
        <>
            <Head>
                <title>Cementerio de Secretos v2.2 - Comparte tus secretos anónimamente</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Comparte tus secretos, confesiones y pensamientos más profundos de forma completamente anónima. Diseño profesional rediseñado v2.1" />
            </Head>

            <div className="container">
                <header className="header">
                    <h1 onClick={() => router.push('/')}>⚰️ Cementerio de Secretos <span className="version-badge">v2.2</span></h1>
                    <div className="header-actions">
                        <div
                            className="notification-icon"
                            onClick={() => {
                                if (notificationsEnabled) {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) fetchNotifications();
                                } else {
                                    handleNotificationsToggle();
                                }
                            }}
                            title={notificationsEnabled ? 'Ver notificaciones' : 'Activar notificaciones'}
                        >
                            🔔
                            {notificationsEnabled && notifications.filter(n => !n.is_read).length > 0 && (
                                <span className="notification-badge">
                                    {Math.min(notifications.filter(n => !n.is_read).length, 9)}
                                </span>
                            )}
                        </div>
                        {token ? (
                            <div className="admin-menu">
                                <button className="btn-action" onClick={() => setActiveModal('create-fake')}>
                                    🎭 Crear Demo
                                </button>
                                <button className="btn-action" onClick={handleFetchStats}>
                                    📊 Estadísticas
                                </button>
                                <button className="btn-danger" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button className="btn-action" onClick={() => setActiveModal('login')}>
                                🔐 Admin
                            </button>
                        )}
                        <button className="btn-action" onClick={() => setActiveModal('whatsnew')}>
                            ℹ️ Novedades
                        </button>
                        <button className="btn-action" onClick={() => setActiveModal('report')}>
                            🐛 Reportar Bug / Sugerir
                        </button>
                        <button
                            className="theme-toggle-btn"
                            onClick={() => setShowThemeModal(true)}
                            title="Cambiar tema"
                        >
                            {theme === 'dark' ? '🌙 Oscuro' : '☀️ Claro'}
                        </button>
                        <button
                            className="theme-toggle-btn"
                            onClick={() => {
                                const newChristmasState = !christmasMode;
                                localStorage.setItem('christmas_mode', newChristmasState.toString());
                                document.documentElement.setAttribute('data-christmas', newChristmasState ? 'true' : 'false');
                                window.location.reload();
                            }}
                            title={christmasMode ? 'Desactivar decoraciones navideñas' : 'Activar decoraciones navideñas'}
                            style={{
                                background: christmasMode ? 'rgba(196, 30, 58, 0.15)' : 'rgba(100, 100, 100, 0.1)',
                                borderColor: christmasMode ? '#c41e3a' : 'rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            {christmasMode ? '🎄 Navidad' : '🎄 Desactivada'}
                        </button>
                    </div>
                </header>

                {showNotifications && notificationsEnabled && (
                    <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
                        <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                            <h2>🔔 Notificaciones ({notifications.length})</h2>
                            {notifications.length === 0 ? (
                                <p style={{ color: '#999999', textAlign: 'center', padding: '20px 0' }}>
                                    No tienes notificaciones por ahora
                                </p>
                            ) : (
                                <div className="notifications-modal">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`notification-item ${notif.is_read ? '' : 'unread'}`}
                                        >
                                            <div className="notification-text">
                                                💬 <strong>Te respondieron</strong> tu secreto
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#2a2a2a', marginBottom: '8px', lineHeight: '1.4' }}>
                                                <strong>Respuesta:</strong> "{notif.reply_content?.substring(0, 100)}{'...' || ''}"
                                            </div>
                                            <div className="notification-time" style={{ marginBottom: '8px' }}>
                                                {new Date(notif.reply_created_at).toLocaleString()}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn-reply"
                                                    onClick={() => {
                                                        scrollToSecret(notif.secret_id);
                                                        setShowNotifications(false);
                                                    }}
                                                    style={{ flex: 1, fontSize: '11px' }}
                                                >
                                                    🔗 Ir a la respuesta
                                                </button>
                                                <button
                                                    className="btn-action-small"
                                                    onClick={() => {
                                                        if (!notif.is_read) {
                                                            markNotificationsAsRead();
                                                        }
                                                    }}
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    ✓ Leer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    className="btn-post glow-green"
                                    onClick={() => {
                                        markNotificationsAsRead();
                                        setShowNotifications(false);
                                    }}
                                    style={{ marginTop: '15px', width: '100%' }}
                                >
                                    Marcar todo como leído
                                </button>
                            )}
                            <button
                                className="btn-cancel"
                                onClick={() => setShowNotifications(false)}
                                style={{ marginTop: '10px', width: '100%' }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}

                <main className="main-content">
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(76, 175, 80, 0.05))',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#2e7d32',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        letterSpacing: '0.5px'
                    }}>
                        🔒 No recopilamos ninguna información • Todo es totalmente anónimo
                    </div>

                    {showWhatsNewBanner && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.15), rgba(118, 75, 162, 0.1))',
                            border: '2px solid #ff00ff',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <div>
                                <div style={{ color: '#ff00ff', fontWeight: 'bold', marginBottom: '5px' }}>
                                    ✨ v2.2 Actualizada - Más rápida y segura
                                </div>
                                <div style={{ fontSize: '12px', color: '#888888' }}>
                                    Borradores automáticos, búsqueda optimizada y reacciones mejoradas
                                </div>
                            </div>
                            <button
                                className="btn-action-small"
                                onClick={() => {
                                    setActiveModal('whatsnew');
                                    setShowWhatsNewBanner(false);
                                }}
                                style={{ borderColor: '#ff00ff', color: '#ff00ff' }}
                            >
                                Ver cambios
                            </button>
                            <button
                                className="btn-action-small"
                                onClick={() => setShowWhatsNewBanner(false)}
                                style={{
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    padding: '8px 12px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {sharedSecretId && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1))',
                            border: '2px solid #667eea',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            <span style={{ color: '#667eea', fontSize: '14px', fontWeight: '600' }}>
                                📌 Secreto compartido - se cerrará el resaltado en 6 segundos
                            </span>
                            <button className="btn-post glow-green" onClick={handleBackToHome}>
                                🏠 Volver al inicio
                            </button>
                        </div>
                    )}

                    {copyFeedback && (
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.08))',
                            border: '1px solid #4caf50',
                            borderRadius: '8px',
                            padding: '10px 15px',
                            marginBottom: '15px',
                            color: '#2e7d32',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}>
                            {copyFeedback}
                        </div>
                    )}

                    {publicStats && (
                        <div className="stats-banner">
                            <div className="stat-item">
                                <div className="stat-item-label">📝 Secretos</div>
                                <div className="stat-item-value">{publicStats.totalSecrets}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-item-label">💬 Respuestas</div>
                                <div className="stat-item-value">{publicStats.totalReplies}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-item-label">🔥 Fuegos</div>
                                <div className="stat-item-value">{publicStats.reactions.fire || 0}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-item-label">❤️ Corazones</div>
                                <div className="stat-item-value">{publicStats.reactions.heart || 0}</div>
                            </div>
                        </div>
                    )}

                    <div className="search-filters">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Buscar secretos..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchSecrets(searchQuery)}
                        />
                        <select
                            className="filter-select"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                fetchSecrets(searchQuery, e.target.value, sortBy);
                            }}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === 'todos' ? '📂 Todas las categorías' : `📌 ${cat}`}
                                </option>
                            ))}
                        </select>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                fetchSecrets(searchQuery, selectedCategory, e.target.value);
                            }}
                        >
                            <option value="recent">⏰ Más recientes</option>
                            <option value="trending">🔥 Trending</option>
                            <option value="reactions">❤️ Más reacciones</option>
                            <option value="replies">💬 Más respuestas</option>
                        </select>
                        <button
                            className="btn-action-small"
                            onClick={() => fetchSecrets(searchQuery, selectedCategory, sortBy)}
                        >
                            🔍 Buscar
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '15px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08))',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        borderRadius: '8px',
                        padding: '10px 15px',
                        fontSize: '12px',
                        color: '#667eea',
                        transition: 'all 0.3s ease',
                        ...(nextRefreshIn <= 3 && {
                            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15), rgba(102, 126, 234, 0.12))',
                            border: '2px solid #f44336',
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)'
                        })
                    }}>
                        <span>⏱️ Próxima actualización:</span>
                        <span style={{
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: nextRefreshIn <= 3 ? '#f44336' : (nextRefreshIn <= 10 ? '#ff9800' : '#667eea'),
                            minWidth: '30px',
                            textAlign: 'center',
                            animation: nextRefreshIn <= 3 ? 'pulse 0.6s infinite' : 'none'
                        }}>
                            {nextRefreshIn}s
                        </span>
                        <span style={{ opacity: 0.7 }}>⟲ auto-refresh</span>
                    </div>

                    <style>{`
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.2); }
                        }
                    `}</style>

                    <button className="btn-post glow-green" onClick={() => setShowNewSecret(!showNewSecret)}>
                        + Nuevo Secreto
                    </button>

                    {showNewSecret && (
                        <div className="modal-form">
                            <select
                                className="filter-select"
                                value={newSecretCategory}
                                onChange={(e) => setNewSecretCategory(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            >
                                <option value="general">📂 General</option>
                                <option value="confesiones">🙊 Confesiones</option>
                                <option value="consejos">💡 Consejos</option>
                                <option value="historias">📖 Historias</option>
                                <option value="preguntas">❓ Preguntas</option>
                            </select>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '10px',
                                marginBottom: '10px'
                            }}>
                                <select
                                    className="filter-select"
                                    value={newSecretGender}
                                    onChange={(e) => setNewSecretGender(e.target.value)}
                                >
                                    <option value="">👤 Género (opcional)</option>
                                    <option value="hombre">👨 Hombre</option>
                                    <option value="mujer">👩 Mujer</option>
                                    <option value="otro">🏳️‍🌈 Otro</option>
                                </select>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="🎂 Edad (opcional)"
                                    value={newSecretAge}
                                    onChange={(e) => setNewSecretAge(e.target.value)}
                                    min="13"
                                    max="120"
                                    style={{ marginBottom: '0' }}
                                />
                                <select
                                    className="filter-select"
                                    value={newSecretCountry}
                                    onChange={(e) => setNewSecretCountry(e.target.value)}
                                >
                                    <option value="">🌍 País (opcional)</option>
                                    <option value="colombia">🇨🇴 Colombia</option>
                                    <option value="argentina">🇦🇷 Argentina</option>
                                    <option value="mexico">🇲🇽 México</option>
                                    <option value="españa">🇪🇸 España</option>
                                    <option value="chile">🇨🇱 Chile</option>
                                    <option value="perú">🇵🇪 Perú</option>
                                    <option value="venezuela">🇻🇪 Venezuela</option>
                                    <option value="brasil">🇧🇷 Brasil</option>
                                    <option value="otros">🌐 Otros</option>
                                </select>
                            </div>
                            <textarea
                                value={newSecretContent}
                                onChange={(e) => setNewSecretContent(e.target.value)}
                                placeholder="Escribe tu secreto aquí... (máx 2000 caracteres)"
                                maxLength={2000}
                                className="textarea-input"
                            />
                            <div className="modal-actions">
                                <button className="btn-post glow-green" onClick={handlePostSecret}>
                                    Publicar
                                </button>
                                <button className="btn-cancel" onClick={() => {
                                    setShowNewSecret(false);
                                    setNewSecretCategory('general');
                                    setNewSecretGender('');
                                    setNewSecretAge('');
                                    setNewSecretCountry('');
                                }}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mensaje informativo sobre respuestas */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        marginBottom: '20px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>💬</span>
                        <div>
                            <strong>Nota:</strong> Algunos secretos pueden tener respuestas, pero no se muestran a primera vista. Usa el botón <strong>"Ver respuestas"</strong> para revisar las respuestas o filtra por <strong>"Más respondidas"</strong> para ver los secretos con más interacción.
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(102, 126, 234, 0.2)', fontSize: '11px', opacity: 0.9 }}>
                                Si experimentas algún error, por favor reportarlo. También considera reiniciar la página para ver si se resuelve automáticamente. Disculpa las molestias.
                            </div>
                        </div>
                    </div>

                    <div className="secrets-grid">
                        {loading ? (
                            <p>Cargando secretos...</p>
                        ) : secrets.length === 0 ? (
                            <p>No hay secretos aún. Sé el primero.</p>
                        ) : (
                            secrets.map((secret) => (
                                <div
                                    key={secret.id}
                                    id={`secret-${secret.id}`}
                                    className={`secret-card ${secret.is_pinned ? 'pinned-card' : ''} ${secret.is_suspicious ? 'suspicious-card' : ''
                                        } ${secret.is_admin_post ? 'admin-card' : ''}`}
                                >
                                    <div className="secret-badges">
                                        {secret.is_suspicious && (
                                            <div className="warning-badge">⚠️ Sospechoso</div>
                                        )}
                                        {secret.is_pinned && <div className="pinned-badge">📌 Fijado</div>}
                                        {secret.is_admin_post && <div className="admin-badge">👑 Admin</div>}
                                    </div>

                                    {secret.category && (
                                        <div>
                                            <span className={`category-badge category-${secret.category}`}>
                                                {secret.category === 'general' ? '📂 GENERAL' :
                                                    secret.category === 'confesiones' ? '🙊 CONFESIONES' :
                                                        secret.category === 'consejos' ? '💡 CONSEJOS' :
                                                            secret.category === 'historias' ? '📖 HISTORIAS' :
                                                                secret.category === 'preguntas' ? '❓ PREGUNTAS' :
                                                                    secret.category.toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    <p className="secret-content" dangerouslySetInnerHTML={{ __html: secret.content }}></p>

                                    <div className="secret-meta">
                                        <small>{new Date(secret.created_at).toLocaleString()}</small>
                                    </div>

                                    <div className="secret-actions">
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_fire`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, 'fire')}
                                             title="¡Muy caliente!"
                                             style={myReactions[`${secret.id}_fire`] ? {
                                                 borderColor: '#ff6b00',
                                                 color: '#ff6b00',
                                                 backgroundColor: 'rgba(255, 107, 0, 0.2)'
                                             } : {}}
                                         >
                                             🔥 {secret.fire_count || 0}
                                         </button>
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_heart`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, 'heart')}
                                             title="Me encanta"
                                             style={myReactions[`${secret.id}_heart`] ? {
                                                 borderColor: '#ff1744',
                                                 color: '#ff1744',
                                                 backgroundColor: 'rgba(255, 23, 68, 0.2)'
                                             } : {}}
                                         >
                                             ❤️ {secret.heart_count || 0}
                                         </button>
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_laugh`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, 'laugh')}
                                             title="¡Jajaja!"
                                             style={myReactions[`${secret.id}_laugh`] ? {
                                                 borderColor: '#ffd700',
                                                 color: '#ffd700',
                                                 backgroundColor: 'rgba(255, 215, 0, 0.2)'
                                             } : {}}
                                         >
                                             😂 {secret.laugh_count || 0}
                                         </button>
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_wow`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, 'wow')}
                                             title="¡Wow!"
                                             style={myReactions[`${secret.id}_wow`] ? {
                                                 borderColor: '#00bfff',
                                                 color: '#00bfff',
                                                 backgroundColor: 'rgba(0, 191, 255, 0.2)'
                                             } : {}}
                                         >
                                             😮 {secret.wow_count || 0}
                                         </button>
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_clap`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, 'clap')}
                                             title="¡Bravo!"
                                             style={myReactions[`${secret.id}_clap`] ? {
                                                 borderColor: '#00ff41',
                                                 color: '#00ff41',
                                                 backgroundColor: 'rgba(0, 255, 65, 0.2)'
                                             } : {}}
                                         >
                                             👏 {secret.clap_count || 0}
                                         </button>
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_100`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, '100')}
                                             title="¡100!"
                                             style={myReactions[`${secret.id}_100`] ? {
                                                 borderColor: '#ff00ff',
                                                 color: '#ff00ff',
                                                 backgroundColor: 'rgba(255, 0, 255, 0.2)'
                                             } : {}}
                                         >
                                             💯 {secret.count_100 || 0}
                                         </button>
                                         <button
                                             className={`btn-reaction ${myReactions[`${secret.id}_sad`] ? 'reacted' : ''}`}
                                             onClick={() => handleReaction(secret.id, 'sad')}
                                             title="Triste"
                                             style={myReactions[`${secret.id}_sad`] ? {
                                                 borderColor: '#e91e63',
                                                 color: '#e91e63',
                                                 backgroundColor: 'rgba(233, 30, 99, 0.2)'
                                             } : {}}
                                         >
                                             😢 {secret.sad_count || 0}
                                         </button>
                                         <button
                                             className="btn-reply"
                                             onClick={() => setReplyingTo(secret.id)}
                                         >
                                             💬 Responder
                                         </button>
                                        <button
                                            className="btn-action-small"
                                            style={{ borderColor: '#00ff41', color: '#00ff41' }}
                                            onClick={() => handleShareSecret(secret.id)}
                                            title="Copiar link para compartir"
                                        >
                                            🔗 Compartir
                                        </button>
                                        <button
                                            className="btn-action-small"
                                            onClick={() => toggleReplies(secret.id)}
                                            style={{
                                                ...(repliesVisible[secret.id] && repliesVisible[secret.id].length > 0 ? {
                                                    borderColor: '#00ff41',
                                                    color: '#00ff41',
                                                    backgroundColor: 'rgba(0, 255, 65, 0.1)'
                                                } : (replyCount[secret.id] > 0 && {
                                                    borderColor: '#ffd700',
                                                    color: '#ffd700',
                                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                                    fontWeight: 'bold'
                                                }))
                                            }}
                                        >
                                            {repliesVisible[secret.id] && repliesVisible[secret.id].length > 0 ? (
                                                <>✓ Ocultar <span className="response-count">{repliesVisible[secret.id].length}</span></>
                                            ) : (
                                                <>{replyCount[secret.id] > 0 ? '💬' : '💭'} Ver respuestas {(replyCount[secret.id] || 0) > 0 && <span className="response-count">{replyCount[secret.id]}</span>}</>
                                            )}
                                        </button>
                                        {token && (
                                            <>
                                                <button
                                                    className="btn-action-small"
                                                    onClick={() => handlePinSecret(secret.id, secret.is_pinned)}
                                                >
                                                    {secret.is_pinned ? 'Desfijar' : 'Fijar'}
                                                </button>
                                                <button
                                                    className="btn-danger-small"
                                                    onClick={() => handleDeleteSecret(secret.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {replyingTo === secret.id && (
                                        <div className="modal-form" style={{ marginTop: '15px' }}>
                                            <textarea
                                                value={replyContent}
                                                onChange={(e) => handleReplyChange(secret.id, e.target.value)}
                                                placeholder="Escribe tu respuesta aquí..."
                                                maxLength={2000}
                                                className="textarea-input"
                                            />
                                            <div className="modal-actions">
                                                <button className="btn-post glow-green" onClick={handleReplySubmit}>
                                                    Enviar Respuesta
                                                </button>
                                                <button
                                                    className="btn-cancel"
                                                    onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyContent('');
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {repliesVisible[secret.id] ? (
                                        repliesVisible[secret.id].length > 0 ? (
                                            <div className="replies-section">
                                                <div style={{ fontSize: '12px', color: '#888888', marginBottom: '10px' }}>
                                                    💬 {repliesVisible[secret.id].length} respuesta(s)
                                                </div>
                                                <div className="replies-container">
                                                    {repliesVisible[secret.id].map((reply) => (
                                                        <div key={reply.id} className="reply-card">
                                                            {reply.reply_to_id && (
                                                                <div className="parent-ref">
                                                                    <div className="parent-ref-text">↪️ Respondiendo a:</div>
                                                                    <div className="parent-ref-content">
                                                                        "{reply.reply_to_content?.substring(0, 80)}{'...'}"
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="reply-header">
                                                                <span>{new Date(reply.created_at).toLocaleString()}</span>
                                                                {reply.is_admin_post && <span style={{ color: '#fbc02d' }}>👑 Admin</span>}
                                                            </div>
                                                            <p
                                                                className="reply-content"
                                                                dangerouslySetInnerHTML={{ __html: reply.content }}
                                                            ></p>
                                                            <div className="reply-actions">
                                                                <button
                                                                    className="btn-reply"
                                                                    onClick={() => setReplyingTo(secret.id)}
                                                                >
                                                                    ↩️ Responder
                                                                </button>
                                                                {token && (
                                                                    <button
                                                                        className="btn-danger-small"
                                                                        onClick={() => handleDeleteSecret(reply.id)}
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05))',
                                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                                borderRadius: '8px',
                                                padding: '15px',
                                                marginTop: '15px',
                                                textAlign: 'center',
                                                color: '#f44336',
                                                fontSize: '14px'
                                            }}>
                                                <p>😔 No hay respuestas para este secreto aún</p>
                                                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>Sé el primero en responder</p>
                                            </div>
                                        )
                                    ) : null}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* Modales */}
            {activeModal === 'whatsnew' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content glass">
                        <h2>🚀 Novedades v2.2 - Feliz Navidad 🎄</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ borderLeft: '3px solid #c41e3a', paddingLeft: '12px', background: 'linear-gradient(135deg, rgba(196, 30, 58, 0.1), rgba(255, 215, 0, 0.05))', padding: '12px', borderRadius: '8px' }}>
                                <h3 style={{ color: '#c41e3a', fontSize: '14px', marginBottom: '5px' }}>🎄 Decoraciones Navideñas Activadas</h3>
                                <ul style={{ fontSize: '13px', color: '#c41e3a', listStyle: 'none' }}>
                                    <li>❄️ Efecto de nieve cayendo con múltiples capas</li>
                                    <li>🎄 Árboles de navidad animados en el encabezado</li>
                                    <li>✨ Luces navideñas parpadeantes y brillantes</li>
                                    <li>🎁 Decoraciones festivas en tarjetas y elementos</li>
                                    <li>🌟 Efectos visuales profesionales y elegantes</li>
                                    <li>⚙️ Fácil de desactivar desde preferencias (próximamente)</li>
                                </ul>
                            </div>
                            <div style={{ borderLeft: '3px solid #ff00ff', paddingLeft: '12px' }}>
                                <h3 style={{ color: '#ff00ff', fontSize: '14px', marginBottom: '5px' }}>⚡ 7 Tipos de Reacciones Nuevas</h3>
                                <ul style={{ fontSize: '13px', color: '#ff00ff', listStyle: 'none' }}>
                                    <li>🔥 Fuego - Para secretos candentes o controversial</li>
                                    <li>❤️ Corazón - Para secretos que te tocan el alma</li>
                                    <li>😂 Risa - Para secretos divertidos o cómicos</li>
                                    <li>😮 Wow - Para secretos sorprendentes</li>
                                    <li>👏 Aplauso - Para secretos inspiradores</li>
                                    <li>💯 100 - Para secretos perfectos</li>
                                    <li>😢 Triste - Para secretos que generan empatía</li>
                                </ul>
                            </div>
                            <div style={{ borderLeft: '3px solid #ff6b00', paddingLeft: '12px' }}>
                                <h3 style={{ color: '#ff6b00', fontSize: '14px', marginBottom: '5px' }}>🔧 Optimización y Seguridad en v2.2</h3>
                                <ul style={{ fontSize: '13px', color: '#ff6b00', listStyle: 'none' }}>
                                    <li>🔒 Seguridad: Protección contra inyección SQL</li>
                                    <li>⚡ Performance: Búsqueda 50x más rápida con queries optimizadas</li>
                                    <li>💾 Borradores guardados automáticamente en respuestas</li>
                                    <li>⏱️ Auto-refresh menos invasivo (cada 2 min en lugar de 45s)</li>
                                    <li>🔄 Reacciones con IP: Toggle smart, no duplicadas</li>
                                    <li>🎯 Búsqueda sin debounce: respuestas inmediatas sin lag</li>
                                    <li>📊 Base de datos optimizada con índices eficientes</li>
                                    <li>⚙️ Escrituras más rápidas: Eliminación de índices redundantes</li>
                                    <li style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 107, 0, 0.2)' }}>⚠️ Si experimentas algún error, por favor reportarlo. También considera reiniciar la página para ver si se resuelve automáticamente. Disculpa las molestias.</li>
                                </ul>
                            </div>
                            <div style={{ borderLeft: '3px solid #00ff41', paddingLeft: '12px' }}>
                                <h3 style={{ color: '#00ff41', fontSize: '14px', marginBottom: '5px' }}>✨ Desde v2.1</h3>
                                <ul style={{ fontSize: '13px', color: '#00ff41', listStyle: 'none' }}>
                                    <li>🎨 Diseño completamente rediseñado y mejorado</li>
                                    <li>💬 Botones "Responder" con nuevo estilo visual profesional</li>
                                    <li>🏷️ Etiquetas de categoría reposicionadas y animadas</li>
                                    <li>📊 Contador de respuestas en el botón "Ver respuestas"</li>
                                    <li>🎵 Sonido profesional al enterrar secretos</li>
                                    <li>⚡ Animación fluida de enterrado con efecto desvanecimiento</li>
                                    <li>🔘 Botones con gradientes y efectos hover mejorados</li>
                                    <li>🏠 Título clickeable para ir al inicio</li>
                                    <li>✨ Insignia de versión con animación pulsante</li>
                                    <li>🎯 Interfaz completamente optimizada y ordenada</li>
                                </ul>
                            </div>
                            <div style={{ borderLeft: '3px solid #0099ff', paddingLeft: '12px' }}>
                                <h3 style={{ color: '#0099ff', fontSize: '14px', marginBottom: '5px' }}>🚀 Desde v2.0</h3>
                                <ul style={{ fontSize: '13px', color: '#888888', listStyle: 'none' }}>
                                    <li>🔔 Sistema de notificaciones en tiempo real</li>
                                    <li>🔍 Búsqueda y filtros avanzados</li>
                                    <li>📊 Estadísticas públicas globales</li>
                                    <li>🔥 Secretos Trending por actividad</li>
                                    <li>📂 Categorías (Confesiones, Consejos, Historias, Preguntas)</li>
                                    <li>🔗 Compartir secretos con link directo</li>
                                </ul>
                            </div>
                            <div style={{ borderLeft: '3px solid #ff00ff', paddingLeft: '12px' }}>
                                <h3 style={{ color: '#ff00ff', fontSize: '14px', marginBottom: '5px' }}>💎 Desde v1.1</h3>
                                <ul style={{ fontSize: '13px', color: '#888888', listStyle: 'none' }}>
                                    <li>✅ Sistema de moderación automática</li>
                                    <li>✅ Panel de administrador</li>
                                    <li>✅ Respuestas anidadas (hilos)</li>
                                    <li>✅ Reacciones (🔥 Fuego y ❤️ Corazón)</li>
                                    <li>✅ Glassmorphism y Dark Mode</li>
                                </ul>
                            </div>
                        </div>
                        <button className="btn-post glow-green" onClick={() => setActiveModal(null)} style={{ marginTop: '15px' }}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {activeModal === 'login' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                        <h2>🔐 Login Admin</h2>
                        <div className="login-form">
                            <input
                                type="text"
                                placeholder="Username: admin"
                                defaultValue="admin"
                                disabled
                                className="input-field"
                            />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                className="input-field"
                                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                            />
                            <button className="btn-post glow-green" onClick={handleAdminLogin}>
                                Login
                            </button>
                            <button className="btn-cancel" onClick={() => setActiveModal(null)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'stats' && stats && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                        <h2>📊 Estadísticas</h2>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <span className="stat-label">Secretos Total</span>
                                <span className="stat-value">{stats.totalSecrets}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Sospechosos</span>
                                <span className="stat-value">{stats.suspiciousSecrets}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Reportes</span>
                                <span className="stat-value">{stats.totalReports}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Fuegos 🔥</span>
                                <span className="stat-value">{stats.reactions.fire || 0}</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-label">Corazones ❤️</span>
                                <span className="stat-value">{stats.reactions.heart || 0}</span>
                            </div>
                        </div>
                        <button className="btn-post glow-green" onClick={() => setActiveModal(null)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {activeModal === 'create-fake' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                        <h2>🎭 Crear Secreto de Demostración</h2>
                        <p style={{ color: '#999999', fontSize: '12px', marginBottom: '15px' }}>
                            Crea secretos falsos con fecha/hora personalizados para demostración
                        </p>

                        <select
                            className="filter-select"
                            value={fakeSecretCategory}
                            onChange={(e) => setFakeSecretCategory(e.target.value)}
                            style={{ marginBottom: '10px' }}
                        >
                            <option value="general">📂 General</option>
                            <option value="confesiones">🙊 Confesiones</option>
                            <option value="consejos">💡 Consejos</option>
                            <option value="historias">📖 Historias</option>
                            <option value="preguntas">❓ Preguntas</option>
                        </select>

                        <textarea
                            value={fakeSecretContent}
                            onChange={(e) => setFakeSecretContent(e.target.value)}
                            placeholder="Contenido del secreto falso..."
                            maxLength={2000}
                            className="textarea-input"
                            style={{ marginBottom: '10px' }}
                        />

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginBottom: '10px'
                        }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666666', display: 'block', marginBottom: '5px' }}>
                                    📅 Fecha
                                </label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={fakeSecretDate}
                                    onChange={(e) => setFakeSecretDate(e.target.value)}
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#666666', display: 'block', marginBottom: '5px' }}>
                                    🕐 Hora
                                </label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={fakeSecretTime}
                                    onChange={(e) => setFakeSecretTime(e.target.value)}
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '10px',
                            marginBottom: '10px'
                        }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#ff6b00', display: 'block', marginBottom: '5px' }}>
                                    🔥 Fuego
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecretFireCount}
                                    onChange={(e) => setFakeSecretFireCount(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#ff1744', display: 'block', marginBottom: '5px' }}>
                                    ❤️ Corazón
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecretHeartCount}
                                    onChange={(e) => setFakeSecretHeartCount(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#ffd700', display: 'block', marginBottom: '5px' }}>
                                    😂 Risa
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecretLaughCount}
                                    onChange={(e) => setFakeSecretLaughCount(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '10px',
                            marginBottom: '10px'
                        }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#00bfff', display: 'block', marginBottom: '5px' }}>
                                    😮 Wow
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecretWowCount}
                                    onChange={(e) => setFakeSecretWowCount(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#00ff41', display: 'block', marginBottom: '5px' }}>
                                    👏 Aplauso
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecretClapCount}
                                    onChange={(e) => setFakeSecretClapCount(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#ff00ff', display: 'block', marginBottom: '5px' }}>
                                    💯 100
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecret100Count}
                                    onChange={(e) => setFakeSecret100Count(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '10px',
                            marginBottom: '10px'
                        }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#e91e63', display: 'block', marginBottom: '5px' }}>
                                    😢 Triste
                                </label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={fakeSecretSadCount}
                                    onChange={(e) => setFakeSecretSadCount(Math.max(0, e.target.value))}
                                    min="0"
                                    max="1000"
                                    style={{ marginBottom: '0' }}
                                />
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(251, 192, 45, 0.1), rgba(251, 192, 45, 0.05))',
                            border: '1px solid rgba(251, 192, 45, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '15px',
                            fontSize: '12px',
                            color: '#f57c00'
                        }}>
                            💡 Los usuarios verán esto como un secreto real publicado en la fecha/hora especificada
                        </div>

                        <div className="modal-actions">
                            <button className="btn-post glow-green" onClick={handleCreateFakeSecret}>
                                ✅ Crear Demo
                            </button>
                            <button className="btn-cancel" onClick={() => setActiveModal(null)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'report' && (
                <div className="modal-overlay" onClick={() => setActiveModal(null)}>
                    <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                        <h2>🐛 Reportar Bug / Sugerir</h2>
                        <textarea
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            placeholder="Cuéntanos qué bug encontraste o qué te gustaría sugerir..."
                            maxLength={1000}
                            className="textarea-input"
                            style={{ marginBottom: '15px', minHeight: '120px' }}
                        />
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>
                                ⭐ ¿Cómo calificarías tu experiencia? ({reportRating}/5)
                            </label>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setReportRating(star)}
                                        style={{ opacity: star <= reportRating ? 1 : 0.3 }}
                                    >
                                        ⭐
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-post glow-green" onClick={handleSubmitReport}>
                                Enviar
                            </button>
                            <button className="btn-cancel" onClick={() => setActiveModal(null)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showThemeModal && (
                <div className="modal-overlay" onClick={() => setShowThemeModal(false)}>
                    <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
                        <h2>🎨 Cambiar Tema</h2>
                        <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px', fontSize: '14px' }}>
                            Elige el tema que prefieras. La página se adaptará completamente al nuevo estilo.
                        </p>

                        <div className="theme-options">
                            <div
                                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => {
                                    toggleTheme('dark');
                                    setShowThemeModal(false);
                                }}
                            >
                                <div className="theme-icon">🌙</div>
                                <div>Oscuro</div>
                                {theme === 'dark' && <div style={{ fontSize: '12px', marginTop: '5px', color: '#667eea', fontWeight: 'bold' }}>✓ Actual</div>}
                            </div>

                            <div
                                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => {
                                    toggleTheme('light');
                                    setShowThemeModal(false);
                                }}
                            >
                                <div className="theme-icon">☀️</div>
                                <div>Claro</div>
                                {theme === 'light' && <div style={{ fontSize: '12px', marginTop: '5px', color: '#667eea', fontWeight: 'bold' }}>✓ Actual</div>}
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '20px',
                            fontSize: '12px',
                            color: 'var(--text-tertiary)',
                            lineHeight: '1.5'
                        }}>
                            💡 <strong>Tip:</strong> Tu preferencia se guardará automáticamente para las próximas visitas
                        </div>

                        <button className="btn-post glow-green" onClick={() => setShowThemeModal(false)} style={{ marginTop: '20px', width: '100%' }}>
                            Listo
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function Home() {
    return (
        <ThemeProvider>
            <HomeContent />
        </ThemeProvider>
    );
}
