import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="app">
      <h1>Builder&apos;s Table</h1>
      <p>Project scaffold is live. Build something great.</p>
      <p>
        <Link to="/demo">View the ingestion demo →</Link>
      </p>
    </main>
  );
}
