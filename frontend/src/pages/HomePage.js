const HomePage = () => {
  
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#ff6b00' }}>
          ☁️ My Cloud
        </h1>
        <p style={{ fontSize: '20px', color: '#cccccc', maxWidth: '600px', margin: '0 auto 30px' }}>
          Облачное хранилище для ваших файлов.
          <br/>
          Загружайте и скачивайте файлы где угодно.
        </p>

        <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
          <div>
            <h3 style={{ color: '#ff6b00' }}>📤 Загрузка</h3>
          </div>
          <div>
            <h3 style={{ color: '#ff6b00' }}>📥 Скачивание</h3>
          </div>
          <div>
            <h3 style={{ color: '#ff6b00' }}>🛡️ Безопасность</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;