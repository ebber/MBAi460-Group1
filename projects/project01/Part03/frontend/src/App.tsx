import { Routes, Route, Navigate } from 'react-router-dom';

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="p-8">
      <h1 className="text-xl font-serif">{name}</h1>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="px-6 py-4 border-b border-line">
        <h1 className="text-lg font-serif">MBAi 460 — PhotoApp</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/library" element={<PlaceholderPage name="Library" />} />
          <Route path="/upload" element={<PlaceholderPage name="Upload" />} />
          <Route path="/asset/:id" element={<PlaceholderPage name="Asset Detail" />} />
          <Route path="/login" element={<PlaceholderPage name="Login" />} />
          <Route path="/register" element={<PlaceholderPage name="Register" />} />
          <Route path="/profile" element={<PlaceholderPage name="Profile" />} />
          <Route path="/help" element={<PlaceholderPage name="Help" />} />
          <Route path="*" element={<PlaceholderPage name="404 — Not Found" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
