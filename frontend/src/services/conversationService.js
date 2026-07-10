import client from '../api/client';

export function startConversation(roomId) {
  return client.post('/conversations/start', { room_id: roomId });
}

export function getMyConversations() {
  return client.get('/conversations');
}

export function getMessages(conversationId) {
  return client.get(`/conversations/${conversationId}/messages`);
}

export function sendMessage(conversationId, content) {
  return client.post(`/conversations/${conversationId}/messages`, { content });
}

export function markAsRead(conversationId) {
  return client.put(`/conversations/${conversationId}/read`);
}
