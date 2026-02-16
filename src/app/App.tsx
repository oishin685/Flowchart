import { useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { NodePalette } from '../components/NodePalette';
import { PropertyPanel } from '../components/PropertyPanel';
import { TopBar } from '../components/TopBar';
import { LogPanel } from '../components/LogPanel';
import { useFlowStore } from '../flow/store';
import { STORAGE_KEY, downloadTextFile, importFromFile, localStorageFlow } from '../storage/flowStorage';
import { validateFlow } from '../flow/validation';
import { simulateFlow } from '../flow/simulation';
import { generateAiPrompt, toFlowMarkdown, toStableJson } from '../flow/export';
import type { FlowEdge, FlowNode } from '../types/flow';

const AppInner = () => {
  const [variablesText, setVariablesText] = useState('{"amount": 1200}');
  const [aiRequestText, setAiRequestText] = useState('条件を追加し、到達不能ノードがない構成にしたい');
  const {
    nodes,
    edges,
    meta,
    variablesSchema,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelection,
    setLogs,
    toDocument,
    setFlow,
    removeSelected,
    undo,
    redo,
    newFlow,
    logs,
  } = useFlowStore();

  const variablesSchemaText = useMemo(() => variablesSchema.join(','), [variablesSchema]);
  const runtimeInfo = useMemo(
    () => `実行中URL: ${window.location.origin} / 保存先: localStorage（キー: ${STORAGE_KEY}）`,
    [],
  );

  const onSelectionChange = (sel: OnSelectionChangeParams<FlowNode, FlowEdge>) => {
    setSelection(sel.nodes[0]?.id, sel.edges[0]?.id);
  };

  const handleSave = () => {
    const doc = toDocument();
    localStorageFlow.save(doc);
    setLogs(['localStorageに保存しました。']);
  };

  const handleLoad = () => {
    const doc = localStorageFlow.load();
    if (!doc) return setLogs(['保存データがありません。']);
    setFlow(doc);
  };

  const handleValidate = () => {
    const result = validateFlow(toDocument());
    const viewLogs = [
      ...result.errors.map((e) => `❌ ${e}`),
      ...result.warnings.map((w) => `⚠️ ${w}`),
    ];
    setLogs(viewLogs.length ? viewLogs : ['✅ バリデーションOK']);
  };

  const handleSimulate = () => {
    try {
      const variables = JSON.parse(variablesText) as Record<string, unknown>;
      const result = simulateFlow(toDocument(), variables);
      setLogs([...result.logs, result.completed ? `✅ ${result.reason}` : `⚠️ ${result.reason}`]);
    } catch {
      setLogs(['❌ 入力JSONのパースに失敗しました。']);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const doc = await importFromFile(file);
      setFlow(doc);
    } catch (error) {
      setLogs([`❌ インポート失敗: ${(error as Error).message}`]);
    }
  };

  const copyToClipboard = async (label: string, content: string, warnLarge = false) => {
    if (warnLarge && content.length > 100_000) {
      const shouldContinue = window.confirm('JSONが大きい可能性があります。コピーを続行しますか？');
      if (!shouldContinue) {
        setLogs(['⚠️ コピーをキャンセルしました。']);
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(content);
      setLogs([`✅ ${label}をクリップボードにコピーしました。`]);
    } catch {
      setLogs([`❌ ${label}のコピーに失敗しました。`]);
    }
  };

  const handleDownloadJson = () => {
    const doc = toDocument();
    const text = toStableJson(doc);
    downloadTextFile(`${doc.meta.name || 'flow'}-${Date.now()}.json`, text, 'application/json');
    setLogs(['✅ flow.jsonをダウンロードしました。']);
  };

  const handleDownloadMarkdown = () => {
    const doc = toDocument();
    const text = toFlowMarkdown(doc);
    downloadTextFile(`${doc.meta.name || 'flow'}-${Date.now()}.md`, text, 'text/markdown');
    setLogs(['✅ flow.mdをダウンロードしました。']);
  };

  const handleGenerateAiPrompt = async () => {
    const text = generateAiPrompt(toDocument(), aiRequestText);
    await copyToClipboard('AIプロンプト', text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Delete') removeSelected();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="app" tabIndex={0} onKeyDown={handleKeyDown}>
      <TopBar
        flowName={meta.name}
        setFlowName={(name) => setFlow({ ...toDocument(), meta: { ...meta, name } })}
        variablesSchema={variablesSchemaText}
        setVariablesSchema={(txt) => setFlow({ ...toDocument(), variablesSchema: txt.split(',').map((v) => v.trim()).filter(Boolean) })}
        variablesText={variablesText}
        setVariablesText={setVariablesText}
        aiRequestText={aiRequestText}
        setAiRequestText={setAiRequestText}
        runtimeInfo={runtimeInfo}
        onNew={newFlow}
        onSave={handleSave}
        onLoad={handleLoad}
        onImport={handleImport}
        onValidate={handleValidate}
        onSimulate={handleSimulate}
        onUndo={undo}
        onRedo={redo}
        onDownloadJson={handleDownloadJson}
        onDownloadMarkdown={handleDownloadMarkdown}
        onCopyMarkdown={() => copyToClipboard('Markdown', toFlowMarkdown(toDocument()))}
        onCopyJson={() => copyToClipboard('JSON', toStableJson(toDocument()), true)}
        onGenerateAiPrompt={handleGenerateAiPrompt}
      />
      <main className="layout">
        <NodePalette onAdd={addNode} />
        <section className="canvas">
          <ReactFlow<FlowNode, FlowEdge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </section>
        <PropertyPanel />
      </main>
      <LogPanel logs={logs} />
    </div>
  );
};

export const App = () => (
  <ReactFlowProvider>
    <AppInner />
  </ReactFlowProvider>
);
