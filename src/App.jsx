import React, { useState, useEffect } from 'react';
import { Clock, Dumbbell, Activity, ChevronLeft, CheckCircle, XCircle, Trophy, RotateCcw, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Intro from './components/Intro';
import WorkoutStatus from './components/WorkoutStatus';

export default function GymApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home');
  
  const [workoutData, setWorkoutData] = useState({
    hiit: { time: 30 },
    weights: {
      day1: {},
      day2: {},
      day3: {},
      day4: {}
    },
    vo2max: { speed: 10.0 },
    lastWorkout: null,
    consecutiveDays: 0,
    recommendedRestUntil: null
  });

  const [sessionData, setSessionData] = useState({
    hiitComplete: false,
    hiitPassed: false,
    weightsComplete: false,
    vo2maxComplete: false,
    vo2maxPassed: false,
    currentWeightsDay: 1,
    weightsResults: {}
  });
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [tempTime, setTempTime] = useState('30');
  const [tempSpeed, setTempSpeed] = useState('10.0');
  
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [showIntro, setShowIntro] = useState(false);
  const [checkingIntro, setCheckingIntro] = useState(true);
  const [restRecommendationDismissed, setRestRecommendationDismissed] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      // If no session, we're not checking intro - go straight to auth
      if (!session) {
        setCheckingIntro(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Reset checking state when session changes
      if (!session) {
        setCheckingIntro(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load workout data from Supabase when user logs in
  useEffect(() => {
    if (session) {
      loadWorkoutData();
    }
  }, [session]);

  const loadWorkoutData = async () => {
    console.log('🔍 loadWorkoutData STARTED');
    console.log('Session user ID:', session?.user?.id);

    try {
      console.log('📡 Querying Supabase...');
      const { data, error } = await supabase
        .from('workout_data')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      console.log('✅ Query completed:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error code:', error.code);
        throw error;
      }

      if (data) {
        console.log('💾 Data found, loading...');
        // Show intro only for brand new users with default data
        const isFirstTime = !data.last_workout &&
                             data.consecutive_days === 0 &&
                             data.hiit_time === 30 &&
                             parseFloat(data.vo2max_speed) === 10.0 &&
                             Object.keys(data.weights_day1 || {}).length === 0;
        setShowIntro(isFirstTime);

        setWorkoutData({
          hiit: { time: data.hiit_time },
          weights: {
            day1: data.weights_day1 || {},
            day2: data.weights_day2 || {},
            day3: data.weights_day3 || {},
            day4: data.weights_day4 || {}
          },
          vo2max: { speed: parseFloat(data.vo2max_speed) },
          lastWorkout: data.last_workout,
          consecutiveDays: data.consecutive_days,
          recommendedRestUntil: data.recommended_rest_until || null
        });
        setTempTime(data.hiit_time.toString());
        setTempSpeed(data.vo2max_speed.toString());
      } else {
        console.log('⚠️ No data found for user');
      }

      setCheckingIntro(false);
      console.log('✅ checkingIntro set to FALSE');
    } catch (error) {
      console.error('💥 Error in loadWorkoutData:', error);
      setCheckingIntro(false);
    }
  };

  const saveWorkoutData = async (data) => {
    try {
      const { error } = await supabase
        .from('workout_data')
        .upsert({
          user_id: session.user.id,
          hiit_time: data.hiit.time,
          vo2max_speed: data.vo2max.speed,
          weights_day1: data.weights.day1,
          weights_day2: data.weights.day2,
          weights_day3: data.weights.day3,
          weights_day4: data.weights.day4,
          last_workout: data.lastWorkout,
          consecutive_days: data.consecutiveDays,
          recommended_rest_until: data.recommendedRestUntil,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving workout data:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setWorkoutData({
      hiit: { time: 30 },
      weights: { day1: {}, day2: {}, day3: {}, day4: {} },
      vo2max: { speed: 10.0 },
      lastWorkout: null,
      consecutiveDays: 0,
      recommendedRestUntil: null
    });
    setRestRecommendationDismissed(false);
  };

  const roundUpTime = (value) => Math.ceil(value);
  const roundUpWeight = (value) => Math.ceil(value * 2) / 2;
  const roundUpSpeed = (value) => Math.ceil(value * 10) / 10;

  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          
          if (currentExerciseIndex < hiitExercises.length - 1) {
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);
            
            setTimeout(() => {
              speakExercise(hiitExercises[nextIndex]);
              setTimeout(() => {
                setTimeRemaining(workoutData.hiit.time);
                setTimerActive(true);
              }, 2000);
            }, 500);
          }
          
          return 0;
        }
        
        if (prev <= 5) {
          playBeep();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, currentExerciseIndex, workoutData.hiit.time]);

  const playBeep = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const speakExercise = (exerciseName) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Next: ${exerciseName}`);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startHiitTimer = () => {
    setTimeRemaining(workoutData.hiit.time);
    setTimerActive(true);
    speakExercise(hiitExercises[0]);
  };

  const pauseHiitTimer = () => {
    setTimerActive(false);
  };

  const resetHiitTimer = () => {
    setTimerActive(false);
    setTimeRemaining(workoutData.hiit.time);
  };

  const hiitExercises = [
    'Burpees', 'Mountain Climbers', 'Press-ups', 'Plank', 'Squats',
    'Bench Dips', 'High knees', 'Burpees', 'Press-ups', 'Plank',
    'V-ups', 'Alternate lunges', 'Incline Press-ups', 'Pull ups',
    'Leg raises', 'Alternate leg raises', 'Knees to chest'
  ];

  const weightsProgram = {
    day1: {
      name: 'CHEST/BICEPS/ABS',
      exercises: [
        { name: 'Incline bench press', reps: 8 },
        { name: 'Machine bench press/flat bench', reps: 8 },
        { name: 'Incline dumbbell fly', reps: 12 },
        { name: 'Machine fly/cable fly', reps: 12 },
        { name: 'Incline bicep curl', reps: 8 },
        { name: 'EZ bar curl/barbell curl', reps: 8 },
        { name: 'Concentration/cable curl', reps: 12 },
        { name: 'Hanging leg raise', reps: 12 },
        { name: 'Cable crunch', reps: 15 }
      ]
    },
    day2: {
      name: 'LEGS',
      exercises: [
        { name: 'Goblet squats', reps: 12 },
        { name: 'Leg press', reps: 12 },
        { name: 'Leg press calf raise', reps: 15 },
        { name: 'Smith machine squat/barbell squat', reps: 12 },
        { name: 'Hip abductor', reps: 15 },
        { name: 'Romanian Dead Lift', reps: 8 },
        { name: 'Hip aductor', reps: 15 },
        { name: 'Weighted lunges', reps: 12 }
      ]
    },
    day3: {
      name: 'SHOULDERS/TRICEPS/ABS',
      exercises: [
        { name: 'Overhead press', reps: 8 },
        { name: 'Dumbbell lateral raise', reps: 8 },
        { name: 'Barbell upright row', reps: 8 },
        { name: 'Cable lateral raise', reps: 12 },
        { name: 'Cable pressdown', reps: 8 },
        { name: 'EZ bar skullcrusher', reps: 8 },
        { name: 'Cable overhead extension', reps: 12 },
        { name: 'Weighted Abdominal Twists', reps: 12 },
        { name: 'Reverse crunch', reps: 10 }
      ]
    },
    day4: {
      name: 'BACK',
      exercises: [
        { name: 'Dumbbell pullover', reps: 12 },
        { name: 'Machine pulldown', reps: 8 },
        { name: 'Barbell row', reps: 8 },
        { name: 'Cable row', reps: 8 },
        { name: 'Chest-supported row or facepull', reps: 12 },
        { name: 'Barbell back extension', reps: 10 },
        { name: 'Deadlift', reps: 8 }
      ]
    }
  };

  const getDaysSinceLastWorkout = (lastWorkout) => {
    if (!lastWorkout) return null;
    const today = new Date();
    const last = new Date(lastWorkout);
    const diffTime = Math.abs(today - last);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateAdjustment = (lastWorkout, currentValue, consecutiveDays, type = 'time') => {
    const daysSince = getDaysSinceLastWorkout(lastWorkout);

    if (daysSince === null) return currentValue; // First workout

    if (daysSince === 1) {
      // Consecutive day - only apply gains if consecutiveDays >= 1
      if (consecutiveDays >= 1) {
        // Can get gains (second or later consecutive day)
        const increased = currentValue * 1.01;
        if (type === 'time') return roundUpTime(increased);
        if (type === 'weight') return roundUpWeight(increased);
        if (type === 'speed') return roundUpSpeed(increased);
      } else {
        // First day back after rest, no gains
        return currentValue;
      }
    }

    if (daysSince === 2) {
      // First rest day, no penalty, no gains
      return currentValue;
    }

    if (daysSince >= 3) {
      // Extended break, compounded penalty
      const decreased = currentValue * Math.pow(0.99, daysSince - 2);
      if (type === 'time') return roundUpTime(decreased);
      if (type === 'weight') return roundUpWeight(decreased);
      if (type === 'speed') return roundUpSpeed(decreased);
    }

    return currentValue;
  };

  const checkSessionComplete = (updatedSessionData) => {
    return updatedSessionData.hiitComplete && 
           updatedSessionData.weightsComplete && 
           updatedSessionData.vo2maxComplete;
  };

  const completeSession = async (updatedSessionData) => {
    const daysSince = getDaysSinceLastWorkout(workoutData.lastWorkout);
    const newConsecutiveDays = daysSince === 1 ? workoutData.consecutiveDays + 1 : 0;

    // Only apply adjustments to passed sections
    const newHiitTime = updatedSessionData.hiitPassed
      ? calculateAdjustment(workoutData.lastWorkout, workoutData.hiit.time, workoutData.consecutiveDays, 'time')
      : workoutData.hiit.time;

    const newVO2Speed = updatedSessionData.vo2maxPassed
      ? calculateAdjustment(workoutData.lastWorkout, workoutData.vo2max.speed, workoutData.consecutiveDays, 'speed')
      : workoutData.vo2max.speed;

    const dayKey = `day${updatedSessionData.currentWeightsDay}`;
    const updatedDayWeights = { ...workoutData.weights[dayKey] };

    Object.keys(updatedSessionData.weightsResults).forEach(exerciseName => {
      if (updatedSessionData.weightsResults[exerciseName].passed) {
        const currentWeight = updatedSessionData.weightsResults[exerciseName].weight;
        if (currentWeight > 0) {
          updatedDayWeights[exerciseName] = calculateAdjustment(workoutData.lastWorkout, currentWeight, workoutData.consecutiveDays, 'weight');
        }
      }
    });

    // Handle rest recommendation (after 5 consecutive days)
    let recommendedRestUntil = workoutData.recommendedRestUntil;
    if (newConsecutiveDays >= 5 && !workoutData.recommendedRestUntil) {
      // Set recommended rest window for next 2 days
      const restDate = new Date();
      restDate.setDate(restDate.getDate() + 2);
      recommendedRestUntil = restDate.toISOString();
      setRestRecommendationDismissed(false);
    }

    // Clear recommendation if they took 2 rest days
    if (daysSince >= 2) {
      recommendedRestUntil = null;
      setRestRecommendationDismissed(false);
    }

    const newWorkoutData = {
      ...workoutData,
      hiit: { time: newHiitTime },
      vo2max: { speed: newVO2Speed },
      weights: {
        ...workoutData.weights,
        [dayKey]: updatedDayWeights
      },
      lastWorkout: new Date().toISOString(),
      consecutiveDays: newConsecutiveDays,
      recommendedRestUntil
    };

    setWorkoutData(newWorkoutData);
    await saveWorkoutData(newWorkoutData);

    setSessionData({
      hiitComplete: false,
      hiitPassed: false,
      weightsComplete: false,
      vo2maxComplete: false,
      vo2maxPassed: false,
      currentWeightsDay: 1,
      weightsResults: {}
    });

    alert('🎉 Full session complete! All improvements applied!');
    setScreen('home');
  };

  const handleHiitComplete = (passed) => {
    const updatedSessionData = {
      ...sessionData,
      hiitComplete: true,
      hiitPassed: passed
    };
    setSessionData(updatedSessionData);

    if (checkSessionComplete(updatedSessionData)) {
      completeSession(updatedSessionData);
    } else {
      setScreen('home');
    }
  };

  const handleVO2Complete = (passed) => {
    const updatedSessionData = {
      ...sessionData,
      vo2maxComplete: true,
      vo2maxPassed: passed
    };
    setSessionData(updatedSessionData);

    if (checkSessionComplete(updatedSessionData)) {
      completeSession(updatedSessionData);
    } else {
      setScreen('home');
    }
  };

  const getStatusMessage = (lastWorkout, consecutiveDays, recommendedRestUntil) => {
    const daysSince = getDaysSinceLastWorkout(lastWorkout);

    // Check if in recommended rest window
    if (recommendedRestUntil) {
      const restDate = new Date(recommendedRestUntil);
      const now = new Date();
      if (now < restDate) {
        const daysInWindow = Math.floor((restDate - now) / (1000 * 60 * 60 * 24)) + 1;
        return {
          text: `Recommended rest day ${3 - daysInWindow} of 2`,
          color: 'text-blue-300'
        };
      }
    }

    if (daysSince === null) return { text: 'Start your journey!', color: 'text-blue-200' };

    if (daysSince === 1) {
      if (consecutiveDays >= 1) {
        return { text: '+1% boost ready!', color: 'text-green-300' };
      } else {
        return { text: 'First day back - no gains', color: 'text-yellow-300' };
      }
    }

    if (daysSince === 2) return { text: 'Rest day - no change', color: 'text-yellow-300' };
    if (daysSince > 2) {
      const penalty = Math.round((1 - Math.pow(0.99, daysSince - 2)) * 100);
      return { text: `-${penalty}% penalty applied`, color: 'text-red-300' };
    }

    return { text: '', color: '' };
  };

  const resetAllData = async () => {
    if (confirm('Are you sure you want to reset all workout data? This cannot be undone.')) {
      const defaultData = {
        hiit: { time: 30 },
        weights: {
          day1: {},
          day2: {},
          day3: {},
          day4: {}
        },
        vo2max: { speed: 10.0 },
        lastWorkout: null,
        consecutiveDays: 0,
        recommendedRestUntil: null
      };
      setWorkoutData(defaultData);
      setSessionData({
        hiitComplete: false,
        hiitPassed: false,
        weightsComplete: false,
        vo2maxComplete: false,
        vo2maxPassed: false,
        currentWeightsDay: 1,
        weightsResults: {}
      });
      setRestRecommendationDismissed(false);
      setTempTime('30');
      setTempSpeed('10.0');
      await saveWorkoutData(defaultData);
    }
  };

  const getSessionProgress = () => {
    const completed = [
      sessionData.hiitComplete,
      sessionData.weightsComplete,
      sessionData.vo2maxComplete
    ].filter(Boolean).length;
    return `${completed}/3`;
  };

  if (loading || checkingIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (showIntro) {
    return <Intro onComplete={() => setShowIntro(false)} />;
  }

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">No Days Off Gym Club</h1>
          <p className="text-blue-200">Get 2% better every day</p>
          <p className="text-blue-300 text-sm mt-2">{session.user.email}</p>
        </div>

        {/* Add Workout Status Dashboard */}
        <WorkoutStatus workoutData={workoutData} />

        {/* Rest Recommendation Banner */}
        {workoutData.consecutiveDays >= 5 && workoutData.recommendedRestUntil && !restRecommendationDismissed && (
          <div className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Great Work! Time to Rest
                </h3>
                <p className="text-sm mb-2">
                  You've trained for 5 consecutive days! Consider taking 2 rest days to recover.
                </p>
                <p className="text-xs opacity-90">
                  No penalties will apply during your recommended rest window. Gains still possible if you train.
                </p>
              </div>
              <button
                onClick={() => setRestRecommendationDismissed(true)}
                className="ml-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {(sessionData.hiitComplete || sessionData.weightsComplete || sessionData.vo2maxComplete) && (
          <div className="mb-4 bg-yellow-500 text-yellow-900 px-4 py-3 rounded-lg font-bold">
            Session Progress: {getSessionProgress()} complete
            <p className="text-sm font-normal mt-1">Complete all 3 to apply improvements!</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => { 
              setScreen('hiit'); 
              setCurrentExerciseIndex(0);
              setTimerActive(false);
              setTimeRemaining(0);
            }}
            className={`w-full ${sessionData.hiitComplete ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-orange-500 to-red-500'} text-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95`}
          >
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-1">HIIT Training {sessionData.hiitComplete && '✓'}</h2>
            <p className="text-sm opacity-90">Current: {workoutData.hiit.time} seconds per exercise</p>
            <p className="text-xs opacity-75 mt-1">Streak: {workoutData.consecutiveDays} days</p>
            <p className={`text-xs font-semibold mt-1 ${getStatusMessage(workoutData.lastWorkout, workoutData.consecutiveDays, workoutData.recommendedRestUntil).color}`}>
              {getStatusMessage(workoutData.lastWorkout, workoutData.consecutiveDays, workoutData.recommendedRestUntil).text}
            </p>
          </button>

          <button
            onClick={() => setScreen('weights-select')}
            className={`w-full ${sessionData.weightsComplete ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95`}
          >
            <Dumbbell className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-1">Weights {sessionData.weightsComplete && '✓'}</h2>
            <p className="text-sm opacity-90">Progressive overload tracking</p>
            <p className="text-xs opacity-75 mt-1">Streak: {workoutData.consecutiveDays} days</p>
            <p className={`text-xs font-semibold mt-1 ${getStatusMessage(workoutData.lastWorkout, workoutData.consecutiveDays, workoutData.recommendedRestUntil).color}`}>
              {getStatusMessage(workoutData.lastWorkout, workoutData.consecutiveDays, workoutData.recommendedRestUntil).text}
            </p>
          </button>

          <button
            onClick={() => setScreen('vo2max')}
            className={`w-full ${sessionData.vo2maxComplete ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-green-500 to-teal-500'} text-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95`}
          >
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-1">VO2 Max Training {sessionData.vo2maxComplete && '✓'}</h2>
            <p className="text-sm opacity-90">Current: {workoutData.vo2max.speed}</p>
            <p className="text-xs opacity-75 mt-1">Streak: {workoutData.consecutiveDays} days</p>
            <p className={`text-xs font-semibold mt-1 ${getStatusMessage(workoutData.lastWorkout, workoutData.consecutiveDays, workoutData.recommendedRestUntil).color}`}>
              {getStatusMessage(workoutData.lastWorkout, workoutData.consecutiveDays, workoutData.recommendedRestUntil).text}
            </p>
          </button>
        </div>

        <button
          onClick={() => setShowIntro(true)}
          className="w-full bg-blue-600 bg-opacity-50 text-white p-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-70 transition mb-2"
        >
          <Trophy className="w-5 h-5" />
          How It Works
        </button>

        <div className="flex gap-2 mt-2">
          <button
            onClick={resetAllData}
            className="flex-1 bg-gray-700 bg-opacity-50 text-white p-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-70 transition"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Data
          </button>

          <button
            onClick={handleSignOut}
            className="flex-1 bg-red-600 bg-opacity-50 text-white p-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-70 transition"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderHiit = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => {
            setScreen('home');
            setTimerActive(false);
            setTimeRemaining(0);
          }}
          className="text-white mb-4 flex items-center"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-2xl mb-4">
          <h2 className="text-2xl font-bold mb-2">HIIT Workout</h2>
          <p className="text-gray-600 mb-4">{workoutData.hiit.time} seconds each - No breaks</p>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Set time per exercise (seconds):</label>
            <input
              type="number"
              value={tempTime}
              onChange={(e) => setTempTime(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
              disabled={timerActive}
            />
            <button
              onClick={async () => {
                const newData = {
                  ...workoutData,
                  hiit: { time: parseInt(tempTime) || 30 }
                };
                setWorkoutData(newData);
                await saveWorkoutData(newData);
                resetHiitTimer();
              }}
              disabled={timerActive}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded-lg disabled:bg-gray-400"
            >
              Update Time
            </button>
          </div>

          <div className="bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Exercise {currentExerciseIndex + 1} of {hiitExercises.length}
            </p>
            <h3 className="text-3xl font-bold text-orange-700 text-center mb-4">
              {hiitExercises[currentExerciseIndex]}
            </h3>
            
            <div className={`text-center ${timeRemaining <= 5 && timeRemaining > 0 ? 'animate-pulse' : ''}`}>
              <div className={`text-7xl font-bold ${timeRemaining <= 5 && timeRemaining > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {timerActive || timeRemaining > 0 ? timeRemaining : workoutData.hiit.time}
              </div>
              <p className="text-sm text-gray-600 mt-2">seconds remaining</p>
            </div>
          </div>

          <div className="space-y-3">
            {currentExerciseIndex < hiitExercises.length - 1 ? (
              <>
                {!timerActive && timeRemaining === 0 ? (
                  <button
                    onClick={startHiitTimer}
                    className="w-full bg-green-500 text-white p-4 rounded-xl font-bold text-lg"
                  >
                    Start Workout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={timerActive ? pauseHiitTimer : () => setTimerActive(true)}
                      className={`w-full ${timerActive ? 'bg-yellow-500' : 'bg-green-500'} text-white p-4 rounded-xl font-bold text-lg`}
                    >
                      {timerActive ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={resetHiitTimer}
                      className="w-full bg-gray-500 text-white p-3 rounded-xl font-semibold"
                    >
                      Reset Current Exercise
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {!timerActive && timeRemaining === 0 ? (
                  currentExerciseIndex === 0 ? (
                    <button
                      onClick={startHiitTimer}
                      className="w-full bg-green-500 text-white p-4 rounded-xl font-bold text-lg"
                    >
                      Start Workout
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          handleHiitComplete(true);
                          setCurrentExerciseIndex(0);
                          setTimeRemaining(0);
                        }}
                        className="w-full bg-green-500 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-6 h-6" />
                        Pass - Complete HIIT
                      </button>
                      <button
                        onClick={() => {
                          handleHiitComplete(false);
                          setCurrentExerciseIndex(0);
                          setTimeRemaining(0);
                        }}
                        className="w-full bg-red-500 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-6 h-6" />
                        Fail - End Session
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    <button
                      onClick={timerActive ? pauseHiitTimer : () => setTimerActive(true)}
                      className={`w-full ${timerActive ? 'bg-yellow-500' : 'bg-green-500'} text-white p-4 rounded-xl font-bold text-lg`}
                    >
                      {timerActive ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={resetHiitTimer}
                      className="w-full bg-gray-500 text-white p-3 rounded-xl font-semibold"
                    >
                      Reset Current Exercise
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <div className="mt-6 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">All Exercises:</h4>
            <ul className="space-y-1 text-sm">
              {hiitExercises.map((exercise, idx) => (
                <li
                  key={idx}
                  className={`${
                    idx === currentExerciseIndex
                      ? 'font-bold text-orange-600'
                      : idx < currentExerciseIndex
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700'
                  }`}
                >
                  {idx + 1}. {exercise}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeightsSelect = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setScreen('home')}
          className="text-white mb-4 flex items-center"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Select Workout Day</h2>
          
          <div className="space-y-3">
            {[1, 2, 3, 4].map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSessionData({ ...sessionData, currentWeightsDay: day });
                  setScreen('weights');
                  setCurrentExerciseIndex(0);
                }}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 text-white p-5 rounded-xl shadow-lg transform transition hover:scale-105 active:scale-95"
              >
                <h3 className="text-xl font-bold">Day {day}</h3>
                <p className="text-sm opacity-90">{weightsProgram[`day${day}`].name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeights = () => {
    const currentDay = sessionData.currentWeightsDay;
    const dayKey = `day${currentDay}`;
    const program = weightsProgram[dayKey];
    const currentExercise = program.exercises[currentExerciseIndex];
    const savedWeight = workoutData.weights[dayKey][currentExercise.name] || 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setScreen('weights-select')}
            className="text-white mb-4 flex items-center"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Back</span>
          </button>

          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Day {currentDay}: {program.name}</h2>
            <p className="text-gray-600 mb-6">1 set - Max weight</p>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Exercise {currentExerciseIndex + 1} of {program.exercises.length}
              </p>
              <h3 className="text-2xl font-bold text-purple-700 mb-2">
                {currentExercise.name}
              </h3>
              <p className="text-lg text-gray-700">{currentExercise.reps} reps</p>
              {savedWeight > 0 && (
                <p className="text-sm text-green-600 font-semibold mt-2">
                  Target: {savedWeight}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Weight used:</label>
              <input
                type="number"
                step="0.5"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                placeholder={savedWeight > 0 ? `Last: ${savedWeight}` : 'Enter weight'}
                className="w-full p-3 border-2 border-gray-300 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  const weight = parseFloat(currentWeight) || savedWeight;
                  
                  const updatedWeightsResults = {
                    ...sessionData.weightsResults,
                    [currentExercise.name]: { passed: true, weight: weight }
                  };

                  if (currentExerciseIndex < program.exercises.length - 1) {
                    setSessionData({ ...sessionData, weightsResults: updatedWeightsResults });
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentWeight('');
                  } else {
                    const updatedSessionData = {
                      ...sessionData,
                      weightsResults: updatedWeightsResults,
                      weightsComplete: true
                    };
                    setSessionData(updatedSessionData);
                    
                    if (checkSessionComplete(updatedSessionData)) {
                      completeSession(updatedSessionData);
                    } else {
                      setScreen('home');
                    }
                    setCurrentWeight('');
                  }
                }}
                className="w-full bg-green-500 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" />
                {currentExerciseIndex < program.exercises.length - 1 ? 'Pass - Next Exercise' : 'Pass - Complete Weights'}
              </button>
              
              <button
                onClick={async () => {
                  const weight = parseFloat(currentWeight) || savedWeight;
                  const penalizedWeight = weight > 0 ? roundUpWeight(weight * 0.99) : 0;
                  
                  const newWorkoutData = {
                    ...workoutData,
                    weights: {
                      ...workoutData.weights,
                      [dayKey]: {
                        ...workoutData.weights[dayKey],
                        [currentExercise.name]: penalizedWeight
                      }
                    }
                  };
                  
                  setWorkoutData(newWorkoutData);
                  await saveWorkoutData(newWorkoutData);

                  const updatedWeightsResults = {
                    ...sessionData.weightsResults,
                    [currentExercise.name]: { passed: false, weight: penalizedWeight }
                  };

                  if (currentExerciseIndex < program.exercises.length - 1) {
                    setSessionData({ ...sessionData, weightsResults: updatedWeightsResults });
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentWeight('');
                  } else {
                    const updatedSessionData = {
                      ...sessionData,
                      weightsResults: updatedWeightsResults,
                      weightsComplete: true
                    };
                    setSessionData(updatedSessionData);
                    
                    if (checkSessionComplete(updatedSessionData)) {
                      completeSession(updatedSessionData);
                    } else {
                      setScreen('home');
                    }
                    setCurrentWeight('');
                  }
                }}
                className="w-full bg-red-500 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <XCircle className="w-6 h-6" />
                {currentExerciseIndex < program.exercises.length - 1 ? 'Fail - Next Exercise (-1%)' : 'Fail - Complete Weights (-1%)'}
              </button>

              <button
                onClick={() => {
                  setScreen('home');
                  setCurrentWeight('');
                }}
                className="w-full bg-gray-600 text-white p-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
              >
                End Workout Early
              </button>
            </div>

            <div className="mt-6 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Today's Exercises:</h4>
              <ul className="space-y-1 text-sm">
                {program.exercises.map((ex, idx) => (
                  <li
                    key={idx}
                    className={`${
                      idx === currentExerciseIndex
                        ? 'font-bold text-purple-600'
                        : idx < currentExerciseIndex
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700'
                    }`}
                  >
                    {idx + 1}. {ex.name} - {ex.reps} reps
                    {workoutData.weights[dayKey][ex.name] > 0 && (
                      <span className="text-green-600 ml-2">({workoutData.weights[dayKey][ex.name]})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVO2Max = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 p-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => setScreen('home')}
          className="text-white mb-4 flex items-center"
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">VO2 Max Training</h2>
          <p className="text-gray-600 mb-6">4 x 1 minute at max speed</p>
          <p className="text-gray-600 mb-6">1 minute rest between intervals</p>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Set speed:</label>
            <input
              type="number"
              step="0.1"
              value={tempSpeed}
              onChange={(e) => setTempSpeed(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            />
            <button
              onClick={async () => {
                const newData = {
                  ...workoutData,
                  vo2max: { speed: parseFloat(tempSpeed) || 10.0 }
                };
                setWorkoutData(newData);
                await saveWorkoutData(newData);
              }}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded-lg"
            >
              Update Speed
            </button>
          </div>

          <div className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-lg mb-6 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-2">Target Speed</p>
            <p className="text-5xl font-bold text-green-700">{workoutData.vo2max.speed}</p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-yellow-800 mb-2">Workout Protocol:</h4>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li>• Interval 1: 1 min at {workoutData.vo2max.speed}</li>
              <li>• Rest: 1 minute</li>
              <li>• Interval 2: 1 min at {workoutData.vo2max.speed}</li>
              <li>• Rest: 1 minute</li>
              <li>• Interval 3: 1 min at {workoutData.vo2max.speed}</li>
              <li>• Rest: 1 minute</li>
              <li>• Interval 4: 1 min at {workoutData.vo2max.speed}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleVO2Complete(true)}
              className="w-full bg-green-500 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              Pass - Complete VO2 Max
            </button>
            <button
              onClick={() => handleVO2Complete(false)}
              className="w-full bg-red-500 text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <XCircle className="w-6 h-6" />
              Fail - End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {screen === 'home' && renderHome()}
      {screen === 'hiit' && renderHiit()}
      {screen === 'weights-select' && renderWeightsSelect()}
      {screen === 'weights' && renderWeights()}
      {screen === 'vo2max' && renderVO2Max()}
    </>
  );
}