import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import GamePage from './pages/GamePage';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <ErrorBoundary name="ShadowCityRoot">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary name="ShadowCityGame">
                <GamePage />
              </ErrorBoundary>
            }
          />
          <Route
            path="*"
            element={
              <ErrorBoundary name="ShadowCityFallback">
                <GamePage />
              </ErrorBoundary>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}