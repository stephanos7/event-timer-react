import { useEffect, useState } from "react";
import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig.js";

export default function StaleTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);

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
        // This callback reads the sound preference captured when
        // the interval was created, even after the checkbox changes.
        console.log(`[stale timer] ${phase}; soundEnabled=${soundEnabled}`);

        console.log(
          soundEnabled
            ? "[stale timer] BEEP (simulated)"
            : "[stale timer] sound skipped"
        );

        setLastAlert({ phase, soundEnabled });
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
    // Start begins a fresh workout.
    setElapsedSeconds(0);
    setLastAlert(null);
    setStartedAt(performance.now());
  }

  function handleStop() {
    // Changing startedAt triggers interval cleanup.
    setStartedAt(null);
  }

  function handleSoundChange(event) {
    const enabled = event.target.checked;

    console.log(`[stale timer] sound preference changed to ${enabled}`);
    setSoundEnabled(enabled);
  }

  // Derive the display from elapsed time instead of duplicating state.
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
        The next phase alert uses the sound setting from when you started.
        Changing sound does not restart the interval.
      </p>

      <p>Status: {isRunning ? "Running" : "Stopped"}</p>
      <h3>{phase}</h3>
      <p>{remainingSeconds} seconds remaining</p>

      <button onClick={handleStart} disabled={isRunning}>
        Start workout
      </button>
      <button onClick={handleStop} disabled={!isRunning}>
        Stop
      </button>

      <p>
        <label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={handleSoundChange}
          />
          Sound alerts
        </label>
      </p>

      <p>Sound is simulated in the console.</p>
      <p>Current sound preference: {soundEnabled ? "On" : "Off"}</p>

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
