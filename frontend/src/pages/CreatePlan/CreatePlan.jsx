import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import './CreatePlan.css';

export default function CreatePlan() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState(null);

  const handleSubmit = (data) => {
    setProfile(data);
    setSubmitted(true);
    // In a real app, this would call POST /plans/generate
    // For now, just show a success state and navigate to workout
    setTimeout(() => {
      navigate('/workout');
    }, 2000);
  };

  return (
    <div className="create-plan" id="create-plan-page">
      <header className="create-plan__header">
        <h1 className="create-plan__title">Create Your Workout Plan</h1>
        <p className="create-plan__subtitle">
          Tell us about yourself and your goals. We'll generate a personalized
          weekly workout schedule tailored to you.
        </p>
      </header>

      {submitted ? (
        <div className="create-plan__success" id="create-plan-success">
          <span className="create-plan__success-icon">🎉</span>
          <h2 className="create-plan__success-title">Plan Generated!</h2>
          <p className="create-plan__success-text">
            Your <strong>{profile.fitness_goal.replaceAll('_', ' ')}</strong> plan for
            a <strong>{profile.experience_level}</strong> is ready.
            Redirecting to your workout…
          </p>
        </div>
      ) : (
        <ProfileForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}
