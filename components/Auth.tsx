
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | '2fa';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Normalize username by trimming spaces
    const cleanUsername = username.trim();
    if (!cleanUsername && mode !== '2fa') {
      setError('Username cannot be empty');
      return;
    }

    const users = JSON.parse(localStorage.getItem('wa_clone_users') || '[]');

    if (mode === 'login') {
      const user = users.find((u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.password === password);
      if (user) {
        if (user.is2FAEnabled) {
          setTempUser(user);
          setMode('2fa');
        } else {
          onLogin(user);
        }
      } else {
        setError('Invalid username or password');
      }
    } else if (mode === '2fa') {
      if (tempUser && tempUser.twoFactorPin === pin) {
        onLogin(tempUser);
      } else {
        setError('Incorrect security PIN');
      }
    } else if (mode === 'signup') {
      if (!cleanUsername || !password) {
        setError('Please fill in required fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (users.find((u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
        setError('Username already taken');
        return;
      }

      const newUser: User & { password?: string } = {
        id: Date.now().toString(),
        username: cleanUsername, // Store trimmed username
        isOnline: true,
        avatar: `https://picsum.photos/seed/${cleanUsername}/200`,
        password,
        blockedUserIds: []
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('wa_clone_users', JSON.stringify(updatedUsers));
      onLogin(newUser);
    } else if (mode === 'forgot') {
      const userIndex = users.findIndex((u: any) => u.username.toLowerCase() === cleanUsername.toLowerCase());
      if (userIndex === -1) {
        setError('Username not found');
        return;
      }

      if (!password || password !== confirmPassword) {
        setError('Please enter and confirm a new password');
        return;
      }

      users[userIndex].password = password;
      localStorage.setItem('wa_clone_users', JSON.stringify(users));
      setSuccess('Password updated successfully! Please sign in.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  const titles = {
    login: 'Sign In',
    signup: 'Sign Up',
    forgot: 'Reset Password',
    '2fa': 'Verification'
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-[#00a884] p-3 rounded-full mb-4">
           <svg viewBox="0 0 24 24" width="40" height="40" fill="white">
            <path d="M12.011 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 1.725.449 3.344 1.237 4.743L2.25 21.75l5.163-1.355c1.365.747 2.923 1.17 4.598 1.17 5.385 0 9.75-4.365 9.75-9.75s-4.365-9.75-9.75-9.75z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#41525d]">Gemini-Chat WhatsApp</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === '2fa' ? (
          <div>
            <p className="text-sm text-center text-gray-600 mb-4">Two-step verification is enabled. Enter your 6-digit PIN.</p>
            <input
              type="password"
              maxLength={6}
              placeholder="******"
              className="mt-1 block w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-md text-center text-2xl tracking-[1em] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1">Tip: Spaces are automatically trimmed.</p>
            </div>

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {mode === 'forgot' ? 'New Password' : 'Password'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {(mode === 'signup' || mode === 'forgot') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        {error && <p className="text-red-500 text-xs mt-1 text-center font-medium">{error}</p>}
        {success && <p className="text-green-600 text-xs mt-1 font-medium text-center">{success}</p>}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[#00a884] hover:bg-[#008f70] text-white font-semibold rounded-md transition duration-200"
        >
          {titles[mode]}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        {mode === 'login' && (
          <>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className="block w-full text-[#00a884] hover:underline text-sm font-medium"
            >
              Don't have an account? Sign Up
            </button>
            <button
              onClick={() => { setMode('forgot'); setError(''); }}
              className="block w-full text-gray-500 hover:underline text-xs"
            >
              Forgot Password?
            </button>
          </>
        )}
        {(mode === 'signup' || mode === 'forgot' || mode === '2fa') && (
          <button
            onClick={() => { setMode('login'); setError(''); setTempUser(null); }}
            className="block w-full text-[#00a884] hover:underline text-sm font-medium"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
