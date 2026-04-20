import { EditorView } from '../editor/EditorView.jsx';
import { Sidebar } from './Sidebar.jsx';

export function EditorLayout() {
  return (
    <main className="flex h-screen overflow-hidden bg-white text-ink">
      <Sidebar />
      <EditorView />
    </main>
  );
}

