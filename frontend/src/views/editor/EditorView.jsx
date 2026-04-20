import Editor from '@monaco-editor/react';

const starterCode = `// Start with a file or paste code here.
// The next slice will connect repo indexing and intent analysis.

export function analyzeIntent(goal, context) {
  if (!goal || goal.trim().length < 8) {
    return {
      status: 'needs_clarification',
      question: 'What engineering outcome should improve first?'
    };
  }

  return {
    status: 'ready_for_analysis',
    goal,
    filesConsidered: context.files.length
  };
}
`;

export function EditorView() {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <div>
          <p className="text-sm font-medium text-ink">Editor</p>
          <p className="text-xs text-muted">Local workspace surface</p>
        </div>
        <span className="rounded-md border border-line px-2 py-1 text-xs text-muted">JavaScript</span>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue={starterCode}
          theme="vs-light"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2
          }}
        />
      </div>
    </section>
  );
}

