import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Sparkles } from 'lucide-react';

const SYSTEM_PROMPT = `You are CampusMitra AI, an intelligent assistant for BookMyCampus — a campus resource booking platform. You help students, faculty, and admins with resource availability, timetable info, and booking guidance. Be concise and helpful.`;

function getLocalResponse(text, resources = [], timetable = []) {
  const lower = text.toLowerCase();

  if (lower.includes('class') || lower.includes('lecture') || lower.includes('sem')) {
    const semMatch = lower.match(/sem(?:ester)?\s*(\d)/);
    const semester = semMatch ? semMatch[1] : null;
    let found = semester ? timetable.filter(t => String(t.semester) === semester) : [];
    if (found.length > 0) {
      const f = found[0];
      return `📚 Semester ${f.semester}: ${f.subject} is in ${f.room_name} (${f.building}). ${found.length > 1 ? `+${found.length - 1} more classes.` : ''}`;
    }
    return "Check the 'Class Timetable' section for a full schedule. You can filter by department and semester.";
  }

  if (lower.includes('available') || lower.includes('free') || lower.includes('status')) {
    const available = resources.filter(r => r.status === 'available');
    if (available.length > 0) {
      return `✅ ${available.length} resources are currently available. Popular ones: ${available.slice(0, 3).map(r => r.name).join(', ')}.`;
    }
    return "All resources appear occupied or under maintenance right now. Check 'Available Resources' for live updates.";
  }

  if (lower.includes('sport') || lower.includes('ground') || lower.includes('cricket') || lower.includes('basketball') || lower.includes('football')) {
    const sports = resources.filter(r => r.type === 'sport ground');
    const avail = sports.filter(r => r.status === 'available');
    if (avail.length > 0) return `🏅 Available sports facilities: ${avail.map(r => r.name).join(', ')}. Students can book these!`;
    return sports.length > 0 ? "All sports grounds are currently occupied. Try checking back later." : "No sports grounds found in the system.";
  }

  if (lower.includes('lab') || lower.includes('computer')) {
    const labs = resources.filter(r => r.type === 'lab');
    const avail = labs.filter(r => r.status === 'available');
    return `🔬 ${labs.length} labs on campus. ${avail.length} currently available. Faculty can book labs for classes.`;
  }

  if (lower.includes('auditorium') || lower.includes('seminar hall')) {
    const auds = resources.filter(r => r.type === 'auditorium');
    return `🎭 ${auds.length} auditoriums available. ${auds.map(r => r.name).join(', ')}. Both students and faculty can book these.`;
  }

  if (lower.includes('book') || lower.includes('reserve')) {
    return "📅 To book a resource: Go to 'Book Resource', select the facility, choose your date and time, then click 'Check Availability' before submitting.";
  }

  if (lower.includes('approve') || lower.includes('pending') || lower.includes('status')) {
    return "⏳ After submitting, bookings go to Pending status. Admin will approve/reject them. You'll get a notification and a QR code when approved!";
  }

  if (lower.includes('qr') || lower.includes('entry') || lower.includes('pass')) {
    return "📱 Approved bookings get a QR Entry Pass. Find it in 'My Bookings' → tap the QR code to enlarge. Show it at the facility entrance.";
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "👋 Hello! I'm CampusMitra AI. Ask me about resource availability, class schedules, booking help, or anything about BookMyCampus!";
  }

  return "🤖 I'm CampusMitra AI — your campus booking assistant! Ask me about available resources, class schedules, how to book facilities, or booking status.";
}

export default function CampusMitraAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm CampusMitra AI 🎓 Your campus booking assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    
    // Optimistic UI update
    setMessages(m => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    
    const resources = window.allResources || [];
    const timetable = window.allTimetableData || [];
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey && apiKey.length > 10) {
      try {
        const contextStr = `\n\nDatabase Context:\n- Total Resources: ${resources.length}\n- Available Resources: ${resources.filter(r => r.status === 'available').map(r => r.name).join(', ')}\n- Timetable Classes: ${timetable.length} scheduled.\nPlease use this data if relevant to the user's question. Keep answers short and friendly (max 2-3 sentences).`;

        const contents = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));
        contents.push({ role: 'user', parts: [{ text }] });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT + contextStr }] },
            contents
          })
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        const botReply = data.candidates[0].content.parts[0].text;
        
        setMessages(m => [...m, { role: 'assistant', text: botReply }]);
      } catch (err) {
        console.error("Gemini failed, falling back to local:", err);
        const fallbackReply = getLocalResponse(text, resources, timetable);
        setMessages(m => [...m, { role: 'assistant', text: fallbackReply }]);
      }
    } else {
      setTimeout(() => {
        const response = getLocalResponse(text, resources, timetable);
        setMessages(m => [...m, { role: 'assistant', text: response }]);
      }, 900 + Math.random() * 600);
    }
    
    setTyping(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 via-primary-500 to-violet-400 text-white shadow-glow-lg flex items-center justify-center ai-glow"
        aria-label="CampusMitra AI"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}}><X size={22} /></motion.div>
            : <motion.div key="bot" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}}><Sparkles size={22} /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            style={{ height: 480 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-500 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">CampusMitra AI</div>
                <div className="text-white/70 text-[10px]">Campus booking assistant</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 rounded-bl-sm shadow-card border border-slate-100'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((d, i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce-dot" style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-100 px-3 py-3 flex gap-2 items-center">
              <input
                ref={inputRef}
                className="flex-1 text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 placeholder-slate-400"
                placeholder="Ask about facilities…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
              >
                <Send size={15} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
