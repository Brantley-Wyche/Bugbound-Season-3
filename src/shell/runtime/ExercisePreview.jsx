import { useEffect, useRef, useState } from 'react';
import { exerciseFramePath, frameAddress } from './frame-check.js';

export default function ExercisePreview({ levelId, title, frameUrl = exerciseFramePath() }) {
  const frameRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [height, setHeight] = useState(300);
  useEffect(() => {
    const frame = frameRef.current;
    const channel = crypto.randomUUID();
    const timeout = setTimeout(() => { setStatus('error'); setMessage('The exercise did not finish loading. Remount to try again.'); }, 20000);
    let frameWindow = null;
    // Keys pressed inside the experiment stay in the frame, so the run-checks chord is re-dispatched here.
    const forwardShortcut = (event) => {
      if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
      event.preventDefault();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: event.ctrlKey, metaKey: event.metaKey }));
    };
    const receive = (event) => {
      if (event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.channel !== channel) return;
      if (event.data.type === 'ready') {
        clearTimeout(timeout);
        setStatus('ready');
        frameWindow?.removeEventListener('keydown', forwardShortcut);
        frameWindow = frame.contentWindow;
        frameWindow?.addEventListener('keydown', forwardShortcut);
      }
      if (event.data.type === 'error') { clearTimeout(timeout); setStatus('error'); setMessage(String(event.data.message)); }
      if (event.data.type === 'resize' && Number.isFinite(event.data.height)) setHeight(Math.max(80, Math.min(20000, Math.ceil(event.data.height) + 8)));
    };
    window.addEventListener('message', receive);
    frame.src = frameAddress(frameUrl, levelId, channel, 'preview', location.href);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('message', receive);
      frameWindow?.removeEventListener('keydown', forwardShortcut);
    };
  }, [levelId, frameUrl]);
  return <>
    {status === 'loading' && <p role="status">Loading your local exercise…</p>}
    {status === 'error' && <p role="alert">{message} Use Remount after correcting the exercise files.</p>}
    <iframe ref={frameRef} className="exercise-preview" title={`${title} — live experiment`} style={{ height }} hidden={status === 'error'} />
  </>;
}
