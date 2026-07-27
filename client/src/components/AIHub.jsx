import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { usePlayback } from '../context/PlaybackContext';
import { useAuth } from '../context/AuthContext';

/* ─── tiny helpers ─────────────────────────────────────────── */
const ACCENT   = '#ff6b35';
const PURPLE   = '#a855f7';
const TEAL     = '#14b8a6';
const BLUE     = '#3b82f6';
const PINK     = '#ec4899';
const GREEN    = '#22c55e';

const card = (color, extra = {}) => ({
  background: `rgba(255,255,255,0.04)`,
  border: `1px solid ${color}33`,
  borderRadius: 20,
  padding: '28px 24px',
  backdropFilter: 'blur(12px)',
  boxShadow: `0 0 30px ${color}18`,
  transition: 'all .3s',
  ...extra,
});

const btn = (color) => ({
  background: `linear-gradient(135deg, ${color}, ${color}bb)`,
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 24px',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all .2s',
  boxShadow: `0 4px 20px ${color}44`,
});

const input = {
  width: '100%',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 12,
  padding: '14px 16px',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  resize: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const SongRow = ({ track, onPlay, queue }) => (
  <div
    onClick={() => onPlay(track, queue)}
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
      transition: 'background .2s',
      background: 'rgba(255,255,255,0.03)',
      marginBottom: 6,
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
  >
    <img src={track.image} alt={track.name}
      style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {track.name}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{track.artist}</div>
    </div>
    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>▶</span>
  </div>
);

const Spinner = ({ color }) => (
  <div style={{
    width: 36, height: 36, borderRadius: '50%',
    border: `3px solid ${color}33`,
    borderTop: `3px solid ${color}`,
    animation: 'spin 1s linear infinite',
  }} />
);

/* ════════════════════════════════════════════════════════════ */
/*                       FEATURE PANELS                         */
/* ════════════════════════════════════════════════════════════ */

/* 1 ─ VIBE DNA */
function VibeDNA({ onPlay }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true); setError('');
    try {
      // Fetch liked songs to build the history
      const liked = await axios.get(`${API_BASE_URL}/api/user/liked-songs`);
      const songs = (liked.data || []).slice(0, 30).map(s => ({ name: s.name, artist: s.artist }));
      if (songs.length < 3) {
        setError('Like at least 3 songs first to generate your Vibe DNA!');
        setLoading(false); return;
      }
      const res = await axios.post(`${API_BASE_URL}/api/ai/vibe-dna`, { songs });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const dna = result?.dna;
  const tracks = result?.tracks || [];

  return (
    <div style={card(PURPLE)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem' }}>🧬</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: PURPLE }}>Vibe DNA</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            AI analyzes your taste & creates your music personality
          </p>
        </div>
      </div>

      {!result && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: 12 }}>🧬</div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            Based on your liked songs, AI will build your unique Music DNA fingerprint
          </p>
          {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}
          <button style={btn(PURPLE)} onClick={generate} disabled={loading}>
            {loading ? <><Spinner color={PURPLE} /> Analyzing...</> : '✨ Generate My Vibe DNA'}
          </button>
        </div>
      )}

      {dna && (
        <div>
          {/* DNA Card */}
          <div style={{
            background: `linear-gradient(135deg, ${PURPLE}22, rgba(168,85,247,0.05))`,
            border: `1px solid ${PURPLE}44`, borderRadius: 16,
            padding: '24px', marginBottom: 20, textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{dna.emoji}</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.8rem', background: `linear-gradient(135deg, ${PURPLE}, #e879f9)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {dna.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', lineHeight: 1.6 }}>
              {dna.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {(dna.traits || []).map((t, i) => (
                <span key={i} style={{
                  background: `${PURPLE}33`, border: `1px solid ${PURPLE}55`,
                  borderRadius: 20, padding: '4px 14px', fontSize: '0.8rem', color: '#e879f9'
                }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'left' }}>
              {[
                { label: '🎭 Dominant Mood', value: dna.dominantMood },
                { label: '🤫 Hidden Side', value: dna.hiddenSide },
                { label: '💞 Vibes With', value: dna.compatibleWith },
              ].map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                  padding: '10px 12px', gridColumn: i === 2 ? '1/-1' : 'auto'
                }}>
                  <div style={{ color: PURPLE, fontSize: '0.8rem', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracks */}
          <h4 style={{ color: PURPLE, marginBottom: 12 }}>🎵 Songs that match your DNA</h4>
          {tracks.map((t, i) => <SongRow key={i} track={t} onPlay={onPlay} queue={tracks} />)}
          <button style={{ ...btn(PURPLE), marginTop: 16, width: '100%', justifyContent: 'center' }}
            onClick={() => setResult(null)}>🔄 Regenerate</button>
        </div>
      )}
    </div>
  );
}

/* 2 ─ AI MUSIC THERAPIST */
function MusicTherapist({ onPlay }) {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activePhase, setActivePhase] = useState(0);

  const submit = async () => {
    if (!mood.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/therapist`, { mood });
      setResult(res.data);
      setActivePhase(0);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const phases = result?.phases || [];
  const currentPhase = phases[activePhase] || {};

  return (
    <div style={card(TEAL)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem' }}>💬</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: TEAL }}>Music Therapist</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Tell AI how you feel — get a healing music journey
          </p>
        </div>
      </div>

      {!result ? (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
            Write anything — your day, your mood, your thoughts... in Hindi or English 💙
          </p>
          <textarea
            rows={4} style={input} value={mood}
            onChange={e => setMood(e.target.value)}
            placeholder="e.g. Aaj bahut thaka hua hoon, kuch motivating chahiye... or I'm feeling heartbroken and need to process it through music"
          />
          {error && <p style={{ color: '#f87171', margin: '8px 0' }}>{error}</p>}
          <button style={{ ...btn(TEAL), marginTop: 12 }} onClick={submit} disabled={loading || !mood.trim()}>
            {loading ? <><Spinner color={TEAL} /> Creating your journey...</> : '💙 Start My Healing Journey'}
          </button>
        </div>
      ) : (
        <div>
          {/* Therapist message */}
          <div style={{
            background: `linear-gradient(135deg, ${TEAL}18, transparent)`,
            border: `1px solid ${TEAL}33`, borderRadius: 14, padding: '18px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🤍</div>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
              {result.therapistMessage}
            </p>
            <div style={{ marginTop: 12, padding: '10px 14px', background: `${TEAL}22`, borderRadius: 10, borderLeft: `3px solid ${TEAL}` }}>
              <span style={{ color: TEAL, fontStyle: 'italic', fontSize: '0.9rem' }}>✨ {result.affirmation}</span>
            </div>
          </div>

          <h4 style={{ color: TEAL, marginBottom: 14 }}>🌊 Your Journey: {result.journeyTitle}</h4>

          {/* Phase tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {phases.map((p, i) => (
              <button key={i} onClick={() => setActivePhase(i)} style={{
                background: i === activePhase ? TEAL : 'rgba(255,255,255,0.07)',
                border: `1px solid ${i === activePhase ? TEAL : 'transparent'}`,
                borderRadius: 20, padding: '8px 16px', color: '#fff', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: i === activePhase ? 700 : 400,
              }}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>

          {currentPhase.tracks && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 12, fontStyle: 'italic' }}>
                {currentPhase.description}
              </p>
              {(currentPhase.tracks || []).map((t, i) => (
                <SongRow key={i} track={t} onPlay={onPlay} queue={currentPhase.tracks} />
              ))}
            </div>
          )}

          <button style={{ ...btn(TEAL), marginTop: 16, background: 'transparent', border: `1px solid ${TEAL}` }}
            onClick={() => setResult(null)}>← Write Again</button>
        </div>
      )}
    </div>
  );
}

/* 3 ─ STORY MODE */
function StoryMode({ onPlay }) {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeChapter, setActiveChapter] = useState(0);

  const presets = [
    'A solo road trip at midnight through empty highways',
    'First day at a new city, excited and nervous',
    'A bittersweet farewell between two old friends',
    'Late night coding session trying to build my dream',
    'Falling in love slowly over many rainy evenings',
  ];

  const submit = async (text = scenario) => {
    if (!text.trim()) return;
    setScenario(text);
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/story-mode`, { scenario: text });
      setResult(res.data);
      setActiveChapter(0);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const chapter = (result?.chapters || [])[activeChapter] || {};

  return (
    <div style={card(ACCENT)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem' }}>📖</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: ACCENT }}>Story Mode</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Describe a scene — AI creates a cinematic music journey
          </p>
        </div>
      </div>

      {!result ? (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Or pick a preset:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {presets.map((p, i) => (
              <button key={i} onClick={() => submit(p)} style={{
                background: 'rgba(255,107,53,0.12)', border: `1px solid ${ACCENT}33`,
                borderRadius: 20, padding: '6px 14px', color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer', fontSize: '0.8rem',
              }}>{p}</button>
            ))}
          </div>
          <textarea rows={3} style={input} value={scenario}
            onChange={e => setScenario(e.target.value)}
            placeholder="Describe your scene, situation, or feeling..." />
          {error && <p style={{ color: '#f87171', margin: '8px 0' }}>{error}</p>}
          <button style={{ ...btn(ACCENT), marginTop: 12 }} onClick={() => submit()} disabled={loading || !scenario.trim()}>
            {loading ? <><Spinner color={ACCENT} /> Building your story...</> : '🎬 Create Story Journey'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            background: `linear-gradient(135deg, ${ACCENT}18, transparent)`,
            border: `1px solid ${ACCENT}33`, borderRadius: 14, padding: 18, marginBottom: 20
          }}>
            <h3 style={{ margin: '0 0 8px', color: ACCENT }}>📖 {result.storyTitle}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
              {result.storyIntro}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {(result.chapters || []).map((c, i) => (
              <button key={i} onClick={() => setActiveChapter(i)} style={{
                background: i === activeChapter ? ACCENT : 'rgba(255,255,255,0.07)',
                border: 'none', borderRadius: 20, padding: '6px 14px',
                color: '#fff', cursor: 'pointer', fontSize: '0.82rem',
                fontWeight: i === activeChapter ? 700 : 400,
              }}>{c.emoji} {c.chapterName}</button>
            ))}
          </div>

          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, borderLeft: `3px solid ${ACCENT}` }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.6 }}>
              {chapter.narration}
            </p>
          </div>

          {(chapter.tracks || []).map((t, i) => <SongRow key={i} track={t} onPlay={onPlay} queue={chapter.tracks} />)}

          {result.epilogue && activeChapter === (result.chapters?.length || 1) - 1 && (
            <div style={{ marginTop: 16, textAlign: 'center', color: `${ACCENT}cc`, fontStyle: 'italic' }}>
              ✨ {result.epilogue}
            </div>
          )}

          <button style={{ ...btn(ACCENT), marginTop: 16, background: 'transparent', border: `1px solid ${ACCENT}` }}
            onClick={() => setResult(null)}>← New Story</button>
        </div>
      )}
    </div>
  );
}

