export default function FerrariLogo() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ferrari-logo"
    >
      {/* Yellow background */}
      <rect width="60" height="60" fill="#FFD700" rx="4" />

      {/* Red prancing horse (cavallo rampante) */}
      <g transform="translate(10, 8)">
        {/* Horse body */}
        <ellipse cx="20" cy="20" rx="12" ry="14" fill="#DC143C" />

        {/* Horse head */}
        <circle cx="28" cy="12" r="6" fill="#DC143C" />

        {/* Horse neck */}
        <path
          d="M 26 16 Q 28 18 27 22"
          stroke="#DC143C"
          strokeWidth="2"
          fill="none"
        />

        {/* Front legs - rearing position */}
        <line x1="22" y1="32" x2="18" y2="42" stroke="#DC143C" strokeWidth="2.5" />
        <line x1="26" y1="33" x2="24" y2="43" stroke="#DC143C" strokeWidth="2.5" />

        {/* Back legs */}
        <line x1="14" y1="32" x2="10" y2="42" stroke="#DC143C" strokeWidth="2.5" />
        <line x1="10" y1="32" x2="6" y2="42" stroke="#DC143C" strokeWidth="2.5" />

        {/* Tail */}
        <path
          d="M 10 24 Q 0 25 -2 20"
          stroke="#DC143C"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Horse snout */}
        <circle cx="32" cy="12" r="2.5" fill="#DC143C" />
      </g>

      {/* Red border */}
      <rect
        x="0"
        y="0"
        width="60"
        height="60"
        fill="none"
        stroke="#DC143C"
        strokeWidth="2"
        rx="4"
      />
    </svg>
  )
}
