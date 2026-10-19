
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/tasks";

const STATS = [
  { title: "Overall Performance", value: "94%", sub: "/ +2.1%" },
  { title: "Task Completion", value: "91%", sub: "/ 12/14 Tasks" },
  { title: "Goals Achieved", value: "5 of 6", sub: "/ Progress" },
  { title: "Current Rating", value: "4.8", sub: "/ 5.0" },
];

const COLUMNS = ["To Do", "In Progress", "Completed"];

const GOALS = [{ fill: 90 }, { fill: 80 }, { fill: 65 }];

const CHART = [
  ["Jan", 30],
  ["Mar", 41],
  ["May", 33],
  ["Jul", 45],
  ["Sep", 56],
  ["Nov", 56],
  ["Dec", 69],
];

// Sample tasks are displayed along with database tasks.
// Sample tasks do not have MongoDB IDs and are not saved to MongoDB.
const INITIAL_TASKS = [
  {
    id: "sample-1",
    name: "Complete Employee Dashboard",
    date: "Oct 15",
    priority: "High",
    status: "To Do",
    isSample: true,
  },
  {
    id: "sample-2",
    name: "Review Employee Performance",
    date: "Oct 17",
    priority: "Medium",
    status: "To Do",
    isSample: true,
  },
  {
    id: "sample-3",
    name: "Update HR Documentation",
    date: "Oct 18",
    priority: "Low",
    status: "To Do",
    isSample: true,
  },
  {
    id: "sample-4",
    name: "Complete Attendance Report",
    date: "Oct 16",
    priority: "High",
    status: "In Progress",
    isSample: true,
  },
  {
    id: "sample-5",
    name: "Review Monthly Goals",
    date: "Oct 19",
    priority: "Medium",
    status: "In Progress",
    isSample: true,
  },
  {
    id: "sample-6",
    name: "Prepare Weekly Report",
    date: "Oct 12",
    priority: "Medium",
    status: "Completed",
    isSample: true,
  },
];

function getToken() {
  return localStorage.getItem("token");
}

function formatTask(task) {
  const statusMap = {
    todo: "To Do",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  return {
    ...task,
    id: task._id,
    name: task.title,
    date: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "No due date",
    priority: task.priority
      ? task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1)
      : "Medium",
    status: statusMap[task.status] || "To Do",
    isSample: false,
  };
}

function StatCard({ title, value, sub }) {
  return (
    <div className="relative rounded-2xl bg-[#541D25] px-5 py-4 text-[#FFF5ED]">
      <p className="pr-8 text-[17px]">{title}</p>

      <span className="absolute right-5 top-5 h-2 w-5 rounded-full bg-[#D9A0A4]" />

      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-[38px] font-bold leading-tight">
          {value}
        </span>
        <span className="text-[17px] text-[#E9B8BA]">{sub}</span>
      </p>
    </div>
  );
}

