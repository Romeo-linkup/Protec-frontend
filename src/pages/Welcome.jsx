import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(200,16,46,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,16,46,0.35)';
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const roles = [
    {
      role: 'admin',
      icon: '⚙',
      label: 'Administrator',
      desc: 'Manage learners, capture results, view branch reports',
      color: '#c8102e',
    },
    {
      role: 'tutor',
      icon: '✏',
      label: 'Tutor',
      desc: 'Record lesson sessions, track learner progress',
      color: '#185FA5',
    },
    {
      role: 'learner',
      icon: '📖',
      label: 'Learner',
      desc: 'View your results, upload term reports, check rankings',
      color: '#0F6E56',
    },
    {
      role: 'parent',
      icon: '👨‍👧',
      label: 'Parent',
      desc: "Monitor your child's academic progress and attendance",
      color: '#854F0B',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0b1529', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>

      {/* Hero */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Animated bg canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />

        {/* Top bar */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProtecMark size={36} />
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, letterSpacing: '0.06em' }}>
                PROTEC <span style={{ color: '#c8102e' }}>INK</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Results System
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent', border: '1px solid rgba(200,16,46,0.5)',
              color: '#fff', padding: '8px 22px', borderRadius: 6,
              fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = '#c8102e'; e.target.style.borderColor = '#c8102e'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(200,16,46,0.5)'; }}
          >
            Sign in
          </button>
        </div>

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 2, flex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block', background: 'rgba(200,16,46,0.12)',
            border: '1px solid rgba(200,16,46,0.25)', borderRadius: 20,
            padding: '4px 16px', fontSize: 11, color: 'rgba(200,16,46,0.9)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28,
          }}>
            Durban Branch · 2025
          </div>

          <h1 style={{
            color: '#fff', fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700, lineHeight: 1.1, margin: '0 0 20px',
            maxWidth: 700, letterSpacing: '-0.02em',
          }}>
            Track every learner.<br />
            <span style={{ color: '#c8102e' }}>Every result.</span><br />
            Every step forward.
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7,
            maxWidth: 480, margin: '0 0 48px',
          }}>
            The Protec INK branch management platform — built for administrators,
            tutors, learners and parents to work together toward academic excellence.
          </p>

          {/* Role cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, width: '100%', maxWidth: 800,
          }}>
            {roles.map(({ role, icon, label, desc, color }) => (
              <button
                key={role}
                onClick={() => navigate('/login')}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '20px 16px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', fontFamily: 'system-ui, sans-serif',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.5 }}>{desc}</div>
                <div style={{ marginTop: 12, fontSize: 11, color, fontWeight: 600 }}>
                  Sign in →
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Install banner */}
        {showInstall && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#fff', borderRadius: 12, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)', zIndex: 100,
            maxWidth: 380, width: '90%',
          }}>
            <div style={{ fontSize: 28 }}>📲</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111e3d' }}>
                Install Protec INK
              </div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                Add to your home screen for quick access
              </div>
            </div>
            <button onClick={handleInstall} style={{
              background: '#c8102e', color: '#fff', border: 'none',
              borderRadius: 7, padding: '8px 16px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Install
            </button>
            <button onClick={() => setShowInstall(false)} style={{
              background: 'none', border: 'none', color: '#999',
              fontSize: 18, cursor: 'pointer', padding: '0 4px',
            }}>×</button>
          </div>
        )}

        {/* Bottom stats bar */}
        <div style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'center', gap: 0,
          flexWrap: 'wrap',
        }}>
          {[
            { val: '4', label: 'User roles' },
            { val: '11', label: 'Backend routes' },
            { val: '14', label: 'Admin pages' },
            { val: '100%', label: 'CAPS aligned' },
          ].map(({ val, label }, i) => (
            <div key={i} style={{
              padding: '18px 40px', textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ color: '#c8102e', fontSize: 22, fontWeight: 700 }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtecMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#c8102e" />
      <text x="20" y="27" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif">P</text>
      <circle cx="30" cy="10" r="3" fill="#fff" opacity="0.6" />
      <circle cx="10" cy="10" r="2" fill="#fff" opacity="0.4" />
      <line x1="13" y1="10" x2="27" y2="10" stroke="#fff" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
