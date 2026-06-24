import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWixClient } from '../../context/WixContext';
import { useTranslation } from '../../context/LanguageContext';
import './WixChatWidget.css';

export const WixChatWidget = () => {
  const { t, locale } = useTranslation();
  const { wixClient, isReady } = useWixClient();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState(() => localStorage.getItem('kamibi_chat_convo_id') || '');
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'setup' | 'online' | 'fallback'
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Visual typing indicator state

  // Initial user info form for chat setup
  const [initForm, setInitForm] = useState({ name: '', email: '' });
  const [initError, setInitError] = useState('');
  const [diagInfo, setDiagInfo] = useState(null);
  const [runningDiag, setRunningDiag] = useState(false);

  // Fallback form states (for CMS fallback if WIX env keys are missing)
  const [fallbackForm, setFallbackForm] = useState({ name: '', email: '', message: '' });
  const [fallbackSubmitted, setFallbackSubmitted] = useState(false);
  const [fallbackSubmitting, setFallbackSubmitting] = useState(false);
  const [fallbackError, setFallbackError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of message history
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen, isTyping]);

  // Initial setup: retrieve conversation or check if logged in member
  useEffect(() => {
    if (!isReady || !wixClient) return;

    const checkStoredOrMember = async () => {
      try {
        if (conversationId) {
          // Verify conversation exists by listing messages
          const res = await fetch(`/api/chat?action=list&conversationId=${conversationId}`);
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();
              if (data.messages) {
                const sorted = [...data.messages].sort((a, b) => {
                  const dateA = new Date(a.createdDate || a.createdAt || a._createdDate || 0);
                  const dateB = new Date(b.createdDate || b.createdAt || b._createdDate || 0);
                  return dateA - dateB;
                });
                setMessages(sorted);
                setStatus('online');
                return;
              }
            }
          }
          // If stored ID is invalid/expired, clear it
          localStorage.removeItem('kamibi_chat_convo_id');
          localStorage.removeItem('kamibi_chat_contact_id');
          setConversationId('');
        }

        // Check if member is logged in to auto-initiate conversation
        try {
          const { member } = await wixClient.members.getCurrentMember();
          if (member) {
            const email = member.loginEmail || member.profile?.emails?.[0]?.address;
            const name = member.profile?.nickname || `${member.profile?.firstName || ''} ${member.profile?.lastName || ''}`.trim();
            if (email) {
              await initializeConversation(name || 'Member', email);
              return;
            }
          }
        } catch (err) {
          // Not logged in or failed to get member, proceed to manual setup
        }

        setStatus('setup');
      } catch (err) {
        console.error('[WixChat] Setup verification failed:', err);
        setStatus('fallback');
        setFallbackError(err.message || 'Error connection');
      }
    };

    checkStoredOrMember();
  }, [isReady, wixClient]);

  // Call serverless API to initialize conversation
  const initializeConversation = async (name, email) => {
    setLoading(true);
    setInitError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init', name, email }),
      });

      const contentType = res.headers.get('content-type');
      let data = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textErr = await res.text();
        throw new Error(textErr || 'A server error occurred');
      }

      if (!res.ok) {
        let errMsg = data.error || 'Failed to initialize chat';
        if (data.details) {
          errMsg += ` - ${data.details}`;
        }
        if (data.wixData) {
          errMsg += ` - Wix Details: ${JSON.stringify(data.wixData)}`;
        }
        throw new Error(errMsg);
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem('kamibi_chat_convo_id', data.conversationId);
        localStorage.setItem('kamibi_chat_contact_id', data.contactId);
        setStatus('online');
        await fetchMessages(data.conversationId);
      } else {
        throw new Error('No conversation ID returned');
      }
    } catch (err) {
      console.error('[WixChat] Initialization failed:', err);
      if (err.message?.includes('configure') || err.message?.includes('WIX_API_KEY')) {
        setStatus('fallback');
        setFallbackError(err.message);
      } else {
        setInitError(err.message || 'Error initializing conversation');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages from Wix
  const fetchMessages = async (convoId) => {
    if (!convoId) return;
    try {
      const res = await fetch(`/api/chat?action=list&conversationId=${convoId}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.messages) {
            const sorted = [...data.messages].sort((a, b) => {
              const dateA = new Date(a.createdDate || a.createdAt || a._createdDate || 0);
              const dateB = new Date(b.createdDate || b.createdAt || b._createdDate || 0);
              return dateA - dateB;
            });
            setMessages(sorted);
          }
        }
      }
    } catch (err) {
      console.error('[WixChat] Failed to fetch messages:', err);
    }
  };

  // Poll for new messages every 5 seconds when open
  useEffect(() => {
    if (status !== 'online' || !isOpen || !conversationId) return;

    const interval = setInterval(() => {
      fetchMessages(conversationId);
    }, 5000);

    return () => clearInterval(interval);
  }, [status, isOpen, conversationId]);

  // Send message helper
  const sendMessageToServer = async (text) => {
    setIsSending(true);
    // Optimistically add message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      direction: 'PARTICIPANT_TO_BUSINESS',
      createdAt: new Date().toISOString(),
      content: {
        basic: {
          items: [{ text }]
        }
      }
    };
    setMessages(prev => [...prev, tempMessage]);

    // Simulate typing feedback briefly when user sends a message
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', conversationId, text }),
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errMsg = 'Failed to send message';
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } else {
          errMsg = await res.text() || errMsg;
        }
        throw new Error(errMsg);
      }

      await fetchMessages(conversationId);
    } catch (err) {
      console.error('[WixChat] Error sending message:', err);
    } finally {
      setIsSending(false);
      // Turn off mock typing indicator after a short delay
      setTimeout(() => setIsTyping(false), 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !conversationId) return;

    const messageText = inputText.trim();
    setInputText('');
    await sendMessageToServer(messageText);
  };

  // Quick Prompts / FAQ options based on locale
  const quickPrompts = locale === 'es' ? [
    { text: '¿Cuáles son las opciones de envío? 🚚', reply: 'Hola! ¿Cuáles son las opciones de envío y entrega a domicilio?' },
    { text: '¿Dónde puedo retirar mi compra? 📍', reply: 'Hola! Quería consultar cuáles son los puntos de retiro o sucursales.' },
    { text: 'Quiero hablar con un asesor 💬', reply: 'Hola! Necesito asistencia personalizada con un asesor de soporte.' }
  ] : [
    { text: 'What are the shipping options? 🚚', reply: 'Hi! What are the shipping and home delivery options?' },
    { text: 'Where can I pick up my order? 📍', reply: 'Hi! I would like to know the pickup locations.' },
    { text: 'I want to speak with an agent 💬', reply: 'Hi! I need personalized assistance from a support agent.' }
  ];

  const handleQuickPromptClick = async (prompt) => {
    if (isSending || !conversationId) return;
    await sendMessageToServer(prompt.reply);
  };

  // Run diagnostics helper
  const runDiagnostics = async () => {
    setRunningDiag(true);
    setDiagInfo(null);
    try {
      const res = await fetch('/api/chat?action=diagnostic');
      if (res.ok) {
        const data = await res.json();
        setDiagInfo(data);
      } else {
        const text = await res.text();
        setDiagInfo({ error: `Backend returned ${res.status}: ${text}` });
      }
    } catch (err) {
      setDiagInfo({ error: err.message });
    } finally {
      setRunningDiag(false);
    }
  };

  // Fallback form submission
  const handleFallbackSubmit = async (e) => {
    e.preventDefault();
    if (!fallbackForm.email.trim() || !fallbackForm.message.trim() || fallbackSubmitting) return;

    setFallbackSubmitting(true);
    setFallbackError('');

    try {
      const payload = {
        type: 'contact',
        name: fallbackForm.name,
        email: fallbackForm.email,
        message: fallbackForm.message,
        locale,
        source: 'chat-widget-fallback',
        status: 'new',
        submittedAt: new Date().toISOString(),
      };

      await wixClient.items.insert('KamibiFormSubmissions', payload);
      setFallbackSubmitted(true);
      setFallbackForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('[WixChat] Fallback form CMS insert failed:', err);
      setFallbackError(t('chat.fallbackError'));
    } finally {
      setFallbackSubmitting(false);
    }
  };

  const handleInitSubmit = (e) => {
    e.preventDefault();
    if (initForm.email.trim()) {
      initializeConversation(initForm.name, initForm.email);
    }
  };

  const getMessageText = (msg) => {
    return msg.content?.basic?.items?.[0]?.text || msg.content?.basic?.text || msg.text || '';
  };

  const isMessageFromVisitor = (msg) => {
    const dir = msg.direction || '';
    return (
      dir === 'PARTICIPANT_TO_BUSINESS' ||
      dir === 'visitor' ||
      msg.sender?.role === 'visitor' ||
      msg.id?.startsWith('temp-')
    );
  };

  return (
    <div className="wix-chat-container">
      {/* Floating Chat Bubble Button */}
      <motion.button
        className="wix-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={t('chat.bubbleTooltip')}
        title={t('chat.bubbleTooltip')}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" className="chat-icon">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        ) : (
          <div className="chat-bubble-inner">
            <svg viewBox="0 0 24 24" className="chat-icon">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,14.63 3.03,17.03 4.71,18.83L3,23L7.47,21.82C8.84,22.58 10.37,23 12,23A10,10 0 0,0 22,13A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20C10.66,20 9.42,19.67 8.33,19.09L8.06,18.94L5.16,19.7L5.94,17.8L5.78,17.55C5.28,16.75 5,15.82 5,14.83A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12a6,6 0 0,0-6-6z" />
            </svg>
            <span className="bubble-ping" />
          </div>
        )}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="wix-chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            {/* Premium Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="avatar-group">
                  <div className="avatar">K</div>
                  <span className="online-badge" />
                </div>
                <div className="info-text">
                  <h3>{t('chat.title') || 'Kamibi Store'}</h3>
                  <div className="status-indicator">
                    <span>{locale === 'es' ? 'Soporte Activo ⚡' : 'Active Support ⚡'}</span>
                    <span className="dot-divider">•</span>
                    <span>{locale === 'es' ? 'En línea' : 'Online'}</span>
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="chat-body">
              {status === 'connecting' && (
                <div className="chat-loading-screen">
                  <div className="premium-spinner" />
                  <p>{t('chat.statusConnecting') || 'Conectando soporte...'}</p>
                </div>
              )}

              {status === 'setup' && (
                /* Registration screen before chat starts */
                <motion.div 
                  className="setup-form-container"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4>{locale === 'es' ? 'Iniciar Chat de Soporte' : 'Start Support Chat'}</h4>
                  <p className="setup-desc">
                    {locale === 'es' 
                      ? 'Ingresa tus datos para conectarte en tiempo real con un asesor de Kamibi.' 
                      : 'Enter your details to connect in real time with a Kamibi agent.'}
                  </p>
                  <form onSubmit={handleInitSubmit} className="premium-form">
                    <div className="form-group-premium">
                      <input
                        type="text"
                        required
                        value={initForm.name}
                        onChange={(e) => setInitForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder=" "
                        id="init_name"
                      />
                      <label htmlFor="init_name">{t('chat.nameLabel') || 'NombreCompleto'}</label>
                    </div>
                    <div className="form-group-premium">
                      <input
                        type="email"
                        required
                        value={initForm.email}
                        onChange={(e) => setInitForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder=" "
                        id="init_email"
                      />
                      <label htmlFor="init_email">{t('chat.emailLabel') || 'Email'}</label>
                    </div>

                    {initError && (
                      <div className="diag-error-card">
                        <p className="diag-error-text">{initError}</p>
                        <button
                          type="button"
                          onClick={runDiagnostics}
                          className="diag-run-btn"
                          disabled={runningDiag}
                        >
                          {runningDiag ? 'Analizando...' : '🔍 Diagnosticar conexión'}
                        </button>
                        {diagInfo && (
                          <pre className="diag-json-output">
                            {JSON.stringify(diagInfo, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}

                    <button type="submit" className="premium-submit-btn" disabled={loading}>
                      {loading ? (
                        <div className="btn-loader-spinner" />
                      ) : (
                        locale === 'es' ? 'Comenzar Chat' : 'Start Chat'
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {status === 'fallback' && (
                /* Fallback Contact Form */
                <div className="setup-form-container">
                  <h4>{t('chat.fallbackTitle') || 'Dejar un mensaje'}</h4>
                  <p className="setup-desc">{t('chat.fallbackDesc') || 'Envíanos tu consulta e iniciamos seguimiento por email.'}</p>

                  {fallbackSubmitted ? (
                    <motion.div
                      className="fallback-success-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="success-icon-wrapper">
                        <svg viewBox="0 0 24 24" className="success-svg">
                          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z" />
                        </svg>
                      </div>
                      <p>{t('chat.fallbackSuccess') || 'Mensaje enviado. Te responderemos a la brevedad.'}</p>
                      <button
                        className="btn-premium-retry"
                        onClick={() => setFallbackSubmitted(false)}
                      >
                        {t('chat.tryChatBtn') || 'Volver a intentar'}
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFallbackSubmit} className="premium-form">
                      <div className="form-group-premium">
                        <input
                          type="text"
                          required
                          value={fallbackForm.name}
                          onChange={(e) => setFallbackForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder=" "
                          id="fb_name"
                        />
                        <label htmlFor="fb_name">{t('chat.nameLabel')}</label>
                      </div>
                      <div className="form-group-premium">
                        <input
                          type="email"
                          required
                          value={fallbackForm.email}
                          onChange={(e) => setFallbackForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder=" "
                          id="fb_email"
                        />
                        <label htmlFor="fb_email">{t('chat.emailLabel')}</label>
                      </div>
                      <div className="form-group-premium textarea-group">
                        <textarea
                          required
                          rows={3}
                          value={fallbackForm.message}
                          onChange={(e) => setFallbackForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder=" "
                          id="fb_message"
                        />
                        <label htmlFor="fb_message">{t('chat.messageLabel')}</label>
                      </div>
                      {fallbackError && <p className="fallback-error-text">{fallbackError}</p>}
                      <button type="submit" className="premium-submit-btn" disabled={fallbackSubmitting}>
                        {fallbackSubmitting ? <div className="btn-loader-spinner" /> : t('chat.submitBtn')}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {status === 'online' && (
                /* Chat Messages History */
                <div className="messages-history">
                  {messages.length === 0 ? (
                    <div className="chat-welcome-container">
                      <div className="welcome-logo">K</div>
                      <h4>{locale === 'es' ? '¡Bienvenido a Kamibi!' : 'Welcome to Kamibi!'}</h4>
                      <p>{locale === 'es' ? '¿En qué podemos ayudarte hoy? Haz clic en alguna consulta frecuente o escríbenos directamente.' : 'How can we help you today? Choose a quick question below or write us.'}</p>
                    </div>
                  ) : (
                    <div className="chat-scroll-wrapper">
                      {messages.map((msg, index) => {
                        const isVisitor = isMessageFromVisitor(msg);
                        const text = getMessageText(msg);
                        if (!text) return null;

                        return (
                          <motion.div
                            key={msg.id || index}
                            className={`message-bubble-wrapper ${isVisitor ? 'visitor' : 'business'}`}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.22 }}
                          >
                            <div className="message-bubble">
                              <p>{text}</p>
                            </div>
                            <span className="timestamp">
                              {new Date(msg.createdDate || msg.createdAt || msg._createdDate).toLocaleTimeString(locale, {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </motion.div>
                        );
                      })}

                      {/* Visual Mock Typing Indicator */}
                      {isTyping && (
                        <motion.div 
                          className="message-bubble-wrapper business typing-wrapper"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="message-bubble typing-bubble">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}

                  {/* Predefined Quick Prompts / FAQ Buttons */}
                  {messages.length === 0 && (
                    <div className="quick-prompts-container">
                      {quickPrompts.map((prompt, idx) => (
                        <motion.button
                          key={idx}
                          className="quick-prompt-btn"
                          onClick={() => handleQuickPromptClick(prompt)}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * idx }}
                        >
                          {prompt.text}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Input (Only if in online mode) */}
            {status === 'online' && (
              <form onSubmit={handleSendMessage} className="chat-footer">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('chat.inputPlaceholder') || 'Escribe tu mensaje...'}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="send-btn"
                  aria-label={t('chat.send')}
                >
                  <svg viewBox="0 0 24 24" className="send-icon">
                    <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                  </svg>
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
