import { useEffect, useState } from "react";
import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig.js";

export default function WithDependencyTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);

  const isRunning = startedAt !== null;

  // teaching:start
  useEffect(() => {
    if (startedAt === null) return;

    console.log("[dependency timer] setup");

    // Number each phase: exercise 0, rest 1, exercise 2, etc.
    function getPhaseNumber(elapsed) {
      const completedCycles = Math.floor(elapsed / CYCLE_SECONDS);
      const secondsIntoCycle = elapsed % CYCLE_SECONDS;
      const isResting = secondsIntoCycle >= EXERCISE_SECONDS;

      return completedCycles * 2 + (isResting ? 1 : 0);
    }

    // A sound change recreates this interval. Initialize tracking
    // from the current phase instead of resetting it to phase zero.
    const elapsedAtSetup = Math.floor((performance.now() - startedAt) / 1000);

    let previousPhaseNumber = getPhaseNumber(elapsedAtSetup);

    const intervalId = setInterval(() => {
      // startedAt stays the same when sound changes, so elapsed
      // workout time is preserved even though the interval restarts.
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);

      const phaseNumber = getPhaseNumber(elapsed);

      if (phaseNumber !== previousPhaseNumber) {
        previousPhaseNumber = phaseNumber;

        const phase = phaseNumber % 2 === 0 ? "Exercise" : "Rest";

        // The replacement interval captures the updated preference.
        console.log(
          `[dependency timer] ${phase}; soundEnabled=${soundEnabled}`
        );

        console.log(
          soundEnabled
            ? "[dependency timer] BEEP (simulated)"
            : "[dependency timer] sound skipped"
        );

        setLastAlert({ phase, soundEnabled });
      }
    }, 100);

    return () => {
      console.log("[dependency timer] cleanup");
      clearInterval(intervalId);
    };

    // Both values are dependencies because this effect reads them.
    // Toggling sound cleans up the old interval and creates a new one.
  }, [startedAt, soundEnabled]);
  // teaching:end

  function handleStart() {
    setElapsedSeconds(0);
    setLastAlert(null);
    setStartedAt(performance.now());
  }

  function handleStop() {
    setStartedAt(null);
  }

  function handleSoundChange(event) {
    const enabled = event.target.checked;

    console.log(`[dependency timer] sound preference changed to ${enabled}`);
    setSoundEnabled(enabled);
  }

  const secondsIntoCycle = elapsedSeconds % CYCLE_SECONDS;
  const isExercising = secondsIntoCycle < EXERCISE_SECONDS;
  const phase = isExercising ? "Exercise" : "Rest";

  const remainingSeconds = isExercising
    ? EXERCISE_SECONDS - secondsIntoCycle
    : CYCLE_SECONDS - secondsIntoCycle;

  return (
    <section>
      <h2>Ordinary callback — complete dependencies</h2>

      <p>
        Changing sound recreates the interval. The next phase alert uses the
        current setting, and elapsed workout time is preserved.
      </p>

      <p className="timer-status">
        Status: {isRunning ? "Running" : "Stopped"}
      </p>

      <h3 className="timer-phase">{phase}</h3>

      <p className="timer-countdown">
        {remainingSeconds}
        <span>seconds remaining</span>
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
            checked={soundEnabled}
            onChange={handleSoundChange}
          />
          Sound alerts
        </label>

        <p className="muted-text">Sound is simulated in the console.</p>

        <p>
          Current preference: <strong>{soundEnabled ? "On" : "Off"}</strong>
        </p>
      </div>

      <div className="observation">
        <h3>Last phase alert</h3>

        {/* Announce phase results, not every countdown update. */}
        <p role="status">
          {lastAlert ? (
            <>
              {lastAlert.phase}: callback read sound as{" "}
              <strong>{lastAlert.soundEnabled ? "On" : "Off"}</strong>.
            </>
          ) : (
            "Start the timer and wait for a phase change."
          )}
        </p>
      </div>
    </section>
  );
}
