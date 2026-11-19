import { useEffect, useMemo, useState } from "react";
import {
  Activity, AudioLines, Bell, ChevronDown, CircleHelp, Compass, Disc3,
  Heart, Home, Library, ListMusic, LogOut, Maximize2, MoreHorizontal,
  Pause, Play, Plus, Search, SkipBack, SkipForward, SlidersHorizontal,
  Volume2, X
} from "lucide-react";
import {
  completeLogin, controlPlayback, getFeaturedTracks, getProfile, getToken,
  isConfigured, login, logout, playTrack, type SpotifyTrack
} from "./spotify";

const demoTracks: SpotifyTrack[] = [
  { id:"d1", name:"Midnight City", uri:"", duration_ms:244000, artists:[{name:"M83"}], album:{name:"Hurry Up, We're Dreaming",images:[{url:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600"}]} },
  { id:"d2", name:"A Moment Apart", uri:"", duration_ms:236000, artists:[{name:"ODESZA"}], album:{name:"A Moment Apart",images:[{url:"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600"}]} },
  { id:"d3", name:"Intro", uri:"", duration_ms:130000, artists:[{name:"The xx"}], album:{name:"xx",images:[{url:"https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600"}]} },
  { id:"d4", name:"Sunset Lover", uri:"", duration_ms:220000, artists:[{name:"Petit Biscuit"}], album:{name:"Presence",images:[{url:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600"}]} },
  { id:"d5", name:"Tadow", uri:"", duration_ms:315000, artists:[{name:"Masego, FKJ"}], album:{name:"Lady Lady",images:[{url:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600"}]} }
];
const artwork = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=700"
];

export default function App() {
  const [connected, setConnected] = useState(Boolean(getToken()));
  const [profile, setProfile] = useState<{display_name:string; images:{url:string}[]}|null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>(demoTracks);
  const [current, setCurrent] = useState<SpotifyTrack>(demoTracks[0]);
  const [playing, setPlaying] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState("Home");

  useEffect(() => {
    completeLogin().then(done => { if (done) setConnected(true); }).catch(e => setNotice(e.message));
  }, []);
  useEffect(() => {
    if (!connected) return;
    Promise.all([getProfile(), getFeaturedTracks()])
      .then(([p, t]) => { setProfile(p); if (t.length) { setTracks(t); setCurrent(t[0]); } })
      .catch(e => setNotice(e.message));
  }, [connected]);

  const filtered = useMemo(() => tracks.filter(t =>
    `${t.name} ${t.artists.map(a => a.name).join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [tracks, query]);

  async function startTrack(track: SpotifyTrack) {
    setCurrent(track);
    if (!track.uri) { setNotice("Demo mode: connect Spotify to play full tracks."); return; }
    try { await playTrack(track.uri); setPlaying(true); setNotice(""); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Playback unavailable."); }
  }
  async function playback(action: "pause"|"next"|"previous") {
    if (!connected) { setPlaying(action === "pause" ? false : playing); return; }
    try { await controlPlayback(action); if (action === "pause") setPlaying(false); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Playback command failed."); }
  }
  function connect() { login().catch(e => setNotice(e.message)); }
  function disconnect() { logout(); setConnected(false); setProfile(null); setTracks(demoTracks); setCurrent(demoTracks[0]); setPlaying(false); }

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <aside className="sidebar glass">
      <a className="brand" href="#"><span className="brand-mark"><AudioLines size={22}/></span><span>redwave<span className="brand-dot">.</span></span></a>
      <div className="nav-label">WORKSPACE</div>
      {[
        [Home,"Home"],[Compass,"Discover"],[Search,"Search"],[Library,"Your Library"]
      ].map(([Icon,label]: any) => <button key={label} onClick={()=>setActive(label)} className={`nav-item ${active===label?"selected":""}`}><Icon size={18}/>{label}</button>)}
      <div className="sidebar-rule"/>
      <div className="nav-label row-label">YOUR COLLECTION <button className="icon-button"><Plus size={15}/></button></div>
      {["Liked tracks","Late night drive","Focus mode","Electronic finds"].map((name,i)=><button className="playlist-link" key={name} onClick={()=>setActive(name)}><span className={`playlist-art art-${i}`}>{i===0?<Heart size={15}/>:<Disc3 size={15}/>}</span>{name}</button>)}
      <div className="sidebar-bottom">
        <div className="privacy-pill"><span className="pulse-dot"/> Privacy mode <span className="on">ON</span></div>
        <div className="sidebar-user"><div className="avatar">{profile?.display_name?.[0] || "R"}</div><div className="user-meta"><b>{profile?.display_name || "Guest listener"}</b><small>{connected ? "Spotify connected" : "Local preview mode"}</small></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>

    <section className="main-column">
      <header className="topbar">
        <div className="history-controls"><button className="round-control">‹</button><button className="round-control">›</button></div>
        <div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="What do you want to listen to?"/><kbd>⌘ K</kbd></div>
        <div className="top-actions"><button className="icon-button"><Bell size={18}/></button><button className="profile-chip" onClick={connected?disconnect:connect}><span className="avatar small">{profile?.display_name?.[0] || "R"}</span>{connected ? "Disconnect" : "Connect Spotify"}<ChevronDown size={14}/></button></div>
      </header>

      <div className="content-scroll">
        <div className="greeting-row"><div><div className="eyebrow"><span className="pulse-dot"/> YOUR PERSONAL SOUNDSPACE</div><h1>Feel the <em>frequency.</em></h1><p className="subheading">A little space to find your next favourite sound.</p></div><button className="tune-button"><SlidersHorizontal size={16}/> Customize</button></div>
        {notice && <div className="notice"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={15}/></button></div>}

        <section className="hero-card glass">
          <div className="hero-copy"><div className="eyebrow">CURATED FOR YOUR MOMENT</div><div className="hero-tag">FEATURED MIX <span>✦</span></div><h2>After hours<br/><em>in motion.</em></h2><p>Soft edges. Deep focus. Sounds for wherever the night takes you.</p><button className="primary-button" onClick={()=>startTrack(tracks[0])}><Play size={16} fill="currentColor"/> Explore mix</button></div>
          <div className="hero-art"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="hero-disc"><div className="disc-center"/></div><div className="hero-glow"/></div>
          <div className="hero-index">01 <span>/ 04</span></div>
        </section>

        <section className="section-block">
          <div className="section-heading"><div><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h3>In your rotation</h3></div><button className="text-link">See all <span>↗</span></button></div>
          <div className="mix-grid">{artwork.map((src,i)=><button className="mix-card glass" key={src} onClick={()=>startTrack(tracks[i%tracks.length])}><div className="mix-image"><img src={src} alt="Abstract album artwork"/><span className="mix-play"><Play size={17} fill="currentColor"/></span></div><b>{["Night drive","Deep focus","Open skies","New energy"][i]}</b><small>{["Electronic • 42 tracks","Ambient • 36 tracks","Indie • 28 tracks","Chill • 31 tracks"][i]}</small></button>)}</div>
        </section>

        <section className="section-block track-section">
          <div className="section-heading"><div><div className="eyebrow">YOUR RECENT LISTENING</div><h3>Recently played</h3></div><button className="text-link">View history <span>↗</span></button></div>
          <div className="track-table">
            <div className="track-header"><span>#</span><span>TITLE</span><span>ALBUM</span><span><Activity size={14}/></span></div>
            {filtered.map((track,i)=><button key={track.id} className={`track-row ${current.id===track.id?"is-current":""}`} onClick={()=>startTrack(track)}><span className="track-number">{current.id===track.id&&playing?<AudioLines size={16}/>:String(i+1).padStart(2,"0")}</span><span className="track-title"><img src={track.album.images[0]?.url || artwork[i%4]} alt=""/><span><b>{track.name}</b><small>{track.artists.map(a=>a.name).join(", ")}</small></span></span><span className="track-album">{track.album.name}</span><span className="track-duration">{Math.floor(track.duration_ms/60000)}:{String(Math.floor(track.duration_ms/1000)%60).padStart(2,"0")}</span></button>)}
            {filtered.length===0&&<div className="empty-state">No tracks match that search.</div>}
          </div>
        </section>
        <footer className="footer-note"><span>REDWAVE / OPEN SOURCE MUSIC CLIENT</span><span>BUILT FOR THE LISTENING EXPERIENCE · 2025</span></footer>
      </div>
    </section>

    <aside className="right-rail">
      <div className="rail-top"><span>NOW PLAYING</span><button className="icon-button"><MoreHorizontal size={19}/></button></div>
      <div className="now-art"><img src={current.album.images[0]?.url || artwork[0]} alt="Current album artwork"/><div className="art-overlay"><span>REDWAVE SELECTS</span><Maximize2 size={16}/></div></div>
      <div className="now-title"><div><h3>{current.name}</h3><p>{current.artists.map(a=>a.name).join(", ")}</p></div><button className="like-button"><Heart size={19}/></button></div>
      <div className="rail-album glass"><div className="mini-art"><img src={current.album.images[0]?.url || artwork[0]} alt=""/></div><div><b>{current.album.name}</b><small>Album</small></div><ChevronDown size={16}/></div>
      <div className="queue-heading"><b>Up next</b><button className="text-link">Open queue</button></div>
      {tracks.filter(t=>t.id!==current.id).slice(0,3).map(t=><button className="queue-item" key={t.id} onClick={()=>startTrack(t)}><img src={t.album.images[0]?.url || artwork[1]} alt=""/><span><b>{t.name}</b><small>{t.artists[0]?.name}</small></span><Play size={14}/></button>)}
      <div className="rail-bottom"><div className="privacy-card glass"><div className="privacy-icon"><SlidersHorizontal size={17}/></div><div><b>Quiet by design</b><p>Minimal tracking. Your listening stays yours.</p></div></div><button className="help-link"><CircleHelp size={15}/> About Redwave</button></div>
    </aside>

    <div className="player-bar glass">
      <div className="player-track"><img src={current.album.images[0]?.url || artwork[0]} alt=""/><div><b>{current.name}</b><small>{current.artists.map(a=>a.name).join(", ")}</small></div><button className="icon-button"><Heart size={16}/></button></div>
      <div className="player-center"><div className="player-controls"><button onClick={()=>playback("previous")}><SkipBack size={17} fill="currentColor"/></button><button className="play-main" onClick={()=>connected?playback("pause"):(setPlaying(!playing),setNotice("Demo preview only — connect Spotify for playback."))}>{playing?<Pause size={18} fill="currentColor"/>:<Play size={18} fill="currentColor"/>}</button><button onClick={()=>playback("next")}><SkipForward size={17} fill="currentColor"/></button></div><div className="timeline"><span>0:00</span><div className="progress"><i/></div><span>{Math.floor(current.duration_ms/60000)}:{String(Math.floor(current.duration_ms/1000)%60).padStart(2,"0")}</span></div></div>
      <div className="player-extra"><ListMusic size={17}/><Volume2 size={17}/><div className="volume-line"><i/></div></div>
    </div>
  </main>;
}
