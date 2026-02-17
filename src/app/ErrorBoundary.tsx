import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : '不明なエラー' };
  }

  componentDidCatch(error: unknown): void {
    console.error('UI ErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" role="alert">
          <h1>画面の表示でエラーが発生しました</h1>
          <p>白画面の代わりに原因を表示しています。以下をコピーして共有してください。</p>
          <pre>{this.state.message}</pre>
          <p>対処手順: ① ブラウザ再読み込み ② npm run dev を再起動 ③ git pull</p>
        </main>
      );
    }

    return this.props.children;
  }
}
