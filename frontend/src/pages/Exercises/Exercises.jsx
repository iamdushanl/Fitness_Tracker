import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  X,
  Dumbbell,
} from 'lucide-react';
import { fetchExercises } from '../../lib/exercises';
import StateScreen from '../../components/StateScreen/StateScreen';
import './Exercises.css';

const MUSCLE_FILTERS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
];

const CATEGORY_FILTERS = [
  { id: 'All', label: 'All Categories' },
  { id: 'strength', label: 'Strength' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'flexibility', label: 'Mobility & Stretch' },
];

/**
 * Assigns a curated preview image based on exercise type and muscle focus
 */
function getExercisePreviewImage(exercise) {
  if (exercise.preview_image) return exercise.preview_image;
  const name = (exercise.name || '').toLowerCase();
  const muscle = (exercise.muscle_group || '').toLowerCase();
  const category = (exercise.category || '').toLowerCase();

  if (name.includes('bench') || name.includes('squat') || name.includes('deadlift')) {
    return '/images/bench-press.jpg';
  }
  if (name.includes('pulldown') || name.includes('extension') || name.includes('curl') || category === 'strength') {
    return '/images/gym-machines.jpg';
  }
  if (category === 'cardio' || category === 'flexibility' || muscle.includes('body')) {
    return '/images/athlete.jpg';
  }
  return '/images/bench-press.jpg';
}

/**
 * FitTrack 2.0 Movement Library Page
 */
export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let active = true;
    async function loadExercises() {
      try {
        setLoading(true);
        const { data, error: err } = await fetchExercises();
        if (!active) return;
        if (err) {
          setError(err.message || 'Failed to load exercises');
        } else {
          setExercises(data || []);
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to fetch exercise library');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadExercises();
    return () => {
      active = false;
    };
  }, []);

  // Filtered exercise list
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (ex.name || '').toLowerCase().includes(query);
        const matchesMuscle = (ex.muscle_group || '').toLowerCase().includes(query);
        const matchesCategory = (ex.category || '').toLowerCase().includes(query);
        const matchesInstructions = (ex.instructions || '').toLowerCase().includes(query);
        if (!matchesName && !matchesMuscle && !matchesCategory && !matchesInstructions) {
          return false;
        }
      }

      // Muscle match
      if (selectedMuscle !== 'All') {
        const muscleLower = (ex.muscle_group || '').toLowerCase();
        if (selectedMuscle === 'Arms') {
          if (!muscleLower.includes('bicep') && !muscleLower.includes('tricep') && !muscleLower.includes('arm')) {
            return false;
          }
        } else if (selectedMuscle === 'Legs') {
          if (
            !muscleLower.includes('quad') &&
            !muscleLower.includes('hamstring') &&
            !muscleLower.includes('hip') &&
            !muscleLower.includes('leg')
          ) {
            return false;
          }
        } else if (selectedMuscle === 'Core') {
          if (!muscleLower.includes('core') && !muscleLower.includes('spine') && !muscleLower.includes('ab')) {
            return false;
          }
        } else if (!muscleLower.includes(selectedMuscle.toLowerCase())) {
          return false;
        }
      }

      // Category match
      if (selectedCategory !== 'All') {
        if ((ex.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMuscle('All');
    setSelectedCategory('All');
  };

  if (loading) {
    return (
      <div className="exercise-library-page" id="exercises-page">
        <StateScreen variant="loading" text="Loading movement library…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="exercise-library-page" id="exercises-page">
        <StateScreen
          variant="error"
          text="Could not load exercises"
          action={{ label: 'Try Again', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="exercise-library-page" id="exercises-page">
      {/* ── Search & Filter Controls ── */}
      <section className="library-controls" aria-label="Movement search and filters">
        <div className="library-search">
          <div className="library-search-input-wrap">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="search"
              id="exercise-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movements, muscle groups, technique keywords..."
              aria-label="Search exercises"
              className="library-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Primary Muscle Scroller */}
        <div
          className="filter-scroller"
          role="tablist"
          aria-label="Filter by primary muscle group"
        >
          {MUSCLE_FILTERS.map((muscle) => {
            const isActive = selectedMuscle === muscle;
            return (
              <button
                key={muscle}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`button filter-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedMuscle(muscle)}
              >
                {muscle}
              </button>
            );
          })}
        </div>

        {/* Secondary Category Filter Strip */}
        <div
          className="filter-scroller secondary-filters"
          role="tablist"
          aria-label="Filter by exercise category"
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`button secondary-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Library Title & Results Count ── */}
      <div className="library-title">
        <div>
          <span className="eyebrow">CURATED EXERCISE DATABASE</span>
          <h2 className="library-heading">All Movements</h2>
          <span className="library-subtext">
            {selectedMuscle !== 'All' ? `${selectedMuscle} focus` : 'Full catalog'}
            {selectedCategory !== 'All' ? ` · ${selectedCategory}` : ''}
          </span>
        </div>
        <span className="library-count" aria-live="polite">
          {filteredExercises.length} {filteredExercises.length === 1 ? 'movement' : 'movements'}
        </span>
      </div>

      {/* ── Exercise Grid ── */}
      {filteredExercises.length > 0 ? (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => {
            const targetUrl = `/exercise/${exercise.slug || exercise.id}`;
            const previewImg = getExercisePreviewImage(exercise);
            const categoryLabel =
              exercise.category === 'strength'
                ? 'Strength'
                : exercise.category === 'cardio'
                ? 'Cardio'
                : 'Mobility';

            return (
              <Link
                to={targetUrl}
                key={exercise.id}
                className="card exercise-card"
                aria-label={`View details for ${exercise.name}`}
              >
                <div className="exercise-image">
                  <img
                    src={previewImg}
                    alt={`${exercise.name} demonstration`}
                    loading="lazy"
                    onError={(e) => {
                      // Graceful fallback to dark atmospheric visual
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="badge exercise-cat-badge">{categoryLabel}</span>
                  <div className="exercise-quick-action" aria-hidden="true">
                    <ChevronRight size={17} />
                  </div>
                </div>

                <div className="exercise-card-copy">
                  <div className="exercise-card-info">
                    <h3 className="exercise-card-title">{exercise.name}</h3>
                    <p className="exercise-card-meta">
                      {exercise.muscle_group} · {categoryLabel}
                    </p>
                  </div>
                  <ChevronRight size={18} className="exercise-card-chevron" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="library-empty">
          <div className="library-empty-icon" aria-hidden="true">
            <Dumbbell size={32} />
          </div>
          <h3>No matching movements found</h3>
          <p>Try searching for a different keyword or resetting your muscle filters.</p>
          <button
            type="button"
            className="primary-button library-empty-btn"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
