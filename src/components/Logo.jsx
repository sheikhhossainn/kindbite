export default function Logo({ className = "w-10 h-10" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* The Bowl Shape - Orange */}
            <path
                d="M20 50 C20 70 35 85 50 85 C65 85 80 70 80 50 L20 50 Z"
                className="fill-orange-500"
            />

            {/* The Rice Mound - Warm White/Cream with texture bumps */}
            <path
                d="M25 50 C25 35 35 25 50 25 C65 25 75 35 75 50 H25 Z"
                className="fill-orange-50"
            />

            {/* Rice Grain Details - Subtle texture */}
            <circle cx="40" cy="35" r="2" className="fill-orange-200" />
            <circle cx="50" cy="30" r="2" className="fill-orange-200" />
            <circle cx="60" cy="35" r="2" className="fill-orange-200" />
            <circle cx="45" cy="42" r="2" className="fill-orange-200" />
            <circle cx="55" cy="42" r="2" className="fill-orange-200" />

            {/* Steam Lines - Representing Warmth */}
            <path
                d="M40 20 C38 15 40 10 40 10"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-60"
            />
            <path
                d="M50 15 C48 10 50 5 50 5"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-80"
            />
            <path
                d="M60 20 C58 15 60 10 60 10"
                stroke="#f97316"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-60"
            />
        </svg>
    );
}
