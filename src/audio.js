let audioContext;

// Called directly from the Start button handler.
export async function enableAudio() {
  audioContext ??= new AudioContext();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

export function playBeep() {
  // If audio wasn't enabled successfully, keep the timer working.
  if (!audioContext || audioContext.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = "sine";
  oscillator.frequency.value = 660;

  // A short volume envelope avoids abrupt clicks.
  volume.gain.setValueAtTime(0, now);
  volume.gain.linearRampToValueAtTime(0.15, now + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  oscillator.connect(volume);
  volume.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.2);

  oscillator.onended = () => {
    oscillator.disconnect();
    volume.disconnect();
  };
}
