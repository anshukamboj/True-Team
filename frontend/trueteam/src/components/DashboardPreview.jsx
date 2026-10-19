
function DashboardPreview() {
  return (
    <div className="flex w-full max-w-[560px] overflow-hidden rounded-xl border border-[#79434b] bg-[#390f17] text-white">

      <div className="w-[30%] shrink-0 bg-[#501c25] p-3">
        <h2 className="mb-7 text-sm font-semibold">
          Empower HR
        </h2>

        {["▦  Dashboard", "◷  Calendar", "♙  Employees",
          "♧  HR & Admin", "⚙  Settings"].map((item, i) => (
          <div
            key={item}
            className={`mb-2 rounded p-2 text-[10px] ${
              i === 0 ? "bg-[#3c1119]" : "text-[#d7b9bd]"
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Dashboard */}
      <div className="min-w-0 flex-1 p-4">

        <h1 className="text-xl font-semibold">Workspace</h1>
        <p className="text-[10px] text-[#d2afb4]">
          Employee Management
        </p>

        {/* Statistics */}
        <div className="my-6 grid grid-cols-3 border-b border-[#57232c] pb-5">
          {[
            ["800", "Employees"],
            ["229", "New Hires"],
            ["224", "Left Early"],
          ].map(([number, label]) => (
            <div key={label}>
              <h2 className="text-lg font-semibold">• {number}</h2>
              <p className="text-[9px] text-[#d2afb4]">{label}</p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Metrics</h2>
          <button className="border border-[#70404a] px-2 py-1 text-[9px]">
            Last 6 Months⌄
          </button>
        </div>

        {/* Chart */}
        <svg viewBox="0 0 320 150" className="mt-4 w-full">
          <path
            d="M5 100 C25 100 30 103 40 83
               S60 65 70 85 S90 92 100 83
               S120 83 130 96 S150 94 160 67
               S185 47 200 58 S225 72 245 65
               S285 68 315 20"
            fill="none"
            stroke="#d5a0a6"
            strokeWidth="2"
          />

          <line
            x1="245" y1="65" x2="245" y2="125"
            stroke="#9d6972"
          />

          <circle cx="245" cy="65" r="3" fill="white" />

          <rect x="230" y="30" width="30" height="15" fill="#9d6972" />
          <text x="245" y="41" fontSize="9" fill="white" textAnchor="middle">
            82%
          </text>

          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <text
              key={day}
              x={5 + i * 61}
              y="143"
              fontSize="9"
              fill="#d2afb4"
            >
              {day}
            </text>
          ))}
        </svg>

      </div>
    </div>
  );
}

export default DashboardPreview;

