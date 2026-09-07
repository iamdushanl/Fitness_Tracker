-- ==============================================================================
-- SUPABASE DATABASE SETUP: RLS POLICIES & SEED DATA
-- ==============================================================================
-- Run this SQL in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard/project/<your-project-id>/sql/new
-- 2. Paste this entire script and click "Run" (Ctrl+Enter)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED EXERCISES (20 exercises with deterministic UUIDs matching ARCH.md)
-- ------------------------------------------------------------------------------
INSERT INTO public.exercises (id, name, category, muscle_group, instructions, youtube_url)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Barbell Squat',
    'strength',
    'Quadriceps',
    'Stand with feet shoulder-width apart, barbell across your upper back. Bend your knees and hips to lower your body until your thighs are parallel to the floor. Drive through your heels to return to standing.',
    'https://www.youtube.com/watch?v=ultWZbUMPL8'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Bench Press',
    'strength',
    'Chest',
    'Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up to full arm extension.',
    'https://www.youtube.com/watch?v=rT7DgCr-3pg'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Deadlift',
    'strength',
    'Back',
    'Stand with feet hip-width apart, barbell over mid-foot. Hinge at the hips, grip the bar, and lift by driving your hips forward while keeping a flat back.',
    'https://www.youtube.com/watch?v=op9kVnSso6Q'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Overhead Press',
    'strength',
    'Shoulders',
    'Stand with the barbell at shoulder height. Press the bar overhead until your arms are fully extended, then lower it back to your shoulders.',
    'https://www.youtube.com/watch?v=2yjwXTZQDDI'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Barbell Row',
    'strength',
    'Back',
    'Bend at the hips with a slight knee bend, holding the barbell with an overhand grip. Pull the bar to your lower chest, squeezing your shoulder blades together.',
    'https://www.youtube.com/watch?v=FWJR5Ve8bnQ'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Lunge',
    'strength',
    'Quadriceps',
    'Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees. Push back to the starting position and alternate legs.',
    'https://www.youtube.com/watch?v=QOVaHwm-Q6U'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'Bicep Curl',
    'strength',
    'Biceps',
    'Stand with dumbbells at your sides, palms facing forward. Curl the weights toward your shoulders, keeping your elbows close to your body.',
    'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Tricep Extension',
    'strength',
    'Triceps',
    'Hold a dumbbell overhead with both hands. Lower it behind your head by bending your elbows, then extend your arms back to the start.',
    'https://www.youtube.com/watch?v=_gsUck-7M74'
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'Plank',
    'strength',
    'Core',
    'Support your body on your forearms and toes, keeping your body in a straight line from head to heels. Hold the position without letting your hips sag.',
    'https://www.youtube.com/watch?v=ASdvN_XEl_c'
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'Lat Pulldown',
    'strength',
    'Back',
    'Sit at a pulldown machine, grip the bar wider than shoulder-width. Pull the bar down to your upper chest, squeezing your lats, then slowly return.',
    'https://www.youtube.com/watch?v=CAwf7n6Luuc'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'Running',
    'cardio',
    'Full Body',
    'Maintain an upright posture with a slight forward lean. Land on your mid-foot and keep a steady breathing rhythm. Start at a comfortable pace and gradually increase intensity.',
    'https://www.youtube.com/watch?v=_kGESn8ArrU'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'Cycling',
    'cardio',
    'Legs',
    'Adjust the seat so your leg is almost fully extended at the bottom of the pedal stroke. Maintain a cadence of 70–90 RPM and keep your upper body relaxed.',
    'https://www.youtube.com/watch?v=gCamGzqLHM8'
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'Jump Rope',
    'cardio',
    'Full Body',
    'Hold the handles at hip height, elbows close to your body. Use your wrists to rotate the rope and jump just high enough for it to pass under your feet.',
    'https://www.youtube.com/watch?v=FJmRQ5iTXKE'
  ),
  (
    '00000000-0000-0000-0000-000000000014',
    'Rowing',
    'cardio',
    'Full Body',
    'Sit on the rowing machine with feet strapped in. Push with your legs first, then lean back slightly and pull the handle to your lower chest. Reverse the motion to return.',
    'https://www.youtube.com/watch?v=H0r_dPAMGsY'
  ),
  (
    '00000000-0000-0000-0000-000000000015',
    'Stair Climbing',
    'cardio',
    'Legs',
    'Use a stair climber machine or actual stairs. Step at a steady pace, keeping your back straight and using the handrails only for balance.',
    'https://www.youtube.com/watch?v=dFcUnLxQ-H8'
  ),
  (
    '00000000-0000-0000-0000-000000000016',
    'Brisk Walking',
    'cardio',
    'Full Body',
    'Walk at a pace of about 5–6 km/h. Swing your arms naturally and maintain an upright posture. Aim for a pace that makes conversation slightly challenging.',
    'https://www.youtube.com/watch?v=njeZ29umqVE'
  ),
  (
    '00000000-0000-0000-0000-000000000017',
    'Hamstring Stretch',
    'flexibility',
    'Hamstrings',
    'Sit on the floor with one leg extended and the other bent. Reach toward the toes of your extended leg, keeping your back straight. Hold for 20–30 seconds per side.',
    'https://www.youtube.com/watch?v=FDwpEdRyFdI'
  ),
  (
    '00000000-0000-0000-0000-000000000018',
    'Hip Flexor Stretch',
    'flexibility',
    'Hip Flexors',
    'Kneel on one knee with the other foot flat on the floor in front of you. Push your hips forward gently until you feel a stretch in the front of your hip. Hold for 20–30 seconds per side.',
    'https://www.youtube.com/watch?v=YQmpO9VT2go'
  ),
  (
    '00000000-0000-0000-0000-000000000019',
    'Shoulder Stretch',
    'flexibility',
    'Shoulders',
    'Bring one arm across your body at shoulder height. Use the opposite hand to press the arm closer to your chest. Hold for 20–30 seconds per side.',
    'https://www.youtube.com/watch?v=SHg1xA0_y4s'
  ),
  (
    '00000000-0000-0000-0000-000000000020',
    'Cat-Cow',
    'flexibility',
    'Spine',
    'Start on all fours. Inhale and arch your back (cow), then exhale and round your spine (cat). Move slowly between positions for 10–15 repetitions.',
    'https://www.youtube.com/watch?v=kqnua4rHVVA'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  muscle_group = EXCLUDED.muscle_group,
  instructions = EXCLUDED.instructions,
  youtube_url = EXCLUDED.youtube_url;

-- ------------------------------------------------------------------------------
-- 2. ENABLE ROW-LEVEL SECURITY ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. DROP EXISTING POLICIES (Idempotent replay)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON public.exercises;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own weight history" ON public.weight_history;
DROP POLICY IF EXISTS "Users can insert own weight history" ON public.weight_history;
DROP POLICY IF EXISTS "Users can update own weight history" ON public.weight_history;

DROP POLICY IF EXISTS "Users can view own workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can insert own workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can update own workout plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can delete own workout plans" ON public.workout_plans;

DROP POLICY IF EXISTS "Users can view own plan exercises" ON public.plan_exercises;
DROP POLICY IF EXISTS "Users can insert own plan exercises" ON public.plan_exercises;
DROP POLICY IF EXISTS "Users can update own plan exercises" ON public.plan_exercises;
DROP POLICY IF EXISTS "Users can delete own plan exercises" ON public.plan_exercises;

DROP POLICY IF EXISTS "Users can view own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON public.workout_logs;

-- ------------------------------------------------------------------------------
-- 4. CREATE RLS POLICIES (per ARCH.md §5)
-- ------------------------------------------------------------------------------

-- A. exercises: Shared seed library, read-only for everyone (authenticated & anon)
CREATE POLICY "Exercises are viewable by everyone"
  ON public.exercises
  FOR SELECT
  USING (true);

-- B. users: Authenticated user owns their profile row (id = auth.uid())
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- C. weight_history: Authenticated user owns their weight history
CREATE POLICY "Users can view own weight history"
  ON public.weight_history
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own weight history"
  ON public.weight_history
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own weight history"
  ON public.weight_history
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- D. workout_plans: Authenticated user owns their weekly plans
CREATE POLICY "Users can view own workout plans"
  ON public.workout_plans
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own workout plans"
  ON public.workout_plans
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workout plans"
  ON public.workout_plans
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own workout plans"
  ON public.workout_plans
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- E. plan_exercises: Transitive ownership via workout_plan_id -> workout_plans.user_id
CREATE POLICY "Users can view own plan exercises"
  ON public.plan_exercises
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans
      WHERE workout_plans.id = plan_exercises.workout_plan_id
        AND workout_plans.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own plan exercises"
  ON public.plan_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_plans
      WHERE workout_plans.id = plan_exercises.workout_plan_id
        AND workout_plans.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own plan exercises"
  ON public.plan_exercises
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans
      WHERE workout_plans.id = plan_exercises.workout_plan_id
        AND workout_plans.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_plans
      WHERE workout_plans.id = plan_exercises.workout_plan_id
        AND workout_plans.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own plan exercises"
  ON public.plan_exercises
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_plans
      WHERE workout_plans.id = plan_exercises.workout_plan_id
        AND workout_plans.user_id = (select auth.uid())
    )
  );

-- F. workout_logs: Authenticated user owns their performance logs
CREATE POLICY "Users can view own workout logs"
  ON public.workout_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own workout logs"
  ON public.workout_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workout logs"
  ON public.workout_logs
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own workout logs"
  ON public.workout_logs
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- 5. GRANTS FOR POSTGREST DATA API
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.exercises TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
