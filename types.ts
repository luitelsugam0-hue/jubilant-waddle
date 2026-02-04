
export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  avatar: string;
  password?: string;
  twoFactorPin?: string;
  is2FAEnabled?: boolean;
  blockedUserIds?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface StatusComment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Status {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'image';
  timestamp: number;
  expiresAt: number;
  likes: string[];
  comments: StatusComment[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  timestamp: number;
  duration?: number;
  status: 'missed' | 'answered' | 'outgoing';
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  members: string[]; // User IDs
  avatar: string;
  lastTimestamp: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[]; // User IDs
  avatar: string;
  groups: string[]; // Group IDs belonging to community
}
