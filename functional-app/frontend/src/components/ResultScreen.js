import React from 'react';

const ResultScreen = ({ image, result, onRetake, onHome }) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '40px' }}>✅</div>
        <h2>Breed Identified!</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <img src={image} alt="Analyzed cattle" style={{ 
          width: '100%', 
          maxWidth: '300px', 
          height: 'auto', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }} />
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '10px' }}>
        <h1 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>{result.breed}</h1>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          Confidence: <strong>{Math.round(result.confidence * 100)}%</strong>
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#ddd',
          borderRadius: '5px',
          overflow: 'hidden',
          marginBottom: '15px'
        }}>
          <div style={{
            width: `${result.confidence * 100}%`,
            height: '100%',
            backgroundColor: '#4CAF50'
          }}></div>
        </div>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
          {result.description}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Key Characteristics</h3>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          {result.characteristics.map((char, index) => (
            <li key={index} style={{ margin: '5px 0' }}>{char}</li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onRetake} style={{
          backgroundColor: '#2196F3', color: 'white', padding: '12px 20px',
          border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          📷 Take Another Photo
        </button>
        
        <button onClick={onHome} style={{
          backgroundColor: '#4CAF50', color: 'white', padding: '12px 20px',
          border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          🏠 Back to Home
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;