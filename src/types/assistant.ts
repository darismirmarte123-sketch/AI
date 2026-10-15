export type PersonaId = 'nova' | 'atlas' | 'aura' | 'spark';

export interface PersonaInfo {
  id: PersonaId;
  name: string;
  tagline: string;
  avatar: string;
  color: string;
  voice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
}

export type AttachmentType = 'image' | 'video' | 'audio' | 'document';

export interface FileAttachment {
  name: string;
  type: AttachmentType;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachment?: FileAttachment;
  image?: {
    mimeType: string;
    data: string; // base64
    previewUrl?: string;
  };
  actions?: Array<{
    type: 'reminder' | 'note' | 'timer';
    data: any;
  }>;
  quickReplies?: string[];
  audioBase64?: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  date: string;
  completed: boolean;
  priority?: 'normal' | 'high';
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  color?: string;
}

export interface ActiveTimer {
  id: string;
  minutes: number;
  remainingSeconds: number;
  label: string;
  isRunning: boolean;
}
