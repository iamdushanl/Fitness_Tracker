import { supabase } from './supabase';

/**
 * Deterministic UUIDs for the 20 seed exercises.
 * Matches docs/supabase_setup.sql.
 */
export const EXERCISE_UUIDS = {
  'ex-001': '00000000-0000-0000-0000-000000000001', // Barbell Squat
  'ex-002': '00000000-0000-0000-0000-000000000002', // Bench Press
  'ex-003': '00000000-0000-0000-0000-000000000003', // Deadlift
  'ex-004': '00000000-0000-0000-0000-000000000004', // Overhead Press
  'ex-005': '00000000-0000-0000-0000-000000000005', // Barbell Row
  'ex-006': '00000000-0000-0000-0000-000000000006', // Lunge
  'ex-007': '00000000-0000-0000-0000-000000000007', // Bicep Curl
  'ex-008': '00000000-0000-0000-0000-000000000008', // Tricep Extension
  'ex-009': '00000000-0000-0000-0000-000000000009', // Plank
  'ex-010': '00000000-0000-0000-0000-000000000010', // Lat Pulldown
  'ex-011': '00000000-0000-0000-0000-000000000011', // Running
  'ex-012': '00000000-0000-0000-0000-000000000012', // Cycling
  'ex-013': '00000000-0000-0000-0000-000000000013', // Jump Rope
  'ex-014': '00000000-0000-0000-0000-000000000014', // Rowing
  'ex-015': '00000000-0000-0000-0000-000000000015', // Stair Climbing
  'ex-016': '00000000-0000-0000-0000-000000000016', // Brisk Walking
  'ex-017': '00000000-0000-0000-0000-000000000017', // Hamstring Stretch
  'ex-018': '00000000-0000-0000-0000-000000000018', // Hip Flexor Stretch
  'ex-019': '00000000-0000-0000-0000-000000000019', // Shoulder Stretch
  'ex-020': '00000000-0000-0000-0000-000000000020', // Cat-Cow
};

/**
 * 20 Curated exercises matching SPEC §5 / ARCH.md §4.
 */
