'use client';
import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  role: 'user' | 'pet';
  text: string;
}

export function PetCompanion() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<Message[]>([
    { role: 'pet', text: '* 破壳 * ...你好？我刚孵化出来。在上方配置我的灵魂，然后跟我说话吧。' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    const petMsg: Message = { role: 'pet', text: `[模拟] 我听到了："${input}"。先在上方注入灵魂，再接入 API 就能让我变成真的。` };
    setLog(prev => [...prev, userMsg, petMsg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 text-[11px] font-bold text-amber-700 flex items-center gap-2 bg-[#fbf3e4] border-b border-amber-100">
        <span>🐣</span> 伙伴终端
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {log.map((m, i) => (
          <div key={i} className={`text-[12px] leading-relaxed ${
            m.role === 'user'
              ? 'text-stone-400 text-right'
              : 'text-amber-800'
          }`}>
            {m.role === 'pet' && <span className="text-amber-500">{'> '}</span>}
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-2 border-t border-amber-100 flex gap-2 bg-[#fbf3e4]/50">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200 shadow-inner"
          placeholder="跟你的伙伴说话..."
        />
        <button onClick={send} className="text-amber-400 hover:text-amber-600 transition p-1">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
