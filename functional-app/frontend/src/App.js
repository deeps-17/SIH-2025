import React, { useState } from 'react';
import './App.css';
import HomeScreen from './components/HomeScreen';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [capturedImage, setCapturedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const navigateToCamera = () => setCurrentScreen('camera');
  const navigateToResult = (image, result) => {
    setCapturedImage(image);
    setPredictionResult(result);
    setCurrentScreen('result');
  };
  const navigateHome = () => {
    setCurrentScreen('home');
    setCapturedImage(null);
    setPredictionResult(null);
  };
  const navigateBack = () => {
    if (currentScreen === 'camera') setCurrentScreen('home');
    else if (currentScreen === 'result') setCurrentScreen('camera');
  };

  return (
    <div className="App">
      <header className="app-header">
        {currentScreen !== 'home' && (
          <button className="back-button" onClick={navigateBack}>←</button>
        )}
        <h1>Cattle Breed Recognition</h1>
        {currentScreen !== 'home' && (
          <button className="home-button" onClick={navigateHome}>🏠</button>
        )}
      </header>

      <main className="app-main">
        {currentScreen === 'home' && <HomeScreen onNavigateToCamera={navigateToCamera} />}
        {currentScreen === 'camera' && <CameraScreen onNavigateToResult={navigateToResult} />}
        {currentScreen === 'result' && (
          <ResultScreen 
            image={capturedImage} 
            result={predictionResult}
            onRetake={() => setCurrentScreen('camera')}
            onHome={navigateHome}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>AI-Powered Cattle Breed Identification</p>
      </footer>
    </div>
  );
}

export default App; 