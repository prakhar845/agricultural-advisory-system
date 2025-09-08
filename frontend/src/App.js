import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import Crops from './pages/Crops';
import IrrigationRecommendation from './pages/IrrigationRecommendation';
import FertilizerRecommendation from './pages/FertilizerRecommendation';
import Recommendations from './pages/Recommendations';
import DiseaseDetection from './pages/DiseaseDetection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms"
                  element={
                    <ProtectedRoute>
                      <Farms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:farmId"
                  element={
                    <ProtectedRoute>
                      <FarmDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:farmId/crops"
                  element={
                    <ProtectedRoute>
                      <Crops />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:farmId/crops/:cropId/irrigation"
                  element={
                    <ProtectedRoute>
                      <IrrigationRecommendation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:farmId/crops/:cropId/fertilizer"
                  element={
                    <ProtectedRoute>
                      <FertilizerRecommendation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:farmId/recommendations"
                  element={
                    <ProtectedRoute>
                      <Recommendations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/farms/:farmId/disease-detection"
                  element={
                    <ProtectedRoute>
                      <DiseaseDetection />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
