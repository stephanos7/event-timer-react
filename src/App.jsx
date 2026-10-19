import { NavLink, Navigate, Route, Routes } from "react-router";

import StaleTimer from "./examples/StaleTimer.jsx";
import EffectEventTimer from "./examples/EffectEventTimer.jsx";

// Vite's ?raw imports the actual source file as a string.
// This keeps the displayed code consistent with the running example.
import staleSource from "./examples/StaleTimer.jsx?raw";
import effectEventSource from "./examples/EffectEventTimer.jsx?raw";

export default function App() {
  return (
    <main>
      <h1>Reading current state from a timer</h1>

      <nav aria-label="Examples">
        <ul>
          <li>
            <NavLink to="/ordinary-callback">
              Ordinary callback — intentionally stale
            </NavLink>
          </li>
          <li>
            <NavLink to="/effect-event">
              useEffectEvent — current preference
            </NavLink>
          </li>
        </ul>
      </nav>

      <p>
        Switching examples stops the current timer. Returning to an example
        starts it with fresh state.
      </p>

      <h2>Try this</h2>
      <ol>
        <li>Start with sound enabled.</li>
        <li>Disable sound before the phase changes.</li>
        <li>Compare the current preference with the last phase alert.</li>
        <li>Inspect timer setup and cleanup in the console.</li>
      </ol>

      <hr />

      {/* The URL determines which example and source code appear.
          There is no separate selected-example state. */}
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/ordinary-callback" replace />}
        />

        <Route
          path="/ordinary-callback"
          element={
            <>
              <StaleTimer />

              <h2>Implementation source</h2>
              <pre>
                <code>{staleSource}</code>
              </pre>
            </>
          }
        />

        <Route
          path="/effect-event"
          element={
            <>
              <EffectEventTimer />

              <h2>Implementation source</h2>
              <pre>
                <code>{effectEventSource}</code>
              </pre>
            </>
          }
        />

        <Route path="*" element={<p>Example not found. Choose one above.</p>} />
      </Routes>
    </main>
  );
}
