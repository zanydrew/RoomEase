import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import useAuth from '../../hooks/useAuth';
import useAsync from '../../hooks/useAsync';
import * as conversationService from '../../services/conversationService';
import { notify } from '../../context/ToastConfig';

export default function Chat() {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    data: conversations,
    loading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useAsync(() => conversationService.getMyConversations().then((res) => res.data.data.conversations), []);

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Auto-select the first conversation if none is chosen yet.
  useEffect(() => {
    if (!conversationId && conversations?.length > 0) {
      navigate(`/chat/${conversations[0].uuid}`, { replace: true });
    }
  }, [conversationId, conversations, navigate]);

  useEffect(() => {
    if (!conversationId) return;

    setMessagesLoading(true);
    conversationService
      .getMessages(conversationId)
      .then((res) => setMessages(res.data.data.messages || []))
      .catch((err) => notify.error(err))
      .finally(() => setMessagesLoading(false));
  }, [conversationId]);

  const activeConversation = conversations?.find((c) => c.uuid === conversationId);
  const otherParty = activeConversation
    ? activeConversation.renter_id === user?.uuid
      ? activeConversation.owner
      : activeConversation.renter
    : null;

  async function handleSend(content) {
    setSending(true);
    try {
      const res = await conversationService.sendMessage(conversationId, content);
      setMessages((current) => [...current, res.data.data.message]);
      refetchConversations();
    } catch (err) {
      notify.error(err);
    } finally {
      setSending(false);
    }
  }

  if (conversationsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ErrorState message="Couldn't load your conversations." onRetry={refetchConversations} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid h-[calc(100vh-220px)] min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-bg-card shadow-sm sm:grid-cols-[280px_1fr]">
        <div className="hidden border-r border-border sm:block">
          {!conversationsLoading && (
            <ConversationList
              conversations={conversations || []}
              activeConversationId={conversationId}
              onSelect={(id) => navigate(`/chat/${id}`)}
              currentUserId={user?.uuid}
            />
          )}
        </div>

        <div>
          {!conversationsLoading && conversations?.length === 0 && (
            <div className="flex h-full items-center justify-center p-8">
              <EmptyState title="No conversations yet" description="Start a chat from a room's detail page." />
            </div>
          )}

          {activeConversation && !messagesLoading && (
            <ChatWindow
              conversation={activeConversation}
              otherParty={otherParty}
              messages={messages}
              currentUserId={user?.uuid}
              onSendMessage={handleSend}
              sending={sending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
