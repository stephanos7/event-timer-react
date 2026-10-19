import { useEffect, useState } from "react";

import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig";

export default function StaleTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);

  const isRunning = startedAt !== null;

  useEffect(() => {
    // Don't create a timer while the workout is stopped.
    if (startedAt === null) return;

    console.log("[stale timer] setup");

    // This belongs to this interval and prevents repeated alerts
    // during the same phase. It isn't used to render the UI.
    let previousPhaseNumber = 0;

    const intervalId = setInterval(() => {
      // Measure elapsed time rather than assuming ticks are punctual.
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);

      const completedCycles = Math.floor(elapsed / CYCLE_SECONDS);
      const secondsIntoCycle = elapsed % CYCLE_SECONDS;
      const isResting = secondsIntoCycle >= EXERCISE_SECONDS;

      // Exercise 0, rest 1, exercise 2, rest 3, etc.
      const phaseNumber = completedCycles * 2 + (isResting ? 1 : 0);

      if (phaseNumber !== previousPhaseNumber) {
        previousPhaseNumber = phaseNumber;

        const phase = isResting ? "Rest" : "Exercise";

        // INTENTIONAL BUG:
        // This callback captured soundEnabled when the timer started.
        // Later renders don't replace the registered callback.
        console.log(`[stale timer] ${phase}; soundEnabled=${soundEnabled}`);

        console.log(
          soundEnabled
            ? "[stale timer] BEEP (simulated)"
            : "[stale timer] sound skipped"
        );

        // Display the value the callback actually used.
        setLastAlert({ phase, soundEnabled });
      }
    }, 100);

    // Runs when stopped, or when navigation unmounts this component.
    return () => {
      console.log("[stale timer] cleanup");
      clearInterval(intervalId);
    };

    // INTENTIONAL missing dependency for this educational example.
    // Omitting soundEnabled keeps the timer running but its value stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  function handleStart() {
    setElapsedSeconds(0);
    setLastAlert(null);
    setStartedAt(performance.now());
  }

  function handleStop() {
    // Triggers cleanup. The displayed elapsed time stays frozen.
    setStartedAt(null);
  }

  // These are calculated from elapsed time, not stored separately.
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
        The timer reads the sound preference captured when Start was pressed.
        Sound is simulated in the console.
      </p>

      <p>Status: {isRunning ? "Running" : "Stopped"}</p>
      <h3>{phase}</h3>
      <p>{remainingSeconds} seconds remaining</p>

      <label>
        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(event) => setSoundEnabled(event.target.checked)}
        />
        Sound alerts
      </label>

      <p>Current sound preference: {soundEnabled ? "On" : "Off"}</p>

      <button onClick={handleStart} disabled={isRunning}>
        Start
      </button>
      <button onClick={handleStop} disabled={!isRunning}>
        Stop
      </button>

      <h3>Last phase alert</h3>
      <p>
        {lastAlert
          ? `${lastAlert.phase}: callback read sound as ${
              lastAlert.soundEnabled ? "On" : "Off"
            }.`
          : "No phase transition yet."}
      </p>
    </section>
  );
}
