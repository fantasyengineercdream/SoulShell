'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Settings2 } from 'lucide-react';
import { CreatureAvatar, CreatureSelector, CreatureType, CREATURES } from './CreatureAvatar';
import { DiscoveredFile } from '@/lib/discovery';

interface Message {
  role: 'user' | 'pet';
  text: string;
}

interface Props {
  files?: DiscoveredFile[];
  onHatched?: () => void;
  fullscreenMode?: boolean;
  usePersistedState?: boolean;
}

type PetState = 'egg' | 'hatching' | 'selecting' | 'alive';

export function PetCompanion({ files = [], onHatched, fullscreenMode, usePersistedState = true }: Props) {
  const [petState, setPetState] = useState<PetState>('egg');
  const [creature, setCreature] = useState<CreatureType>('dragon');
  const [petName, setPetName] = useState('');
  const [input, setInput] = useState('');
  const [showMemoryConfig, setShowMemoryConfig] = useState(false);
  const [connectedMemories, setConnectedMemories] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // 启动时检查 localStorage，如果已孵化直接进 alive
  useEffect(() => {
    if (!usePersistedState) return;
    const savedCreature = localStorage.getItem('soulshell-creature') as CreatureType | null;
    const savedName = localStorage.getItem('soulshell-pet-name');
    if (savedCreature) {
      setCreature(savedCreature);
      setPetName(savedName || CREATURES[savedCreature].label);
      setPetState('alive');
      const name = savedName || CREATURES[savedCreature].label;
      setLog([{ role: 'pet', text: `你好！我是 ${name}，你的灵魂伙伴。随时和我聊天，或者去灵魂注入给我配置人格。` }]);
    }
  }, [usePersistedState]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const memoryFiles = files.filter(f => f.type === 'memory' && f.exists);

  const toggleMemory = (id: string) => {
    setConnectedMemories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const hatch = () => {
    setPetState('hatching');
    setTimeout(() => setPetState('selecting'), 1500);
  };

  const confirmCreature = () => {
    const name = petName || CREATURES[creature].label;
    if (usePersistedState) {
      localStorage.setItem('soulshell-creature', creature);
      localStorage.setItem('soulshell-pet-name', name);
    }
    setPetState('alive');
    setLog([{ role: 'pet', text: `* 破壳 * 你好！我是 ${name}，你的灵魂伙伴。用上方的灵魂注入给我注入灵魂，或者直接和我聊天吧。` }]);
    onHatched?.();
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    const connCount = connectedMemories.size;
    const petResponse: Message = {
      role: 'pet',
      text: connCount > 0
        ? `[接入了 ${connCount} 个记忆源] 我在思考你说的："${input}"。接入 LLM API 后我就能真正理解你了。`
        : `[未接入记忆] "${input}" — 试试在设置中接入一些记忆文件，让我更了解你。`
    };
    setLog(prev => [...prev, userMsg, petResponse]);
    setInput('');
  };

  // ── 蛋状态 ──
  if (petState === 'egg') {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-6">
        <div className="text-6xl cursor-pointer hover:scale-110 transition-transform" onClick={hatch}>
          🥚
        </div>
        <p className="text-xs text-stone-400 text-center">点击蛋壳，孵化你的伙伴</p>
      </div>
    );
  }

  // ── 孵化动画 ──
  if (petState === 'hatching') {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4">
        <div className="text-6xl animate-shake">🥚</div>
        <div className="w-32 h-1 bg-amber-100 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ width: '80%' }} />
        </div>
        <p className="text-xs text-amber-600 font-medium">孵化中...</p>
      </div>
    );
  }

  // ── 选择形象 ──
  if (petState === 'selecting') {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-5 p-4">
        <CreatureAvatar creature={creature} size={100} animate={true} />
        <CreatureSelector selected={creature} onSelect={setCreature} />
        <input
          value={petName}
          onChange={e => setPetName(e.target.value)}
          placeholder={`给 ${CREATURES[creature].label} 起个名字...`}
          className="bg-white rounded-full px-4 py-2 text-sm text-center text-stone-700 border border-amber-200 focus:ring-2 focus:ring-amber-300 outline-none w-48"
        />
        <button onClick={confirmCreature}
          className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full text-white font-bold text-sm shadow-lg shadow-amber-200/50 hover:scale-105 active:scale-95 transition-all">
          确认！
        </button>
      </div>
    );
  }

  // ── 宠物存活——对话界面 ──
  const name = petName || CREATURES[creature].label;
  return (
    <div className="flex flex-col h-full bg-white/60 backdrop-blur-sm rounded-xl overflow-hidden">
      {/* Header: 宠物 + 名字 + 配置按钮 */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#fbf3e4] border-b border-amber-100">
        <CreatureAvatar creature={creature} size={32} animate={true} />
        <div className="flex-1">
          <p className="text-xs font-bold text-amber-900">{name}</p>
          <p className="text-[9px] text-stone-400">
            {connectedMemories.size > 0
              ? `已接入 ${connectedMemories.size} 个记忆源`
              : '未接入记忆'}
          </p>
        </div>
        <button onClick={() => setShowMemoryConfig(!showMemoryConfig)}
          className={`p-1.5 rounded-full transition ${showMemoryConfig ? 'bg-amber-200 text-amber-800' : 'text-stone-400 hover:text-amber-600'}`}>
          <Settings2 size={14} />
        </button>
      </div>

      {/* 记忆接入配置面板 */}
      {showMemoryConfig && (
        <div className="px-3 py-2 bg-amber-50/80 border-b border-amber-100 max-h-32 overflow-y-auto">
          <p className="text-[9px] text-amber-700 font-bold uppercase mb-1.5">接入记忆源（测试用）</p>
          {memoryFiles.length === 0 ? (
            <p className="text-[10px] text-stone-400">未发现记忆文件</p>
          ) : (
            <div className="space-y-1">
              {memoryFiles.map(f => (
                <label key={f.id} className="flex items-center gap-2 text-[10px] text-stone-600 cursor-pointer hover:text-amber-700">
                  <input type="checkbox" checked={connectedMemories.has(f.id)}
                    onChange={() => toggleMemory(f.id)}
                    className="w-3 h-3 rounded accent-amber-500" />
                  <span>{f.platform} · {f.displayName}</span>
                </label>
              ))}
            </div>
          )}
          <p className="text-[9px] text-stone-300 mt-1.5">接入 LLM API 后，宠物将用这些记忆回答你</p>
        </div>
      )}

      {/* 对话区 */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {log.map((m, i) => (
          <div key={i} className={`text-[12px] leading-relaxed ${
            m.role === 'user' ? 'text-stone-400 text-right' : 'text-amber-800'
          }`}>
            {m.role === 'pet' && <span className="text-amber-500">{'> '}</span>}
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* 输入 */}
      <div className="p-2 border-t border-amber-100 flex gap-2 bg-[#fbf3e4]/50">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-200 shadow-inner"
          placeholder={`跟 ${name} 说话...`} />
        <button onClick={send} className="text-amber-400 hover:text-amber-600 transition p-1">
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
