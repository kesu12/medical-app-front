import React, { useState } from 'react';
import { 
  submitMedicalIndicators, 
  generateRandomIndicators, 
  getLatestIndicators,
  analyzeMedicalIndicators,
  MedicalIndicators,
  MedicalIndicatorsSubmitResponse,
  MedicalIndicatorsAnalysis
} from '../api/medicalIndicators';

const MedicalIndicatorsPage: React.FC = () => {
  const [indicators, setIndicators] = useState<MedicalIndicators>({
    heartrate: 75,
    temperature: 36.6,
    spo2: 98,
    patientId: 1
  });
  
  const [submitResponse, setSubmitResponse] = useState<MedicalIndicatorsSubmitResponse | null>(null);
  const [analysis, setAnalysis] = useState<MedicalIndicatorsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof MedicalIndicators, value: string) => {
    const numValue = parseFloat(value);
    setIndicators(prev => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSubmitResponse(null);
    
    try {
      const response = await submitMedicalIndicators(indicators);
      setSubmitResponse(response);
    } catch (err: any) {
      setError(err.message || 'Failed to submit indicators');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const result = await analyzeMedicalIndicators(indicators);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze indicators');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRandom = async (includeCritical: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const randomData = await generateRandomIndicators(includeCritical);
      setIndicators(randomData);
      setSubmitResponse(null);
      setAnalysis(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate random indicators');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLatest = async () => {
    if (!indicators.patientId) {
      setError('Please enter a patient ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const latestData = await getLatestIndicators(indicators.patientId);
      setIndicators(latestData);
      setSubmitResponse(null);
      setAnalysis(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load latest indicators');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (alertLevel?: string) => {
    switch (alertLevel) {
      case 'EMERGENCY':
        return '#d32f2f';
      case 'CRITICAL':
        return '#f57c00';
      case 'WARNING':
        return '#fbc02d';
      case 'NORMAL':
        return '#388e3c';
      default:
        return '#666';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Medical Indicators</h1>
      
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Input Indicators</h2>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Patient ID:
            </label>
            <input
              type="number"
              value={indicators.patientId || ''}
              onChange={(e) => handleInputChange('patientId', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Heart Rate (bpm):
            </label>
            <input
              type="number"
              value={indicators.heartrate}
              onChange={(e) => handleInputChange('heartrate', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Temperature (°C):
            </label>
            <input
              type="number"
              step="0.1"
              value={indicators.temperature}
              onChange={(e) => handleInputChange('temperature', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              SpO2 (%):
            </label>
            <input
              type="number"
              value={indicators.spo2}
              onChange={(e) => handleInputChange('spo2', e.target.value)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Submit
          </button>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Analyze
          </button>

          <button
            onClick={handleLoadLatest}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Load Latest
          </button>

          <button
            onClick={() => handleGenerateRandom(false)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f57c00',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Random Normal
          </button>

          <button
            onClick={() => handleGenerateRandom(true)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Random Critical
          </button>
        </div>
      </div>

      {submitResponse && (
        <div style={{ 
          border: '2px solid ' + getAlertColor(submitResponse.alertLevel),
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}>
          <h2 style={{ color: getAlertColor(submitResponse.alertLevel) }}>
            Submit Response
          </h2>
          <p><strong>Status:</strong> {submitResponse.status}</p>
          <p><strong>Message:</strong> {submitResponse.message}</p>
          <p><strong>Category:</strong> {submitResponse.category}</p>
          <p><strong>Alert Level:</strong> {submitResponse.alertLevel}</p>
          {submitResponse.criticalStatus && (
            <p><strong>Critical Status:</strong> {submitResponse.criticalStatus}</p>
          )}
          <p><strong>Timestamp:</strong> {new Date(submitResponse.timestamp).toLocaleString()}</p>
        </div>
      )}

      {analysis && (
        <div style={{ 
          border: '1px solid #ddd',
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fff'
        }}>
          <h2>Analysis Results</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            <p><strong>Heart Rate Status:</strong> {analysis.heartrateStatus}</p>
            <p><strong>Temperature Status:</strong> {analysis.temperatureStatus}</p>
            <p><strong>SpO2 Status:</strong> {analysis.spo2Status}</p>
            <p><strong>Overall Status:</strong> {analysis.overallStatus}</p>
            <p><strong>Category:</strong> {analysis.category}</p>
            <p><strong>Critical:</strong> {analysis.isCritical ? 'Yes' : 'No'}</p>
            <p><strong>Requires Attention:</strong> {analysis.requiresAttention ? 'Yes' : 'No'}</p>
            {analysis.recommendations && (
              <div>
                <strong>Recommendations:</strong>
                <p style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  marginTop: '5px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {analysis.recommendations}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalIndicatorsPage;
