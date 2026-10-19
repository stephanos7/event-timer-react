import { useEffect, useEffectEvent, useState } from "react";

import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig";

export default function EffectEventTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);

  const isRunning = startedAt !== null;

  // Called by the timer when a phase changes.
  // Reads the latest committed soundEnabled value without requiring
  // the timer effect to restart when that preference changes.
  const onPhaseChange = useEffectEvent((phase) => {
    console.log(`[effect-event timer] ${phase}; soundEnabled=${soundEnabled}`);

    console.log(
      soundEnabled
        ? "[effect-event timer] BEEP (simulated)"
        : "[effect-event timer] sound skipped"
    );

    // Record what was read at this event, rather than what the
    // checkbox might change to afterward.
    setLastAlert({ phase, soundEnabled });
  });

  useEffect(() => {
    if (startedAt === null) return;

    console.log("[effect-event timer] setup");

    let previousPhaseNumber = 0;

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);

      const completedCycles = Math.floor(elapsed / CYCLE_SECONDS);
      const secondsIntoCycle = elapsed % CYCLE_SECONDS;
      const isResting = secondsIntoCycle >= EXERCISE_SECONDS;

      const phaseNumber = completedCycles * 2 + (isResting ? 1 : 0);

      if (phaseNumber !== previousPhaseNumber) {
        previousPhaseNumber = phaseNumber;

        const phase = isResting ? "Rest" : "Exercise";

        // The timer reports the event. It doesn't read soundEnabled.
        onPhaseChange(phase);
      }
    }, 100);

    return () => {
      console.log("[effect-event timer] cleanup");
      clearInterval(intervalId);
    };

    // startedAt controls the timer's lifetime.
    // Effect Events are intentionally excluded from dependencies.
  }, [startedAt]);

  function handleStart() {
    setElapsedSeconds(0);
    setLastAlert(null);
    setStartedAt(performance.now());
  }

  function handleStop() {
    setStartedAt(null);
  }

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
        Phase alerts read the latest sound preference without restarting the
        timer. Sound is simulated in the console.
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
