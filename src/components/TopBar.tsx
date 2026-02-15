interface Props {
  onSave: () => void;
  onLoad: () => void;
  onNew: () => void;
  onValidate: () => void;
  onSimulate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownloadJson: () => void;
  onDownloadMarkdown: () => void;
  onCopyMarkdown: () => void;
  onCopyJson: () => void;
  onGenerateAiPrompt: () => void;
  onImport: (file: File) => void;
  setVariablesText: (s: string) => void;
  variablesText: string;
  flowName: string;
  setFlowName: (name: string) => void;
  setVariablesSchema: (s: string) => void;
  variablesSchema: string;
  aiRequestText: string;
  setAiRequestText: (s: string) => void;
}

export const TopBar = (props: Props) => (
  <header className="topbar">
    <strong>汎用フローチャートビルダー</strong>
    <input value={props.flowName} onChange={(e) => props.setFlowName(e.target.value)} placeholder="フロー名" />
    <button onClick={props.onNew}>新規</button>
    <button onClick={props.onSave}>保存</button>
    <button onClick={props.onLoad}>読込</button>
    <label className="file-input">インポート<input type="file" accept="application/json" onChange={(e) => e.target.files?.[0] && props.onImport(e.target.files[0])} /></label>

    <details className="export-menu">
      <summary>Export</summary>
      <div className="export-items">
        <button onClick={props.onDownloadJson}>Download JSON</button>
        <button onClick={props.onDownloadMarkdown}>Download Markdown</button>
        <button onClick={props.onCopyMarkdown}>Copy Markdown</button>
        <button onClick={props.onCopyJson}>Copy JSON</button>
        <button onClick={props.onGenerateAiPrompt}>Generate AI Prompt</button>
      </div>
    </details>

    <button onClick={props.onValidate}>検証</button>
    <button onClick={props.onSimulate}>シミュレーション</button>
    <button onClick={props.onUndo}>Undo</button>
    <button onClick={props.onRedo}>Redo</button>
    <input value={props.variablesSchema} onChange={(e) => props.setVariablesSchema(e.target.value)} placeholder="variablesSchema (a,b,c)" />
    <textarea value={props.variablesText} onChange={(e) => props.setVariablesText(e.target.value)} placeholder='入力JSON 例: {"amount": 1200}' />
    <textarea value={props.aiRequestText} onChange={(e) => props.setAiRequestText(e.target.value)} placeholder='変更したい点（1〜3行）' />
  </header>
);
