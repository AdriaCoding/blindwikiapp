import { Tag } from './tag';
import User from './user';

export interface Message {
  id: string;
  visible: string;
  dateTime: string;
  text: string;
  text_visible: string;
  latitude: string;
  longitude: string;
  address?: string;
  authorUser: User;
  attachments?: Attachment[];
  tagsText?: string;
  tags?: Tag[];
  comments?: Comment[];
}

export interface Attachment {
  id: string;
  type: string;
  url?: string;
  externalUrl?: string | null;
  lastPlayed?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  dateTime: string;
  authorUser: User;  
  audio_url: string | null;
  visible: string;  
}