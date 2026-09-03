// Mock exercise seed library — ~20 exercises per SPEC §5
// Categories: strength, cardio, flexibility
export const mockExercises = [
  // ── Strength (10) ──
  {
    id: 'ex-001',
    name: 'Barbell Squat',
    category: 'strength',
    muscle_group: 'Quadriceps',
    instructions:
      'Stand with feet shoulder-width apart, barbell across your upper back. Bend your knees and hips to lower your body until your thighs are parallel to the floor. Drive through your heels to return to standing.',
    youtube_url: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
  },
  {
    id: 'ex-002',
    name: 'Bench Press',
    category: 'strength',
    muscle_group: 'Chest',
    instructions:
      'Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up to full arm extension.',
    youtube_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  {
    id: 'ex-003',
    name: 'Deadlift',
    category: 'strength',
    muscle_group: 'Back',
    instructions:
      'Stand with feet hip-width apart, barbell over mid-foot. Hinge at the hips, grip the bar, and lift by driving your hips forward while keeping a flat back.',
    youtube_url: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
  },
  {
    id: 'ex-004',
    name: 'Overhead Press',
    category: 'strength',
    muscle_group: 'Shoulders',
    instructions:
      'Stand with the barbell at shoulder height. Press the bar overhead until your arms are fully extended, then lower it back to your shoulders.',
    youtube_url: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
  },
  {
    id: 'ex-005',
    name: 'Barbell Row',
    category: 'strength',
    muscle_group: 'Back',
    instructions:
      'Bend at the hips with a slight knee bend, holding the barbell with an overhand grip. Pull the bar to your lower chest, squeezing your shoulder blades together.',
    youtube_url: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
  },
  {
    id: 'ex-006',
    name: 'Lunge',
    category: 'strength',
    muscle_group: 'Quadriceps',
    instructions:
      'Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees. Push back to the starting position and alternate legs.',
    youtube_url: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
  },
  {
    id: 'ex-007',
    name: 'Bicep Curl',
    category: 'strength',
    muscle_group: 'Biceps',
    instructions:
      'Stand with dumbbells at your sides, palms facing forward. Curl the weights toward your shoulders, keeping your elbows close to your body.',
    youtube_url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  },
  {
    id: 'ex-008',
    name: 'Tricep Extension',
    category: 'strength',
    muscle_group: 'Triceps',
    instructions:
      'Hold a dumbbell overhead with both hands. Lower it behind your head by bending your elbows, then extend your arms back to the start.',
    youtube_url: 'https://www.youtube.com/watch?v=_gsUck-7M74',
  },
  {
    id: 'ex-009',
    name: 'Plank',
    category: 'strength',
    muscle_group: 'Core',
    instructions:
      'Support your body on your forearms and toes, keeping your body in a straight line from head to heels. Hold the position without letting your hips sag.',
    youtube_url: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
  },
  {
    id: 'ex-010',
    name: 'Lat Pulldown',
    category: 'strength',
    muscle_group: 'Back',
    instructions:
      'Sit at a pulldown machine, grip the bar wider than shoulder-width. Pull the bar down to your upper chest, squeezing your lats, then slowly return.',
    youtube_url: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },

  // ── Cardio (6) ──
  {
    id: 'ex-011',
    name: 'Running',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Maintain an upright posture with a slight forward lean. Land on your mid-foot and keep a steady breathing rhythm. Start at a comfortable pace and gradually increase intensity.',
    youtube_url: 'https://www.youtube.com/watch?v=_kGESn8ArrU',
  },
  {
    id: 'ex-012',
    name: 'Cycling',
    category: 'cardio',
    muscle_group: 'Legs',
    instructions:
      'Adjust the seat so your leg is almost fully extended at the bottom of the pedal stroke. Maintain a cadence of 70–90 RPM and keep your upper body relaxed.',
    youtube_url: 'https://www.youtube.com/watch?v=gCamGzqLHM8',
  },
  {
    id: 'ex-013',
    name: 'Jump Rope',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Hold the handles at hip height, elbows close to your body. Use your wrists to rotate the rope and jump just high enough for it to pass under your feet.',
    youtube_url: 'https://www.youtube.com/watch?v=FJmRQ5iTXKE',
  },
  {
    id: 'ex-014',
    name: 'Rowing',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Sit on the rowing machine with feet strapped in. Push with your legs first, then lean back slightly and pull the handle to your lower chest. Reverse the motion to return.',
    youtube_url: 'https://www.youtube.com/watch?v=H0r_dPAMGsY',
  },
  {
    id: 'ex-015',
    name: 'Stair Climbing',
    category: 'cardio',
    muscle_group: 'Legs',
    instructions:
      'Use a stair climber machine or actual stairs. Step at a steady pace, keeping your back straight and using the handrails only for balance.',
    youtube_url: 'https://www.youtube.com/watch?v=dFcUnLxQ-H8',
  },
  {
    id: 'ex-016',
    name: 'Brisk Walking',
    category: 'cardio',
    muscle_group: 'Full Body',
    instructions:
      'Walk at a pace of about 5–6 km/h. Swing your arms naturally and maintain an upright posture. Aim for a pace that makes conversation slightly challenging.',
    youtube_url: 'https://www.youtube.com/watch?v=njeZ29umqVE',
  },

  // ── Flexibility (4) ──
  {
    id: 'ex-017',
    name: 'Hamstring Stretch',
    category: 'flexibility',
    muscle_group: 'Hamstrings',
    instructions:
      'Sit on the floor with one leg extended and the other bent. Reach toward the toes of your extended leg, keeping your back straight. Hold for 20–30 seconds per side.',
    youtube_url: 'https://www.youtube.com/watch?v=FDwpEdRyFdI',
  },
  {
    id: 'ex-018',
    name: 'Hip Flexor Stretch',
    category: 'flexibility',
    muscle_group: 'Hip Flexors',
    instructions:
      'Kneel on one knee with the other foot flat on the floor in front of you. Push your hips forward gently until you feel a stretch in the front of your hip. Hold for 20–30 seconds per side.',
    youtube_url: 'https://www.youtube.com/watch?v=YQmpO9VT2go',
  },
  {
    id: 'ex-019',
    name: 'Shoulder Stretch',
    category: 'flexibility',
    muscle_group: 'Shoulders',
    instructions:
      'Bring one arm across your body at shoulder height. Use the opposite hand to press the arm closer to your chest. Hold for 20–30 seconds per side.',
    youtube_url: 'https://www.youtube.com/watch?v=SHg1xA0_y4s',
  },
  {
    id: 'ex-020',
    name: 'Cat-Cow',
    category: 'flexibility',
    muscle_group: 'Spine',
    instructions:
      'Start on all fours. Inhale and arch your back (cow), then exhale and round your spine (cat). Move slowly between positions for 10–15 repetitions.',
    youtube_url: 'https://www.youtube.com/watch?v=kqnua4rHVVA',
  },
];

/** Look up a single exercise by id */
export function getExerciseById(id) {
  return mockExercises.find((e) => e.id === id) ?? null;
}
