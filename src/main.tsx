import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/styles.css';
import '@xyflow/react/dist/style.css';


const renderBootstrapError = (error: unknown): void => {
  const root = document.getElementById('root');
  if (!root) return;

  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  const container = document.createElement('main');
  container.style.margin = '20px';
  container.style.padding = '16px';
  container.style.border = '1px solid #fecaca';
  container.style.borderRadius = '8px';
  container.style.background = '#fff1f2';
  container.style.color = '#7f1d1d';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';

  const title = document.createElement('h1');
  title.style.marginTop = '0';
  title.textContent = '画面の初期化でエラーが発生しました';

  const description = document.createElement('p');
  description.textContent = 'アプリの読み込み途中で失敗しました。下記メッセージを共有してください。';

  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.background = '#fff';
  pre.style.border = '1px solid #fca5a5';
  pre.style.borderRadius = '6px';
  pre.style.padding = '10px';
  pre.textContent = message;

  container.append(title, description, pre);
  root.replaceChildren(container);
};

const bootstrap = async (): Promise<void> => {
  try {
    const [{ App }, { ErrorBoundary }] = await Promise.all([
      import('./app/App'),
      import('./app/ErrorBoundary'),
    ]);

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('App bootstrap failed:', error);
    renderBootstrapError(error);
  }
};

void bootstrap();
