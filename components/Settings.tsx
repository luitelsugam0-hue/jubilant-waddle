
import React, { useState } from 'react';
import { User } from '../types';

interface SettingsProps {
  currentUser: User;
  onClose: () => void;
  onUpdateProfile: (user: User) => void;
  allUsers: User[];
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

type SettingsCategory = 'main' | 'profile' | 'privacy' | 'security' | 'notifications' | 'chats';

const Settings: React.FC<SettingsProps> = ({ currentUser, onClose, onUpdateProfile, allUsers, isDarkMode, setIsDarkMode }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('main');
  const [username, setUsername] = useState(currentUser.username);
  const [isEditingName, setIsEditingName] = useState(false);
  const [pin, setPin] = useState(currentUser.twoFactorPin || '');
  
  const [notifs, setNotifs] = useState({ sounds: true, previews: true, desktop: true });
  const [chatSettings, setChatSettings] = useState({ enterIsSend: true, fontSize: 'medium' });

  const handleSaveName = () => {
    onUpdateProfile({ ...currentUser, username });
    setIsEditingName(false);
  };

  const handleToggle2FA = () => {
    if (currentUser.is2FAEnabled) {
      onUpdateProfile({ ...currentUser, is2FAEnabled: false, twoFactorPin: '' });
      setPin('');
    } else {
      if (pin.length === 6) {
        onUpdateProfile({ ...currentUser, is2FAEnabled: true, twoFactorPin: pin });
      } else {
        alert("Please enter a 6-digit PIN first.");
      }
    }
  };

  const getBlockedUsers = () => {
    return allUsers.filter(u => currentUser.blockedUserIds?.includes(u.id));
  };

  const renderHeader = (title: string, onBack: () => void) => (
    <header className="bg-[#008069] text-white px-6 pt-10 pb-4 flex items-center gap-6 shadow-md z-50">
      <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full active:scale-90 transition">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"/>
        </svg>
      </button>
      <h1 className="text-lg font-medium tracking-wide">{title}</h1>
    </header>
  );

  const SettingItem = ({ icon, title, subtitle, onClick, color = isDarkMode ? "#9ca3af" : "#54656f" }: any) => (
    <button 
      onClick={onClick}
      className={`w-full px-6 py-4 flex items-center gap-6 active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}
    >
      <div style={{ color }}>{icon}</div>
      <div className="flex-1 text-left">
        <p className={`text-[15px] font-medium ${isDarkMode ? 'text-gray-200' : 'text-[#3b4a54]'}`}>{title}</p>
        {subtitle && <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#667781]'}`}>{subtitle}</p>}
      </div>
    </button>
  );

