import React from 'react';
import { Trophy, Activity, Dumbbell, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function Intro({ onComplete }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white mb-3">No Days Off Gym Club</h1>
          <p className="text-2xl text-blue-200 font-semibold">Get 2% Better Every Day</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">How It Works</h2>

          {/* The 3 Workouts */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Complete 3 Workouts Per Session
            </h3>
            <div className="space-y-3 ml-8">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">HIIT Training</p>
                  <p className="text-gray-600 text-sm">19 exercises with automated timer and voice guidance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Dumbbell className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Weights</p>
                  <p className="text-gray-600 text-sm">4-day split program with progressive overload tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">VO2 Max</p>
                  <p className="text-gray-600 text-sm">4 x 1-minute intervals at maximum speed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progression System */}
          <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Smart Progression System
            </h3>
            <div className="space-y-3 ml-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-bold text-green-700">Consecutive Days: +2%</p>
                  <p className="text-gray-700 text-sm">Work out daily to boost all your numbers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">😌</span>
                <div>
                  <p className="font-bold text-yellow-700">Rest Day (2 days ago): No Change</p>
                  <p className="text-gray-700 text-sm">One rest day allowed without penalty</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📉</span>
                <div>
                  <p className="font-bold text-red-700">Missed Days (3+ days): -1%</p>
                  <p className="text-gray-700 text-sm">Numbers decrease if you skip too long</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Rules */}
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-300 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Important Rules
            </h3>
            <ul className="space-y-3 ml-8 text-gray-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Complete ALL 3 workouts</strong> in one session for improvements to apply</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>PASS</strong> a weight exercise to be eligible for +2% next time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>FAIL</strong> a weight exercise to get immediate -1% on that exercise</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Time</strong> rounds up to nearest second</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Weight</strong> rounds up to nearest 0.5</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>Speed</strong> rounds up to nearest 0.1</span>
              </li>
            </ul>
          </div>

          {/* Getting Started */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
            <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Getting Started
            </h3>
            <ol className="space-y-2 ml-8 text-gray-800">
              <li><strong>1.</strong> Start with comfortable baseline numbers</li>
              <li><strong>2.</strong> Complete all 3 workouts in your first session</li>
              <li><strong>3.</strong> Return daily to get your 2% boost</li>
              <li><strong>4.</strong> Track your streak and watch yourself improve!</li>
            </ol>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 transform transition hover:scale-105 active:scale-95 shadow-lg"
          >
            Let's Get Started! 💪
          </button>
        </div>

        <p className="text-center text-blue-200 text-sm">
          You can always view this info again from Settings
        </p>
      </div>
    </div>
  );
}
