import { useState } from 'react';
import './ProfileForm.css';

/**
 * Profile / onboarding form for creating a workout plan.
 * Props:
 *   onSubmit — callback(profileData)
 *   initialData — optional pre-filled data
 */
export default function ProfileForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: initialData.name ?? '',
    age: initialData.age ?? '',
    height_cm: initialData.height_cm ?? '',
    weight_kg: initialData.weight_kg ?? '',
    experience_level: initialData.experience_level ?? '',
    fitness_goal: initialData.fitness_goal ?? '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.age || Number(form.age) <= 0) errs.age = 'Enter a valid age';
    if (!form.height_cm || Number(form.height_cm) <= 0) errs.height_cm = 'Enter a valid height';
    if (!form.weight_kg || Number(form.weight_kg) <= 0) errs.weight_kg = 'Enter a valid weight';
    if (!form.experience_level) errs.experience_level = 'Select an experience level';
    if (!form.fitness_goal) errs.fitness_goal = 'Select a fitness goal';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit?.({
      name: form.name.trim(),
      age: Number(form.age),
      height_cm: Number(form.height_cm),
      weight_kg: Number(form.weight_kg),
      experience_level: form.experience_level,
      fitness_goal: form.fitness_goal,
    });
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} id="profile-form">
      <div className="profile-form__group">
        <label className="profile-form__field">
          <span className="profile-form__label">Name</span>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Alex Rivera" className="profile-form__input" />
          {errors.name && <span className="profile-form__error">{errors.name}</span>}
        </label>
      </div>

      <div className="profile-form__row">
        <label className="profile-form__field">
          <span className="profile-form__label">Age</span>
          <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="28" min="1" className="profile-form__input" />
          {errors.age && <span className="profile-form__error">{errors.age}</span>}
        </label>
        <label className="profile-form__field">
          <span className="profile-form__label">Height (cm)</span>
          <input type="number" name="height_cm" value={form.height_cm} onChange={handleChange} placeholder="175" min="1" className="profile-form__input" />
          {errors.height_cm && <span className="profile-form__error">{errors.height_cm}</span>}
        </label>
        <label className="profile-form__field">
          <span className="profile-form__label">Weight (kg)</span>
          <input type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange} placeholder="78" min="1" step="0.1" className="profile-form__input" />
          {errors.weight_kg && <span className="profile-form__error">{errors.weight_kg}</span>}
        </label>
      </div>

      <div className="profile-form__group">
        <span className="profile-form__label">Experience Level</span>
        <div className="profile-form__options">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button key={level} type="button"
              className={`profile-form__option ${form.experience_level === level ? 'profile-form__option--selected' : ''}`}
              onClick={() => { handleChange({ target: { name: 'experience_level', value: level } }); }}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        {errors.experience_level && <span className="profile-form__error">{errors.experience_level}</span>}
      </div>

      <div className="profile-form__group">
        <span className="profile-form__label">Fitness Goal</span>
        <div className="profile-form__options">
          {[
            { value: 'weight_loss', label: '🔥 Weight Loss' },
            { value: 'muscle_gain', label: '💪 Muscle Gain' },
            { value: 'general_fitness', label: '❤️ General Fitness' },
            { value: 'endurance', label: '🏃 Endurance' },
          ].map(({ value, label }) => (
            <button key={value} type="button"
              className={`profile-form__option ${form.fitness_goal === value ? 'profile-form__option--selected' : ''}`}
              onClick={() => { handleChange({ target: { name: 'fitness_goal', value } }); }}>
              {label}
            </button>
          ))}
        </div>
        {errors.fitness_goal && <span className="profile-form__error">{errors.fitness_goal}</span>}
      </div>

      <button type="submit" className="profile-form__submit">Generate My Plan ✨</button>
    </form>
  );
}
