import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow({ conversation, otherParty, messages, currentUserId, onSendMessage, sending }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex items-center gap-3">
          {otherParty?.avatar_url ? (
            <img src={otherParty.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-bg" />
          )}
          <p className="font-semibold text-text">{otherParty?.full_name || 'User'}</p>
        </div>

        {conversation.room && (
          <Link
            to={`/rooms/${conversation.room.uuid}`}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-bg"
          >
            {conversation.room.images?.[0]?.image_url && (
              <img
                src={conversation.room.images[0].image_url}
                alt=""
                className="h-9 w-9 rounded-md object-cover"
              />
            )}
            <div className="text-left">
              <p className="text-xs font-semibold text-text">{conversation.room.title}</p>
              <p className="text-xs text-gold-dark">${conversation.room.price_per_month}/month</p>
            </div>
            <ChevronRight size={14} className="text-text-muted" />
          </Link>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.uuid || message.id} message={message} isOwn={message.sender_id === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSendMessage} disabled={sending} />
    </div>
  );
}
