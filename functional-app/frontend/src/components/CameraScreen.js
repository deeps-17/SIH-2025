// src/components/CameraScreen.js - Updated to connect to your real API
import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const CameraScreen = ({ onNavigateToResult }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = 'http://localhost:8000';  // Your FastAPI backend URL

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setError(null);
  }, [webcamRef]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert base64 to File object for API upload
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setError(null);
    
    try {
      // Convert image to file
      const imageFile = dataURLtoFile(capturedImage, 'cattle-image.jpg');
      
      // Create form data
      const formData = new FormData();
      formData.append('file', imageFile);
      
      console.log('🚀 Sending image to API...');
      
      // Call your real API
      const response = await fetch(`${API_BASE_URL}/predict-breed`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ API Response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Prediction failed');
      }
      
      // Navigate to results with real prediction
      onNavigateToResult(capturedImage, {
        breed: result.breed,
        confidence: result.confidence,
        characteristics: result.characteristics || [],
        description: result.description || `${result.breed} breed information`,
        modelUsed: result.model_used || 'AI Model',
        allPredictions: result.all_predictions || [],
        processingTime: result.processing_time || 'N/A'
      });
      
    } catch (error) {
      console.error('❌ Prediction error:', error);
      setError(error.message);
      
      // Fallback to mock data if API fails
      if (error.message.includes('fetch')) {
        setError('Cannot connect to AI server. Make sure the backend is running on http://localhost:8000');
        
        // Show instructions for starting backend
        alert(
          'Backend API not running!\n\n' +
          'To fix this:\n' +
          '1. Open a new terminal\n' +
          '2. Navigate to your backend folder\n' +
          '3. Run: python main.py\n' +
          '4. Try again once the server is running'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('🔍 API Health Check:', data);
      
      if (data.status === 'healthy') {
        alert(`✅ API Connected!\n\nModels Available:\n- Traditional ML: ${data.models_available.traditional_ml ? 'Yes' : 'No'}\n- CNN: ${data.models_available.cnn ? 'Yes' : 'No'}`);
      } else {
        alert('⚠️ API connected but models may not be loaded');
      }
    } catch (error) {
      alert(`❌ Cannot connect to API at ${API_BASE_URL}\n\nMake sure your backend server is running!`);
      console.error('API connection test failed:', error);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      {/* API Status Check */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>🔗 API Status</span>
        <button 
          onClick={testAPIConnection}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test Connection
        </button>
      </div>

      {/* Instructions */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#E8F5E8', 
        borderRadius: '10px' 
      }}>
        ℹ️ Take a clear photo showing the cattle's face and body for best results
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#ffebee',
          borderRadius: '10px',
          border: '1px solid #f44336',
          color: '#d32f2f'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Camera/Image Display */}
      <div style={{ 
        marginBottom: '20px', 
        minHeight: '300px', 
        border: '2px solid #ddd', 
        borderRadius: '10px', 
        overflow: 'hidden' 
      }}>
        {capturedImage ? (
          <div style={{ position: 'relative' }}>
            <img 
              src={capturedImage} 
              alt="Captured cattle" 
              style={{ width: '100%', height: 'auto' }} 
            />
            <button 
              onClick={() => {
                setCapturedImage(null);
                setError(null);
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🔄 Retake
            </button>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "environment" }}
              style={{ borderRadius: '10px' }}
              onUserMediaError={(error) => {
                console.error('Camera error:', error);
                setError('Camera access denied. Please allow camera permissions or use file upload.');
              }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        marginBottom: '20px'
      }}>
        {!capturedImage ? (
          <>
            <button 
              onClick={capturePhoto} 
              style={{
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '12px 20px',
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              📷 Capture Photo
            </button>
            
            <label style={{
              backgroundColor: '#2196F3', 
              color: 'white', 
              padding: '12px 20px',
              borderRadius: '5px', 
              cursor: 'pointer',
              fontSize: '16px'
            }}>
              📁 Upload File
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
              />
            </label>
          </>
        ) : (
          <button 
            onClick={analyzeImage}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#ccc' : '#FF6B35',
              color: 'white',
              padding: '15px 25px',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              minWidth: '200px'
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ marginRight: '10px' }}>⏳</span>
                Analyzing with AI...
              </div>
            ) : (
              '🔍 Identify Breed with AI'
            )}
          </button>
        )}
      </div>

      {/* Loading Progress */}
      {isLoading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#ddd',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div 
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#FF6B35',
                animation: 'loading 2s infinite'
              }}
            />
          </div>
          <p style={{ marginTop: '10px', color: '#666' }}>
            Processing image with your trained AI model...
          </p>
        </div>
      )}

      {/* Photo Tips */}
      <div style={{
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        padding: '15px',
        textAlign: 'left'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>📸 Tips for Better AI Predictions:</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          fontSize: '14px'
        }}>
          <div>✅ Good lighting</div>
          <div>✅ Animal centered in frame</div>
          <div>✅ Clear, not blurry</div>
          <div>✅ Include face and body</div>
          <div>✅ Single animal preferred</div>
          <div>✅ Natural background</div>
        </div>
      </div>

      {/* Backend Instructions */}
      <details style={{ marginTop: '20px', textAlign: 'left' }}>
        <summary style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          🔧 Backend Setup Instructions (Click to expand)
        </summary>
        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', marginTop: '10px', borderRadius: '5px' }}>
          <h4>To connect your trained model:</h4>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Make sure you've exported your trained models (use the export script)</li>
            <li>Install backend dependencies: <code>pip install fastapi uvicorn pillow opencv-python scikit-image</code></li>
            <li>Create a 'backend' folder and put the main.py file there</li>
            <li>Put your model files in 'backend/models/' folder</li>
            <li>Run the backend: <code>python main.py</code></li>
            <li>Test the API connection using the "Test Connection" button above</li>
            <li>Take a photo and get real AI predictions!</li>
          </ol>
          <p><strong>API should be running at:</strong> <code>http://localhost:8000</code></p>
        </div>
      </details>

      {/* CSS Animation for loading bar */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default CameraScreen;