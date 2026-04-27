import { useEffect, useState } from 'react';
import { getUsers } from '@/api/photoappApi';
import { useUIStore } from '@/stores/ui';
import type { User } from '@/api/types';

export function ProfilePage() {
  const mockAuth = useUIStore((s) => s.mockAuth);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then((rows) => {
        if (!cancelled) setUsers(rows);
      })
      .catch(() => {
        // Non-blocking; profile shows an empty user list on failure.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-serif mb-4">Profile</h1>

      {mockAuth.isMockAuthed ? (
        <div className="bg-paper-2 border border-line rounded-md p-4 mb-6" data-testid="mock-auth-card">
          <p className="text-sm text-ink-2">Signed in as</p>
          <p className="font-serif text-lg">
            {mockAuth.givenname} {mockAuth.familyname}
          </p>
          <p className="text-xs text-ink-3 mt-1">
            (Mock auth — Q10 non-blocking visual scaffold; not a real session.)
          </p>
        </div>
      ) : (
        <div className="bg-paper-2 border border-line rounded-md p-4 mb-6 text-ink-2 text-sm" data-testid="anonymous-card">
          Not signed in. Visit <a className="text-accent underline" href="/login">login</a> to set a mock identity for the demo.
        </div>
      )}

      <h2 className="text-lg font-serif mb-2">Users in this PhotoApp</h2>
      {loading ? (
        <div className="animate-shim bg-paper-3 h-16 w-full rounded-md" />
      ) : users.length === 0 ? (
        <p className="text-ink-3 text-sm">No users found.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.userid} className="bg-paper-2 border border-line rounded-md p-3 flex justify-between">
              <div>
                <div className="font-medium">{u.givenname} {u.familyname}</div>
                <div className="text-xs text-ink-3">@{u.username} · userid {u.userid}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProfilePage;
