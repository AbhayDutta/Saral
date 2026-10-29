import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';

function Permission() {
  const [status, setStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function request() {
    setStatus('requesting');
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setStatus('granted');
      setTimeout(() => {
        try {
          window.close();
        } catch {
          // Ignore if window.close is blocked
        }
      }, 2000);
    } catch (err) {
      console.warn('Microphone permission request failed:', err);
      setStatus('denied');
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    }
  }

  useEffect(() => {
    void request();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center p-6 text-center">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
          🎙
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          Saral Microphone Permission
        </h1>

        {status === 'requesting' && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-600">
              Please click <strong className="text-slate-900">Allow</strong> when Chrome asks for microphone access at the top of this tab.
            </p>
            <p className="text-xs text-slate-500">
              Chrome side panels cannot show permission prompts directly, so this tab was opened to grant access once to Saral.
            </p>
          </div>
        )}

        {status === 'granted' && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
              <p className="text-sm font-semibold">✓ Microphone access granted!</p>
              <p className="mt-1 text-xs text-emerald-700">
                You can now use voice recording in the Saral side panel. This tab will close automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.close()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Close this tab
            </button>
          </div>
        )}

        {status === 'denied' && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-red-800 text-left">
              <p className="text-sm font-semibold">Microphone access could not be enabled</p>
              {errorMsg && <p className="mt-1 text-xs text-red-600">Error: {errorMsg}</p>}
              <div className="mt-3 text-xs text-slate-700 space-y-1">
                <p className="font-medium text-slate-900">Possible causes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Microphone was blocked for this extension in Chrome settings.</li>
                  <li>
                    macOS blocked Chrome: Check <strong>System Settings &gt; Privacy &amp; Security &gt; Microphone</strong> and ensure <strong>Google Chrome</strong> is enabled.
                  </li>
                  <li>Click the camera/microphone icon in Chrome's address bar above to allow access.</li>
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void request()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Permission />
  </StrictMode>,
);
