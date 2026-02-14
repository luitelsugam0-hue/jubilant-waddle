
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Message, Status, Call, GeneratedImage, StatusComment, Group, Community } from './types';
import Auth from './components/Auth';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import Contacts from './components/Contacts';

const App: React.FC = () => {
  // 1. All State Hooks
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);

  // 2. All Memo/Callback Hooks (Must be before any conditional returns)
  const loadData = useCallback(() => {
    const storedUsers = JSON.parse(localStorage.getItem('wa_clone_users') || '[]');
    const storedMessages = JSON.parse(localStorage.getItem('wa_clone_messages') || '[]');
    const storedStatuses = JSON.parse(localStorage.getItem('wa_clone_statuses') || '[]');
    const storedAiImages = JSON.parse(localStorage.getItem('wa_clone_ai_images') || '[]');
    const storedCalls = JSON.parse(localStorage.getItem('wa_clone_calls') || '[]');
    const storedGroups = JSON.parse(localStorage.getItem('wa_clone_groups') || '[]');
    const storedCommunities = JSON.parse(localStorage.getItem('wa_clone_communities') || '[]');
    
    const now = Date.now();
    const activeStatuses = storedStatuses.filter((s: Status) => s.expiresAt > now);
    if (activeStatuses.length !== storedStatuses.length) {
      localStorage.setItem('wa_clone_statuses', JSON.stringify(activeStatuses));
    }

    setAllUsers(storedUsers);
    setMessages(storedMessages);
    setStatuses(activeStatuses);
    setGeneratedImages(storedAiImages);
    setCalls(storedCalls);
    setGroups(storedGroups);
    setCommunities(storedCommunities);
  }, []);

  const activeTarget = useMemo(() => {
    if (!activeChatId) return null;
    if (activeChatId === 'gemini') {
        return { id: 'gemini', username: 'Gemini AI Support', isOnline: true, avatar: 'https://picsum.photos/seed/gemini/200' };
    }
    if (activeChatId.startsWith('group_')) {
        return groups.find(g => g.id === activeChatId) || null;
    }
    return allUsers.find(u => u.id === activeChatId) || null;
  }, [activeChatId, groups, allUsers]);

  // 3. All Effect Hooks
  useEffect(() => {
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    loadData();
    const session = localStorage.getItem('wa_clone_session');
    if (session) {
      const storedUsers = JSON.parse(localStorage.getItem('wa_clone_users') || '[]');
      const user = storedUsers.find((u: User) => u.id === session);
      if (user) {
        setCurrentUser({ ...user, isOnline: true });
        const updated = storedUsers.map((u: User) => u.id === user.id ? { ...u, isOnline: true } : u);
        localStorage.setItem('wa_clone_users', JSON.stringify(updated));
        setAllUsers(updated);
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      const keys = ['wa_clone_users', 'wa_clone_messages', 'wa_clone_statuses', 'wa_clone_calls', 'wa_clone_ai_images', 'wa_clone_groups', 'wa_clone_communities'];
      if (keys.includes(e.key || '')) {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  // 4. Helper Methods
  const updateUserStatus = (userId: string, isOnline: boolean) => {
    const usersInStorage = JSON.parse(localStorage.getItem('wa_clone_users') || '[]');
    const updated = usersInStorage.map((u: User) => u.id === userId ? { ...u, isOnline } : u);
    localStorage.setItem('wa_clone_users', JSON.stringify(updated));
    setAllUsers(updated);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const usersInStorage = JSON.parse(localStorage.getItem('wa_clone_users') || '[]');
    const updated = usersInStorage.map((u: User) => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
    localStorage.setItem('wa_clone_users', JSON.stringify(updated));
    setAllUsers(updated);
  };

  const handleLogin = (user: User) => {
    setCurrentUser({ ...user, isOnline: true });
    updateUserStatus(user.id, true);
    localStorage.setItem('wa_clone_session', user.id);
  };

  const handleLogout = () => {
    if (currentUser) updateUserStatus(currentUser.id, false);
    setCurrentUser(null);
    setActiveChatId(null);
    setShowSettings(false);
    setShowContacts(false);
    localStorage.removeItem('wa_clone_session');
  };

  const handleSelectContact = (userId: string) => {
    setActiveChatId(userId);
    setShowContacts(false);
  };

  const handleSendMessage = useCallback((text: string, receiverId: string, isAi: boolean = false) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: isAi ? receiverId : currentUser.id,
      receiverId: isAi ? currentUser.id : receiverId,
      text,
      timestamp: Date.now(),
      isAi,
      status: isAi ? 'read' : 'sent'
    };
    
    if (window.navigator.vibrate) window.navigator.vibrate(50);

    setMessages(prev => {
      const updated = [...prev, newMessage];
      localStorage.setItem('wa_clone_messages', JSON.stringify(updated));
      return updated;
    });
  }, [currentUser]);

  const handleCreateGroup = (name: string, firstMemberId: string) => {
    if (!currentUser) return;
    const newGroup: Group = {
      id: 'group_' + Math.random().toString(36).substr(2, 9),
      name,
      creatorId: currentUser.id,
      members: [currentUser.id, firstMemberId],
      avatar: `https://picsum.photos/seed/${name}/200`,
      lastTimestamp: Date.now()
    };
    setGroups(prev => {
      const updated = [...prev, newGroup];
      localStorage.setItem('wa_clone_groups', JSON.stringify(updated));
      return updated;
    });
    setActiveChatId(newGroup.id);
  };

  const handleAddMemberToGroup = (groupId: string, memberId: string) => {
    setGroups(prev => {
      const updated = prev.map(g => {
        if (g.id === groupId && !g.members.includes(memberId)) {
          return { ...g, members: [...g.members, memberId] };
        }
        return g;
      });
      localStorage.setItem('wa_clone_groups', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateCommunity = (name: string, description: string) => {
    if (!currentUser) return;
    const newComm: Community = {
      id: 'comm_' + Math.random().toString(36).substr(2, 9),
      name,
      description,
      creatorId: currentUser.id,
      members: [currentUser.id],
      avatar: `https://picsum.photos/seed/${name}/200`,
      groups: []
    };
    setCommunities(prev => {
      const updated = [...prev, newComm];
      localStorage.setItem('wa_clone_communities', JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartCall = async (receiverId: string) => {
    if (!currentUser) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const newCall: Call = {
        id: Math.random().toString(36).substr(2, 9),
        callerId: currentUser.id,
        receiverId,
        timestamp: Date.now(),
        status: 'outgoing'
      };
      setActiveCall(newCall);
      setCalls(prev => {
        const updated = [...prev, newCall];
        localStorage.setItem('wa_clone_calls', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      alert("Microphone access is required for WhatsApp audio calls.");
    }
  };

  const handleAddStatus = (content: string) => {
    if (!currentUser) return;
    const newStatus: Status = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      content,
      type: 'text',
      timestamp: Date.now(),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, 
      likes: [],
      comments: []
    };
    setStatuses(prev => {
      const updated = [...prev, newStatus];
      localStorage.setItem('wa_clone_statuses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLikeStatus = (statusId: string) => {
    if (!currentUser) return;
    setStatuses(prev => {
      const updated = prev.map(s => {
        if (s.id === statusId) {
          const hasLiked = s.likes.includes(currentUser.id);
          const newLikes = hasLiked 
            ? s.likes.filter(id => id !== currentUser.id)
            : [...s.likes, currentUser.id];
          return { ...s, likes: newLikes };
        }
        return s;
      });
      localStorage.setItem('wa_clone_statuses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCommentStatus = (statusId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newComment: StatusComment = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      text: text.trim(),
      timestamp: Date.now()
    };
    setStatuses(prev => {
      const updated = prev.map(s => {
        if (s.id === statusId) {
          return { ...s, comments: [...s.comments, newComment] };
        }
        return s;
      });
      localStorage.setItem('wa_clone_statuses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveGeneratedImage = (imageUrl: string, prompt: string) => {
    const newImage: GeneratedImage = {
      id: Math.random().toString(36).substr(2, 9),
      url: imageUrl,
      prompt,
      timestamp: Date.now()
    };
    setGeneratedImages(prev => {
      const updated = [newImage, ...prev];
      localStorage.setItem('wa_clone_ai_images', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleBlock = (targetId: string) => {
    if (!currentUser) return;
    const isBlocked = currentUser.blockedUserIds?.includes(targetId);
    
    // 1. Update Current User (Blocker)
    const updatedBlockedUserIds = isBlocked 
      ? (currentUser.blockedUserIds || []).filter(id => id !== targetId)
      : [...(currentUser.blockedUserIds || []), targetId];
      
    const newCurrentUser = { ...currentUser, blockedUserIds: updatedBlockedUserIds };
    
    // 2. Update All Users (persist to localStorage)
    const newAllUsers = allUsers.map(u => {
      if (u.id === currentUser.id) return newCurrentUser;
      if (u.id === targetId) {
        const currentBlockedBy = u.blockedBy || [];
        const updatedBlockedBy = isBlocked
          ? currentBlockedBy.filter(id => id !== currentUser.id)
          : [...currentBlockedBy, currentUser.id];
        return { ...u, blockedBy: updatedBlockedBy };
      }
      return u;
    });

    setCurrentUser(newCurrentUser);
    setAllUsers(newAllUsers);
    localStorage.setItem('wa_clone_users', JSON.stringify(newAllUsers));
  };

  // 5. Conditional Return (Must be after ALL hooks)
  if (!currentUser) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f0f2f5]">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className={`h-[100svh] w-full overflow-hidden fixed ${isDarkMode ? 'dark bg-gray-900' : 'bg-[#f0f2f5]'}`}>
      {activeCall && (
        <div className="fixed inset-0 z-[100] bg-[#075e54] flex flex-col items-center justify-between text-white p-12 py-20">
          <div className="flex flex-col items-center">
            <img src={allUsers.find(u => u.id === activeCall.receiverId)?.avatar || 'https://picsum.photos/200'} className="w-32 h-32 rounded-full border-4 border-white/20 mb-6 shadow-2xl" alt=""/>
            <h2 className="text-3xl font-bold">{allUsers.find(u => u.id === activeCall.receiverId)?.username || 'Calling...'}</h2>
            <p className="mt-4 text-white/60 tracking-widest font-medium">WHATSAPP CALL</p>
          </div>
          <div className="flex gap-8 items-center">
            <button onClick={() => setActiveCall(null)} className="bg-red-500 p-6 rounded-full shadow-2xl active:scale-90 transition-transform flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white" className="rotate-[135deg]">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex h-full w-full relative">
        <div className={`w-full h-full flex flex-col relative transition-all duration-300 ${activeChatId ? 'hidden md:flex md:w-[350px] lg:w-[450px]' : 'flex'}`}>
          <div className={`flex-1 relative overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {showSettings && (
              <Settings currentUser={currentUser} onClose={() => setShowSettings(false)} onUpdateProfile={handleUpdateProfile} allUsers={allUsers} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}/>
            )}
            {showContacts && (
              <Contacts 
                users={allUsers.filter(u => u.id !== currentUser.id)} 
                onClose={() => setShowContacts(false)} 
                onSelectContact={handleSelectContact} 
                onCreateGroup={(name, fid) => { handleCreateGroup(name, fid); setShowContacts(false); }}
                onCreateCommunity={(name, desc) => { handleCreateCommunity(name, desc); setShowContacts(false); }}
                isDarkMode={isDarkMode}
              />
            )}
            <ChatSidebar 
              currentUser={currentUser} users={allUsers} onLogout={handleLogout}
              onSelectChat={setActiveChatId} activeChatId={activeChatId} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
              messages={messages} statuses={statuses} calls={calls} generatedImages={generatedImages}
              groups={groups.filter(g => g.members.includes(currentUser.id))}
              communities={communities.filter(c => c.members.includes(currentUser.id))}
              onOpenSettings={() => setShowSettings(true)} onOpenContacts={() => setShowContacts(true)}
              onAddStatus={handleAddStatus} onStartCall={handleStartCall} onSaveGeneratedImage={handleSaveGeneratedImage}
              onLikeStatus={handleLikeStatus} onCommentStatus={handleCommentStatus}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        <div className={`h-full flex-1 relative transition-all duration-300 ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
          {activeChatId && activeTarget ? (
            (() => {
              const currentUserData = allUsers.find(u => u.id === currentUser.id) || currentUser;
              return (
                <ChatWindow 
                  activeTarget={activeTarget as any} currentUser={currentUser}
                  messages={messages.filter(m => 
                    (activeChatId.startsWith('group_') && m.receiverId === activeChatId) ||
                    (!activeChatId.startsWith('group_') && ((m.senderId === currentUser.id && m.receiverId === activeChatId) || (m.senderId === activeChatId && m.receiverId === currentUser.id)))
                  )}
                  onSendMessage={handleSendMessage} onBlockUser={handleToggleBlock}
                  isBlocked={currentUserData.blockedUserIds?.includes(activeChatId)} 
                  amIBlocked={currentUserData.blockedBy?.includes(activeChatId)}
                  onBack={() => setActiveChatId(null)} onStartCall={handleStartCall}
                  onAddMember={(uid) => handleAddMemberToGroup(activeChatId, uid)}
                  availableUsers={allUsers.filter(u => u.id !== currentUser.id)}
                  isDarkMode={isDarkMode}
                />
              );
            })()
          ) : (
            <div className={`hidden md:flex flex-col items-center justify-center h-full w-full text-center p-10 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8f9fa]'}`}>
              <div className="w-48 h-48 mb-6 opacity-20"><svg viewBox="0 0 512 512" fill="none"><circle cx="256" cy="256" r="256" fill="#00a884"/><path d="M124 124H388V388H124V124Z" fill="white"/></svg></div>
              <h2 className={`text-2xl font-light mb-4 ${isDarkMode ? 'text-gray-300' : 'text-[#41525d]'}`}>WhatsApp AI</h2>
              <p className={`text-sm max-w-xs ${isDarkMode ? 'text-gray-400' : 'text-[#667781]'}`}>Explore AI features or create groups and communities privately in the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
