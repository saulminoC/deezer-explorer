import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiHome, FiMusic, FiHeart, FiArrowLeft, FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2 } from "react-icons/fi";
import { FaDeezer } from "react-icons/fa";
import './App.css';

function App() {
  const [search, setSearch] = useState('');
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]); // <--- Nuevo: Lista de canciones
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estado del Reproductor
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null); // Referencia al elemento <audio> invisible

  const CORS_PROXY = "https://corsproxy.io/?";

  // Efecto para controlar Play/Pause cuando cambia la canción
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.preview; // Link del MP3 de 30seg
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const searchArtist = async (e) => {
    e.preventDefault();
    if (!search) return;
    setLoading(true);
    try {
      const res = await fetch(`${CORS_PROXY}https://api.deezer.com/search/artist?q=${search}`);
      const data = await res.json();
      setArtists(data.data);
      setSelectedArtist(null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getArtistDetails = async (artist) => {
    setLoading(true);
    setSelectedArtist(artist);
    try {
      // 1. Traer Álbumes
      const resAlbums = await fetch(`${CORS_PROXY}https://api.deezer.com/artist/${artist.id}/albums`);
      const dataAlbums = await resAlbums.json();
      setAlbums(dataAlbums.data);

      // 2. Traer Top Canciones (Para poder escuchar algo)
      const resTracks = await fetch(`${CORS_PROXY}https://api.deezer.com/artist/${artist.id}/top?limit=5`);
      const dataTracks = await resTracks.json();
      setTopTracks(dataTracks.data);

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Formatear segundos a min:seg
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="app-container">
      {/* Elemento de Audio Invisible (El motor real) */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* --- SIDEBAR --- */}
      <div className="sidebar">
        <div className="brand"><FaDeezer size={30} /> DeezerExplorer</div>
        <div className="nav-menu">
          <div className="nav-item active"><FiSearch size={24}/> Buscar</div>
          <div className="nav-item"><FiHome size={24}/> Inicio</div>
          <div className="nav-item"><FiMusic size={24}/> Tu Biblioteca</div>
        </div>
      </div>

      {/* --- MAIN VIEW --- */}
      <div className="main-view">
        {!selectedArtist && (
          <div className="search-header">
            <form onSubmit={searchArtist}>
              <div className="search-bar-container">
                <FiSearch size={20} color="var(--text-secondary)" />
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="¿Qué quieres escuchar?" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}

        {loading ? <h2 style={{marginTop:40, color:'#888'}}>Cargando...</h2> : 
         !selectedArtist ? (
          <div style={{marginTop: '20px'}}>
            {artists.length > 0 && <h2>Resultados principales</h2>}
            <div className="grid-layout">
              {artists.map(artist => (
                <div key={artist.id} className="card" onClick={() => getArtistDetails(artist)}>
                  <div className="artist-img-wrapper">
                    <img src={artist.picture_medium} alt={artist.name} style={{width:'100%'}} />
                  </div>
                  <div className="artist-name">{artist.name}</div>
                  <div className="artist-sub">Artista • {artist.nb_fan.toLocaleString()} fans</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* VISTA DETALLE ARTISTA */
          <div>
             <button className="back-btn" onClick={() => setSelectedArtist(null)}>
               <FiArrowLeft size={24}/> Volver
             </button>
            
            <div className="artist-hero">
              <img src={selectedArtist.picture_medium} className="hero-image" />
              <div className="hero-info">
                 <span style={{color: 'var(--text-secondary)'}}>Artista Verificado</span>
                 <h1>{selectedArtist.name}</h1>
                 <p>{selectedArtist.nb_fan.toLocaleString()} fans mensuales</p>
              </div>
            </div>

            {/* SECCIÓN NUEVA: TOP CANCIONES (PLAYABLE) */}
            <h2 style={{marginTop: '30px'}}>Populares</h2>
            <div className="track-list">
              {topTracks.map((track, index) => (
                <div 
                  key={track.id} 
                  className={`track-row ${currentTrack?.id === track.id ? 'active' : ''}`}
                  onClick={() => setCurrentTrack(track)}
                >
                  <div className="track-num">{index + 1}</div>
                  <img src={track.album.cover_small} style={{width: 40, borderRadius: 4}} />
                  <div className="track-info">
                    <span className="track-title" style={{ color: currentTrack?.id === track.id ? '#1db954' : '' }}>
                      {track.title}
                    </span>
                    <span className="track-duration">{formatTime(track.duration)}</span>
                  </div>
                </div>
              ))}
            </div>

            <h2>Álbumes</h2>
            <div className="grid-layout">
              {albums.map(album => (
                <div key={album.id} className="card">
                  <img src={album.cover_medium} className="album-cover" style={{width:'100%'}}/>
                  <div className="artist-name" style={{fontSize: '0.9rem'}}>{album.title}</div>
                  <div className="artist-sub">{new Date(album.release_date).getFullYear()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- REPRODUCTOR REAL (FOOTER) --- */}
      <div className="player-bar">
        {currentTrack ? (
          <>
            <div className="player-track-info">
               <img src={currentTrack.album.cover_medium} className="player-cover" />
               <div>
                 <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{currentTrack.title}</div>
                 <div style={{fontSize: '0.8rem', color: '#b3b3b3'}}>{currentTrack.artist.name}</div>
               </div>
            </div>
            
            <div className="player-controls">
               <div className="control-buttons">
                  <FiSkipBack style={{cursor:'pointer'}}/>
                  <div className="play-pause-btn" onClick={togglePlay}>
                    {isPlaying ? <FiPause /> : <FiPlay style={{marginLeft: 2}} />}
                  </div>
                  <FiSkipForward style={{cursor:'pointer'}}/>
               </div>
               {/* Barra de progreso visual (decorativa) */}
               <div style={{width:'100%', height: 4, background:'#555', borderRadius:2, position:'relative'}}>
                 <div style={{width: isPlaying ? '50%' : '0%', height:'100%', background:'white', borderRadius:2}}></div>
               </div>
            </div>

            <div className="volume-area">
               <FiVolume2 size={20} />
               <input type="range" min="0" max="100" />
            </div>
          </>
        ) : (
          <div style={{width:'100%', textAlign:'center', color:'#b3b3b3', fontSize:'0.9rem'}}>
            Selecciona una canción de la lista "Populares" para escuchar un preview 🎵
          </div>
        )}
      </div>
    </div>
  );
}

export default App;