export const SEED_EXERCISES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    slug: 'ex-001',
    name: 'Barbell Squat',
    category: 'strength',
    muscle_group: 'Quadriceps',
    instructions:
      'Stand with feet shoulder-width apart, barbell across your upper back. Bend your knees and hips to lower your body until your thighs are parallel to the floor. Drive through your heels to return to standing.',
    youtube_url: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    slug: 'ex-002',
    name: 'Bench Press',
    category: 'strength',
    muscle_group: 'Chest',
    instructions:
      'Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up to full arm extension.',
    youtube_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    slug: 'ex-003',
    name: 'Deadlift',
    category: 'strength',
    muscle_group: 'Back',
    instructions:
      'Stand with feet hip-width apart, barbell over mid-foot. Hinge at the hips, grip the bar, and lift by driving your hips forward while keeping a flat back.',
    youtube_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    slug: 'ex-004',
    name: 'Overhead Press',
    category: 'strength',
    muscle_group: 'Shoulders',
    instructions:
      'Stand with the barbell at shoulder height. Press the bar overhead until your arms are fully extended, then lower it back to your shoulders.',
    youtube_url: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    slug: 'ex-005',
    name: 'Barbell Row',
    category: 'strength',
    muscle_group: 'Back',
    instructions:
      'Bend at the hips with a slight knee bend, holding the barbell with an overhand grip. Pull the bar to your lower chest, squeezing your shoulder blades together.',
    youtube_url: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    slug: 'ex-006',
    name: 'Lunge',
    category: 'strength',
    muscle_group: 'Quadriceps',
    instructions:
      'Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees. Push back to the starting position and alternate legs.',
    youtube_url: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    slug: 'ex-007',
    name: 'Bicep Curl',
    category: 'strength',
    muscle_group: 'Biceps',
    instructions:
      'Stand with dumbbells at your sides, palms facing forward. Curl the weights toward your shoulders, keeping your elbows close to your body.',
    youtube_url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    slug: 'ex-008',
    name: 'Tricep Extension',
    category: 'strength',
    muscle_group: 'Triceps',
    instructions:
      'Hold a dumbbell overhead with both hands. Lower it behind your head by bending your elbows, then extend your arms back to the start.',
    youtube_url: 'https://www.youtube.com/watch?v=_gsUck-7M74',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    slug: 'ex-009',
    name: 'Plank',
    category: 'strength',
    muscle_group: 'Core',
    instructions:
      'Support your body on your forearms and toes, keeping your body in a straight line from head to heels. Hold the position without letting your hips sag.',
    youtube_url: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    slug: 'ex-010',
    name: 'Lat Pulldown',
    category: 'strength',
    muscle_group: 'Back',
    instructions:
      'Sit at a pulldown machine, grip the bar wider than shoulder-width. Pull the bar down to your upper chest, squeezing your lats, then slowly return.',
    youtube_url: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    slug: 'ex-011',
    name: 'Running',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Maintain an upright posture with a slight forward lean. Land on your mid-foot and keep a steady breathing rhythm. Start at a comfortable pace and gradually increase intensity.',
    youtube_url: 'https://www.youtube.com/watch?v=_kGESn8ArrU',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    slug: 'ex-012',
    name: 'Cycling',
    category: 'cardio',
    muscle_group: 'Legs',
    instructions:
      'Adjust the seat so your leg is almost fully extended at the bottom of the pedal stroke. Maintain a cadence of 70–90 RPM and keep your upper body relaxed.',
    youtube_url: 'https://www.youtube.com/watch?v=gCamGzqLHM8',
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    slug: 'ex-013',
    name: 'Jump Rope',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Hold the handles at hip height, elbows close to your body. Use your wrists to rotate the rope and jump just high enough for it to pass under your feet.',
    youtube_url: 'https://www.youtube.com/watch?v=FJmRQ5iTXKE',
  },
  {
    id: '00000000-0000-0000-0000-000000000014',
    slug: 'ex-014',
    name: 'Rowing',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Sit on the rowing machine with feet strapped in. Push with your legs first, then lean back slightly and pull the handle to your lower chest. Reverse the motion to return.',
    youtube_url: 'https://www.youtube.com/watch?v=H0r_dPAMGsY',
  },
  {
    id: '00000000-0000-0000-0000-000000000015',
    slug: 'ex-015',
    name: 'Stair Climbing',
    category: 'cardio',
    muscle_group: 'Legs',
    instructions:
      'Use a stair climber machine or actual stairs. Step at a steady pace, keeping your back straight and using the handrails only for balance.',
    youtube_url: 'https://www.youtube.com/watch?v=dFcUnLxQ-H8',
  },
  {
    id: '00000000-0000-0000-0000-000000000016',
    slug: 'ex-016',
    name: 'Brisk Walking',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Walk at a pace of about 5–6 km/h. Swing your arms naturally and maintain an upright posture. Aim for a pace that makes conversation slightly challenging.',
    youtube_url: 'https://www.youtube.com/watch?v=njeZ29umqVE',
  },
  {
    id: '00000000-0000-0000-0000-000000000017',
    slug: 'ex-017',
    name: 'Hamstring Stretch',
    category: 'flexibility',
    muscle_group: 'Hamstrings',
    instructions:
      'Sit on the floor with one leg extended and the other bent. Reach toward the toes of your extended leg, keeping your back straight. Hold for 20–30 seconds per side.',
    youtube_url: 'https://www.youtube.com/watch?v=FDwpEdRyFdI',
  },
  {
    id: '00000000-0000-0000-0000-000000000018',
    slug: 'ex-018',
    name: 'Hip Flexor Stretch',
    category: 'flexibility',
    muscle_group: 'Hip Flexors',
    instructions:
      'Kneel on one knee with the other foot flat on the floor in front of you. Push your hips forward gently until you feel a stretch in the front of your hip. Hold for 20–30 seconds per side.',
    youtube_url: 'https://www.youtube.com/watch?v=YQmpO9VT2go',
  },
  {
    id: '00000000-0000-0000-0000-000000000019',
    slug: 'ex-019',
    name: 'Shoulder Stretch',
    category: 'flexibility',
    muscle_group: 'Shoulders',
    instructions:
      'Bring one arm across your body at shoulder height. Use the opposite hand to press the arm closer to your chest. Hold for 20–30 seconds per side.',
    youtube_url: 'https://www.youtube.com/watch?v=SHg1xA0_y4s',
  },
  {
    id: '00000000-0000-0000-0000-000000000020',
    slug: 'ex-020',
    name: 'Cat-Cow',
    category: 'flexibility',
    muscle_group: 'Spine',
    instructions:
      'Start on all fours. Inhale and arch your back (cow), then exhale and round your spine (cat). Move slowly between positions for 10–15 repetitions.',
    youtube_url: 'https://www.youtube.com/watch?v=kqnua4rHVVA',
  },
];

const seedMapById = new Map();
for (const ex of SEED_EXERCISES) {
  seedMapById.set(ex.id, ex);
  if (ex.slug) seedMapById.set(ex.slug, ex);
}

/**
 * Fetch all exercises from Supabase (or fallback to seed list).
 * @returns {Promise<{ data: Array, error: object|null }>}
 */
export async function fetchExercises() {
  const { data, error } = await supabase.from('exercises').select('*');
  if (error || !data || data.length === 0) {
    return { data: SEED_EXERCISES, error: null };
  }
  return { data, error: null };
}

/**
 * Fetch a single exercise by ID (UUID or slug).
 * @param {string} id - UUID or slug
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function fetchExerciseById(id) {
  if (!id) return { data: null, error: null };

  // Check if id is a legacy slug like 'ex-001'
  const resolvedId = EXERCISE_UUIDS[id] ?? id;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedId);
  if (isUUID) {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', resolvedId)
      .maybeSingle();

    if (data) return { data, error: null };
    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase exercise fetch error, using local fallback:', error);
    }
  }

  // Fallback to local seed map
  const local = seedMapById.get(id) ?? seedMapById.get(resolvedId) ?? null;
  return { data: local, error: null };
}

/**
 * Synchronous helper for exercise lookup (uses local seed dictionary).
 * Useful in sync renders when exercises are already mapped.
 */
export function getExerciseById(id) {
  if (!id) return null;
  const resolved = EXERCISE_UUIDS[id] ?? id;
  return seedMapById.get(resolved) ?? seedMapById.get(id) ?? null;
}
