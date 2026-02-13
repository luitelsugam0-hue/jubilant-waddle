
import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface ContactsProps {
  users: User[];
  onClose: () => void;
  onSelectContact: (userId: string) => void;
  onCreateGroup?: (name: string, firstMemberId: string) => void;
  onCreateCommunity?: (name: string, description: string) => void;
  isDarkMode?: boolean;
}

const Contacts: React.FC<ContactsProps> = ({ users, onClose, onSelectContact, onCreateGroup, onCreateCommunity, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState<'contacts' | 'newGroup' | 'newComm'>('contacts');
  const [targetName, setTargetName] = useState('');
  const [targetDesc, setTargetDesc] = useState('');

  const filteredContacts = useMemo(() => {
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleCreateGroupWithUser = (uid: string) => {
      if (!targetName.trim()) {
          alert("Please enter a group name first.");
          return;
      }
      onCreateGroup?.(targetName.trim(), uid);
  };

  const handleFinalizeCommunity = () => {
      if (!targetName.trim()) {
          alert("Please enter a community name.");
          return;
      }
      onCreateCommunity?.(targetName.trim(), targetDesc.trim());
  };

  return (
    <div className={`absolute inset-0 z-50 flex flex-col transition-transform duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-[#f0f2f5]'}`}>
      <header className="bg-[#008069] text-white px-6 pt-14 pb-4 flex items-center gap-6">
        <button onClick={() => mode === 'contacts' ? onClose() : setMode('contacts')} className="hover:bg-white/10 p-1 rounded-full transition">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
            <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"/>
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-medium leading-tight">
              {mode === 'contacts' ? 'New chat' : mode === 'newGroup' ? 'New private group' : 'New private community'}
          </h1>
          <p className="text-xs opacity-90">{users.length} contacts</p>
        </div>
      </header>

      <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {mode === 'contacts' && (
            <>
                <div className={`p-4 border-b mb-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg viewBox="0 0 24 24" width="20" height="20" className="text-[#667781]" fill="currentColor">
                            <path d="M15.009 13.805a6.685 6.685 0 10-1.205 1.205l4.814 4.814a.852.852 0 101.205-1.205l-4.814-4.814zM10.125 15.11a4.985 4.985 0 114.985-4.985 4.985 4.985 0 01-4.985 4.985z"/>
                        </svg>
                        </span>
                        <input 
                        type="text" 
                        placeholder="Search contacts" 
                        className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none placeholder-[#667781] ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-[#f0f2f5]'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                <div onClick={() => setMode('newGroup')} className={`px-4 py-3 flex items-center gap-4 cursor-pointer group transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#f5f6f6]'}`}>
                    <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white group-hover:bg-[#008f70]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                    </svg>
                    </div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>New group</span>
                </div>

                <div onClick={() => setMode('newComm')} className={`px-4 py-3 flex items-center gap-4 cursor-pointer group transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-[#f5f6f6]'}`}>
                    <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white group-hover:bg-[#008f70]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                        <path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    </div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>New community</span>
                </div>

                <div className={`px-4 py-4 text-xs font-bold uppercase tracking-widest mt-4 ${isDarkMode ? 'text-[#00a884] bg-gray-900/40' : 'text-[#008069] bg-[#f0f2f5]/50'}`}>
                    Contacts on the application
                </div>

                {filteredContacts.map(user => (
                    <div 
                    key={user.id} 
                    onClick={() => onSelectContact(user.id)}
                    className={`px-4 py-3 flex items-center gap-4 cursor-pointer border-b transition ${isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-[#f5f6f6] border-gray-50'}`}
                    >
                    <div className="relative">
                        <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                        {user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25d366] border-2 border-white dark:border-gray-800 rounded-full"></span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>{user.username}</h3>
                        <p className="text-sm text-[#667781] truncate">
                        {user.isOnline ? 'Online' : 'Hey there! I am using WhatsApp.'}
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </>
        )}

        {mode === 'newGroup' && (
            <div className="p-6 space-y-6">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4 border-2 border-dashed border-gray-300">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Type group name..." 
                        className={`w-full p-3 border-b-2 outline-none text-center text-lg font-bold ${isDarkMode ? 'bg-transparent border-gray-700 text-white focus:border-[#00a884]' : 'bg-transparent border-gray-200 focus:border-[#00a884]'}`}
                        value={targetName}
                        onChange={e => setTargetName(e.target.value)}
                    />
                </div>
                
                <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select first member</h3>
                <div className="space-y-1">
                    {users.map(user => (
                        <div key={user.id} onClick={() => handleCreateGroupWithUser(user.id)} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                            <img src={user.avatar} className="w-10 h-10 rounded-full" alt=""/>
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{user.username}</span>
                            <div className="ml-auto text-[#00a884]"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {mode === 'newComm' && (
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-[#00a884] uppercase">Community Name</label>
                    <input 
                        type="text" 
                        className={`w-full p-4 rounded-xl border-2 outline-none transition-colors focus:border-[#00a884] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                        placeholder="E.g., Tech Enthusiasts"
                        value={targetName}
                        onChange={e => setTargetName(e.target.value)}
                    />
                    <label className="text-xs font-bold text-[#00a884] uppercase block mt-4">Description</label>
                    <textarea 
                        className={`w-full p-4 rounded-xl border-2 outline-none transition-colors focus:border-[#00a884] h-32 resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                        placeholder="What's this community about?"
                        value={targetDesc}
                        onChange={e => setTargetDesc(e.target.value)}
                    />
                    <button 
                        onClick={handleFinalizeCommunity}
                        className="w-full bg-[#00a884] text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg active:scale-95 transition mt-8"
                    >
                        Create Private Community
                    </button>
                    <p className="text-[10px] text-center opacity-40 leading-relaxed italic mt-4">Communities created here are strictly private. Only you and users you manually add can see this community exist.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
