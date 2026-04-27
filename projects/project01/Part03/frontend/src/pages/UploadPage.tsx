import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadScreen } from '@/components/UploadScreen';
import { getUsers, uploadImage } from '@/api/photoappApi';
import type { User } from '@/api/types';

export function UploadPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then((rows) => {
        if (!cancelled) setUsers(rows);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'failed to load users');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8" data-testid="upload-loading">
        <div className="animate-shim bg-paper-3 h-6 w-48 rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8" data-testid="upload-error">
        <p className="text-error">Failed to load users: {error}</p>
      </div>
    );
  }

  return (
    <UploadScreen
      users={users}
      onUpload={async (userid, file) => {
        const result = await uploadImage(userid, file);
        // Navigate back to library after a successful upload so the user
        // sees the new asset land in the grid.
        navigate('/library');
        return result;
      }}
    />
  );
}

export default UploadPage;
