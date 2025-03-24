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
  author_user_id?: string;
  area_id?: string;
  authorUser?: User;
  attachments?: Attachment[];
  tags?: Tag[];
  tagsText?: string;
  comments?: Comment[];
  distance?: number;
}

export interface Attachment {
  id: string;
  filename?: string;
  extension?: string;
  mime_type?: string;
  visible?: string;
  type: string;
  url?: string;
  externalUrl?: string | null;
  thumbnail_url?: string;
  lastPlayed?: boolean;
}

export interface Comment {
  id: string;
  text: string;
  dateTime: string;
  user?: User;
}