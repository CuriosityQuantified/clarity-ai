'use client';

interface ConfidenceGaugeProps {
  score: number;
}

function getConfidenceLabel(score: number): string {
  if (score > 80) return 'High Confidence';
  if (score > 50) return 'Medium Confidence';
  return 'Low Confidence';
}

export function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const label = getConfidenceLabel(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width="130" height="130" viewBox="0 0 130 130" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="#1a1a24"
            strokeWidth="10"
          />
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 65 65)"
            className="gauge-progress"
          />
        </svg>
        <span className="absolute text-4xl font-bold text-white">
          {score}%
        </span>
      </div>
      <span className="text-sm font-semibold text-green-500">{label}</span>
    </div>
  );
}
