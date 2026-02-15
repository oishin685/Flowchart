export const LogPanel = ({ logs }: { logs: string[] }) => (
  <section className="logs">
    <h3>ログ</h3>
    {logs.length === 0 ? <p>ログはまだありません。</p> : <ul>{logs.map((log, i) => <li key={`${log}-${i}`}>{log}</li>)}</ul>}
  </section>
);
