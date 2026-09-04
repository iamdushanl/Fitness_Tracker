import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import { createWorkoutPlan } from '../../lib/plans';
import StateScreen from '../../components/StateScreen/StateScreen';
import './CreatePlan.css';

export default function CreatePlan() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await createWorkoutPlan(data);

    if (error) {
      console.error('Supabase error creating workout plan:', error);
      let userFriendlyMsg = error.message || 'Failed to create workout plan';
      if (error.code === '42501') {
        userFriendlyMsg =
          'Row-Level Security violation: please execute the SQL script in docs/supabase_setup.sql in your Supabase SQL Editor to grant permissions.';
      } else if (error.code === '23503') {
        userFriendlyMsg =
          'Exercise seed data missing: please run the SQL script in docs/supabase_setup.sql in your Supabase SQL Editor to seed the exercises library.';
      }
      setErrorMsg(userFriendlyMsg);
      setSubmitting(false);
      return;
    }

    setProfile(data);
    setSubmitted(true);
    setSubmitting(false);

    setTimeout(() => {
      navigate('/workout');
    }, 1500);
  };

  return (
    <div className="create-plan" id="create-plan-page">
      <header className="create-plan__header">
        <h1 className="create-plan__title">Create Your Workout Plan</h1>
        <p className="create-plan__subtitle">
          Tell us about yourself and your goals. We'll generate a personalized
          weekly workout schedule and store it in your database.
        </p>
      </header>

      {errorMsg && (
        <div className="create-plan__error" role="alert">
          <span className="create-plan__error-icon">⚠️</span>
          <div className="create-plan__error-content">
            <h3 className="create-plan__error-title">Database Error</h3>
            <p className="create-plan__error-text">{errorMsg}</p>
          </div>
        </div>
      )}

      {submitting ? (
        <StateScreen variant="loading" text="Generating and saving your plan to Supabase…" />
      ) : submitted ? (
        <div className="create-plan__success" id="create-plan-success">
          <span className="create-plan__success-icon">🎉</span>
          <h2 className="create-plan__success-title">Plan Generated & Saved!</h2>
          <p className="create-plan__success-text">
            Your <strong>{profile?.fitness_goal.replaceAll('_', ' ')}</strong> plan for
            a <strong>{profile?.experience_level}</strong> is now live in Supabase.
            Redirecting to your workout…
          </p>
        </div>
      ) : (
        <ProfileForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}

