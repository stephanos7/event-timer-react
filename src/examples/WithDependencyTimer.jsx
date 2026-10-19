import { useEffect, useState } from "react";

import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig";

export default function WithDependencyTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);

  const isRunning = startedAt !== null;

useEffect(() => {
  if (startedAt === null) return;

  console.log("[dependency timer] setup");

  // Determine the current workout phase from elapsed time.
  function getPhaseNumber(elapsed) {
    const completedCycles = Math.floor(elapsed / CYCLE_SECONDS);
    const secondsIntoCycle = elapsed % CYCLE_SECONDS;
    const isResting = secondsIntoCycle >= EXERCISE_SECONDS;

    return completedCycles * 2 + (isResting ? 1 : 0);
  }

  // If this effect restarts during a workout, begin tracking from
  // the current phase rather than announcing it again as new.
  const elapsedAtSetup = Math.floor((performance.now() - startedAt) / 1000);

  let previousPhaseNumber = getPhaseNumber(elapsedAtSetup);

  const intervalId = setInterval(() => {
    // startedAt hasn't changed when sound changes, so restarting
    // the interval doesn't reset the workout's elapsed time.
    const elapsed = Math.floor((performance.now() - startedAt) / 1000);

    setElapsedSeconds(elapsed);

    const phaseNumber = getPhaseNumber(elapsed);

    if (phaseNumber !== previousPhaseNumber) {
      previousPhaseNumber = phaseNumber;

      // Even phase numbers are exercise; odd ones are rest.
      const phase = phaseNumber % 2 === 0 ? "Exercise" : "Rest";

      console.log(`[dependency timer] ${phase}; soundEnabled=${soundEnabled}`);

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

  // Correct dependencies for an ordinary callback that reads both.
  // Changing sound tears down this interval and creates a new one.
}, [startedAt, soundEnabled]);

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
      <h2>Ordinary callback — complete dependencies</h2>
      <p>
        The sound preference stays current because changing it restarts the
        interval. The workout's elapsed time is preserved. Sound is simulated in
        the console.
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
