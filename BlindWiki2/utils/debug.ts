import { Area } from "@/models/area";
import { Message } from "@/models/message";
import { Tag } from "@/models/tag";
import * as AuthService from "@/services/authService";
import * as MessageService from "@/services/messageService";
import * as TagService from "@/services/tagService";
import * as AreaService from "@/services/areaService";

import {
  testRegisterFlow,
  getAllSecureItems,
  clearAllSecureItems
} from './debugAuth';

import {
  testGetMessages,
  testSearchMessages,
  testDeleteMessage,
  testUpdateMessageTags,
  testPublishMessage,
  testPostComment,
  testAudioPlayed
} from './debugMessage';

import {
  testGetProposedTags,
  testGetTags,
  testGetNearbyTags,
  testGetTagsByArea
} from './debugTag';

import {
  testGetAreas
} from './debugArea';

// Interfaz Debug unificada
export interface Debug {
  // Funciones de Auth
  testRegisterFlow: (username: string, email: string, password: string) => Promise<void>;
  getAllSecureItems: () => Promise<Record<string, string | null>>;
  clearAllSecureItems: () => Promise<void>;
  
  // Funciones de Message
  testSearchMessages: (lat?: string, long?: string, searchTerm?: string) => Promise<void>;
  testDeleteMessage: (messageId?: string) => Promise<void>;
  testGetMessages: (options?: {
    lat?: string;
    long?: string;
    dist?: string;
    authorId?: string;
    tags?: string;
    area?: string;
    sort?: string;
    description?: string;
  }) => Promise<void>;
  testUpdateMessageTags: (messageId?: string, tags?: string) => Promise<void>;
  testPublishMessage: (
    audioFilePath?: string,
    latitude?: string,
    longitude?: string,
    address?: string,
    tags?: string
  ) => Promise<void>;
  testPostComment: (messageId?: string, text?: string) => Promise<void>;
  testAudioPlayed: (attachmentId?: string) => Promise<void>;

  // Funciones de Tag
  testGetProposedTags: () => Promise<void>;
  testGetTags: (options?: {
    lat?: string;
    long?: string;
    area?: string;
    sort?: string;
    dist_init?: string;
    dist_max?: string;
    min_results?: string;
    description?: string;
  }) => Promise<void>;
  testGetNearbyTags: (
    lat?: string,
    long?: string,
    sort?: string,
    dist_init?: string,
    dist_max?: string
  ) => Promise<void>;
  testGetTagsByArea: (area?: string, sort?: string) => Promise<void>;

  // Funciones de Area
  testGetAreas: () => Promise<void>;

  // Servicios originales
  login: typeof AuthService.login;
  logout: typeof AuthService.logout;
  register: typeof AuthService.register;
  fetchRegistrationNonce: typeof AuthService.fetchRegistrationNonce;
  computeRegisterHash: typeof AuthService.computeRegisterHash;
  getMessages: typeof MessageService.getMessages;
  searchMessages: typeof MessageService.searchMessages;
  deleteMessage: typeof MessageService.deleteMessage;
  updateMessageTags: typeof MessageService.updateMessageTags;
  publishMessage: typeof MessageService.publishMessage;
  postComment: typeof MessageService.postComment;
  audioPlayed: typeof MessageService.audioPlayed;
  getProposedTags: typeof TagService.getProposedTags;
  getTags: typeof TagService.getTags;
  getNearbyTags: typeof TagService.getNearbyTags;
  getTagsByArea: typeof TagService.getTagsByArea;
  getAreas: typeof AreaService.getAreas;
}

// Declaración global
declare global {
  interface Window {
    debug: Debug;
  }
  namespace NodeJS {
    interface Global {
      debug: Debug;
    }
  }
}

// Función de configuración unificada
export function setupDebug(): void {
  const debugObject: Debug = {
    // Servicios originales
    login: AuthService.login,
    logout: AuthService.logout,
    register: AuthService.register,
    fetchRegistrationNonce: AuthService.fetchRegistrationNonce,
    computeRegisterHash: AuthService.computeRegisterHash,
    getMessages: MessageService.getMessages,
    searchMessages: MessageService.searchMessages,
    deleteMessage: MessageService.deleteMessage,
    updateMessageTags: MessageService.updateMessageTags,
    publishMessage: MessageService.publishMessage,
    postComment: MessageService.postComment,
    audioPlayed: MessageService.audioPlayed,
    getProposedTags: TagService.getProposedTags,
    getTags: TagService.getTags,
    getNearbyTags: TagService.getNearbyTags,
    getTagsByArea: TagService.getTagsByArea,
    getAreas: AreaService.getAreas,
    
    // Funciones de depuración
    testRegisterFlow,
    getAllSecureItems,
    clearAllSecureItems,
    testGetMessages,
    testSearchMessages,
    testDeleteMessage,
    testUpdateMessageTags,
    testPublishMessage,
    testPostComment,
    testAudioPlayed,
    testGetProposedTags,
    testGetTags,
    testGetNearbyTags,
    testGetTagsByArea,
    testGetAreas
  };

  // Para React Native
  if (global) {
    // @ts-ignore
    global.debug = debugObject;
  }

  // Para Web
  if (typeof window !== 'undefined') {
    window.debug = debugObject;
  }

  console.log("🔧 Funciones de depuración inicializadas!");
  console.log("📱 Categorías disponibles:");
  console.log("- Auth: debug.testRegisterFlow(), debug.getAllSecureItems()");
  console.log("- Messages: debug.testGetMessages(), debug.testPublishMessage()");
  console.log("- Tags: debug.testGetTags(), debug.testGetNearbyTags()");
  console.log("- Areas: debug.testGetAreas()");
} 