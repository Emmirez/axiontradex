import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  TrendingUp,
  ArrowDownCircle,
  PlusCircle,
  Award,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ACTIVITIES = [
  {
    name: "Michael Johnson",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $25,000 in trading portfolio",
    type: "invest",
    amount: "$25,000",
  },
  {
    name: "Jennifer Martinez",
    country: "Canada",
    action: "just withdrew",
    detail: "Successfully withdrew $31,000 to bank account",
    type: "withdraw",
    amount: "$31,000",
  },
  {
    name: "Carlos Mendoza",
    country: "Mexico",
    action: "just invested",
    detail: "Successfully invested $19,500 in trading portfolio",
    type: "invest",
    amount: "$19,500",
  },
  {
    name: "Maria Silva",
    country: "Brazil",
    action: "just deposited",
    detail: "Successfully deposited $9,200 to trading account",
    type: "deposit",
    amount: "$9,200",
  },
  {
    name: "Amanda Jackson",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $48,000 in crypto portfolio",
    type: "invest",
    amount: "$48,000",
  },
  {
    name: "Sophie Laurent",
    country: "France",
    action: "just withdrew",
    detail: "Successfully withdrew $15,750 to bank account",
    type: "withdraw",
    amount: "$15,750",
  },
  {
    name: "James Patel",
    country: "United Kingdom",
    action: "just deposited",
    detail: "Successfully deposited $5,000 to trading account",
    type: "deposit",
    amount: "$5,000",
  },
  {
    name: "Jennifer Taylor",
    country: "Spain",
    action: "just invested",
    detail: "Successfully invested $12,800 in gold portfolio",
    type: "invest",
    amount: "$12,800",
  },
  {
    name: "Lucas Rossi",
    country: "Italy",
    action: "just withdrew",
    detail: "Successfully withdrew $22,400 to bank account",
    type: "withdraw",
    amount: "$22,400",
  },
  {
    name: "Yuki Tanaka",
    country: "Japan",
    action: "just invested",
    detail: "Successfully invested $67,000 in trading portfolio",
    type: "invest",
    amount: "$67,000",
  },
  {
    name: "Fatima Al-Hassan",
    country: "UAE",
    action: "just deposited",
    detail: "Successfully deposited $100,000 to trading account",
    type: "deposit",
    amount: "$100,000",
  },
  {
    name: "Ethan Williams",
    country: "Australia",
    action: "just invested",
    detail: "Successfully invested $8,500 in stocks portfolio",
    type: "invest",
    amount: "$8,500",
  },
  {
    name: "Priya Nair",
    country: "India",
    action: "just withdrew",
    detail: "Successfully withdrew $41,000 to bank account",
    type: "withdraw",
    amount: "$41,000",
  },
  {
    name: "Oliver Schmidt",
    country: "Germany",
    action: "just invested",
    detail: "Successfully invested $33,000 in trading portfolio",
    type: "invest",
    amount: "$33,000",
  },
  {
    name: "Dmitri Volkov",
    country: "Russia",
    action: "just deposited",
    detail: "Successfully deposited $7,500 to trading account",
    type: "deposit",
    amount: "$7,500",
  },
  {
    name: "Sarah Kim",
    country: "South Korea",
    action: "just invested",
    detail: "Successfully invested $55,000 in crypto portfolio",
    type: "invest",
    amount: "$55,000",
  },
  {
    name: "Ahmed Hassan",
    country: "Egypt",
    action: "just withdrew",
    detail: "Successfully withdrew $18,200 to bank account",
    type: "withdraw",
    amount: "$18,200",
  },
  {
    name: "Isabella Costa",
    country: "Portugal",
    action: "just invested",
    detail: "Successfully invested $14,300 in gold portfolio",
    type: "invest",
    amount: "$14,300",
  },
  {
    name: "Ashley Wilson",
    country: "England",
    action: "just deposited",
    detail: "Successfully deposited $20,000 to trading account",
    type: "deposit",
    amount: "$20,000",
  },
  {
    name: "Elena Popescu",
    country: "Romania",
    action: "just invested",
    detail: "Successfully invested $29,700 in trading portfolio",
    type: "invest",
    amount: "$29,700",
  },
  {
    name: "Lars Andersen",
    country: "Denmark",
    action: "just invested",
    detail: "Successfully invested $42,500 in trading portfolio",
    type: "invest",
    amount: "$42,500",
  },
  {
    name: "Emma Johansson",
    country: "Sweden",
    action: "just withdrew",
    detail: "Successfully withdrew $27,800 to bank account",
    type: "withdraw",
    amount: "$27,800",
  },
  {
    name: "Jan Novak",
    country: "Czech Republic",
    action: "just deposited",
    detail: "Successfully deposited $11,300 to trading account",
    type: "deposit",
    amount: "$11,300",
  },
  {
    name: "Anna Kowalski",
    country: "Poland",
    action: "just invested",
    detail: "Successfully invested $19,200 in crypto portfolio",
    type: "invest",
    amount: "$19,200",
  },
  {
    name: "Thomas Müller",
    country: "Austria",
    action: "just withdrew",
    detail: "Successfully withdrew $34,600 to bank account",
    type: "withdraw",
    amount: "$34,600",
  },
  {
    name: "Nina Virtanen",
    country: "Finland",
    action: "just invested",
    detail: "Successfully invested $23,400 in gold portfolio",
    type: "invest",
    amount: "$23,400",
  },
  {
    name: "Dimitris Papadopoulos",
    country: "Greece",
    action: "just deposited",
    detail: "Successfully deposited $8,900 to trading account",
    type: "deposit",
    amount: "$8,900",
  },
  {
    name: "Sofie Van der Berg",
    country: "Netherlands",
    action: "just invested",
    detail: "Successfully invested $56,700 in trading portfolio",
    type: "invest",
    amount: "$56,700",
  },
  {
    name: "Liam O'Connor",
    country: "Ireland",
    action: "just withdrew",
    detail: "Successfully withdrew $45,200 to bank account",
    type: "withdraw",
    amount: "$45,200",
  },
  {
    name: "Eliska Horvath",
    country: "Hungary",
    action: "just deposited",
    detail: "Successfully deposited $6,500 to trading account",
    type: "deposit",
    amount: "$6,500",
  },
  {
    name: "Mateusz Zielinski",
    country: "Poland",
    action: "just invested",
    detail: "Successfully invested $38,900 in crypto portfolio",
    type: "invest",
    amount: "$38,900",
  },
  {
    name: "Clara Dubois",
    country: "Belgium",
    action: "just withdrew",
    detail: "Successfully withdrew $16,400 to bank account",
    type: "withdraw",
    amount: "$16,400",
  },
  {
    name: "Viktor Petrov",
    country: "Bulgaria",
    action: "just invested",
    detail: "Successfully invested $21,800 in trading portfolio",
    type: "invest",
    amount: "$21,800",
  },
  {
    name: "Ursula Schmid",
    country: "Switzerland",
    action: "just deposited",
    detail: "Successfully deposited $73,000 to trading account",
    type: "deposit",
    amount: "$73,000",
  },
  {
    name: "Marko Horvat",
    country: "Croatia",
    action: "just invested",
    detail: "Successfully invested $14,500 in gold portfolio",
    type: "invest",
    amount: "$14,500",
  },
  {
    name: "Brandon Williams",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $92,000 in trading portfolio",
    type: "invest",
    amount: "$92,000",
  },
  {
    name: "Jessica Parker",
    country: "United States",
    action: "just withdrew",
    detail: "Successfully withdrew $63,500 to bank account",
    type: "withdraw",
    amount: "$63,500",
  },
  {
    name: "Kevin Anderson",
    country: "United States",
    action: "just deposited",
    detail: "Successfully deposited $17,800 to trading account",
    type: "deposit",
    amount: "$17,800",
  },
  {
    name: "Stephanie Davis",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $44,300 in crypto portfolio",
    type: "invest",
    amount: "$44,300",
  },
  {
    name: "Christopher Moore",
    country: "United States",
    action: "just withdrew",
    detail: "Successfully withdrew $28,900 to bank account",
    type: "withdraw",
    amount: "$28,900",
  },
  {
    name: "Ashley Thompson",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $51,200 in gold portfolio",
    type: "invest",
    amount: "$51,200",
  },
  {
    name: "Matthew Garcia",
    country: "United States",
    action: "just deposited",
    detail: "Successfully deposited $32,600 to trading account",
    type: "deposit",
    amount: "$32,600",
  },
  {
    name: "Rachel Martinez",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $78,400 in trading portfolio",
    type: "invest",
    amount: "$78,400",
  },
  {
    name: "Daniel Rodriguez",
    country: "United States",
    action: "just withdrew",
    detail: "Successfully withdrew $19,300 to bank account",
    type: "withdraw",
    amount: "$19,300",
  },
  {
    name: "Emily Wilson",
    country: "United States",
    action: "just deposited",
    detail: "Successfully deposited $11,200 to trading account",
    type: "deposit",
    amount: "$11,200",
  },
  {
    name: "Joshua Taylor",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $39,700 in crypto portfolio",
    type: "invest",
    amount: "$39,700",
  },
  {
    name: "Nicole Brown",
    country: "United States",
    action: "just withdrew",
    detail: "Successfully withdrew $24,600 to bank account",
    type: "withdraw",
    amount: "$24,600",
  },
  {
    name: "Andrew Miller",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $67,800 in trading portfolio",
    type: "invest",
    amount: "$67,800",
  },
  {
    name: "Lauren Jones",
    country: "United States",
    action: "just deposited",
    detail: "Successfully deposited $13,500 to trading account",
    type: "deposit",
    amount: "$13,500",
  },
  {
    name: "David Wilson",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $85,200 in gold portfolio",
    type: "invest",
    amount: "$85,200",
  },
  {
    name: "Samantha Moore",
    country: "United States",
    action: "just withdrew",
    detail: "Successfully withdrew $47,300 to bank account",
    type: "withdraw",
    amount: "$47,300",
  },
  {
    name: "Ryan Davis",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $36,400 in trading portfolio",
    type: "invest",
    amount: "$36,400",
  },
  {
    name: "Megan Anderson",
    country: "United States",
    action: "just deposited",
    detail: "Successfully deposited $22,800 to trading account",
    type: "deposit",
    amount: "$22,800",
  },
  {
    name: "Tyler Thomas",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $58,900 in crypto portfolio",
    type: "invest",
    amount: "$58,900",
  },
  {
    name: "Olivia White",
    country: "United States",
    action: "just withdrew",
    detail: "Successfully withdrew $31,200 to bank account",
    type: "withdraw",
    amount: "$31,200",
  },
  {
    name: "Justin Harris",
    country: "United States",
    action: "just invested",
    detail: "Successfully invested $49,500 in trading portfolio",
    type: "invest",
    amount: "$49,500",
  },
  {
    name: "Brittany Martin",
    country: "United States",
    action: "just deposited",
    detail: "Successfully deposited $16,700 to trading account",
    type: "deposit",
    amount: "$16,700",
  },
];

