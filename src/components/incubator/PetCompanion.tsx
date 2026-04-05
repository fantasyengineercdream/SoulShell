'use client';
import { useState, useRef, useEffect } from 'react';
import { Terminal, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'pet';
  text: string;
}

export function PetCompanion() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<Message[]>([
    { role: 'pet', text: '* cracks shell * ...Hello? I just hatched. Inject a persona to give me a soul, then talk to me.' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    const petMsg: Message = { role: 'pet', text: `[Mock] I heard: "${input}". Inject a persona above, then connect an API key to make me real.` };
    setLog(prev => [...prev, userMsg, petMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-black border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-900 px-3 py-2 text-[11px] font-bold text-blue-400 flex items-center gap-2 border-b border-gray-800">
        <Terminal size={12} /> Companion Terminal
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {log.map((m, i) => (
          <div key={i} className={`text-[11px] font-mono leading-relaxed ${
            m.role === 'user' ? 'text-gray-500 text-right' : 'text-purple-300'
          }`}>
            {m.role === 'pet' && <span className="text-purple-600">&gt; </span>}
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-2 border-t border-gray-800 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-600"
          placeholder="Talk to your companion..."
        />
        <button onClick={send} className="text-gray-500 hover:text-purple-400 transition">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
