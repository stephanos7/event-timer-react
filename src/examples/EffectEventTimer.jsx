import { useEffect, useEffectEvent, useState } from "react";
import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig.js";

export default function EffectEventTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);
  const [lastFlash, setLastFlash] = useState(null);

  const isRunning = startedAt !== null;

  // teaching:start

  // Reads the latest committed preference when a phase changes.
  // Changing that preference doesn't restart the timer effect.
  const onPhaseChange = useEffectEvent((phase) => {
    console.log(`[effect-event timer] ${phase}; flashEnabled=${flashEnabled}`);

    if (flashEnabled) {
      // Changing the dot's key restarts its CSS animation.
      setLastFlash(performance.now());
      console.log("[effect-event timer] flash requested");
    } else {
      console.log("[effect-event timer] flash skipped");
    }

    // Record the preference read at this particular transition.
    setLastAlert({ phase, flashEnabled });
  });

  useEffect(() => {
    if (startedAt === null) return;

    console.log("[effect-event timer] setup");

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

      if (phaseNumber !== previousPhaseNumber) {
        previousPhaseNumber = phaseNumber;

        const phase = phaseNumber % 2 === 0 ? "Exercise" : "Rest";

        // The timer reports the transition without reading flashEnabled.
        // The Effect Event handles the preference-dependent behavior.
        onPhaseChange(phase);
      }
    }, 100);

    return () => {
      console.log("[effect-event timer] cleanup");
      clearInterval(intervalId);
    };

    // startedAt controls the timer's lifetime.
    // Effect Events are excluded from effect dependencies.
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

    console.log(`[effect-event timer] flash preference changed to ${enabled}`);

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
      <h2>useEffectEvent — current preference</h2>

      <p>
        The next phase alert uses the current flash preference without
        recreating the interval.
      </p>

      <p className="timer-status">
        Status: {isRunning ? "Running" : "Stopped"}
      </p>

      <h3 className="timer-phase">{phase}</h3>

      <p className="timer-countdown">
        {remainingSeconds}
        <span>seconds remaining</span>
      </p>

      {/* Keep the dot visible regardless of the current preference.
          The Effect Event decides whether to trigger its animation. */}
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
          Toggle this while running. The next phase uses the updated preference
          without timer cleanup or setup.
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
