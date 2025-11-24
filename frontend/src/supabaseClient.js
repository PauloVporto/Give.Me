import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Subscribe to new messages in a conversation
 * @param {string} conversationId - UUID da conversa
 * @param {Function} callback - Função chamada quando nova mensagem chega
 * @returns {Object} subscription - Objeto de subscrição do Supabase
 */
export const subscribeToMessages = (conversationId, callback) => {
  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        console.log('[Supabase Realtime] Nova mensagem:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('[Supabase Realtime] Status:', status);
    });

  return subscription;
};

/**
 * Unsubscribe from a channel
 * @param {Object} subscription - Subscription object returned by subscribeToMessages
 */
export const unsubscribeFromMessages = async (subscription) => {
  if (subscription) {
    await supabase.removeChannel(subscription);
    console.log('[Supabase Realtime] Desconectado');
  }
};
