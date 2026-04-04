import React from 'react';

const HomeScreen = ({ onNavigateToCamera }) => {
  const supportedBreeds = ['Sahiwal', 'Gir', 'Holstein Friesian', 'Ayrshire', 'Brown Swiss'];

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '60px', marginBottom: '20px' }}>🐄</div>
      <h2>Cattle Breed Recognition</h2>
      <p>AI-powered breed identification for Indian cattle</p>
      
      <button 
        onClick={onNavigateToCamera}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px 30px',
          fontSize: '18px',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          margin: '20px 0'
        }}
      >
        📷 Identify Breed
      </button>

      <div style={{ marginTop: '30px' }}>
        <h3>Supported Breeds</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          {supportedBreeds.map((breed, index) => (
            <span key={index} style={{
              backgroundColor: '#E8F5E8',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              {breed}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;