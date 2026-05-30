import { createRoot } from "react-dom/client";
import { Component, type ReactNode } from "react";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "serif", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong</h1>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>The page failed to load. Please refresh and try again.</p>
            <button onClick={() => window.location.reload()} style={{ padding: "0.75rem 2rem", border: "1px solid #000", background: "transparent", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.state.error === null ? this.props.children : null;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
