import { EditorView } from '../editor/EditorView.jsx';
import { Sidebar } from './Sidebar.jsx';

export function EditorLayout(props) {
  return (
    <main className="flex h-screen overflow-hidden bg-white text-ink">
      <Sidebar
        backendStatus={props.backendStatus}
        busy={props.busy}
        onCreateProject={props.onCreateProject}
        onProjectChange={props.onProjectChange}
        onSelectFile={props.onSelectFile}
        onUploadFiles={props.onUploadFiles}
        projects={props.projects}
        selectedFile={props.selectedFile}
        selectedProject={props.selectedProject}
        tree={props.tree}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <EditorView
          busy={props.busy}
          editorLanguage={props.editorLanguage}
          editorValue={props.editorValue}
          isDirty={props.isDirty}
          onChange={props.onEditorChange}
          onSave={props.onSaveFile}
          selectedFile={props.selectedFile}
        />
        <footer className="flex h-10 items-center justify-between border-t border-line px-4 text-xs text-muted">
          <span>{props.message}</span>
          <span>{props.isDirty ? 'Unsaved changes' : 'Ready'}</span>
        </footer>
      </div>
    </main>
  );
}
