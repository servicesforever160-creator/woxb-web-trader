export type TradeSound = "open" | "close";

let audioContext: AudioContext | undefined;

export async function prepareTradeAudio() {
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
    return audioContext;
  } catch {
    return undefined;
  }
}

export async function playTradeSound(
  audio: Promise<AudioContext | undefined>,
  sound: TradeSound,
) {
  try {
    const context = await audio;
    if (!context) return;

    const response = await fetch(`/assets/audio/trade/trade-${sound}.wav`);
    if (!response.ok) return;

    const source = context.createBufferSource();
    source.buffer = await context.decodeAudioData(await response.arrayBuffer());
    source.connect(context.destination);
    source.onended = () => source.disconnect();
    source.start();
  } catch {
    // Playback failure should not affect the trade result.
  }
}
