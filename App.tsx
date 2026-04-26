import { FormEvent, useMemo, useState } from 'react';

type ResearchResult = {
  answer: string;
  links: { title: string; url: string }[];
  docText: string;
  suggestedFileName: string;
};

type ChatMessage = {
  role: 'user' | 'agent';
  text: string;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

const desktopIcons = [
  { name: 'Research Hub', prompt: 'Find key trends in AI desktop agents for 2026.' },
  { name: 'News Scout', prompt: 'Give me 5 recent trustworthy AI news sources.' },
  { name: 'Explain Mode', prompt: 'Explain transformers like I am 12.' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'agent', text: "Mochi is online. Ask by voice or type your research request." },
  ]);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const hasSpeechApi = useMemo(
    () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    []
  );

  const runResearch = async (prompt: string) => {
    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: cleanedPrompt }]);
    setQuery('');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanedPrompt }),
      });
      if (!response.ok) throw new Error('Mochi could not complete this request.');
      const data: ResearchResult = await response.json();
      setResult(data);
      setMessages((prev) => [...prev, { role: 'agent', text: data.answer }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) => [...prev, { role: 'agent', text: `Error: ${message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runResearch(query);
  };

  const startVoiceInput = () => {
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: 'Voice is not supported in this browser. Use Chrome or Edge.' },
      ]);
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await runResearch(transcript);
    };
    recognition.start();
  };

  const downloadResearch = () => {
    if (!result) return;
    const blob = new Blob([result.docText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.suggestedFileName || 'mochi-research.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="desktop">
      <header className="desktop-topbar">
        <h1>AI Desktop</h1>
        <form onSubmit={handleSubmit} className="search-box">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ask Mochi to research something..."
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      </header>

      <section className="desktop-icons">
        {desktopIcons.map((icon) => (
          <button key={icon.name} className="icon-card" onClick={() => runResearch(icon.prompt)}>
            <span className="icon-circle">{icon.name[0]}</span>
            <span>{icon.name}</span>
          </button>
        ))}
      </section>

      <section className="mochi-window">
        <div className="mochi-header">Mochi Agent</div>
        <div className="chat-log">
          {messages.map((message, index) => (
            <p key={`${message.role}-${index}`} className={`msg ${message.role}`}>
              {message.text}
            </p>
          ))}
        </div>

        {result && (
          <div className="results-panel">
            <h3>Research Output</h3>
            <div className="result-actions">
              <button onClick={downloadResearch}>Download report</button>
            </div>
            <ul>
              {result.links.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <footer className="taskbar">
        <button onClick={() => runResearch('Research AI productivity tools for software engineers.')}>
          Research
        </button>
        <button onClick={() => runResearch('Give me top global tech headlines today from reliable outlets.')}>
          News
        </button>
        <button onClick={() => runResearch('Explain this topic simply with examples.')}>Explain</button>
      </footer>

      <button
        className={`mic-fab ${isListening ? 'active' : ''}`}
        onClick={startVoiceInput}
        disabled={!hasSpeechApi || isLoading}
        title="Voice command"
      >
        {isListening ? 'Listening...' : 'Mic'}
      </button>
    </main>
  );
}
