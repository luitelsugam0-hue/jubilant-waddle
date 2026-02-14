
import React, { useState, useRef, useEffect } from 'react';
import { User, Message, Group } from '../types';
import { getGeminiResponse, generateTTS } from '../services/geminiService';

interface ChatWindowProps {
  activeTarget: User | Group;
  currentUser: User;
  messages: Message[];
  onSendMessage: (text: string, receiverId: string, isAi?: boolean) => void;
  onBlockUser: (userId: string) => void;
  isBlocked: boolean;
  onBack: () => void;
  onStartCall: (id: string) => void;
  onAddMember?: (uid: string) => void;
  availableUsers?: User[];
  isDarkMode?: boolean;
  amIBlocked?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    activeTarget, currentUser, messages, onSendMessage, onBlockUser, 
    isBlocked, amIBlocked, onBack, onStartCall, onAddMember, availableUsers, isDarkMode 
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isBlocked || amIBlocked) return;
    const messageToSend = inputText;
    setInputText('');
    onSendMessage(messageToSend, activeTarget.id);
    if (activeTarget.id === 'gemini') {
      setIsTyping(true);
      const aiReply = await getGeminiResponse(messageToSend);
      setIsTyping(false);
      onSendMessage(aiReply, 'gemini', true);
    }
  };

  const handleTTS = async (text: string) => {
    const base64 = await generateTTS(text);
    if (!base64) return;

    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    const ctx = audioCtxRef.current;
    
    // Decoding PCM manually as per Gemini rules
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isGroup = activeTarget.id.startsWith('group_');
  const targetName = (activeTarget as User).username || (activeTarget as Group).name;

  return (
    <div className={`flex flex-col h-full w-full relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-[#efeae2]'}`}>
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/580/678/HD-wallpaper-whatsapp-background-whatsapp-theme-whatsapp.jpg")', backgroundSize: '400px'}}></div>

      <header className="bg-[#008069] text-white px-3 py-3 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></button>
          <img src={activeTarget.avatar} alt="avatar" className="w-9 h-9 rounded-full border border-white/20" />
          <div className="flex flex-col overflow-hidden max-w-[120px] sm:max-w-none">
            <h2 className="font-medium text-base truncate">{targetName}</h2>
            <p className="text-[11px] opacity-80 truncate">
              {isGroup 
                ? `${(activeTarget as Group).members.length} members` 
                : amIBlocked 
                  ? '' 
                  : (activeTarget as User).isOnline ? 'online' : 'last seen recently'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {!isGroup && <button onClick={() => onStartCall(activeTarget.id)} className="p-2 hover:bg-white/10 rounded-full"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></button>}
          {isGroup && (activeTarget as Group).creatorId === currentUser.id && (
              <button onClick={() => setIsAddMemberOpen(true)} className="p-2 hover:bg-white/10 rounded-full"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></button>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-white/10 rounded-full"><svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)}></div>
              <div className="absolute top-10 right-0 w-48 bg-white shadow-lg rounded-sm py-2 z-30 border border-gray-100 text-[#3b4a54]">
                {!isGroup && <button onClick={() => { onBlockUser(activeTarget.id); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] text-sm">{isBlocked ? 'Unblock' : 'Block'} contact</button>}
                <button className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] text-sm">Clear chat</button>
              </div>
            </>
          )}
        </div>
      </header>

      {isAddMemberOpen && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
              <div className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="p-4 bg-[#008069] text-white flex justify-between items-center">
                      <h3 className="font-bold">Add Member to Group</h3>
                      <button onClick={() => setIsAddMemberOpen(false)}><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
                  </div>
                  <div className="p-2 max-h-[300px] overflow-y-auto">
                      {availableUsers?.filter(u => !(activeTarget as Group).members.includes(u.id)).map(user => (
                          <div key={user.id} onClick={() => { onAddMember?.(user.id); setIsAddMemberOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer rounded-lg border-b dark:border-gray-700">
                              <img src={user.avatar} className="w-10 h-10 rounded-full" alt=""/>
                              <span className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>{user.username}</span>
                          </div>
                      ))}
                      {availableUsers?.filter(u => !(activeTarget as Group).members.includes(u.id)).length === 0 && (
                          <p className="p-6 text-center opacity-40 text-sm italic">All your contacts are already in this group.</p>
                      )}
                  </div>
              </div>
          </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 z-10 scroll-smooth">
        {messages.map((m) => {
          const isOwn = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm text-sm relative group ${isOwn ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none dark:bg-gray-800 dark:text-gray-100'}`}>
                {isGroup && !isOwn && <p className="text-[10px] font-bold text-[#00a884] mb-0.5">~ {availableUsers?.find(u => u.id === m.senderId)?.username || 'User'}</p>}
                <p className="break-words whitespace-pre-wrap">{m.text}</p>
                <div className="flex items-center justify-between mt-1 space-x-2">
                  <button onClick={() => handleTTS(m.text)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#00a884] p-1 -ml-1">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  </button>
                  <span className="text-[9px] opacity-60">{formatTime(m.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && <div className="text-xs italic opacity-40">Gemini is thinking...</div>}
      </div>

      {amIBlocked ? (
        <footer className={`p-4 text-center text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-[#f0f2f5] text-gray-500'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          You have been blocked by this contact.
        </footer>
      ) : (
      <footer className="bg-[#f0f2f5] dark:bg-gray-800 px-2 py-2 flex items-center gap-2 z-10 border-t border-gray-200 dark:border-gray-700">
        <input type="text" placeholder="Type a message" className="flex-1 bg-white dark:bg-gray-700 py-2 px-4 rounded-full text-sm focus:outline-none dark:text-white" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}/>
        <button onClick={() => handleSend()} className="bg-[#00a884] text-white p-3 rounded-full shadow-md active:scale-95 transition-transform">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/></svg>
        </button>
      </footer>
      )}
    </div>
  );
};

export default ChatWindow;
