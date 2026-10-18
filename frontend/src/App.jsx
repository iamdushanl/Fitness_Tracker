import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import BottomNav from './components/BottomNav/BottomNav';
import Dashboard from './pages/Dashboard/Dashboard';
import CreatePlan from './pages/CreatePlan/CreatePlan';
import Plan from './pages/Plan/Plan';
import Workout from './pages/Workout/Workout';
import ExerciseDetails from './pages/ExerciseDetails/ExerciseDetails';
import Exercises from './pages/Exercises/Exercises';
import Progress from './pages/Progress/Progress';
import Recovery from './pages/Recovery/Recovery';
import Profile from './pages/Profile/Profile';
import DesignSystem from './pages/DesignSystem/DesignSystem';
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
      <div className="app-shell" id="app-shell-root">
        <Sidebar />
        <div className="main-panel">
          <Topbar />
          <main className="content-area page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create-plan" element={<CreatePlan />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/exercise/:id" element={<ExerciseDetails />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/recovery" element={<Recovery />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/design-system" element={<DesignSystem />} />
            </Routes>
          </main>
        </div>
        <BottomNav />
      </div>
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
