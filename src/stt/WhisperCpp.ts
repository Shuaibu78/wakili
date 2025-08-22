// Placeholder for local STT integration; implement when ready.
export class WhisperCpp {
  constructor(private modelPath: string) {}
  async transcribe(_audioUrl: string): Promise<string> {
    // Download file, call whisper.cpp binary, return text
    return "(transcription not implemented in starter)";
  }
}
