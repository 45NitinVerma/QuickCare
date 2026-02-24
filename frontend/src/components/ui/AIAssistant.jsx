import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AIAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your QuickCare AI Assistant. How can I help you today?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const newMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = newMessage.text.toLowerCase();
      let aiResponse = "I can help with appointments, lab results, prescriptions, or general health queries. Could you give a bit more detail?";

      if (lower.includes('headache') || lower.includes('pain')) {
        aiResponse = "I hear you. If the pain is severe, sudden, or accompanied by numbness or vision changes, please visit the ER immediately. Would you like help scheduling a General Physician consultation?";
      } else if (lower.includes('report') || lower.includes('lab') || lower.includes('result')) {
        aiResponse = "I can summarize your most recent lab results! Your latest 'Complete Blood Count' from 5 days ago shows all major markers within normal limits. Would you like to view the full AI Summary?";
      } else if (lower.includes('appointment') || lower.includes('book')) {
        aiResponse = "You can book a new appointment easily via the 'Book Appointment' section in the sidebar. Which department are you looking for?";
      } else if (lower.includes('prescription') || lower.includes('medicine')) {
        aiResponse = "Your active prescriptions include Aspirin (81mg daily) and Atorvastatin (20mg nightly). Reminders can be configured in your profile settings.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 ${
          isOpen
            ? 'bg-[var(--card-elevated)] hover:bg-[var(--bg-secondary)]'
            : 'bg-gradient-to-br from-[var(--primary)] to-indigo-600 hover:shadow-[var(--shadow-glow-primary)] hover:scale-105'
        }`}
        style={{ boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-glow-primary)' }}
      >
        <span style={{ color: isOpen ? 'var(--text-primary)' : 'white' }}>
          {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        </span>
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2"
              style={{ borderColor: 'var(--bg)' }} />
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 sm:w-96 h-[520px] rounded-2xl flex flex-col overflow-hidden animate-fade-up"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div className="shrink-0 relative overflow-hidden flex items-center gap-3 p-4"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' }}>
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Sparkles size={72} />
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Bot size={20} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base text-white leading-tight">QuickCare AI</h3>
              <p className="text-xs text-blue-100 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                Online — Medical Assistant
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors relative z-10">
              <X size={18} />
            </button>
          </div>

          {/* Warning Banner */}
          <div className="shrink-0 px-4 py-2.5 flex items-start gap-2 text-xs"
            style={{ background: 'var(--warning-light)', borderBottom: '1px solid var(--border)', color: 'var(--warning)' }}>
            <ShieldAlert size={13} className="shrink-0 mt-0.5" />
            <p>AI may generate inaccurate responses. For emergencies, call 911 immediately.</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg-secondary)' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' }}>
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div
                  className="max-w-[82%] rounded-2xl p-3 text-sm leading-relaxed"
                  style={msg.sender === 'user'
                    ? { background: 'var(--primary)', color: 'white', borderRadius: '18px 18px 4px 18px' }
                    : { background: 'var(--card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', boxShadow: 'var(--shadow-sm)' }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start w-full">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)' }}>
                  <Bot size={13} className="text-white" />
                </div>
                <div className="rounded-2xl p-4 flex items-center gap-1.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px' }}>
                  {[0, 150, 300].map(delay => (
                    <div key={delay} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: 'var(--text-muted)', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-3" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a health question..."
                className="flex-1 h-10 px-4 text-sm rounded-full transition-all focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  '--tw-ring-color': 'var(--primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-95 disabled:opacity-40"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <Send size={15} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
