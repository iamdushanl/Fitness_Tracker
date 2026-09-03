import { useState } from 'react';
import './WorkoutLogForm.css';

/**
 * Form for recording actual performance against a plan exercise.
 * Props:
 *   planExercise — the plan_exercise row
 *   exercise     — the exercise object (for category detection)
 *   onSave       — callback(logData) when user saves
 *   onCancel     — callback when user cancels
 */
export default function WorkoutLogForm({ planExercise, exercise, onSave, onCancel }) {
  const isStrength = exercise?.category === 'strength';

  const [formData, setFormData] = useState({
    actual_sets: planExercise.target_sets ?? '',
    actual_reps: planExercise.target_reps ?? '',
    actual_weight_kg: planExercise.target_weight_kg ?? '',
    actual_duration_min: planExercise.target_duration_min ?? '',
    actual_distance_km: planExercise.target_distance_km ?? '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      plan_exercise_id: planExercise.id,
      performed_at: new Date().toISOString(),
      actual_sets: isStrength ? Number(formData.actual_sets) || null : null,
      actual_reps: isStrength ? Number(formData.actual_reps) || null : null,
      actual_weight_kg: isStrength ? Number(formData.actual_weight_kg) || null : null,
      actual_duration_min: !isStrength ? Number(formData.actual_duration_min) || null : null,
      actual_distance_km: !isStrength ? Number(formData.actual_distance_km) || null : null,
      notes: formData.notes,
    });
  };

  return (
    <form className="log-form" onSubmit={handleSubmit} id={`log-form-${planExercise.id}`}>
      <h4 className="log-form__title">Log Performance</h4>

      {isStrength ? (
        <div className="log-form__fields">
          <label className="log-form__field">
            <span className="log-form__label">Sets</span>
            <input type="number" name="actual_sets" value={formData.actual_sets} onChange={handleChange} min="0" className="log-form__input" />
          </label>
          <label className="log-form__field">
            <span className="log-form__label">Reps</span>
            <input type="number" name="actual_reps" value={formData.actual_reps} onChange={handleChange} min="0" className="log-form__input" />
          </label>
          <label className="log-form__field">
            <span className="log-form__label">Weight (kg)</span>
            <input type="number" name="actual_weight_kg" value={formData.actual_weight_kg} onChange={handleChange} min="0" step="0.5" className="log-form__input" />
          </label>
        </div>
      ) : (
        <div className="log-form__fields">
          <label className="log-form__field">
            <span className="log-form__label">Duration (min)</span>
            <input type="number" name="actual_duration_min" value={formData.actual_duration_min} onChange={handleChange} min="0" className="log-form__input" />
          </label>
          <label className="log-form__field">
            <span className="log-form__label">Distance (km)</span>
            <input type="number" name="actual_distance_km" value={formData.actual_distance_km} onChange={handleChange} min="0" step="0.1" className="log-form__input" />
          </label>
        </div>
      )}

      <label className="log-form__field log-form__field--full">
        <span className="log-form__label">Notes (optional)</span>
        <textarea name="notes" value={formData.notes} onChange={handleChange} className="log-form__textarea" rows="2" placeholder="How did it feel?" />
      </label>

      <div className="log-form__actions">
        <button type="button" onClick={onCancel} className="log-form__btn log-form__btn--cancel">Cancel</button>
        <button type="submit" className="log-form__btn log-form__btn--save">Save Log</button>
      </div>
    </form>
  );
}
