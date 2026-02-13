
import React, { useState } from 'react';
import { User, Message, Status, Call, GeneratedImage, StatusComment, Group, Community } from '../types';
import { generateAiImage } from '../services/geminiService';

interface ChatSidebarProps {
  currentUser: User;
  users: User[];
  onLogout: () => void;
  onSelectChat: (id: string) => void;
  activeChatId: string | null;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  messages: Message[];
  statuses: Status[];
  calls: Call[];
  groups: Group[];
  communities: Community[];
  generatedImages: GeneratedImage[];
  onOpenSettings: () => void;
  onOpenContacts: () => void;
  onAddStatus: (content: string) => void;
  onStartCall: (id: string) => void;
  onSaveGeneratedImage: (url: string, prompt: string) => void;
  onLikeStatus: (id: string) => void;
  onCommentStatus: (id: string, text: string) => void;
  isDarkMode?: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  currentUser, users, onLogout, onSelectChat, activeChatId, searchTerm, setSearchTerm, 
  messages, statuses, calls, groups, communities, generatedImages, onOpenSettings, onOpenContacts, onAddStatus, onStartCall, onSaveGeneratedImage,
  onLikeStatus, onCommentStatus, isDarkMode
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'status' | 'communities' | 'ai' | 'calls'>('chats');
  const [statusText, setStatusText] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewingStatusId, setViewingStatusId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const viewingStatus = statuses.find(s => s.id === viewingStatusId);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGenerating(true);
    try {
      const url = await generateAiImage(imagePrompt);
      if (url) {
        onSaveGeneratedImage(url, imagePrompt);
        setImagePrompt('');
      }
    } catch (e) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getLastMessage = (targetId: string) => {
    const isGroup = targetId.startsWith('group_');
    const userMessages = messages.filter(m => 
      isGroup ? m.receiverId === targetId : 
      ((m.senderId === currentUser.id && m.receiverId === targetId) ||
      (m.senderId === targetId && m.receiverId === currentUser.id))
    );
    if (userMessages.length === 0) return null;
    return userMessages[userMessages.length - 1];
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePostComment = () => {
    if (viewingStatusId && commentText.trim()) {
      onCommentStatus(viewingStatusId, commentText);
      setCommentText('');
    }
  };

  return (
    <div className={`flex flex-col h-full w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {viewingStatus && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
             <button onClick={() => setViewingStatusId(null)} className="text-white p-2">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"/></svg>
             </button>
             <img src={(users.find(u => u.id === viewingStatus.userId) || currentUser).avatar} className="w-10 h-10 rounded-full border border-white/20" alt=""/>
             <div className="text-white">
                <p className="font-bold text-sm">{(users.find(u => u.id === viewingStatus.userId) || currentUser).username}</p>
                <p className="text-[10px] opacity-60">Status • Expiring in 2h</p>
             </div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center p-6 mt-16 overflow-hidden">
            <div className="text-white text-3xl font-light text-center px-4 max-w-lg leading-relaxed italic mb-8">
               "{viewingStatus.content}"
            </div>
            
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col max-h-[40vh] border border-white/20">
              <div className="flex items-center justify-between mb-4 px-2">
                <button 
                  onClick={() => onLikeStatus(viewingStatus.id)} 
                  className={`flex items-center gap-2 transition-all active:scale-125 ${viewingStatus.likes.includes(currentUser.id) ? 'text-red-500' : 'text-white'}`}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span className="text-sm font-bold">{viewingStatus.likes.length}</span>
                </button>
                <div className="text-white text-xs opacity-60 uppercase font-bold tracking-widest">Comments</div>
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-3 custom-scrollbar px-2">
                {viewingStatus.comments.length === 0 ? (
                  <p className="text-white/40 text-center text-xs py-4 italic">No comments yet</p>
                ) : (
                  viewingStatus.comments.map(c => (
                    <div key={c.id} className="text-white text-sm">
                      <span className="font-bold mr-2 text-[#00a884]">{c.username}:</span>
                      <span>{c.text}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="flex-1 bg-white/20 text-white placeholder-white/40 border-none outline-none rounded-lg px-3 py-2 text-sm"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                />
                <button onClick={handlePostComment} className="text-[#00a884]">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#008069] px-4 py-4 flex items-center justify-between text-white shadow-md z-10">
        <h1 className="text-xl font-medium tracking-wide">WhatsApp</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setSearchTerm(searchTerm ? '' : ' ')} className="p-1 active:scale-90 transition"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></button>
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 active:scale-90 transition"><svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)}></div>
                <div className={`absolute top-8 right-0 w-48 shadow-xl rounded-sm py-2 z-30 border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-100 text-[#3b4a54]'}`}>
                  <button onClick={() => { onOpenSettings(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm">Settings</button>
                  <button onClick={onLogout} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm">Log out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#008069] flex text-white text-[10px] font-bold uppercase overflow-x-auto shadow-sm whitespace-nowrap hide-scrollbar">
          <button onClick={() => setActiveTab('chats')} className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${activeTab === 'chats' ? 'border-white' : 'border-transparent opacity-60'}`}>Chats</button>
          <button onClick={() => setActiveTab('communities')} className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${activeTab === 'communities' ? 'border-white' : 'border-transparent opacity-60'}`}>Communities</button>
          <button onClick={() => setActiveTab('status')} className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${activeTab === 'status' ? 'border-white' : 'border-transparent opacity-60'}`}>Status</button>
          <button onClick={() => setActiveTab('ai')} className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${activeTab === 'ai' ? 'border-white' : 'border-transparent opacity-60'}`}>AI Hub</button>
          <button onClick={() => setActiveTab('calls')} className={`flex-1 py-3 px-4 text-center border-b-2 transition-all ${activeTab === 'calls' ? 'border-white' : 'border-transparent opacity-60'}`}>Calls</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {activeTab === 'chats' && (
          <div className="animate-in fade-in duration-300">
            {/* Private Groups Creator View */}
            {groups.map(group => {
                const lastMsg = getLastMessage(group.id);
                return (
                    <div key={group.id} onClick={() => onSelectChat(group.id)} className={`flex items-center px-4 py-3.5 cursor-pointer border-b active:bg-gray-50 dark:active:bg-gray-700 ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                        <img src={group.avatar} className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100" alt=""/>
                        <div className="ml-4 flex-1 overflow-hidden">
                            <div className="flex items-center justify-between mb-0.5">
                                <h3 className={`font-semibold text-base truncate ${isDarkMode ? 'text-gray-100' : 'text-[#111b21]'}`}>{group.name}</h3>
                                {lastMsg && <span className="text-[11px] opacity-60">{formatTime(lastMsg.timestamp)}</span>}
                            </div>
                            <p className="text-sm opacity-60 truncate">{lastMsg ? lastMsg.text : 'Group created'}</p>
                        </div>
                    </div>
                );
            })}
            
            {/* Direct Messages */}
            {(users.filter(u => u.id !== currentUser.id && u.username.toLowerCase().includes(searchTerm.toLowerCase()))).map(user => {
              const lastMsg = getLastMessage(user.id);
              return (
                <div key={user.id} onClick={() => onSelectChat(user.id)} className={`flex items-center px-4 py-3.5 cursor-pointer border-b active:bg-gray-50 dark:active:bg-gray-700 ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                  <div className="relative">
                    <img src={user.avatar} className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100" alt=""/>
                    {user.isOnline && <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#25d366] border-2 border-white dark:border-gray-800 rounded-full"></span>}
                  </div>
                  <div className="ml-4 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-semibold text-base truncate ${isDarkMode ? 'text-gray-100' : 'text-[#111b21]'}`}>{user.username}</h3>
                      {lastMsg && <span className="text-[11px] opacity-60">{formatTime(lastMsg.timestamp)}</span>}
                    </div>
                    <p className="text-sm opacity-60 truncate">{lastMsg ? lastMsg.text : 'Available'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'communities' && (
            <div className="p-4 space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="bg-[#008069] text-white p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="white" className="mb-4"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                    <h2 className="text-xl font-bold">Communities</h2>
                    <p className="text-xs opacity-80 mt-2 leading-relaxed">Organize your related groups privately. Only members can see these communities.</p>
                </div>
                
                {communities.map(comm => (
                    <div key={comm.id} className={`p-4 rounded-xl border flex gap-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                        <img src={comm.avatar} className="w-12 h-12 rounded-lg object-cover" alt=""/>
                        <div className="flex-1">
                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{comm.name}</h3>
                            <p className="text-xs opacity-60 truncate">{comm.description}</p>
                            <p className="text-[10px] mt-1 font-bold text-[#00a884] uppercase">{comm.members.length} Members</p>
                        </div>
                    </div>
                ))}
                
                {communities.length === 0 && (
                    <div className="text-center py-12 opacity-30 text-sm italic">You haven't joined any communities yet.</div>
                )}
            </div>
        )}

        {activeTab === 'status' && (
          <div className="p-4 space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={currentUser.avatar} className="w-14 h-14 rounded-full border-2 border-[#00a884] p-0.5" alt=""/>
                <button className="absolute bottom-0 right-0 bg-[#00a884] text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"><svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></button>
              </div>
              <div className="flex-1">
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>My Status</h3>
                <p className="text-xs opacity-60">Expires in 2h</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
               <textarea 
                placeholder="Type temporary status..." 
                rows={2}
                className={`w-full p-3 rounded-lg text-sm border outline-none resize-none mb-3 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
              />
              <button 
                onClick={() => { if(statusText.trim()) { onAddStatus(statusText); setStatusText(''); } }} 
                className="w-full bg-[#00a884] text-white py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition"
              >
                Post (2h Life)
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-[#008069] uppercase tracking-wider">Recent Updates</h4>
              {statuses.map(status => {
                const user = users.find(u => u.id === status.userId) || currentUser;
                return (
                  <div key={status.id} onClick={() => setViewingStatusId(status.id)} className="flex items-center gap-4 cursor-pointer active:scale-95 transition p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 rounded-full border-2 border-[#00a884] p-1">
                      <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt=""/>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : ''}`}>{user.username}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                           <span className="flex items-center gap-0.5">
                              <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                              {status.likes.length}
                           </span>
                           <span>{status.comments.length} cmt</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#00a884] font-bold uppercase">Tap to view & interact</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
               <h2 className="text-xl font-bold mb-1">AI HUB</h2>
               <p className="text-xs opacity-80">Powerful Gemini AI at your fingertips</p>
            </div>

            <div className="p-4 space-y-6">
              <div className={`p-4 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Gemini Support</h3>
                    <p className="text-xs opacity-60">Real-time intelligent chat</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectChat('gemini')}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider active:scale-95 transition shadow-lg"
                >
                  Launch Support Chat
                </button>
              </div>

              <div className={`p-4 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Image Lab</h3>
                    <p className="text-xs opacity-60">Turn text into art</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <textarea 
                    placeholder="E.g., A cute cat sitting on a moon made of cheese..."
                    rows={2}
                    className={`w-full p-3 text-xs border rounded-xl outline-none resize-none ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                    value={imagePrompt}
                    onChange={e => setImagePrompt(e.target.value)}
                  />
                  <button 
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider active:scale-95 transition shadow-lg disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Magic'}
                  </button>
                </div>

                {generatedImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-[11px] font-bold uppercase opacity-40 mb-3 tracking-widest">Recent Creations</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {generatedImages.slice(0, 4).map(img => (
                        <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600 bg-gray-100">
                          <img src={img.url} className="w-full h-full object-cover" alt={img.prompt} title={img.prompt}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="p-2 animate-in slide-in-from-left-4 duration-300">
            {calls.slice().reverse().map(call => {
              const isIncoming = call.receiverId === currentUser.id;
              const peer = users.find(u => u.id === (isIncoming ? call.callerId : call.receiverId));
              return (
                <div key={call.id} className="flex items-center px-4 py-3 gap-4 border-b dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition">
                  <img src={peer?.avatar} className="w-12 h-12 rounded-full object-cover" alt=""/>
                  <div className="flex-1">
                    <h4 className={`font-bold ${isDarkMode ? 'text-white' : ''}`}>{peer?.username || 'Unknown'}</h4>
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill={call.status === 'missed' ? '#ef4444' : '#22c55e'} className={!isIncoming ? 'rotate-180' : ''}>
                        <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z"/>
                      </svg>
                      <p className="text-xs opacity-60 font-medium">{formatTime(call.timestamp)}</p>
                    </div>
                  </div>
                  <button onClick={() => peer && onStartCall(peer.id)} className="text-[#008069] p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full active:scale-90 transition">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={onOpenContacts} className="fixed bottom-6 right-6 bg-[#00a884] text-white p-4 rounded-full shadow-2xl z-10 active:scale-90 transition hover:bg-[#008f70]"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></button>
    </div>
  );
};

export default ChatSidebar;
