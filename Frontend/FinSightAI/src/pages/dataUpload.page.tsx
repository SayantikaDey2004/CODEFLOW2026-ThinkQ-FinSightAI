import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, Image, CheckCircle, X, AlertTriangle,
  BarChart3, MessageSquare, DollarSign, Target, ArrowRight,
  Sparkles, Shield, Zap, RefreshCw, Eye, Brain, Activity,
  Home, ChevronRight, Info, File, Trash2, CloudUpload
} from "lucide-react";

// ─── Global styles (same design system as landing page) ──────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base:     #070b14;
    --bg-card:     #0d1526;
    --bg-card2:    #111c33;
    --border:      rgba(99,140,210,0.15);
    --border-b:    rgba(99,140,210,0.35);
    --accent-blue: #3b82f6;
    --accent-teal: #06d6a0;
    --accent-purple:#818cf8;
    --accent-cyan: #22d3ee;
    --text-p:      #e8edf8;
    --text-s:      #8499c4;
    --text-m:      #4a6080;
    --shadow-glow: 0 0 40px rgba(59,130,246,0.18);
  }

  body { background: var(--bg-base); color: var(--text-p);
         font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg-base); }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }

  .grad-text {
    background: linear-gradient(90deg,#3b82f6,#06d6a0);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .glass {
    background: rgba(13,21,38,0.7); border: 1px solid var(--border);
    backdrop-filter: blur(12px);
  }
  .glass-b {
    background: rgba(17,28,51,0.85); border: 1px solid var(--border-b);
    backdrop-filter: blur(16px);
  }

  /* Nav */
  .nav-blur {
    background: rgba(7,11,20,0.88); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(99,140,210,0.1);
  }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(135deg,#1d4ed8,#0891b2);
    border: 1px solid rgba(59,130,246,0.4);
    transition: all 0.25s; position: relative; overflow: hidden; cursor: pointer;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(59,130,246,0.35); }
  .btn-ghost {
    background: rgba(99,140,210,0.08); border: 1px solid var(--border-b);
    transition: all 0.25s; cursor: pointer;
  }
  .btn-ghost:hover { background: rgba(99,140,210,0.14); transform: translateY(-1px); }

  /* Bottom nav tabs */
  .tab-item { transition: all 0.2s; cursor: pointer; }
  .tab-item:hover { color: var(--text-p) !important; }
  .tab-active { color: var(--accent-blue) !important; }

  /* Drop zone */
  .dropzone {
    border: 2px dashed rgba(99,140,210,0.25);
    background: rgba(13,21,38,0.5);
    transition: all 0.3s; cursor: pointer; position: relative;
  }
  .dropzone:hover, .dropzone.drag-over {
    border-color: var(--accent-blue);
    background: rgba(59,130,246,0.05);
    box-shadow: 0 0 30px rgba(59,130,246,0.1);
  }
  .dropzone.drag-over { border-style: solid; }

  /* File card */
  .file-card {
    background: var(--bg-card2); border: 1px solid var(--border);
    transition: all 0.25s;
  }
  .file-card:hover { border-color: var(--border-b); }

  /* Process step */
  .proc-step {
    background: var(--bg-card); border: 1px solid var(--border);
    transition: all 0.3s; position: relative;
  }
  .proc-step.active {
    border-color: rgba(59,130,246,0.4);
    box-shadow: 0 0 20px rgba(59,130,246,0.1);
  }
  .proc-step.done {
    border-color: rgba(6,214,160,0.35);
    box-shadow: 0 0 16px rgba(6,214,160,0.08);
  }

  /* Progress bar fill */
  @keyframes prog-fill { from { width:0% } to { width: var(--target); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.8); } }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
  @keyframes check-pop { 0% { transform:scale(0); } 70% { transform:scale(1.2); } 100% { transform:scale(1); } }

  .anim-fade-up   { animation: fadeUp 0.6s ease forwards; }
  .anim-fade-up-1 { animation: fadeUp 0.6s 0.08s ease both; }
  .anim-fade-up-2 { animation: fadeUp 0.6s 0.16s ease both; }
  .anim-fade-up-3 { animation: fadeUp 0.6s 0.24s ease both; }
  .anim-float     { animation: float 3.5s ease-in-out infinite; }
  .spin           { animation: spin 1.1s linear infinite; }
  .check-pop      { animation: check-pop 0.45s ease forwards; }

  .shimmer-bar {
    background: linear-gradient(90deg,
      rgba(99,140,210,0.06) 25%,
      rgba(99,140,210,0.18) 50%,
      rgba(99,140,210,0.06) 75%);
    background-size: 200% auto;
    animation: shimmer 1.8s linear infinite;
  }

  .mesh-bg {
    background:
      radial-gradient(ellipse 70% 40% at 15% 30%, rgba(59,130,246,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 50% 30% at 85% 70%, rgba(6,214,160,0.05) 0%, transparent 60%),
      var(--bg-base);
  }
  .dot-grid {
    background-image: radial-gradient(rgba(99,140,210,0.1) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Format badge */
  .fmt-badge {
    background: rgba(99,140,210,0.08); border: 1px solid var(--border);
    border-radius: 8px; padding: 4px 10px; font-size: 0.68rem;
    color: var(--text-s); font-weight: 600; letter-spacing: 0.06em;
    text-transform: uppercase; transition: all 0.2s;
  }
  .fmt-badge:hover { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.35); color: #93c5fd; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtBytes = (b) => {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1048576).toFixed(2)} MB`;
};

const fileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return { color:'#f87171', label:'PDF' };
  if (['jpg','jpeg','png','webp'].includes(ext)) return { color:'#818cf8', label:ext.toUpperCase() };
  if (ext === 'csv') return { color:'#06d6a0', label:'CSV' };
  return { color:'#8499c4', label:'FILE' };
};

// ─── AI Processing Flow (visual only, no ReactFlow dep needed) ────────────────
const FLOW_NODES = [
  { id:'upload', label:'File Uploaded', icon:Upload,       color:'#3b82f6',  desc:'PDF / CSV / Image' },
  { id:'parse',  label:'AI Parsing',    icon:Brain,        color:'#818cf8',  desc:'Extract raw text & data' },
  { id:'txn',    label:'Transactions',  icon:Activity,     color:'#06d6a0',  desc:'Identify every entry' },
  { id:'cat',    label:'Categorize',    icon:Target,       color:'#f59e0b',  desc:'Tag by spending type' },
  { id:'score',  label:'Health Score',  icon:Zap,          color:'#22d3ee',  desc:'Compute financial score' },
  { id:'report', label:'Report Ready',  icon:FileText,     color:'#06d6a0',  desc:'AI summary + insights' },
];

function ProcessFlow({ activeStep }) {
  return (
    <div style={{ position:'relative', padding:'8px 0' }}>
      {/* connector line */}
      <div style={{ position:'absolute', top:'28px', left:'28px', right:'28px', height:'2px',
        background:'linear-gradient(90deg, #3b82f620, #06d6a020)', zIndex:0 }}/>
      <div style={{ position:'absolute', top:'28px', left:'28px', height:'2px', zIndex:1,
        width:`${Math.min(100,(activeStep/(FLOW_NODES.length-1))*100)}%`,
        background:'linear-gradient(90deg,#3b82f6,#06d6a0)',
        transition:'width 0.8s ease', borderRadius:'2px' }}/>

      <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:2 }}>
        {FLOW_NODES.map((n, i) => {
          const done    = i < activeStep;
          const current = i === activeStep;
          const Icon = n.icon;
          return (
            <div key={n.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', flex:1 }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%',
                background: done ? 'rgba(6,214,160,0.15)' : current ? `${n.color}22` : 'rgba(13,21,38,0.9)',
                border: `2px solid ${done ? '#06d6a0' : current ? n.color : 'rgba(99,140,210,0.2)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: current ? `0 0 18px ${n.color}40` : 'none',
                transition:'all 0.4s' }}>
                {done
                  ? <CheckCircle size={15} style={{ color:'#06d6a0' }} className="check-pop"/>
                  : <Icon size={14} style={{ color: current ? n.color : 'var(--text-m)',
                      animation: current ? 'spin 1.4s linear infinite' : 'none' }}/>
                }
              </div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:'0.6rem', fontWeight:700, color: done ? '#06d6a0' : current ? n.color : 'var(--text-m)',
                  fontFamily:"'Syne',sans-serif", whiteSpace:'nowrap' }}>{n.label}</p>
                <p style={{ fontSize:'0.52rem', color:'var(--text-m)', marginTop:'1px', display: window.innerWidth < 480 ? 'none':'block' }}>{n.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV_TABS = [
  { icon:Home,          label:'Dashboard' },
  { icon:MessageSquare, label:'AI Chat'   },
  { icon:DollarSign,    label:'Income'    },
  { icon:Target,        label:'Budget'    },
  { icon:Upload,        label:'Documents', active:true },
];

// ─── Main Upload Page ─────────────────────────────────────────────────────────
export default function UploadPage() {
  const [files,        setFiles]        = useState([]);
  const [dragOver,     setDragOver]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [flowStep,     setFlowStep]     = useState(-1);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState('');
  const fileRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    setError('');
    const allowed = ['application/pdf','image/jpeg','image/png','image/webp','text/csv'];
    const next = [...files];
    for (const f of Array.from(incoming)) {
      if (!allowed.includes(f.type) && !f.name.endsWith('.csv')) {
        setError(`"${f.name}" — unsupported format.`); continue;
      }
      if (f.size > 1_048_576) {
        setError(`"${f.name}" exceeds 1 MB limit.`); continue;
      }
      if (next.find(x => x.name === f.name)) continue;
      next.push({ file:f, name:f.name, size:f.size, progress:0, status:'idle' });
    }
    setFiles(next);
    setDone(false); setFlowStep(-1);
  }, [files]);

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const removeFile = (name) => setFiles(f => f.filter(x => x.name !== name));

  const runUpload = async () => {
    if (!files.length) { setError('Please add at least one file.'); return; }
    setUploading(true); setDone(false); setError('');

    // Simulate progress for each file
    for (let fi = 0; fi < files.length; fi++) {
      await new Promise(res => {
        let p = 0;
        const iv = setInterval(() => {
          p = Math.min(100, p + Math.random()*18 + 4);
          setFiles(prev => prev.map((f,i) => i===fi ? { ...f, progress:Math.round(p), status: p>=100?'done':'uploading' } : f));
          if (p >= 100) { clearInterval(iv); res(); }
        }, 80);
      });
    }

    // Simulate AI processing flow
    for (let s = 0; s < FLOW_NODES.length; s++) {
      setFlowStep(s);
      await new Promise(r => setTimeout(r, 700 + Math.random()*400));
    }
    setFlowStep(FLOW_NODES.length); // all done
    setUploading(false); setDone(true);
  };

  const reset = () => { setFiles([]); setDone(false); setFlowStep(-1); setError(''); setUploading(false); };

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Page wrapper ── */}
      <div className="mesh-bg" style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>

        {/* ── Sticky Top Nav ── */}
        <nav className="nav-blur" style={{ position:'sticky', top:0, zIndex:50, padding:'12px 20px' }}>
          <div style={{ maxWidth:'480px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'11px',
                background:'linear-gradient(135deg,#1d4ed8,#0891b2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 14px rgba(59,130,246,0.4)' }}>
                <BarChart3 size={18} style={{ color:'#fff' }}/>
              </div>
              <div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'var(--text-p)' }}>Statement</span>
                <span className="grad-text" style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'1.05rem' }}>IQ</span>
              </div>
            </div>
            {/* Right side */}
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ background:'rgba(6,214,160,0.12)', color:'#06d6a0', fontSize:'0.58rem',
                padding:'3px 9px', borderRadius:'20px', border:'1px solid rgba(6,214,160,0.25)',
                fontWeight:700, letterSpacing:'0.08em' }}>BETA</span>
              <div style={{ width:'32px', height:'32px', borderRadius:'50%',
                background:'linear-gradient(135deg,#1e3a5f,#0d1526)',
                border:'1px solid var(--border-b)', display:'flex', alignItems:'center',
                justifyContent:'center', cursor:'pointer' }}>
                <span style={{ color:'var(--text-s)', fontSize:'0.75rem', fontWeight:700 }}>AK</span>
              </div>
            </div>
          </div>
        </nav>

        {/* ── Main scroll area ── */}
        <main style={{ flex:1, overflowY:'auto', padding:'24px 20px 110px', maxWidth:'480px', margin:'0 auto', width:'100%' }}>

          {/* Breadcrumb */}
          <div className="anim-fade-up flex items-center gap-2" style={{ marginBottom:'20px' }}>
            <span style={{ color:'var(--text-m)', fontSize:'0.75rem' }}>Dashboard</span>
            <ChevronRight size={12} style={{ color:'var(--text-m)' }}/>
            <span style={{ color:'var(--accent-blue)', fontSize:'0.75rem', fontWeight:600 }}>Documents</span>
          </div>

          {/* Page heading */}
          <div className="anim-fade-up-1" style={{ marginBottom:'24px' }}>
            <h1 style={{ fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:'6px' }}>
              Document <span className="grad-text">Upload</span>
            </h1>
            <p style={{ color:'var(--text-s)', fontSize:'0.88rem', lineHeight:1.6 }}>
              Upload receipts and bank statements to extract transactions with AI.
            </p>
          </div>

          {/* Info banner */}
          <div className="anim-fade-up-2 glass rounded-xl flex items-start gap-3" style={{ padding:'14px 16px', marginBottom:'24px' }}>
            <Info size={15} style={{ color:'var(--accent-blue)', flexShrink:0, marginTop:'2px' }}/>
            <div>
              <p style={{ color:'var(--text-s)', fontSize:'0.78rem', lineHeight:1.65 }}>
                Supported formats: <span style={{ color:'var(--text-p)', fontWeight:600 }}>PDF, JPG, PNG, WEBP, CSV</span>.
                Maximum file size: <span style={{ color:'var(--text-p)', fontWeight:600 }}>1 MB</span>.
                Files are processed securely and never stored.
              </p>
              <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
                {['PDF','JPG','PNG','WEBP','CSV'].map(f=><span key={f} className="fmt-badge">{f}</span>)}
              </div>
            </div>
          </div>

          {/* Upload card */}
          <div className="anim-fade-up-3 glass-b rounded-2xl" style={{ padding:'22px', marginBottom:'20px' }}>
            <div style={{ marginBottom:'18px' }}>
              <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'4px' }}>Upload Document</h2>
              <p style={{ color:'var(--text-s)', fontSize:'0.8rem' }}>
                Upload receipts or bank statements to automatically extract transactions
              </p>
            </div>

            {/* Drop zone */}
            <div
              className={`dropzone rounded-xl${dragOver ? ' drag-over' : ''}`}
              style={{ padding:'36px 20px', textAlign:'center' }}
              onClick={() => !uploading && fileRef.current?.click()}
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            >
              {/* Animated upload icon */}
              <div className="anim-float" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:'60px', height:'60px', borderRadius:'18px', marginBottom:'16px',
                background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)',
                boxShadow: dragOver ? '0 0 30px rgba(59,130,246,0.25)' : 'none' }}>
                <CloudUpload size={26} style={{ color: dragOver ? '#3b82f6' : 'var(--text-s)' }}/>
              </div>

              <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'6px', color:'var(--text-p)' }}>
                {dragOver ? 'Release to drop files' : 'Drop files here or click to upload'}
              </h3>
              <p style={{ color:'var(--text-m)', fontSize:'0.78rem', marginBottom:'20px' }}>
                PDF, images, CSV up to 1 MB each
              </p>

              <button
                className="btn-primary"
                style={{ padding:'10px 26px', borderRadius:'24px', color:'#fff',
                  fontWeight:700, fontSize:'0.85rem', display:'inline-flex',
                  alignItems:'center', gap:'8px', fontFamily:"'DM Sans',sans-serif",
                  pointerEvents: uploading ? 'none' : 'auto', opacity: uploading ? 0.6 : 1 }}
                onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                <Upload size={15}/>
                Choose File
              </button>
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.csv"
                style={{ display:'none' }} onChange={e => addFiles(e.target.files)}/>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl" style={{ marginTop:'14px',
                padding:'10px 14px', background:'rgba(248,113,113,0.08)',
                border:'1px solid rgba(248,113,113,0.25)' }}>
                <AlertTriangle size={14} style={{ color:'#f87171', flexShrink:0 }}/>
                <p style={{ color:'#fca5a5', fontSize:'0.78rem' }}>{error}</p>
              </div>
            )}
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="glass-b rounded-2xl" style={{ padding:'18px', marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                <h3 style={{ fontSize:'0.88rem', fontWeight:700 }}>
                  Files ({files.length})
                </h3>
                {!uploading && (
                  <button onClick={reset} className="btn-ghost flex items-center gap-1"
                    style={{ padding:'5px 12px', borderRadius:'8px', color:'var(--text-s)',
                      fontSize:'0.72rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>
                    <Trash2 size={11}/> Clear all
                  </button>
                )}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {files.map(({ name, size, progress, status }) => {
                  const { color, label } = fileIcon(name);
                  return (
                    <div key={name} className="file-card rounded-xl" style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        {/* Icon badge */}
                        <div style={{ width:'38px', height:'38px', borderRadius:'10px', flexShrink:0,
                          background:`${color}15`, border:`1px solid ${color}30`,
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1px' }}>
                          <File size={13} style={{ color }}/>
                          <span style={{ fontSize:'0.45rem', color, fontWeight:800, letterSpacing:'0.04em' }}>{label}</span>
                        </div>

                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ color:'var(--text-p)', fontSize:'0.82rem', fontWeight:600,
                            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</p>
                          <p style={{ color:'var(--text-m)', fontSize:'0.7rem', marginTop:'1px' }}>{fmtBytes(size)}</p>
                        </div>

                        {/* Status */}
                        <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:'8px' }}>
                          {status === 'done' && (
                            <CheckCircle size={17} style={{ color:'#06d6a0' }} className="check-pop"/>
                          )}
                          {status === 'uploading' && (
                            <div className="spin" style={{ width:'16px', height:'16px', borderRadius:'50%',
                              border:'2px solid rgba(59,130,246,0.2)', borderTopColor:'#3b82f6' }}/>
                          )}
                          {status === 'idle' && !uploading && (
                            <button onClick={() => removeFile(name)}
                              style={{ background:'none', border:'none', cursor:'pointer', padding:'2px',
                                color:'var(--text-m)', transition:'color 0.2s' }}
                              onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                              onMouseLeave={e=>e.currentTarget.style.color='var(--text-m)'}>
                              <X size={15}/>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {status !== 'idle' && (
                        <div style={{ marginTop:'10px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                            <span style={{ color:'var(--text-m)', fontSize:'0.65rem' }}>
                              {status==='done' ? 'Uploaded' : 'Uploading...'}
                            </span>
                            <span style={{ color: status==='done' ? '#06d6a0' : 'var(--accent-blue)',
                              fontSize:'0.65rem', fontWeight:700 }}>{progress}%</span>
                          </div>
                          <div style={{ height:'4px', borderRadius:'4px', background:'rgba(99,140,210,0.12)', overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:'4px', width:`${progress}%`,
                              background: status==='done'
                                ? 'linear-gradient(90deg,#06d6a0,#22d3ee)'
                                : 'linear-gradient(90deg,#3b82f6,#0891b2)',
                              transition:'width 0.15s linear' }} className={status!=='done'?'shimmer-bar':''}/>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Analyse button */}
              {!done && (
                <button
                  className="btn-primary"
                  onClick={runUpload}
                  disabled={uploading}
                  style={{ marginTop:'18px', width:'100%', padding:'13px',
                    borderRadius:'14px', color:'#fff', fontWeight:700, fontSize:'0.95rem',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    opacity: uploading ? 0.7 : 1,
                    fontFamily:"'DM Sans',sans-serif",
                    boxShadow: uploading ? 'none' : '0 0 30px rgba(59,130,246,0.25)' }}>
                  {uploading
                    ? <><div className="spin" style={{ width:'16px', height:'16px', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff' }}/> Processing…</>
                    : <><Brain size={17}/> Analyse with AI <ArrowRight size={15}/></>
                  }
                </button>
              )}
            </div>
          )}

          {/* AI Process Flow — visible while uploading or done */}
          {(uploading || done) && (
            <div className="glass-b rounded-2xl" style={{ padding:'20px', marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'18px' }}>
                <Sparkles size={14} style={{ color:'#818cf8' }}/>
                <h3 style={{ fontSize:'0.88rem', fontWeight:700 }}>AI Processing Pipeline</h3>
              </div>
              <ProcessFlow activeStep={flowStep < 0 ? 0 : flowStep}/>
            </div>
          )}

          {/* Done state */}
          {done && (
            <div style={{ background:'linear-gradient(135deg,rgba(6,214,160,0.08),rgba(59,130,246,0.06))',
              border:'1px solid rgba(6,214,160,0.25)', borderRadius:'20px', padding:'24px', textAlign:'center' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'50%', margin:'0 auto 14px',
                background:'rgba(6,214,160,0.12)', border:'2px solid #06d6a0',
                display:'flex', alignItems:'center', justifyContent:'center' }} className="check-pop">
                <CheckCircle size={26} style={{ color:'#06d6a0' }}/>
              </div>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, marginBottom:'8px' }}>Analysis Complete!</h3>
              <p style={{ color:'var(--text-s)', fontSize:'0.85rem', lineHeight:1.6, marginBottom:'20px' }}>
                Your statement has been fully analysed. Transactions categorised, health score computed, AI summary ready.
              </p>
              <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
                <button className="btn-primary flex items-center gap-2"
                  style={{ padding:'11px 24px', borderRadius:'12px', color:'#fff',
                    fontWeight:700, fontSize:'0.88rem', fontFamily:"'DM Sans',sans-serif" }}>
                  <Eye size={15}/> View Report
                </button>
                <button className="btn-ghost flex items-center gap-2"
                  style={{ padding:'11px 20px', borderRadius:'12px', color:'var(--text-p)',
                    fontWeight:600, fontSize:'0.88rem', fontFamily:"'DM Sans',sans-serif" }}
                  onClick={reset}>
                  <RefreshCw size={14}/> Upload Another
                </button>
              </div>
            </div>
          )}

          {/* Empty state tips — when no files yet */}
          {!files.length && !done && (
            <div className="glass rounded-2xl" style={{ padding:'20px' }}>
              <p style={{ color:'var(--text-m)', fontSize:'0.68rem', textTransform:'uppercase',
                letterSpacing:'0.1em', fontWeight:700, marginBottom:'14px' }}>What happens next?</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {[
                  { icon:FileText, color:'#3b82f6', t:'Upload your statement', d:'PDF, image, or CSV from any Indian bank' },
                  { icon:Brain,    color:'#818cf8', t:'AI extracts transactions', d:'Every debit and credit parsed automatically' },
                  { icon:Target,   color:'#06d6a0', t:'Smart categorisation', d:'Food, transport, shopping, and 12+ more tags' },
                  { icon:Zap,      color:'#f59e0b', t:'Instant insights', d:'Health score, trends, and AI-written summary' },
                ].map(({ icon:Icon, color, t, d }) => (
                  <div key={t} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <div style={{ width:'34px', height:'34px', borderRadius:'10px', flexShrink:0,
                      background:`${color}18`, border:`1px solid ${color}30`,
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={15} style={{ color }}/>
                    </div>
                    <div>
                      <p style={{ color:'var(--text-p)', fontSize:'0.82rem', fontWeight:600 }}>{t}</p>
                      <p style={{ color:'var(--text-m)', fontSize:'0.74rem', marginTop:'2px' }}>{d}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security micro note */}
              <div style={{ marginTop:'18px', display:'flex', alignItems:'center', gap:'8px',
                padding:'10px 12px', background:'rgba(59,130,246,0.06)',
                border:'1px solid rgba(59,130,246,0.15)', borderRadius:'10px' }}>
                <Shield size={13} style={{ color:'#3b82f6', flexShrink:0 }}/>
                <p style={{ color:'var(--text-m)', fontSize:'0.72rem', lineHeight:1.5 }}>
                  End-to-end encrypted · Never stored · GDPR ready
                </p>
              </div>
            </div>
          )}
        </main>

        {/* ── Bottom Tab Bar ── */}
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50,
          background:'rgba(7,11,20,0.95)', backdropFilter:'blur(20px)',
          borderTop:'1px solid rgba(99,140,210,0.12)', padding:'8px 0 12px' }}>
          <div style={{ maxWidth:'480px', margin:'0 auto', display:'flex', justifyContent:'space-around' }}>
            {NAV_TABS.map(({ icon:Icon, label, active }) => (
              <button key={label}
                className={`tab-item${active ? ' tab-active' : ''}`}
                style={{ background:'none', border:'none', display:'flex', flexDirection:'column',
                  alignItems:'center', gap:'5px', padding:'4px 10px',
                  color: active ? 'var(--accent-blue)' : 'var(--text-m)',
                  fontFamily:"'DM Sans',sans-serif" }}>
                {active
                  ? <div style={{ width:'40px', height:'40px', borderRadius:'13px',
                      background:'linear-gradient(135deg,#1d4ed8,#0891b2)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 4px 14px rgba(59,130,246,0.4)' }}>
                      <Icon size={18} style={{ color:'#fff' }}/>
                    </div>
                  : <Icon size={20}/>
                }
                <span style={{ fontSize:'0.62rem', fontWeight: active ? 700 : 500,
                  letterSpacing:'0.02em' }}>{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}