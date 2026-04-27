export function HelpPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-serif mb-4">Help</h1>
      <section className="mb-6">
        <h2 className="text-lg font-serif mb-2">Quick start</h2>
        <ul className="list-disc pl-5 text-ink-2 text-sm flex flex-col gap-1">
          <li>Library — view photos and documents.</li>
          <li>Upload — drag-and-drop any file (50 MB max). Photos get Rekognition labels; documents are stored as-is (OCR coming soon).</li>
          <li>Search — type in the Library page header to filter by label.</li>
          <li>Asset Detail — click any card to see the preview and labels.</li>
          <li>Delete all — one-click reset (with confirmation) on the Library page.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-lg font-serif mb-2">Keyboard</h2>
        <p className="text-ink-2 text-sm">
          Esc closes modals. Tab and Shift+Tab navigate focusable controls. Enter or Space activates buttons and links.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-serif mb-2">Notes</h2>
        <p className="text-ink-2 text-sm">
          Login and Register screens are visual scaffolds for demo purposes (Q10 — non-blocking). Real auth lands in the Future-State Auth workstream. OCR for documents and the keyboard launcher (⌘K command palette) are also Future-State.
        </p>
      </section>
    </div>
  );
}

export default HelpPage;
