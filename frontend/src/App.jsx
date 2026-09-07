import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import CreatePlan from './pages/CreatePlan/CreatePlan';
import Workout from './pages/Workout/Workout';
import ExerciseDetails from './pages/ExerciseDetails/ExerciseDetails';
import Progress from './pages/Progress/Progress';
import Landing from './pages/Landing/Landing';

/**
 * Renders app content or the landing page based on auth state.
 * Must be a child of AuthProvider so useAuth() works.
 */
function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading" id="app-loading-screen">
        <div className="app-loading__spinner" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-plan" element={<CreatePlan />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/exercise/:id" element={<ExerciseDetails />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

