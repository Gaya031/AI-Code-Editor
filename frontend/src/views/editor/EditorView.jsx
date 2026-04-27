import Editor from '@monaco-editor/react';

const emptyState = `// Create a project, upload files, and open one from the tree.
`;

export function EditorView({
  busy,
  editorLanguage,
  editorValue,
  isDirty,
  onChange,
  onSave,
  selectedFile
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <div>
          <p className="text-sm font-medium text-ink">Editor</p>
          <p className="text-xs text-muted">{selectedFile ? selectedFile.path : 'Open a file from the explorer'}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-line px-2 py-1 text-xs text-muted">{editorLanguage}</span>
          <button
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!selectedFile || !isDirty || busy.savingFile}
            onClick={onSave}
            type="button"
          >
            {busy.savingFile ? 'Saving' : isDirty ? 'Save file' : 'Saved'}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={editorLanguage}
          value={selectedFile ? editorValue : emptyState}
          onChange={(value) => onChange(value ?? '')}
          theme="vs-light"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            readOnly: !selectedFile
          }}
        />
      </div>
    </section>
  );
}
