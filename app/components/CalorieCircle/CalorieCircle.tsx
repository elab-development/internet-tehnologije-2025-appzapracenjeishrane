type Props = {
  eaten: number;
  goal: number;
};

export default function CalorieCircle({ eaten, goal }: Props) {
  const radius = 105;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = Math.min(eaten / goal, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative w-[260px] h-[260px]">
      <svg
        className="absolute inset-0 m-auto"
        height={radius * 2}
        width={radius * 2}
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke="#22c55e"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-gray-500">Kalorije</p>
        <p className="text-4xl font-bold text-gray-800">{eaten}</p>
        <p className="text-sm text-gray-500">od {goal}</p>
      </div>
    </div>
  );
}
