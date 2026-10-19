import { useEffect, useEffectEvent, useState } from "react";
import { EXERCISE_SECONDS, CYCLE_SECONDS } from "../workoutConfig.js";

export default function EffectEventTimer() {
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastAlert, setLastAlert] = useState(null);

  const isRunning = startedAt !== null;

  // teaching:start

  // Reads the latest committed preference whenever the timer
  // reports a phase change, without restarting the timer effect.
  const onPhaseChange = useEffectEvent((phase) => {
    console.log(`[effect-event timer] ${phase}; soundEnabled=${soundEnabled}`);

    console.log(
      soundEnabled
        ? "[effect-event timer] BEEP (simulated)"
        : "[effect-event timer] sound skipped"
    );

    setLastAlert({ phase, soundEnabled });
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

    const elapsedAtSetup = Math.floor((performance.now() - startedAt) / 1000);

    let previousPhaseNumber = getPhaseNumber(elapsedAtSetup);

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((performance.now() - startedAt) / 1000);

      setElapsedSeconds(elapsed);

      const phaseNumber = getPhaseNumber(elapsed);

      if (phaseNumber !== previousPhaseNumber) {
        previousPhaseNumber = phaseNumber;

        const phase = phaseNumber % 2 === 0 ? "Exercise" : "Rest";

        // The timer reports the event without reading soundEnabled.
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
    setElapsedSeconds(0);
    setLastAlert(null);
    setStartedAt(performance.now());
  }

  function handleStop() {
    setStartedAt(null);
  }

  function handleSoundChange(event) {
    const enabled = event.target.checked;

    console.log(`[effect-event timer] sound preference changed to ${enabled}`);
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
      <h2>useEffectEvent — current preference</h2>

      <p>
        The next phase alert uses the current sound setting without recreating
        the interval.
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
