import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Persona {
  id: number;
  name: string;
  [key: string]: any; // for extra details
}

interface Message {
  role: string;
  content: string;
  // Optionally, add timestamp, personaId, etc.
}

interface ChatUIProps {
  personaIds: number[];
}

const API_URL = import.meta.env.VITE_API_URL || '';

// Recursive JSON tree view
const JsonTree: React.FC<{ data: any; level?: number }> = ({ data, level = 0 }) => {
  const [open, setOpen] = useState(true);
  if (typeof data !== 'object' || data === null) {
    return <span className="text-blue-700">{JSON.stringify(data)}</span>;
  }
  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((v: any, i: number) => [i, v]) : Object.entries(data);
  return (
    <div className={`pl-${level * 4} border-l border-gray-100 ml-1`}> {/* Indent */}
      <button
        className="text-xs text-blue-500 hover:underline focus:outline-none mb-1"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        {open ? '▼' : '▶'} {isArray ? 'Array' : 'Object'} ({entries.length})
      </button>
      {open && (
        <div className="ml-2">
          {entries.map(([k, v]: any) => (
            <div key={k} className="mb-0.5">
              <span className="text-gray-700 font-mono text-xs">
                {isArray ? '' : <span className="text-purple-700">{k}</span>}
                {isArray ? '' : ': '}
              </span>
              {typeof v === 'object' && v !== null ? (
                <JsonTree data={v} level={level + 1} />
              ) : (
                <span className="text-blue-700 font-mono text-xs">{JSON.stringify(v)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatUI: React.FC<ChatUIProps> = ({ personaIds }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailsId, setShowDetailsId] = useState<number | null>(null);
  const [details, setDetails] = useState<Persona | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [chatHistoryId, setChatHistoryId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPersonasCount, setLoadingPersonasCount] = useState(0);
  const [aiTyping, setAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Progressive persona loading
  useEffect(() => {
    setPersonas([]);
    setLoading(true);
    setLoadingPersonasCount(personaIds.length);
    let isCancelled = false;

    if (personaIds.length === 0) {
      setLoading(false);
      setLoadingPersonasCount(0);
      return;
    }

    personaIds.forEach(id => {
      fetch(`${API_URL}/personas/${id}`, { 
        credentials: 'include',
        signal: AbortSignal.timeout(5 * 60 * 1000) // 5 minute timeout
      })
        .then(res => res.ok ? res.json() : { id, name: `Persona ${id}` })
        .then(data => {
          if (!isCancelled) {
            setPersonas(prev => {
              if (prev.some(p => p.id === id)) return prev;
              return [...prev, { id: data.id, name: data.name }];
            });
            setLoadingPersonasCount(count => count - 1);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setPersonas(prev => {
              if (prev.some(p => p.id === id)) return prev;
              return [...prev, { id, name: `Persona ${id}` }];
            });
            setLoadingPersonasCount(count => count - 1);
          }
        });
    });

    setLoading(false);

    return () => { isCancelled = true; };
  }, [personaIds]);

  // Fetch chat history if chatHistoryId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatHistoryId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/persona_group_chat/${chatHistoryId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch chat history');
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch chat history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [chatHistoryId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, aiTyping]);

  // Fetch full details for modal
  const handleShowDetails = async (id: number) => {
    setShowDetailsId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_URL}/personas/${id}`, { credentials: 'include' });
      if (res.ok) {
        setDetails(await res.json());
      } else {
        setDetails(null);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePersonaSelect = (id: number, checked: boolean) => {
    setSelectedPersonaIds(prev =>
      checked ? [...prev, id] : prev.filter(pid => pid !== id)
    );
  };

  const handleSend = async () => {
    if (!input.trim() || selectedPersonaIds.length === 0) return;
    setSending(true);
    setAiTyping(true);
    setError(null);
    try {
      const body = {
        persona_ids: selectedPersonaIds,
        query: input,
        chat_history_id: chatHistoryId,
      };
      // Add user message immediately for better UX
      setMessages(prev => [
        ...prev,
        { role: 'user_group', content: input },
      ]);
      setInput('');
      const res = await fetch(`${API_URL}/persona_group_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send message');
      }
      const data = await res.json();
      setAiTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'group', content: data.response },
      ]);
      if (data.chat_history_id) setChatHistoryId(data.chat_history_id);
    } catch (e: any) {
      setAiTyping(false);
      setError(e.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[500px] bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Sidebar for persona selection */}
      <div className="w-64 min-w-[180px] max-w-[260px] bg-white border-r border-gray-100 flex flex-col h-full">
        <div className="px-4 py-4 border-b border-gray-100 font-semibold text-gray-700 text-base flex items-center gap-2">
          Personas
          {loadingPersonasCount > 0 && (
            <span className="ml-2">
              <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </span>
          )}
          <span className="flex-1" />
          <button
            className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 font-semibold shadow-sm transition-colors disabled:opacity-60"
            type="button"
            disabled={personas.length === 0}
            onClick={() => {
              if (selectedPersonaIds.length === personas.length) {
                setSelectedPersonaIds([]);
              } else {
                setSelectedPersonaIds(personas.map(p => p.id));
              }
            }}
          >
            {selectedPersonaIds.length === personas.length && personas.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {loading && personas.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full py-8 text-gray-400">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <div>Loading personas...</div>
            </div>
          )}
          {!loading && personas.length === 0 && (
            <div className="text-gray-400 text-sm">No personas found.</div>
          )}
          {personas.length > 0 && personas.map(p => (
            <div key={p.id} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 shadow-sm mb-2">
              <input
                type="checkbox"
                checked={selectedPersonaIds.includes(p.id)}
                onChange={e => handlePersonaSelect(p.id, e.target.checked)}
                className="accent-blue-600 w-4 h-4 mr-2"
                id={`persona-checkbox-${p.id}`}
              />
              <label htmlFor={`persona-checkbox-${p.id}`} className="text-sm font-medium text-gray-800 cursor-pointer select-none flex-1 truncate">
                {p.name}
              </label>
              <button
                onClick={() => handleShowDetails(p.id)}
                className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                title="Show details"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={chatContainerRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="h-10 w-10 mb-2 animate-spin" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              <div>Loading chat...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm flex items-center justify-center h-full">{error}</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="h-10 w-10 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3A7.952 7.952 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <div>No messages yet. Start the conversation!</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user' || msg.role === 'user_group';
                const isAI = msg.role === 'group';
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                      <div className="mb-1 text-xs font-semibold">
                        {isUser ? 'You' : 'Personas'}
                      </div>
                      <div className="whitespace-pre-line text-sm">
                        {isAI ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {aiTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="max-w-[80%] px-4 py-2 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-800 rounded-bl-none flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-xs text-gray-500">typing...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors disabled:opacity-60"
            type="button"
            disabled={sending || !input.trim() || selectedPersonaIds.length === 0}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 min-w-[320px] max-w-[90vw] max-h-[80vh] flex flex-col">
            {/* Sticky Close (X) button */}
            <div className="sticky top-0 z-10 flex justify-end bg-white rounded-t-xl">
              <button
                onClick={() => setShowDetailsId(null)}
                className="m-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 focus:outline-none shadow"
                type="button"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {loadingDetails ? (
                <div className="text-gray-500">Loading details...</div>
              ) : details ? (
                <>
                  <h4 className="text-lg font-semibold mb-2 pr-10">{details.name}</h4>
                  <div className="bg-gray-50 rounded p-3 text-xs text-gray-700 overflow-x-auto max-w-full">
                    {typeof details === 'object' && details !== null ? (
                      <JsonTree data={details} />
                    ) : (
                      <pre>{JSON.stringify(details, null, 2)}</pre>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-red-500">Failed to load details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatUI; 