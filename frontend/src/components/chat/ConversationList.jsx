import { useState } from 'react';
import { Search } from 'lucide-react';
import ConversationListItem from './ConversationListItem';
import EmptyState from '../ui/EmptyState';

export default function ConversationList({ conversations, activeConversationId, onSelect, currentUserId }) {
  const [query, setQuery] = useState('');

  function getOtherParty(conversation) {
    return conversation.renter_id === currentUserId ? conversation.owner : conversation.renter;
  }

  const filtered = conversations.filter((conversation) => {
    if (!query.trim()) return true;
    const otherParty = getOtherParty(conversation);
    const haystack = `${otherParty?.full_name || ''} ${conversation.room?.title || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="text-lg font-bold text-text">Messages</h2>
        <div className="relative mt-3">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 && (
          <div className="px-2">
            <EmptyState title="No conversations" description="Messages with room owners and renters will show up here." />
          </div>
        )}

        {filtered.map((conversation) => (
          <ConversationListItem
            key={conversation.uuid}
            conversation={conversation}
            otherParty={getOtherParty(conversation)}
            isActive={conversation.uuid === activeConversationId}
            onClick={() => onSelect(conversation.uuid)}
          />
        ))}
      </div>
    </div>
  );
}
