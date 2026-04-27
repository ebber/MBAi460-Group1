import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { LeftRail } from '@/components/LeftRail';
import { ToastProvider } from '@/components/ToastProvider';
import { LoginScreen } from '@/components/LoginScreen';
import { RegisterScreen } from '@/components/RegisterScreen';
import { LibraryPage } from '@/pages/LibraryPage';
import { UploadPage } from '@/pages/UploadPage';
import { AssetDetailPage } from '@/pages/AssetDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { HelpPage } from '@/pages/HelpPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { getPing } from '@/api/photoappApi';

export type ConnectionState = 'loading' | 'connected' | 'disconnected';

function App() {
  const [connection, setConnection] = useState<ConnectionState>('loading');

  useEffect(() => {
    let cancelled = false;
    getPing()
      .then(() => {
        if (!cancelled) setConnection('connected');
      })
      .catch(() => {
        if (!cancelled) setConnection('disconnected');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink flex flex-col">
        <TopBar />
        <div className="flex flex-1 min-h-0">
          <LeftRail connection={connection} />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/library" replace />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/asset/:id" element={<AssetDetailPage />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
