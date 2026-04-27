import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-serif mb-4">404 — Not Found</h1>
      <p className="text-ink-2 text-sm mb-4">
        That page doesn't exist. The MBAi 460 PhotoApp has these pages:
      </p>
      <ul className="list-disc pl-5 text-ink-2 text-sm flex flex-col gap-1 mb-6">
        <li><Link to="/library" className="text-accent underline">Library</Link></li>
        <li><Link to="/upload" className="text-accent underline">Upload</Link></li>
        <li><Link to="/profile" className="text-accent underline">Profile</Link></li>
        <li><Link to="/help" className="text-accent underline">Help</Link></li>
      </ul>
    </div>
  );
}

export default NotFoundPage;
