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
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'setup' (needs name/email) | 'online' | 'fallback'
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initial user info form for chat setup
  const [initForm, setInitForm] = useState({ name: '', email: '' });
  const [initError, setInitError] = useState('');

  // Fallback form states (for CMS fallback if WIX env keys are missing)
  const [fallbackForm, setFallbackForm] = useState({ name: '', email: '', message: '' });
  const [fallbackSubmitted, setFallbackSubmitted] = useState(false);
  const [fallbackSubmitting, setFallbackSubmitting] = useState(false);
  const [fallbackError, setFallbackError] = useState('');

  const messagesEndRef = useRef(null);

  // Scroll to bottom of message history
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initial setup: retrieve conversation or check if logged in member
  useEffect(() => {
    if (!isReady || !wixClient) return;

    const checkStoredOrMember = async () => {
      try {
        if (conversationId) {
          // Verify conversation exists by listing messages
          const res = await fetch(`/api/chat?action=list&conversationId=${conversationId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages) {
              const sorted = [...data.messages].sort((a, b) => {
                const dateA = new Date(a.createdAt || a._createdDate || 0);
                const dateB = new Date(b.createdAt || b._createdDate || 0);
                return dateA - dateB;
              });
              setMessages(sorted);
              setStatus('online');
              return;
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize chat');
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
      // If server keys are missing, show fallback form immediately
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
        const data = await res.json();
        if (data.messages) {
          // Sort messages chronologically
          const sorted = [...data.messages].sort((a, b) => {
            const dateA = new Date(a.createdAt || a._createdDate || 0);
            const dateB = new Date(b.createdAt || b._createdDate || 0);
            return dateA - dateB;
          });
          setMessages(sorted);
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

  // Send message to Wix Inbox via serverless API
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !conversationId) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistically add message to state
    const tempMessage = {
      id: `temp-${Date.now()}`,
      direction: 'PARTICIPANT_TO_BUSINESS',
      createdAt: new Date().toISOString(),
      content: {
        basic: {
          items: [{ text: messageText }]
        }
      }
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', conversationId, text: messageText }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      await fetchMessages(conversationId);
    } catch (err) {
      console.error('[WixChat] Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle fallback form submission (submissions directly to Wix CMS)
  const handleFallbackSubmit = async (e) => {
    e.preventDefault();
    if (!fallbackForm.email.trim() || !fallbackForm.message.trim() || fallbackSubmitting) return;

    setFallbackSubmitting(true);
    setFallbackError('');

    try {
      // Direct write to collection (since items.insert is allowed for visitors)
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

  // Setup form submission
  const handleInitSubmit = (e) => {
    e.preventDefault();
    if (initForm.email.trim()) {
      initializeConversation(initForm.name, initForm.email);
    }
  };

  // Parse message text
  const getMessageText = (msg) => {
    return msg.content?.basic?.items?.[0]?.text || msg.content?.basic?.text || msg.text || '';
  };

  // Determine message sender (visitor vs business)
  const isMessageFromVisitor = (msg) => {
    const dir = msg.direction || '';
    return (
      dir.includes('PARTICIPANT') ||
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={t('chat.bubbleTooltip')}
        title={t('chat.bubbleTooltip')}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" className="chat-icon">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="chat-icon">
            <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,14.63 3.03,17.03 4.71,18.83L3,23L7.47,21.82C8.84,22.58 10.37,23 12,23A10,10 0 0,0 22,13A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20C10.66,20 9.42,19.67 8.33,19.09L8.06,18.94L5.16,19.7L5.94,17.8L5.78,17.55C5.28,16.75 5,15.82 5,14.83A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12a6,6 0 0,0-6-6z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="wix-chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="avatar">K</div>
                <div className="info-text">
                  <h3>{t('chat.title')}</h3>
                  <div className="status-indicator">
                    <span className={`status-dot ${status === 'online' ? 'online' : status === 'fallback' ? 'fallback' : 'connecting'}`} />
                    <span>
                      {status === 'online' && t('chat.statusOnline')}
                      {status === 'fallback' && t('chat.statusOffline')}
                      {(status === 'connecting' || status === 'setup') && t('chat.statusConnecting')}
                    </span>
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="chat-body">
              {status === 'connecting' && (
                <div className="empty-chat">
                  <p>{t('chat.statusConnecting')}</p>
                </div>
              )}

              {status === 'setup' && (
                /* Registration screen before chat starts */
                <div className="fallback-form-container">
                  <h4>{locale === 'es' ? 'Iniciar Chat' : 'Start Chat'}</h4>
                  <p className="fallback-desc">
                    {locale === 'es' 
                      ? 'Por favor, ingresa tu correo para iniciar el chat de soporte.' 
                      : 'Please enter your email to start the support chat.'}
                  </p>
                  <form onSubmit={handleInitSubmit} className="fallback-form">
                    <div className="form-group">
                      <label>{t('chat.nameLabel')}</label>
                      <input
                        type="text"
                        value={initForm.name}
                        onChange={(e) => setInitForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('contact.form.placeholderName')}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('chat.emailLabel')} *</label>
                      <input
                        type="email"
                        required
                        value={initForm.email}
                        onChange={(e) => setInitForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t('contact.form.placeholderEmail')}
                      />
                    </div>
                    {initError && <p className="fallback-error">{initError}</p>}
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? t('chat.statusConnecting') : (locale === 'es' ? 'Comenzar' : 'Start')}
                    </button>
                  </form>
                </div>
              )}

              {status === 'fallback' && (
                /* Fallback Contact Form */
                <div className="fallback-form-container">
                  <h4>{t('chat.fallbackTitle')}</h4>
                  <p className="fallback-desc">{t('chat.fallbackDesc')}</p>

                  {fallbackSubmitted ? (
                    <motion.div
                      className="fallback-success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg viewBox="0 0 24 24" className="success-icon">
                        <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z" />
                      </svg>
                      <p>{t('chat.fallbackSuccess')}</p>
                      <button
                        className="btn-retry"
                        onClick={() => setFallbackSubmitted(false)}
                      >
                        {t('chat.tryChatBtn')}
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFallbackSubmit} className="fallback-form">
                      <div className="form-group">
                        <label>{t('chat.nameLabel')}</label>
                        <input
                          type="text"
                          required
                          value={fallbackForm.name}
                          onChange={(e) => setFallbackForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t('contact.form.placeholderName')}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('chat.emailLabel')} *</label>
                        <input
                          type="email"
                          required
                          value={fallbackForm.email}
                          onChange={(e) => setFallbackForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t('contact.form.placeholderEmail')}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t('chat.messageLabel')} *</label>
                        <textarea
                          required
                          rows={3}
                          value={fallbackForm.message}
                          onChange={(e) => setFallbackForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder={t('contact.form.placeholderMessage')}
                        />
                      </div>
                      {fallbackError && (
                        <p className="fallback-error" style={{ fontSize: '0.72rem' }}>
                          {fallbackError}
                        </p>
                      )}
                      <button type="submit" className="submit-btn" disabled={fallbackSubmitting}>
                        {fallbackSubmitting ? t('contact.form.sending') : t('chat.submitBtn')}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {status === 'online' && (
                /* Chat Messages History */
                <div className="messages-history">
                  {messages.length === 0 ? (
                    <div className="empty-chat">
                      <p>{locale === 'es' ? '¡Hola! ¿En qué podemos ayudarte hoy?' : 'Hello! How can we help you today?'}</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isVisitor = isMessageFromVisitor(msg);
                      const text = getMessageText(msg);
                      if (!text) return null;

                      return (
                        <div
                          key={msg.id}
                          className={`message-bubble-wrapper ${isVisitor ? 'visitor' : 'business'}`}
                        >
                          <div className="message-bubble">
                            <p>{text}</p>
                          </div>
                          <span className="timestamp">
                            {new Date(msg.createdAt || msg._createdDate).toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Footer Input (Only if in online mode) */}
            {status === 'online' && (
              <form onSubmit={handleSendMessage} className="chat-footer">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t('chat.inputPlaceholder')}
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