  const ToggleItem = ({ title, subtitle, checked, onChange }: any) => (
    <div className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-50'}`}>
      <div className="flex-1 pr-4">
        <p className={`text-[15px] font-medium ${isDarkMode ? 'text-gray-200' : 'text-[#3b4a54]'}`}>{title}</p>
        {subtitle && <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-[#667781]'}`}>{subtitle}</p>}
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-[#00a884]' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform border border-gray-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const contentBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const mainBg = isDarkMode ? 'bg-gray-900' : 'bg-[#f0f2f5]';

  if (activeCategory === 'main') {
    return (
      <div className={`absolute inset-0 z-40 flex flex-col ${mainBg}`}>
        {renderHeader("Settings", onClose)}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Quick Access */}
          <button 
            onClick={() => setActiveCategory('profile')}
            className={`w-full flex items-center gap-4 px-6 py-5 mb-3 shadow-sm active:scale-95 transition-transform ${contentBg}`}
          >
            <img src={currentUser.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" alt="" />
            <div className="flex-1 text-left">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#111b21]'}`}>{currentUser.username}</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#667781]'}`}>Available</p>
            </div>
          </button>

          <div className={`${contentBg} shadow-sm`}>
            <SettingItem 
              title="Privacy" 
              subtitle="Blocked contacts, disappearing messages" 
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8-1.41-1.42z"/></svg>}
              onClick={() => setActiveCategory('privacy')}
            />
            <SettingItem 
              title="Security" 
              subtitle="Two-step verification, change password" 
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>}
              onClick={() => setActiveCategory('security')}
            />
            <SettingItem 
              title="Notifications" 
              subtitle="Message, group & call tones" 
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>}
              onClick={() => setActiveCategory('notifications')}
            />
            <SettingItem 
              title="Chats" 
              subtitle="Dark mode, wallpaper, chat history" 
              icon={<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>}
              onClick={() => setActiveCategory('chats')}
            />
          </div>

          <div className="mt-8 px-6 pb-10 flex flex-col items-center gap-4">
            <button onClick={onClose} className="text-[#00a884] font-bold text-sm tracking-widest uppercase">Go Back</button>
            <p className="text-[10px] text-gray-500 font-bold uppercase">v 1.2.4 Gemini Android</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-40 flex flex-col ${mainBg}`}>
      {renderHeader(activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1), () => setActiveCategory('main'))}
      
      <div className={`flex-1 overflow-y-auto ${contentBg}`}>
        {activeCategory === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center py-10 bg-gradient-to-b from-[#008069]/10 to-transparent">
              <div className="relative group">
                <img src={currentUser.avatar} className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover" alt="" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              </div>
            </div>
            <div className="px-6 py-6">
              <label className="text-xs text-[#008069] font-bold uppercase tracking-wider block mb-4">Your name</label>
              <div className="flex items-center justify-between border-b-2 border-gray-100 dark:border-gray-700 pb-2">
                {isEditingName ? (
                  <input 
                    autoFocus 
                    className={`w-full py-1 outline-none text-lg font-medium bg-transparent ${isDarkMode ? 'text-white' : 'text-[#3b4a54]'}`} 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  />
                ) : (
                  <>
                    <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-[#3b4a54]'}`}>{username}</span>
                    <button onClick={() => setIsEditingName(true)} className="text-[#00a884]">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">This is not your password. This name will be visible to your WhatsApp contacts.</p>
            </div>
          </div>
        )}

        {activeCategory === 'privacy' && (
          <div>
            <div className="px-6 py-4 border-b dark:border-gray-700 text-xs text-[#008069] font-bold uppercase tracking-widest mt-2">Personal info</div>
            <SettingItem title="Last seen" subtitle="Everyone" />
            <SettingItem title="Profile photo" subtitle="Everyone" />
            <ToggleItem title="Read receipts" subtitle="If turned off, you won't send or receive Read receipts." checked={true} />
            
            <div className="px-6 py-4 border-b dark:border-gray-700 text-xs text-[#008069] font-bold uppercase tracking-widest mt-6">Disappearing messages</div>
            <SettingItem title="Default message timer" subtitle="Off" />
            
            <div className="px-6 py-4 border-b dark:border-gray-700 text-xs text-[#008069] font-bold uppercase tracking-widest mt-6">Contacts</div>
            <SettingItem title="Blocked contacts" subtitle={`${currentUser.blockedUserIds?.length || 0} contacts`} />
            {getBlockedUsers().map(user => (
              <div key={user.id} className="px-10 py-3 flex items-center justify-between text-sm border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                  <span className={isDarkMode ? 'text-gray-200' : ''}>{user.username}</span>
                </div>
                <button onClick={() => onUpdateProfile({...currentUser, blockedUserIds: currentUser.blockedUserIds?.filter(id => id !== user.id)})} className="text-[#00a884] font-bold text-[11px] uppercase">Unblock</button>
              </div>
            ))}
          </div>
        )}

        {activeCategory === 'security' && (
          <div className="px-6 py-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-[#e7fce3] dark:bg-[#008069]/20 rounded-full text-[#008069]">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              </div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#3b4a54]'}`}>Two-step verification</h3>
            </div>
            <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-[#667781]'}`}>For added security, enable two-step verification, which will require a PIN when registering your phone number with WhatsApp again.</p>
            <div className="flex flex-col gap-6">
              <input 
                type="password" 
                maxLength={6}
                placeholder="Enter 6-digit PIN"
                className={`w-full border-2 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#00a884] outline-none text-center text-xl tracking-widest ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'}`}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              />
              <button 
                onClick={handleToggle2FA}
                className={`py-4 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 ${currentUser.is2FAEnabled ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-[#00a884] text-white shadow-lg'}`}
              >
                {currentUser.is2FAEnabled ? 'Disable PIN' : 'Enable Verification'}
              </button>
            </div>
          </div>
        )}

        {activeCategory === 'notifications' && (
          <div>
            <div className="px-6 py-4 border-b dark:border-gray-700 text-xs text-[#008069] font-bold uppercase tracking-widest mt-2">Messages</div>
            <ToggleItem title="Conversation tones" subtitle="Play sounds for incoming and outgoing messages." checked={notifs.sounds} onChange={() => setNotifs({...notifs, sounds: !notifs.sounds})} />
            <SettingItem title="Notification tone" subtitle="Default (Aurora)" />
            <SettingItem title="Vibrate" subtitle="Default" />
            <ToggleItem title="Show Previews" subtitle="Display text in notifications." checked={notifs.previews} onChange={() => setNotifs({...notifs, previews: !notifs.previews})} />
          </div>
        )}

        {activeCategory === 'chats' && (
          <div>
            <div className="px-6 py-4 border-b dark:border-gray-700 text-xs text-[#008069] font-bold uppercase tracking-widest mt-2">Display</div>
            <ToggleItem title="Dark Mode" subtitle="Reduce eye strain with a darker palette." checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
            <SettingItem title="Wallpaper" subtitle="Default pattern" />
            
            <div className="px-6 py-4 border-b dark:border-gray-700 text-xs text-[#008069] font-bold uppercase tracking-widest mt-6">Settings</div>
            <ToggleItem title="Enter is send" subtitle="Enter key will send your message" checked={chatSettings.enterIsSend} onChange={() => setChatSettings({...chatSettings, enterIsSend: !chatSettings.enterIsSend})} />
            <div className="px-6 py-6">
              <label className={`text-sm font-bold block mb-3 uppercase tracking-tighter ${isDarkMode ? 'text-gray-300' : 'text-[#3b4a54]'}`}>Font size</label>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setChatSettings({...chatSettings, fontSize: size})}
                    className={`flex-1 py-2 rounded-lg border-2 text-xs font-bold uppercase transition-all ${chatSettings.fontSize === size ? 'bg-[#00a884] border-[#00a884] text-white shadow-md' : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
