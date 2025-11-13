import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="main-container">
      <header className="header">
        <h1>TD Chatbot</h1>
        <p>Powered by Treasure Data Agent API</p>
      </header>
      <ChatInterface />
    </main>
  );
}
