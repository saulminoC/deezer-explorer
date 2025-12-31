import { useState, useRef, useEffect } from 'react';
import { 
  FiSearch, FiHome, FiMusic, FiHeart, FiArrowLeft, 
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2 
} from "react-icons/fi";
import { FaDeezer, FaHeart } from "react-icons/fa";
import './App.css';

function App() {
  // --- ESTADOS DE NAVEGACIÓN Y DATOS ---
  const [view, setView] = useState('search'); // 'search' | 'favorites'
  const [search, setSearch] = useState('');
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- ESTADO DE FAVORITOS (PERSISTENCIA) ---
  const [favorites, setFavorites] = useState([]);

  // --- ESTADO DEL REPRODUCTOR ---
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Proxy para evitar bloqueo CORS de Deezer
  const CORS_PROXY = "https://corsproxy.io/?";

  // ------------------------------------------------------
  // 1. EFECTOS (Lógica Automática)
  // ------------------------------------------------------

  // A. Cargar favoritos al iniciar la app
  useEffect(() => {
    const saved = localStorage.getItem('deezer_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // B. Guardar favoritos cada vez que cambien
  useEffect(() => {
    localStorage.setItem('deezer_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // C. BUSCADOR EN TIEMPO REAL (Debounce)
  useEffect(() => {
    // Si el input está vacío, limpiamos o no hacemos nada
    if (!search.trim()) {
      if (view === 'search' && !selectedArtist) {
         // Opcional: Limpiar resultados si borras todo
         // setArtists([]); 
      }
      return;
    }

    // Esperar 500ms después de que el usuario deje de escribir
    const delaySearch = setTimeout(() => {
      searchArtistAutomatic();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [search]);

  // D. Controlar Audio (Play/Pause) cuando cambia la canción
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.preview;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Error reproduciendo:", e));
    }
  }, [currentTrack]);

  // ------------------------------------------------------
  // 2. FUNCIONES LÓGICAS
  // ------------------------------------------------------

  const searchArtistAutomatic = async () => {
    setLoading(true);
    if (view !== 'search') setView('search'); // Forzar vista de búsqueda
    
    try {
      const res = await fetch(`${CORS_PROXY}https://api.deezer.com/search/artist?q=${search}`);
      const data = await res.json();
      setArtists(data.data || []);
      // No reseteamos selectedArtist aquí para no cerrar el perfil si buscas otra cosa
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const getArtistDetails = async (artist) => {
    setLoading(true);
    setSelectedArtist(artist);
    setSearch(''); // Limpiar buscador visualmente
    try {
      // 1. Traer Álbumes
      const resAlbums = await fetch(`${CORS_PROXY}https://api.deezer.com/artist/${artist.id}/albums`);
      const dataAlbums = await resAlbums.json();
      setAlbums(dataAlbums.data || []);

      // 2. Traer Top Canciones
      const resTracks = await fetch(`${CORS_PROXY}https://api.deezer.com/artist/${artist.id}/top?limit=20`);
      const dataTracks = await resTracks.json();
      setTopTracks(dataTracks.data || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const toggleFavorite = (track) => {
    const exists = favorites.find(f => f.id === track.id);
    if (exists) {
      setFavorites(favorites.filter(f => f.id !== track.id));
    } else {
      setFavorites([...favorites, track]);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ------------------------------------------------------
  // 3. RENDERIZADO DE COMPONENTES
  // ------------------------------------------------------

  // Helper para renderizar listas de canciones
  const renderTrackList = (tracks) => (
    <div className="track-list">
      {tracks.map((track, index) => {
        const isFav = favorites.some(f => f.id === track.id);
        const isActive = currentTrack?.id === track.id;
        
        return (
          <div 
            key={track.id} 
            className={`track-row ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentTrack(track)}
          >
            <div className="track-num">
              {isActive && isPlaying ? <FiVolume2 className="animate-pulse"/> : index + 1}
            </div>
            
            <img 
              src={track.album.cover_small} 
              alt={track.title}
              style={{width: 40, height: 40, borderRadius: 4, marginRight: 10, objectFit: 'cover'}} 
            />
            
            <div className="track-info">
              <span className="track-title" style={{ color: isActive ? '#c026d3' : '' }}>
                {track.title}
              </span>
              <span className="track-duration" style={{fontSize: '0.8rem', opacity: 0.7}}>
                {track.artist.name}
              </span>
            </div>

            <div style={{marginRight: 10, fontSize: '0.85rem', opacity: 0.6}}>
                {formatTime(track.duration)}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: isFav ? '#ec4899' : '#666' }}
            >
              {isFav ? <FaHeart /> : <FiHeart />}
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="app-container">
      {/* Elemento de Audio Invisible */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* --- SIDEBAR --- */}
      <div className="sidebar">
        <div className="brand">
          <FaDeezer size={30} style={{marginRight: 10}} /> DeezerExplorer
        </div>
        <div className="nav-menu">
          <div 
            className={`nav-item ${view === 'search' ? 'active' : ''}`} 
            onClick={() => { setView('search'); setSelectedArtist(null); }}
          >
            <FiSearch size={24}/> Buscar
          </div>
          <div 
            className={`nav-item ${view === 'favorites' ? 'active' : ''}`} 
            onClick={() => { setView('favorites'); setSelectedArtist(null); }}
          >
            <FiHeart size={24}/> Favoritos
          </div>
        </div>
      </div>

      {/* --- MAIN VIEW --- */}
      <div className="main-view">
        
        {/* HEADER DE BÚSQUEDA (Solo visible en vista Search y si no hay artista seleccionado) */}
        {view === 'search' && !selectedArtist && (
          <div className="search-header">
            <div className="search-bar-container">
              <FiSearch size={20} color="var(--text-secondary)" />
              <input 
                type="text" 
                className="search-input"
                placeholder="Busca artistas, temas..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ marginTop: view === 'search' && !selectedArtist ? '20px' : '0' }}>
            
            {loading && <h2 style={{color:'#888', textAlign:'center'}}>Cargando...</h2>}

            {/* CASO 1: VISTA FAVORITOS */}
            {view === 'favorites' && !selectedArtist && (
              <div>
                <h1 style={{fontSize: '2rem', marginBottom: 20}}>❤️ Mis Favoritos</h1>
                {favorites.length === 0 ? (
                  <div style={{textAlign: 'center', marginTop: 50, color: '#888'}}>
                    <FiMusic size={50} style={{marginBottom: 20}}/>
                    <p>No tienes canciones guardadas.</p>
                  </div>
                ) : (
                  renderTrackList(favorites)
                )}
              </div>
            )}

            {/* CASO 2: RESULTADOS DE BÚSQUEDA (GRID ARTISTAS) */}
            {view === 'search' && !selectedArtist && !loading && (
              <>
                {artists.length > 0 ? (
                   <div className="grid-layout">
                    {artists.map(artist => (
                      <div key={artist.id} className="card" onClick={() => getArtistDetails(artist)}>
                        <div className="artist-img-wrapper">
                          <img src={artist.picture_medium} alt={artist.name} />
                        </div>
                        <div className="artist-name">{artist.name}</div>
                        <div className="artist-sub">{artist.nb_fan.toLocaleString()} fans</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  search.trim() && <p style={{color:'#666', textAlign:'center'}}>No se encontraron resultados.</p>
                )}
              </>
            )}

            {/* CASO 3: DETALLE DE ARTISTA */}
            {selectedArtist && !loading && (
              <div>
                <button className="back-btn" onClick={() => setSelectedArtist(null)}>
                  <FiArrowLeft size={24}/> Volver
                </button>
                
                <div className="artist-hero">
                  <img src={selectedArtist.picture_medium} className="hero-image" alt={selectedArtist.name}/>
                  <div className="hero-info">
                    <span style={{color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: 1}}>Artista Verificado</span>
                    <h1>{selectedArtist.name}</h1>
                    <p>{selectedArtist.nb_fan.toLocaleString()} fans mensuales</p>
                  </div>
                </div>

                <h2 style={{marginTop: '40px', marginBottom: '20px'}}>Populares</h2>
                {renderTrackList(topTracks)}

                <h2 style={{marginTop: '40px', marginBottom: '20px'}}>Álbumes</h2>
                <div className="grid-layout">
                  {albums.map(album => (
                    <div key={album.id} className="card">
                      <img src={album.cover_medium} className="album-cover" alt={album.title}/>
                      <div className="artist-name" style={{fontSize: '0.9rem', marginTop: 10}}>{album.title}</div>
                      <div className="artist-sub">{new Date(album.release_date).getFullYear()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* --- PLAYER BAR (FOOTER) --- */}
      <div className="player-bar">
        {currentTrack ? (
          <>
            {/* Info de la canción */}
            <div className="player-track-info">
               <img src={currentTrack.album.cover_medium} className="player-cover" alt="Cover"/>
               <div style={{overflow: 'hidden'}}>
                 <div style={{fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {currentTrack.title}
                 </div>
                 <div style={{fontSize: '0.75rem', color: '#b3b3b3'}}>
                    {currentTrack.artist.name}
                 </div>
               </div>
               <button 
                  onClick={() => toggleFavorite(currentTrack)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 15, color: favorites.some(f => f.id === currentTrack.id) ? '#ec4899' : '#666' }}
               >
                 {favorites.some(f => f.id === currentTrack.id) ? <FaHeart /> : <FiHeart />}
               </button>
            </div>
            
            {/* Controles centrales */}
            <div className="player-controls">
               <div className="control-buttons">
                  <FiSkipBack style={{cursor:'pointer', opacity: 0.7}}/>
                  <div className="play-pause-btn" onClick={togglePlay}>
                    {isPlaying ? <FiPause /> : <FiPlay style={{marginLeft: 2}} />}
                  </div>
                  <FiSkipForward style={{cursor:'pointer', opacity: 0.7}}/>
               </div>
               {/* Barra de progreso decorativa */}
               <div style={{width:'100%', height: 4, background:'#404040', borderRadius:2, marginTop: 8}}>
                 <div style={{
                    width: isPlaying ? '100%' : '0%', 
                    height:'100%', 
                    background:'white', 
                    borderRadius:2,
                    transition: 'width 30s linear' // Animación simple de 30s (duración del preview)
                 }}></div>
               </div>
            </div>

            {/* Volumen */}
            <div className="volume-area">
               <FiVolume2 size={20} style={{color: '#b3b3b3'}} />
               <input type="range" min="0" max="100" defaultValue="80" />
            </div>
          </>
        ) : (
          <div style={{width:'100%', textAlign:'center', color:'#666', fontSize:'0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10}}>
            <FiMusic /> Selecciona una canción para escuchar
          </div>
        )}
      </div>
    </div>
  );
}

export default App;