const TIMES = [
  "Just now",
  "1 minute ago",
  "2 minutes ago",
  "3 minutes ago",
  "5 minutes ago",
  "8 minutes ago",
  "12 minutes ago",
  "15 minutes ago",
  "18 minutes ago",
  "22 minutes ago",
  "27 minutes ago",
  "32 minutes ago",
  "38 minutes ago",
  "45 minutes ago",
  "52 minutes ago",
  "1 hour ago",
  "1 hour ago",
  "2 hours ago",
];

// Random ms between min and max seconds
const randomDelay = (minSec, maxSec) =>
  (Math.random() * (maxSec - minSec) + minSec) * 1000;

function getIcon(type) {
  switch (type) {
    case "invest":
      return TrendingUp;
    case "withdraw":
      return ArrowDownCircle;
    case "deposit":
      return PlusCircle;
    default:
      return Award;
  }
}

function getColors(type) {
  switch (type) {
    case "invest":
      return {
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.15)",
        border: "rgba(245,158,11,0.4)",
      };
    case "withdraw":
      return {
        color: "#f87171",
        bg: "rgba(239,68,68,0.15)",
        border: "rgba(239,68,68,0.4)",
      };
    case "deposit":
      return {
        color: "#34d399",
        bg: "rgba(52,211,153,0.15)",
        border: "rgba(52,211,153,0.4)",
      };
    default:
      return {
        color: "#a78bfa",
        bg: "rgba(167,139,250,0.15)",
        border: "rgba(167,139,250,0.4)",
      };
  }
}

