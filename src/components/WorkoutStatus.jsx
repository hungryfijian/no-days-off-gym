import React from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Flame, Award } from 'lucide-react';

export default function WorkoutStatus({ workoutData }) {
  const getDaysSinceLastWorkout = (lastWorkout) => {
    if (!lastWorkout) return null;
    const today = new Date();
    const last = new Date(lastWorkout);
    const diffTime = Math.abs(today - last);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = () => {
    const daysSince = getDaysSinceLastWorkout(workoutData.lastWorkout);

    if (daysSince === null) {
      return {
        title: "Ready to Start Your Journey",
        icon: Award,
        color: "from-blue-500 to-blue-600",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        today: "Start today and set your baseline numbers",
        tomorrow: "The sooner you start, the sooner you improve"
      };
    }

    if (daysSince === 0) {
      return {
        title: "Already Trained Today",
        icon: Award,
        color: "from-green-500 to-green-600",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        today: "Great work! Come back tomorrow for your +2% boost",
        tomorrow: "Train tomorrow to maintain your streak and get +2% on everything"
      };
    }

    if (daysSince === 1) {
      return {
        title: "Consecutive Day Bonus Ready",
        icon: TrendingUp,
        color: "from-green-500 to-emerald-600",
        textColor: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        today: "Train today to get +2% on all your numbers",
        tomorrow: "Miss today and it becomes a rest day (no change)"
      };
    }

    if (daysSince === 2) {
      return {
        title: "Rest Day - No Changes",
        icon: Minus,
        color: "from-yellow-500 to-yellow-600",
        textColor: "text-yellow-700",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        today: "Train today to restart your streak",
        tomorrow: "Wait another day and you'll face -1% penalties"
      };
    }

    return {
      title: "Penalty Applied - Time to Return",
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
      textColor: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      today: "Train today to stop further penalties (-1% already applied)",
      tomorrow: "Each day missed = another -1% penalty"
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;
  const daysSince = getDaysSinceLastWorkout(workoutData.lastWorkout);

  return (
    <div className={`${status.bgColor} border-2 ${status.borderColor} rounded-2xl p-6 mb-6`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`bg-gradient-to-br ${status.color} p-3 rounded-xl`}>
          <StatusIcon className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${status.textColor} mb-1`}>
            {status.title}
          </h3>
          {workoutData.lastWorkout && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last workout: {formatDate(workoutData.lastWorkout)}</span>
            </div>
          )}
        </div>
      </div>

      {workoutData.consecutiveDays > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-white bg-opacity-50 rounded-lg p-3">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-gray-700">
            {workoutData.consecutiveDays} day streak
          </span>
        </div>
      )}

      <div className="space-y-3">
        <div className="bg-white bg-opacity-70 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">If You Train Today</p>
          <p className={`font-semibold ${status.textColor}`}>{status.today}</p>
        </div>

        <div className="bg-white bg-opacity-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">If You Wait Until Tomorrow</p>
          <p className="text-gray-700">{status.tomorrow}</p>
        </div>
      </div>

      {daysSince !== null && daysSince > 2 && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-sm text-red-800 font-semibold">
            Your numbers have already decreased by 1%. Train today to prevent further losses.
          </p>
        </div>
      )}
    </div>
  );
}
