import axios from 'axios'
import { ACCESS_TOKEN } from './constants'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
);

export default api

export const chatAPI = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations/');
    return response.data;
  },

  createConversation: async (peerSupabaseUserId) => {
    const response = await api.post('/chat/conversations/create/', {
      peer_supabase_user_id: peerSupabaseUserId
    });
    return response.data;
  },

  sendMessage: async (conversationId, body) => {
    const response = await api.post(
      `/chat/conversations/${conversationId}/messages/send/`,
      { body }
    );
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages/`
    );
    return response.data;
  }
};