import React, { useState, useEffect } from 'react';
import { Clock, Dumbbell, Activity, ChevronLeft, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

export default function GymApp() {
  const [screen, setScreen] = useState('home');

  // Load saved data from localStorage or use defaults
  const [workoutData, setWorkoutData] = useState(() => {
    const saved = localStorage.getItem('gymWorkoutData');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      hiit: { time: 30 },
      weights: {
        day1: {},
        day2: {},
        day3: {},
        day4: {}
      },
      vo2max: { speed: 10.0 },
      lastWorkout: null,
      consecutiveDays: 0
    };
  });

  // Session state - tracks current session progress
  const [sessionData, setSessionData] = useState({
    hiitComplete: false,
    weightsComplete: false,
    vo2maxComplete: false,
    currentWeightsDay: 1,
    weightsResults: {}
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [tempTime, setTempTime] = useState(() => {
    const saved = localStorage.getItem('gymWorkoutData');
    if (saved) {
      return JSON.parse(saved).hiit.time.toString();
    }
    return '30';
  });
  const [tempSpeed, setTempSpeed] = useState(() => {
    const saved = localStorage.getItem('gymWorkoutData');
    if (saved) {
      return JSON.parse(saved).vo2max.speed.toString();
    }
    return '10.0';
  });

  // HIIT Timer states
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Save to localStorage whenever workoutData changes
  useEffect(() => {
    localStorage.setItem('gymWorkoutData', JSON.stringify(workoutData));
  }, [workoutData]);

  // Rounding functions
  const roundUpTime = (value) => {
    // Round up to nearest full second
    return Math.ceil(value);
  };

  const roundUpWeight = (value) => {
    // Round up to nearest 0.5
    return Math.ceil(value * 2) / 2;
  };

  const roundUpSpeed = (value) => {
    // Round up to nearest 0.1
    return Math.ceil(value * 10) / 10;
  };

  // HIIT Timer countdown
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer finished
          clearInterval(interval);
          setTimerActive(false);

          // Move to next exercise
          if (currentExerciseIndex < hiitExercises.length - 1) {
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);

            // Announce next exercise
            setTimeout(() => {
              speakExercise(hiitExercises[nextIndex]);
              // Start timer for next exercise
              setTimeout(() => {
                setTimeRemaining(workoutData.hiit.time);
                setTimerActive(true);
              }, 2000); // 2 second delay after announcement
            }, 500);
          }

          return 0;
        }

        // Beep countdown for last 5 seconds
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
    'Leg raises', 'Alternate leg raises', 'Knees to chest',
    'Barbell squats', 'Deadlifts'
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

  const calculateAdjustment = (lastWorkout, currentValue, type = 'time') => {
    const daysSince = getDaysSinceLastWorkout(lastWorkout);

    if (daysSince === null) return currentValue; // First workout
    if (daysSince === 1) {
      // Consecutive day: +2%
      const increased = currentValue * 1.02;
      if (type === 'time') return roundUpTime(increased);
      if (type === 'weight') return roundUpWeight(increased);
      if (type === 'speed') return roundUpSpeed(increased);
    }
    if (daysSince === 2) return currentValue; // Rest day: no change
    if (daysSince > 2) {
      // Missed day: -1%
      const decreased = currentValue * 0.99;
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

  const completeSession = (updatedSessionData) => {
    const daysSince = getDaysSinceLastWorkout(workoutData.lastWorkout);
    const newConsecutiveDays = daysSince === 1 ? workoutData.consecutiveDays + 1 : 1;

    // Apply adjustments to HIIT and VO2 Max
    const newHiitTime = calculateAdjustment(workoutData.lastWorkout, workoutData.hiit.time, 'time');
    const newVO2Speed = calculateAdjustment(workoutData.lastWorkout, workoutData.vo2max.speed, 'speed');

    // Apply adjustments to weights that were PASSED
    const dayKey = `day${updatedSessionData.currentWeightsDay}`;
    const updatedDayWeights = { ...workoutData.weights[dayKey] };

    Object.keys(updatedSessionData.weightsResults).forEach(exerciseName => {
      if (updatedSessionData.weightsResults[exerciseName].passed) {
        const currentWeight = updatedSessionData.weightsResults[exerciseName].weight;
        if (currentWeight > 0) {
          updatedDayWeights[exerciseName] = calculateAdjustment(workoutData.lastWorkout, currentWeight, 'weight');
        }
      }
      // Failed exercises already got their -1% immediately, so don't touch them here
    });

    setWorkoutData({
      ...workoutData,
      hiit: { time: newHiitTime },
      vo2max: { speed: newVO2Speed },
      weights: {
        ...workoutData.weights,
        [dayKey]: updatedDayWeights
      },
      lastWorkout: new Date().toISOString(),
      consecutiveDays: newConsecutiveDays
    });

    // Reset session
    setSessionData({
      hiitComplete: false,
      weightsComplete: false,
      vo2maxComplete: false,
      currentWeightsDay: 1,
      weightsResults: {}
    });

    alert('<‰ Full session complete! All improvements applied!');
    setScreen('home');
  };

  const handleHiitComplete = (passed) => {
    if (passed) {
      const updatedSessionData = { ...sessionData, hiitComplete: true };
      setSessionData(updatedSessionData);

      if (checkSessionComplete(updatedSessionData)) {
        completeSession(updatedSessionData);
      } else {
        setScreen('home');
      }
    } else {
      // Failed - end session without saving
      setSessionData({
        hiitComplete: false,
        weightsComplete: false,
        vo2maxComplete: false,
        currentWeightsDay: 1,
        weightsResults: {}
      });
      setScreen('home');
    }
  };

  const handleVO2Complete = (passed) => {
    if (passed) {
      const updatedSessionData = { ...sessionData, vo2maxComplete: true };
      setSessionData(updatedSessionData);

      if (checkSessionComplete(updatedSessionData)) {
        completeSession(updatedSessionData);
      } else {
        setScreen('home');
      }
    } else {
      // Failed - end session without saving
      setSessionData({
        hiitComplete: false,
        weightsComplete: false,
        vo2maxComplete: false,
        currentWeightsDay: 1,
        weightsResults: {}
      });
      setScreen('home');
    }
  };

  const getStatusMessage = (lastWorkout) => {
    const daysSince = getDaysSinceLastWorkout(lastWorkout);

    if (daysSince === null) return { text: 'Start your journey!', color: 'text-blue-200' };
    if (daysSince === 1) return { text: '+2% boost ready!', color: 'text-green-300' };
    if (daysSince === 2) return { text: 'Rest day - no change', color: 'text-yellow-300' };
    if (daysSince > 2) return { text: '-1% penalty applied', color: 'text-red-300' };

    return { text: '', color: '' };
  };

  const resetAllData = () => {
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
        consecutiveDays: 0
      };
      setWorkoutData(defaultData);
      setSessionData({
        hiitComplete: false,
        weightsComplete: false,
        vo2maxComplete: false,
        currentWeightsDay: 1,
        weightsResults: {}
      });
      setTempTime('30');
      setTempSpeed('10.0');
      localStorage.setItem('gymWorkoutData', JSON.stringify(defaultData));
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

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">No Days Off Gym Club</h1>
          <p className="text-blue-200">Get 2% better every day</p>

          {(sessionData.hiitComplete || sessionData.weightsComplete || sessionData.vo2maxComplete) && (
            <div className="mt-4 bg-yellow-500 text-yellow-900 px-4 py-3 rounded-lg font-bold">
              Session Progress: {getSessionProgress()} complete
              <p className="text-sm font-normal mt-1">Complete all 3 to apply improvements!</p>
            </div>
          )}
        </div>

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
            <h2 className="text-2xl font-bold mb-1">HIIT Training {sessionData.hiitComplete && ''}</h2>
            <p className="text-sm opacity-90">Current: {workoutData.hiit.time} seconds per exercise</p>
            <p className="text-xs opacity-75 mt-1">Streak: {workoutData.consecutiveDays} days</p>
            <p className={`text-xs font-semibold mt-1 ${getStatusMessage(workoutData.lastWorkout).color}`}>
              {getStatusMessage(workoutData.lastWorkout).text}
            </p>
          </button>

          <button
            onClick={() => setScreen('weights-select')}
            className={`w-full ${sessionData.weightsComplete ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-purple-500 to-pink-500'} text-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95`}
          >
            <Dumbbell className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-1">Weights {sessionData.weightsComplete && ''}</h2>
            <p className="text-sm opacity-90">Progressive overload tracking</p>
            <p className="text-xs opacity-75 mt-1">Streak: {workoutData.consecutiveDays} days</p>
            <p className={`text-xs font-semibold mt-1 ${getStatusMessage(workoutData.lastWorkout).color}`}>
              {getStatusMessage(workoutData.lastWorkout).text}
            </p>
          </button>

          <button
            onClick={() => setScreen('vo2max')}
            className={`w-full ${sessionData.vo2maxComplete ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-green-500 to-teal-500'} text-white p-6 rounded-2xl shadow-lg transform transition hover:scale-105 active:scale-95`}
          >
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <h2 className="text-2xl font-bold mb-1">VO2 Max Training {sessionData.vo2maxComplete && ''}</h2>
            <p className="text-sm opacity-90">Current: {workoutData.vo2max.speed}</p>
            <p className="text-xs opacity-75 mt-1">Streak: {workoutData.consecutiveDays} days</p>
            <p className={`text-xs font-semibold mt-1 ${getStatusMessage(workoutData.lastWorkout).color}`}>
              {getStatusMessage(workoutData.lastWorkout).text}
            </p>
          </button>
        </div>

        <button
          onClick={resetAllData}
          className="w-full mt-8 bg-gray-700 bg-opacity-50 text-white p-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-70 transition"
        >
          <RotateCcw className="w-5 h-5" />
          Reset All Data
        </button>
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
              onClick={() => {
                setWorkoutData({
                  ...workoutData,
                  hiit: { time: parseInt(tempTime) || 30 }
                });
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

            {/* Timer Display */}
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

                  // Record this as a PASS
                  const updatedWeightsResults = {
                    ...sessionData.weightsResults,
                    [currentExercise.name]: { passed: true, weight: weight }
                  };

                  if (currentExerciseIndex < program.exercises.length - 1) {
                    setSessionData({ ...sessionData, weightsResults: updatedWeightsResults });
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentWeight('');
                  } else {
                    // All exercises complete
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
                onClick={() => {
                  const weight = parseFloat(currentWeight) || savedWeight;

                  // Apply immediate -1% penalty
                  const penalizedWeight = weight > 0 ? roundUpWeight(weight * 0.99) : 0;

                  // Update workout data immediately
                  setWorkoutData({
                    ...workoutData,
                    weights: {
                      ...workoutData.weights,
                      [dayKey]: {
                        ...workoutData.weights[dayKey],
                        [currentExercise.name]: penalizedWeight
                      }
                    }
                  });

                  // Record this as a FAIL
                  const updatedWeightsResults = {
                    ...sessionData.weightsResults,
                    [currentExercise.name]: { passed: false, weight: penalizedWeight }
                  };

                  if (currentExerciseIndex < program.exercises.length - 1) {
                    setSessionData({ ...sessionData, weightsResults: updatedWeightsResults });
                    setCurrentExerciseIndex(currentExerciseIndex + 1);
                    setCurrentWeight('');
                  } else {
                    // All exercises complete
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
              onClick={() => setWorkoutData({
                ...workoutData,
                vo2max: { speed: parseFloat(tempSpeed) || 10.0 }
              })}
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
              <li>" Interval 1: 1 min at {workoutData.vo2max.speed}</li>
              <li>" Rest: 1 minute</li>
              <li>" Interval 2: 1 min at {workoutData.vo2max.speed}</li>
              <li>" Rest: 1 minute</li>
              <li>" Interval 3: 1 min at {workoutData.vo2max.speed}</li>
              <li>" Rest: 1 minute</li>
              <li>" Interval 4: 1 min at {workoutData.vo2max.speed}</li>
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