function TaskCard({ task, onMove, updating }) {
  const dark = task.status === "Completed";

  return (
    <div
      className={`rounded-xl px-4 py-3 ${
        dark
          ? "bg-[#541D25] text-[#FFF5ED]"
          : "border border-[#CBB9AD] bg-[#F8F0E7] text-[#4A1820]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[16px] font-medium leading-snug">
          {task.name}
        </p>

        <span className="shrink-0 text-[15px]">{task.date}</span>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p
            className={`text-[14px] ${
              dark ? "text-[#E9B8BA]" : "text-[#6B4A4F]"
            }`}
          >
            Move to
          </p>

          <select
            aria-label={`Move ${task.name}`}
            value={task.status}
            disabled={updating}
            onChange={(e) => onMove(task, e.target.value)}
            className={`mt-1 cursor-pointer rounded bg-transparent text-[13px] outline-none disabled:opacity-50 ${
              dark ? "text-[#E9B8BA]" : "text-[#6B4A4F]"
            }`}
          >
            {COLUMNS.map((column) => (
              <option
                key={column}
                value={column}
                className="text-[#4A1820]"
              >
                {column}
              </option>
            ))}
          </select>
        </div>

        <span className="rounded bg-[#D9A0A4] px-2.5 py-0.5 text-[13px] text-[#4A1820]">
          {task.priority}
        </span>
      </div>
    </div>
  );
}

function PerformanceChart() {
  const L = 34;
  const R = 290;
  const T = 8;
  const B = 134;

  const px = (i) => L + (i * (R - L)) / (CHART.length - 1);
  const py = (v) => B - (v / 80) * (B - T);

  const pts = CHART.map(([, value], i) => `${px(i)},${py(value)}`).join(" ");

  return (
    <svg
      viewBox="0 0 300 160"
      className="mt-2 h-auto w-full"
      role="img"
      aria-label="Performance chart"
    >
      {[0, 20, 40, 60, 80].map((value) => (
        <g key={value}>
          <line
            x1={L}
            x2={R}
            y1={py(value)}
            y2={py(value)}
            stroke="#FFF5ED"
            strokeOpacity="0.12"
          />
          <text
            x={L - 8}
            y={py(value) + 4}
            textAnchor="end"
            fontSize="11"
            fill="#FFF5ED"
            fillOpacity="0.85"
          >
            {value}
          </text>
        </g>
      ))}

      <polyline
        points={pts}
        fill="none"
        stroke="#FFF5ED"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {CHART.map(([month, value], i) => (
        <g key={month}>
          <circle
            cx={px(i)}
            cy={py(value)}
            r="4"
            fill="#D9A0A4"
          />
          <text
            x={px(i)}
            y={154}
            textAnchor="middle"
            fontSize="11"
            fill="#FFF5ED"
            fillOpacity="0.85"
          >
            {month}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Load database tasks and preserve sample tasks.
  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      try {
        const token = getToken();

        if (!token) {
          throw new Error("Login token nahi mila. Dobara login karo.");
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Tasks load nahi hue.");
        }

        if (!cancelled) {
          const databaseTasks = Array.isArray(result.data)
            ? result.data.map(formatTask)
            : [];

          // Keep sample tasks, and avoid duplicate database tasks.
          const databaseIds = new Set(
            databaseTasks.map((task) => task.id)
          );

          const samples = INITIAL_TASKS.filter(
            (task) => !databaseIds.has(task.id)
          );

          setTasks([...samples, ...databaseTasks]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Database tasks load nahi hue. Sample tasks dikhaye ja rahe hain."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  async function moveTask(task, newStatus) {
    // Sample task: update only in React state.
    if (task.isSample) {
      setTasks((list) =>
        list.map((item) =>
          item.id === task.id
            ? { ...item, status: newStatus }
            : item
        )
      );
      return;
    }

    // Database task: save status through the backend.
    try {
      setUpdatingId(task.id);
      setError("");

      const token = getToken();

      const statusMap = {
        "To Do": "todo",
        "In Progress": "in-progress",
        Completed: "completed",
      };

      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: statusMap[newStatus],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Task status update nahi hua."
        );
      }

      setTasks((list) =>
        list.map((item) =>
          item.id === task.id
            ? formatTask(result.data)
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Status update nahi hua.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="px-4 py-6 sm:px-8 lg:px-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-[44px] sm:leading-tight">
        Tasks
      </h1>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {STATS.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      {/* Task Board */}
      <h2 className="mt-8 text-2xl font-bold">Task Board</h2>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-3 overflow-x-auto pb-2">
        <div className="grid min-w-[720px] grid-cols-3 gap-4 xl:gap-5">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column
            );

            return (
              <div key={column}>
                <div className="rounded-t-md bg-[#541D25] px-4 py-2.5 text-lg text-[#FFF5ED]">
                  {column}
                </div>

                <div className="mt-3 flex flex-col gap-3 px-3 sm:px-4">
                  {loading && (
                    <p className="py-4 text-sm text-[#6B4A4F]">
                      Loading tasks...
                    </p>
                  )}

                  {!loading &&
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={moveTask}
                        updating={updatingId === task.id}
                      />
                    ))}

                  {!loading && columnTasks.length === 0 && (
                    <p className="py-4 text-sm text-[#6B4A4F]">
                      No tasks here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Cards */}
      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl bg-[#541D25] p-5 text-[#FFF5ED]">
          <h3 className="text-2xl font-semibold">Performance</h3>
          <PerformanceChart />
        </div>

        <div className="rounded-2xl bg-[#541D25] p-5 text-[#FFF5ED]">
          <h3 className="text-2xl font-semibold">Goals</h3>

          <p className="mt-3 text-[19px]">KPI Goals</p>

          <div className="mt-3 flex flex-col gap-4">
            {GOALS.map((goal, index) => (
              <div
                key={index}
                className="h-1.5 w-full rounded-full bg-[#D9A0A4]/30"
              >
                <div
                  className="h-full rounded-full bg-[#FFF5ED]"
                  style={{ width: `${goal.fill}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[240px] rounded-2xl bg-[#541D25] p-5 text-[#FFF5ED] md:col-span-2 xl:col-span-1">
          <h3 className="text-2xl font-semibold">Manager Feedback</h3>

          <p className="mt-5 text-[17px]">
            <span className="font-medium">Sarah Connor</span>{" "}
            <span className="text-[#E9B8BA]">
              (Manager) • Oct 2026
            </span>
          </p>

          <p className="mt-3 max-w-[300px] text-[17px] leading-snug">
            Great work this quarter on workflow streamlining.
          </p>

          
        </div>
      </section>
    </div>
  );
}

export default Tasks;