/* 4 ─ EMOTION MIRROR */
function EmotionMirror({ onPlay }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      setCameraOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch { setError('Camera access denied. Please allow camera access.'); }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null); setCameraOn(false);
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    stopCamera();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/emotion`, { imageBase64 });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Emotion detection failed');
    }
    setLoading(false);
  };

  const tracks = result?.tracks || [];
  const em = result?.emotion;

  return (
    <div style={card(PINK)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem' }}>🎭</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: PINK }}>Emotion Mirror</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Smile at the camera — AI reads your mood & picks your music
          </p>
        </div>
      </div>

      {!result && !loading && (
        <div style={{ textAlign: 'center' }}>
          {!cameraOn ? (
            <div style={{ padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>📸</div>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
                Gemini Vision will analyze your facial expression and curate the perfect music for your current mood
              </p>
              {error && <p style={{ color: '#f87171', marginBottom: 12 }}>{error}</p>}
              <button style={btn(PINK)} onClick={startCamera}>📷 Open Camera</button>
            </div>
          ) : (
            <div>
              <video ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', maxWidth: 380, borderRadius: 16, border: `2px solid ${PINK}55`, marginBottom: 16 }} />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button style={btn(PINK)} onClick={capture}>📸 Capture & Detect Mood</button>
                <button onClick={stopCamera} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12, padding: '12px 20px', color: '#fff', cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spinner color={PINK} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>Gemini is reading your vibe...</p>
        </div>
      )}

      {em && (
        <div>
          <div style={{
            background: `linear-gradient(135deg, ${PINK}18, transparent)`,
            border: `1px solid ${PINK}33`, borderRadius: 14, padding: 18, marginBottom: 20,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 8 }}>{em.moodEmoji}</div>
            <h3 style={{ margin: '0 0 8px', color: PINK }}>{em.detectedMood}</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>{em.moodMessage}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
              🎵 {em.musicRecommendation}
            </p>
            <span style={{
              display: 'inline-block', marginTop: 10,
              background: `${PINK}22`, border: `1px solid ${PINK}44`,
              borderRadius: 20, padding: '4px 12px', fontSize: '0.8rem', color: PINK,
            }}>Confidence: {em.confidence}</span>
          </div>
          <h4 style={{ color: PINK, marginBottom: 12 }}>🎵 Perfect for your mood right now</h4>
          {tracks.map((t, i) => <SongRow key={i} track={t} onPlay={onPlay} queue={tracks} />)}
          <button style={{ ...btn(PINK), marginTop: 16, background: 'transparent', border: `1px solid ${PINK}` }}
            onClick={() => { setResult(null); }}>🔄 Try Again</button>
        </div>
      )}
    </div>
  );
}

/* 5 ─ HUM SEARCH */
function HumSearch({ onPlay }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          setLoading(true);
          try {
            const res = await axios.post(`${API_BASE_URL}/api/ai/hum-search`, {
              audioBase64: reader.result, mimeType: 'audio/webm'
            });
            setResult(res.data);
          } catch (e) { setError(e.response?.data?.error || 'Recognition failed'); }
          setLoading(false);
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setRecording(true); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch { setError('Microphone access denied.'); }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const humResult = result?.result;
  const tracks = result?.tracks || [];

  return (
    <div style={card(BLUE)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem' }}>🎼</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: BLUE }}>Hum to Search</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Hum, sing or whistle — Gemini AI identifies the song
          </p>
        </div>
      </div>

      {!result && !loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto 20px',
            background: recording ? `${BLUE}33` : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `3px solid ${recording ? BLUE : 'rgba(255,255,255,0.1)'}`,
            cursor: 'pointer', fontSize: '3rem', transition: 'all .3s',
            boxShadow: recording ? `0 0 40px ${BLUE}66` : 'none',
            animation: recording ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }} onClick={recording ? stopRecording : startRecording}>
            {recording ? '⏹' : '🎤'}
          </div>
          {recording ? (
            <>
              <div style={{ color: BLUE, fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>
                Recording... {seconds}s
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                Hum your song — tap ⏹ when done (4-8 seconds is ideal)
              </p>
              <button style={btn(BLUE)} onClick={stopRecording}>⏹ Stop & Identify</button>
            </>
          ) : (
            <>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
                Tap the mic, hum 4-8 seconds of any song you can't remember the name of!
              </p>
              {error && <p style={{ color: '#f87171', marginBottom: 12 }}>{error}</p>}
              <button style={btn(BLUE)} onClick={startRecording}>🎤 Start Humming</button>
            </>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spinner color={BLUE} />
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>Gemini is identifying the song...</p>
        </div>
      )}

      {humResult && (
        <div>
          <div style={{
            background: `linear-gradient(135deg, ${BLUE}18, transparent)`,
            border: `1px solid ${BLUE}33`, borderRadius: 14, padding: 18, marginBottom: 20
          }}>
            {humResult.identified ? (
              <>
                <div style={{ color: GREEN, fontWeight: 700, marginBottom: 4 }}>✅ Song Identified!</div>
                <h3 style={{ margin: '0 0 4px', color: '#fff' }}>{humResult.songName}</h3>
                <div style={{ color: 'rgba(255,255,255,0.6)' }}>by {humResult.artist}</div>
              </>
            ) : (
              <div style={{ color: ACCENT }}>🤔 Not 100% sure, but here are the closest matches:</div>
            )}
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 10, fontSize: '0.85rem', fontStyle: 'italic' }}>
              {humResult.message}
            </p>
          </div>
          <h4 style={{ color: BLUE, marginBottom: 12 }}>🔍 Best matches</h4>
          {tracks.map((t, i) => <SongRow key={i} track={t} onPlay={onPlay} queue={tracks} />)}
          <button style={{ ...btn(BLUE), marginTop: 16, background: 'transparent', border: `1px solid ${BLUE}` }}
            onClick={() => { setResult(null); setError(''); setSeconds(0); }}>🔄 Try Again</button>
        </div>
      )}
    </div>
  );
}

/* 6 ─ COLLAB PLAYLIST */
function CollabPlaylist({ onPlay }) {
  const { user } = useAuth();
  const [person2Songs, setPerson2Songs] = useState('');
  const [person2Name, setPerson2Name] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true); setError('');
    try {
      // Get current user's liked songs
      const liked = await axios.get(`${API_BASE_URL}/api/user/liked-songs`);
      const mySongs = (liked.data || []).slice(0, 15).map(s => ({ name: s.name, artist: s.artist }));
      if (mySongs.length < 3) {
        setError('You need at least 3 liked songs first!');
        setLoading(false); return;
      }
      // Parse friend's songs from textarea (format: "Song Name - Artist")
      const friendSongs = person2Songs.split('\n')
        .map(l => l.trim()).filter(Boolean)
        .map(l => {
          const parts = l.split('-');
          return { name: (parts[0] || l).trim(), artist: (parts[1] || '').trim() || 'Unknown' };
        }).slice(0, 15);

      if (friendSongs.length < 2) {
        setError('Enter at least 2 songs for your friend (one per line: "Song - Artist")');
        setLoading(false); return;
      }
      const res = await axios.post(`${API_BASE_URL}/api/ai/collab`, {
        person1Songs: mySongs,
        person2Songs: friendSongs,
        person1Name: user?.name || 'You',
        person2Name: person2Name || 'Friend',
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const collab = result?.collab;
  const tracks = result?.tracks || [];

  return (
    <div style={card(GREEN)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '2rem' }}>🧩</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: GREEN }}>Collab Playlist</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            AI merges your taste with a friend's — perfect for road trips
          </p>
        </div>
      </div>

      {!result ? (
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
            Your liked songs will be used automatically. Enter your friend's favourite songs below:
          </p>
          <input
            style={{ ...input, marginBottom: 10 }}
            value={person2Name}
            onChange={e => setPerson2Name(e.target.value)}
            placeholder="Your friend's name (e.g. Priya)"
          />
          <textarea
            rows={5} style={input} value={person2Songs}
            onChange={e => setPerson2Songs(e.target.value)}
            placeholder="One song per line in format: Song Name - Artist&#10;e.g.&#10;Kesariya - Arijit Singh&#10;Blinding Lights - The Weeknd&#10;Pasoori - Ali Sethi"
          />
          {error && <p style={{ color: '#f87171', margin: '8px 0' }}>{error}</p>}
          <button style={{ ...btn(GREEN), marginTop: 12 }} onClick={submit} disabled={loading || !person2Songs.trim()}>
            {loading ? <><Spinner color={GREEN} /> Finding common ground...</> : '🎵 Create Collab Playlist'}
          </button>
        </div>
      ) : (
        <div>
          {collab && (
            <div style={{
              background: `linear-gradient(135deg, ${GREEN}18, transparent)`,
              border: `1px solid ${GREEN}33`, borderRadius: 14, padding: 18, marginBottom: 20
            }}>
              <h3 style={{ margin: '0 0 12px', color: GREEN }}>🎵 {collab.playlistName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>COMPATIBILITY</div>
                  <div style={{ color: GREEN, fontWeight: 800, fontSize: '1.6rem' }}>{collab.compatibilityScore}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>COMMON GROUND</div>
                  <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: 4 }}>{collab.commonGround}</div>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 8px', lineHeight: 1.6 }}>{collab.compatibilityMessage}</p>
              <p style={{ color: ACCENT, fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>🎲 {collab.surpriseFactor}</p>
            </div>
          )}
          <h4 style={{ color: GREEN, marginBottom: 12 }}>🎶 Songs you'll both love</h4>
          {tracks.map((t, i) => <SongRow key={i} track={t} onPlay={onPlay} queue={tracks} />)}
          <button style={{ ...btn(GREEN), marginTop: 16, background: 'transparent', border: `1px solid ${GREEN}` }}
            onClick={() => setResult(null)}>← Try Different Songs</button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*                       MAIN AI HUB                            */
/* ════════════════════════════════════════════════════════════ */
const FEATURES = [
  { id: 'vibe-dna',   icon: '🧬', label: 'Vibe DNA',         color: PURPLE, desc: 'Your music personality' },
  { id: 'therapist',  icon: '💬', label: 'Music Therapist',  color: TEAL,   desc: 'Healing music journey' },
  { id: 'story',      icon: '📖', label: 'Story Mode',       color: ACCENT,  desc: 'Cinematic playlist' },
  { id: 'emotion',    icon: '🎭', label: 'Emotion Mirror',   color: PINK,   desc: 'Camera mood detection' },
  { id: 'hum',        icon: '🎼', label: 'Hum to Search',    color: BLUE,   desc: 'Identify any song' },
  { id: 'collab',     icon: '🧩', label: 'Collab Playlist',  color: GREEN,  desc: 'Merge two tastes' },
];

export default function AIHub({ initialFeature = 'vibe-dna', onClose }) {
  const [active, setActive] = useState(initialFeature);
  const { playTrack } = usePlayback();

  const handlePlay = useCallback((track, queue) => {
    playTrack(track, queue);
    if (onClose) onClose(); // close overlay when song starts playing
  }, [playTrack, onClose]);

  return (
    <div style={{
      minHeight: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 30% 20%, #0d0020 0%, #000010 50%, #000000 100%)',
      color: '#fff', fontFamily: "'Inter', sans-serif",
      overflowY: 'auto', position: 'relative',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)} 50%{box-shadow:0 0 0 20px rgba(59,130,246,0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Hero header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0b0b12 0%, #1a0a2e 50%, #0b0b12 100%)',
        padding: '48px 32px 36px', textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* glowing orbs */}
        {[PURPLE, TEAL, PINK].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: `${c}12`, filter: 'blur(80px)',
            top: i === 1 ? '-100px' : '50%', left: `${i * 35}%`,
            transform: 'translate(-50%,-50%)', pointerEvents: 'none',
          }} />
        ))}
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🤖</div>
          <h1 style={{
            margin: '0 0 10px', fontSize: '2.4rem', fontWeight: 800,
            background: `linear-gradient(135deg, ${PURPLE}, ${TEAL}, ${PINK})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Melodify AI Hub</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '1.05rem' }}>
            6 exclusive AI features — unlike any other music app in the world
          </p>
        </div>
      </div>

      {/* ── Close button ── */}
      {onClose && (
        <button onClick={onClose} style={{
          position: 'sticky', top: 16, left: '100%', zIndex: 10,
          float: 'right', marginRight: 16,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', borderRadius: '50%',
          width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', backdropFilter: 'blur(10px)',
        }}>✕</button>
      )}

      {/* ── Feature selector tabs ── */}
      <div style={{
        padding: '20px 24px',
        overflowX: 'auto',
        display: 'flex', gap: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        scrollbarWidth: 'none',
      }}>
        {FEATURES.map(f => (
          <button key={f.id} onClick={() => setActive(f.id)} style={{
            flexShrink: 0,
            background: active === f.id ? `${f.color}22` : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${active === f.id ? f.color : 'transparent'}`,
            borderRadius: 14, padding: '10px 18px', color: '#fff', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            minWidth: 100, transition: 'all .2s',
            boxShadow: active === f.id ? `0 0 20px ${f.color}33` : 'none',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
            <span style={{ fontWeight: active === f.id ? 700 : 400, fontSize: '0.8rem', color: active === f.id ? f.color : 'rgba(255,255,255,0.7)' }}>
              {f.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Active feature panel ── */}
      <div style={{ padding: '24px', maxWidth: 760, margin: '0 auto', animation: 'fadeIn .3s ease' }} key={active}>
        {active === 'vibe-dna'  && <VibeDNA    onPlay={handlePlay} />}
        {active === 'therapist' && <MusicTherapist onPlay={handlePlay} />}
        {active === 'story'     && <StoryMode  onPlay={handlePlay} />}
        {active === 'emotion'   && <EmotionMirror onPlay={handlePlay} />}
        {active === 'hum'       && <HumSearch  onPlay={handlePlay} />}
        {active === 'collab'    && <CollabPlaylist onPlay={handlePlay} />}
      </div>
    </div>
  );
}
