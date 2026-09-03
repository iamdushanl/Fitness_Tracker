import './DaySelector.css';

/**
 * Day picker for navigating the weekly schedule.
 * Props:
 *   dates        — array of date strings (YYYY-MM-DD)
 *   selectedDate — currently selected date
 *   onSelect     — callback(date)
 *   exerciseCounts — optional { [date]: { total, completed } }
 */
export default function DaySelector({ dates, selectedDate, onSelect, exerciseCounts = {} }) {
  return (
    <div className="day-selector" id="day-selector">
      {dates.map((date) => {
        const d = new Date(date + 'T00:00:00');
        const dayLetter = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();
        const isSelected = date === selectedDate;
        const counts = exerciseCounts[date];
        const hasExercises = counts && counts.total > 0;
        const allDone = counts && counts.completed >= counts.total && counts.total > 0;

        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className={`day-selector__day ${isSelected ? 'day-selector__day--selected' : ''} ${allDone ? 'day-selector__day--done' : ''} ${!hasExercises ? 'day-selector__day--rest' : ''}`}
          >
            <span className="day-selector__label">{dayLetter}</span>
            <span className="day-selector__num">{dayNum}</span>
            {hasExercises && (
              <span className="day-selector__dot" />
            )}
          </button>
        );
      })}
    </div>
  );
}
