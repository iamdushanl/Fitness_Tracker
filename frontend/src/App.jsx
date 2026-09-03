import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import CreatePlan from './pages/CreatePlan/CreatePlan';
import Workout from './pages/Workout/Workout';
import ExerciseDetails from './pages/ExerciseDetails/ExerciseDetails';
import Progress from './pages/Progress/Progress';

export default function App() {
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
