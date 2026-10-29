export interface Recording {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export class AudioRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;

  get isRecording(): boolean {
    return this.recorder?.state === 'recording';
  }

  async start(): Promise<void> {
    if (this.recorder) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    this.stream = stream;
    this.recorder = recorder;
    this.chunks = [];
    this.startedAt = Date.now();

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };

    recorder.start();
  }

  async stop(): Promise<Recording> {
    const recorder = this.recorder;
    if (!recorder) throw new Error('Recording has not started');

    const durationMs = Date.now() - this.startedAt;
    const mimeType = recorder.mimeType || 'audio/webm';

    return new Promise<Recording>((resolve, reject) => {
      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this.cleanup();

        if (blob.size === 0) {
          reject(new Error('No audio was recorded'));
          return;
        }

        resolve({ blob, mimeType, durationMs });
      };

      try {
        recorder.stop();
      } catch (error) {
        this.cleanup();
        reject(error);
      }
    });
  }

  cancel(): void {
    const recorder = this.recorder;
    if (recorder) {
      recorder.onstop = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
    this.startedAt = 0;
  }
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the recording'));
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

export function openMicPermissionTab(): void {
  const url = browser.runtime.getURL('/permission.html');
  void browser.tabs.create({ url });
}

export function isPermissionError(error: unknown): boolean {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return (
      error.name === 'NotAllowedError' ||
      error.name === 'PermissionDeniedError' ||
      error.name === 'SecurityError'
    );
  }
  if (error instanceof Error) {
    return /permission|not allowed|denied/i.test(error.message);
  }
  return false;
}

