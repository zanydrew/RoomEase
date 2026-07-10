function formatTimestamp(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ConversationListItem({ conversation, otherParty, isActive, onClick }) {
  const hasUnread = (conversation.unread_count || 0) > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
        isActive ? 'bg-gold/20' : 'hover:bg-bg'
      }`}
    >
      {otherParty?.avatar_url ? (
        <img src={otherParty.avatar_url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-full bg-bg" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-text">{otherParty?.full_name || 'User'}</p>
          <span className="shrink-0 text-xs text-text-muted">
            {formatTimestamp(conversation.lastMessage?.created_at)}
          </span>
        </div>
        {conversation.room?.title && (
          <p className="truncate text-xs font-medium text-gold-dark">{conversation.room.title}</p>
        )}
        <p className={`mt-0.5 truncate text-sm ${hasUnread ? 'font-semibold text-text' : 'text-text-soft'}`}>
          {conversation.lastMessage?.content || 'Start the conversation'}
        </p>
      </div>
    </button>
  );
}
