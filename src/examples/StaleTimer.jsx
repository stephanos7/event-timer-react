import { useEffect, useState } from "react";
import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig.js";

export default function StaleTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);
  const [lastFlash, setLastFlash] = useState(null);

  const isRunning = startedAt !== null;

  // teaching:start
  useEffect(() => {
    if (startedAt === null) return;

    console.log("[stale timer] setup");

    // Number each phase: exercise 0, rest 1, exercise 2, etc.
    function getPhaseNumber(elapsed) {
      const completedCycles = Math.floor(elapsed / CYCLE_SECONDS);
      const secondsIntoCycle = elapsed % CYCLE_SECONDS;
      const isResting = secondsIntoCycle >= EXERCISE_SECONDS;

      return completedCycles * 2 + (isResting ? 1 : 0);
    }

    // Begin tracking from the current phase so setup doesn't
    // announce an already-running phase as a new transition.
    const elapsedAtSetup = Math.floor((performance.now() - startedAt) / 1000);

    let previousPhaseNumber = getPhaseNumber(elapsedAtSetup);

    const intervalId = setInterval(() => {
      // Measure elapsed time instead of counting interval callbacks.
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);

      const phaseNumber = getPhaseNumber(elapsed);

      // Announce a transition once, rather than on every tick.
      if (phaseNumber !== previousPhaseNumber) {
        previousPhaseNumber = phaseNumber;

        const phase = phaseNumber % 2 === 0 ? "Exercise" : "Rest";

        // INTENTIONAL BUG:
        // This callback retains the preference from when the
        // interval was created, even after the checkbox changes.
        console.log(`[stale timer] ${phase}; flashEnabled=${flashEnabled}`);

        if (flashEnabled) {
          // Changing the dot's key restarts its CSS animation.
          setLastFlash(performance.now());
          console.log("[stale timer] flash requested");
        } else {
          console.log("[stale timer] flash skipped");
        }

        // Record the preference the callback actually read.
        setLastAlert({ phase, flashEnabled });
      }
    }, 100);

    return () => {
      console.log("[stale timer] cleanup");
      clearInterval(intervalId);
    };

    // INTENTIONAL missing dependency for this teaching example.
    // Ordinary application code should not suppress this warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);
  // teaching:end

  function handleStart() {
    // Every Start begins a fresh workout and clears previous results.
    setElapsedSeconds(0);
    setLastAlert(null);
    setLastFlash(null);
    setStartedAt(performance.now());
  }

  function handleStop() {
    // Changing startedAt triggers interval cleanup.
    setStartedAt(null);
  }

  function handleFlashChange(event) {
    const enabled = event.target.checked;

    console.log(`[stale timer] flash preference changed to ${enabled}`);

    setFlashEnabled(enabled);
  }

  // Derive the displayed phase and countdown from elapsed time.
  const secondsIntoCycle = elapsedSeconds % CYCLE_SECONDS;
  const isExercising = secondsIntoCycle < EXERCISE_SECONDS;
  const phase = isExercising ? "Exercise" : "Rest";

  const remainingSeconds = isExercising
    ? EXERCISE_SECONDS - secondsIntoCycle
    : CYCLE_SECONDS - secondsIntoCycle;

  return (
    <section>
      <h2>Ordinary callback — intentionally stale</h2>

      <p>
        The next phase alert uses the flash preference from when you started.
        Changing the preference does not restart the interval, so its callback
        keeps reading the old value.
      </p>

      <p className="timer-status">
        Status: {isRunning ? "Running" : "Stopped"}
      </p>

      <h3 className="timer-phase">{phase}</h3>

      <p className="timer-countdown">
        {remainingSeconds}
        <span>seconds remaining</span>
      </p>

      {/* Keep the dot mounted regardless of the current preference.
          The callback's captured value determines whether it flashes. */}
      <p>
        <span
          key={lastFlash}
          className={
            lastFlash === null ? "phase-dot" : "phase-dot phase-dot--flash"
          }
          aria-hidden="true"
        />{" "}
        Phase indicator
      </p>

      <div className="timer-actions">
        <button
          className="primary-button"
          onClick={handleStart}
          disabled={isRunning}
        >
          Start workout
        </button>

        <button onClick={handleStop} disabled={!isRunning}>
          Stop
        </button>
      </div>

      <div className="sound-controls">
        <label>
          <input
            type="checkbox"
            checked={flashEnabled}
            onChange={handleFlashChange}
          />
          Flash on phase change
        </label>

        <p className="muted-text">
          Start with flashing enabled, then disable it before the next phase.
          The dot will still flash because the callback reads the original
          preference.
        </p>

        <p>
          Current flash preference:{" "}
          <strong>{flashEnabled ? "On" : "Off"}</strong>
        </p>
      </div>

      <div className="observation">
        <h3>Last phase alert</h3>

        {/* Announce phase results, not every countdown update. */}
        <p role="status">
          {lastAlert ? (
            <>
              {lastAlert.phase}: callback read flashing as{" "}
              <strong>{lastAlert.flashEnabled ? "On" : "Off"}</strong>.
            </>
          ) : (
            "Start the timer and wait for a phase change."
          )}
        </p>
      </div>
    </section>
  );
}
