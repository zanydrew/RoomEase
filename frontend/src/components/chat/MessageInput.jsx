import { useState } from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border p-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
        aria-label="Type a message"
        className="flex-1 rounded-full bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
      />
      <button
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-dark text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <Send size={16} />
      </button>
    </form>
  );
}
