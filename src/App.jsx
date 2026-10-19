import { NavLink, Navigate, Route, Routes } from "react-router";

import StaleTimer from "./examples/StaleTimer.jsx";
import WithDependencyTimer from "./examples/WithDependencyTimer.jsx";
import EffectEventTimer from "./examples/EffectEventTimer.jsx";
import CodeViewer from "./components/CodeViewer.jsx";

import staleSource from "./examples/StaleTimer.jsx?raw";
import withDependencySource from "./examples/WithDependencyTimer.jsx?raw";
import effectEventSource from "./examples/EffectEventTimer.jsx?raw";

import "./App.css";

// Presentation only: this component doesn't manage the experiment.
function ExamplePage({ children, source, filename }) {
  return (
    <div className="experiment-layout">
      <div className="experiment-panel">{children}</div>
      <CodeViewer source={source} filename={filename} />
    </div>
  );
}

export default function App() {
  return (
    <main className="tutorial">
      <header className="page-header">
        <p className="eyebrow">React effects lab</p>
        <h1>Same timer. Different callbacks.</h1>
        <p>Compare how a running timer reads a changing sound preference.</p>
      </header>

      <nav className="example-nav" aria-label="Examples">
        <NavLink to="/ordinary-callback">1. Stale callback</NavLink>
        <NavLink to="/complete-dependencies">2. Complete dependencies</NavLink>
        <NavLink to="/effect-event">3. Effect Event</NavLink>
      </nav>

      <aside className="instructions" aria-labelledby="experiment-steps">
        <h2 id="experiment-steps">Run the experiment</h2>
        <ol>
          <li>Start with sound enabled.</li>
          <li>Disable sound before the phase changes.</li>
          <li>Check the last alert and the console’s setup/cleanup logs.</li>
        </ol>
        <p>Switching examples stops the timer and resets the example.</p>
      </aside>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/ordinary-callback" replace />}
        />

        <Route
          path="/ordinary-callback"
          element={
            <ExamplePage
              key="stale"
              source={staleSource}
              filename="StaleTimer.jsx"
            >
              <StaleTimer />
            </ExamplePage>
          }
        />

        <Route
          path="/complete-dependencies"
          element={
            <ExamplePage
              key="dependencies"
              source={withDependencySource}
              filename="WithDependencyTimer.jsx"
            >
              <WithDependencyTimer />
            </ExamplePage>
          }
        />

        <Route
          path="/effect-event"
          element={
            <ExamplePage
              key="effect-event"
              source={effectEventSource}
              filename="EffectEventTimer.jsx"
            >
              <EffectEventTimer />
            </ExamplePage>
          }
        />

        <Route path="*" element={<p>Choose an example above.</p>} />
      </Routes>
    </main>
  );
}
