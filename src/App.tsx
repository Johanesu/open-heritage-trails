import CesiumScene from './components/CesiumScene';

function App() {
  return (
    <main className="app-shell">
      <CesiumScene />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p className="eyebrow">Open-source 3D cultural-trail toolkit</p>
        <h1>Open Heritage Trails</h1>
        <p>Shikoku Henro · Temple 11 Fujiidera → Temple 12 Shōsanji</p>
      </div>
    </main>
  );
}

export default App;
