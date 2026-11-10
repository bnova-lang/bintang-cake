import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { repos } from '@/services/repositories';
import { ChatMessage } from '@/types';
import { formatDateTimeWITA } from '@/utils/format';

interface OrderChatBoxProps {
  orderId: string;
  senderType: 'customer' | 'admin' | 'guest';
  senderName: string;
}

export const OrderChatBox: React.FC<OrderChatBoxProps> = ({ orderId, senderType, senderName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    const list = repos.chatRepo.getByOrderId(orderId);
    setMessages(list);
    repos.chatRepo.markAsRead(orderId, senderType);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [orderId, senderType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    repos.chatRepo.addMessage({
      orderId,
      senderType,
      senderName,
      message: inputMessage.trim(),
    });

    setInputMessage('');
    loadMessages();
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--ivory-50)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--cream-300)',
        display: 'flex',
        flexDirection: 'column',
        height: '380px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          backgroundColor: 'var(--brown-800)',
          color: 'var(--text-on-dark)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 700,
        }}
      >
        <MessageSquare size={18} color="var(--gold-500)" />
        <span>Chat Langsung Pesanan (Admin & Pelanggan)</span>
      </div>

      {/* Message List */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Belum ada pesan. Mulai tanyakan detail pesanan kepada admin di sini.
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderType === senderType;
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {msg.senderName} ({msg.senderType === 'admin' ? 'Admin Toko' : 'Pemesan'})
                </span>
                <div
                  style={{
                    backgroundColor: isMe ? 'var(--gold-500)' : 'var(--cream-200)',
                    color: 'var(--brown-900)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.message}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {formatDateTimeWITA(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid var(--cream-300)', padding: '8px', backgroundColor: '#fff', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ketik pesan untuk admin..."
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--cream-300)', fontSize: '13px' }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: 'var(--gold-500)',
            color: 'var(--brown-900)',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