function Toast({ activity, timeAgo, onClose, visible }) {
  const { darkMode } = useTheme();
  const Icon = getIcon(activity.type);
  const colors = getColors(activity.type);

  const bg = darkMode ? "rgba(10,15,30,0.96)" : "rgba(255,255,255,0.98)";
  const textClr = darkMode ? "#f1f5f9" : "#0f172a";
  const subClr = darkMode ? "#94a3b8" : "#64748b";
  const timeClr = darkMode ? "#475569" : "#94a3b8";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.color}`,
        borderRadius: 14,
        padding: "14px 14px 14px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        backdropFilter: "blur(20px)",
        width: 320,
        maxWidth: "90vw",
        position: "relative",
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: colors.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon style={{ width: 18, height: 18, color: colors.color }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
        <p
          style={{
            color: textClr,
            fontWeight: 700,
            fontSize: "0.82rem",
            lineHeight: 1.4,
            marginBottom: 3,
          }}
        >
          <span style={{ color: colors.color }}>{activity.name}</span> from{" "}
          {activity.country}{" "}
          <span style={{ color: textClr }}>{activity.action}</span>
        </p>
        <p
          style={{
            color: subClr,
            fontSize: "0.75rem",
            lineHeight: 1.4,
            marginBottom: 4,
          }}
        >
          {activity.detail}
        </p>
        <p style={{ color: timeClr, fontSize: "0.68rem" }}>{timeAgo}</p>
      </div>

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: subClr,
          transition: "background 0.2s",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239,68,68,0.2)";
          e.currentTarget.style.color = "#f87171";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = darkMode
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.07)";
          e.currentTarget.style.color = subClr;
        }}
      >
        <X style={{ width: 11, height: 11 }} />
      </button>
    </div>
  );
}

export default function LiveActivityToast() {
  const [queue, setQueue] = useState([]);
  const [pointer, setPointer] = useState(0);
  const intervalRef = React.useRef(null);

  const [shuffled] = useState(() => {
    const arr = [...ACTIVITIES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const showNext = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    const activity = shuffled[randomIndex];
    const timeAgo = TIMES[Math.floor(Math.random() * TIMES.length)];
    const id = Date.now() + Math.random();

    setQueue((q) => [
      ...q.slice(-1),
      { id, activity, timeAgo, visible: false },
    ]);

    // Slide in
    setTimeout(() => {
      setQueue((q) =>
        q.map((t) => (t.id === id ? { ...t, visible: true } : t)),
      );
    }, 50);

    // Slide out after 6 seconds
    setTimeout(() => {
      setQueue((q) =>
        q.map((t) => (t.id === id ? { ...t, visible: false } : t)),
      );
      setTimeout(() => {
        setQueue((q) => q.filter((t) => t.id !== id));
      }, 400);
    }, 6000);

    setPointer((p) => p + 1);
  }, [shuffled]);

  // First toast — show after 8-12 seconds
  useEffect(() => {
    const first = setTimeout(showNext, randomDelay(8, 12));
    return () => clearTimeout(first);
  }, [showNext]);

  // Subsequent toasts — every 20-30 seconds
  useEffect(() => {
    if (pointer === 0) return;

    const scheduleNext = () => {
      const delay = randomDelay(20, 30);
      intervalRef.current = setTimeout(() => {
        showNext();
        scheduleNext(); // schedule the next one after this one
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(intervalRef.current);
  }, [pointer, showNext]);

  const dismiss = (id) => {
    setQueue((q) => q.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => setQueue((q) => q.filter((t) => t.id !== id)), 400);
  };

  if (queue.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}
    >
      {queue.map((t) => (
        <Toast
          key={t.id}
          activity={t.activity}
          timeAgo={t.timeAgo}
          visible={t.visible}
          onClose={() => dismiss(t.id)}
        />
      ))}
    </div>
  );
}
