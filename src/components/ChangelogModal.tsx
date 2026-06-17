import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ChangelogModalProps {
  onClose: () => void;
}

const CHANGELOG_DATA = [
  {
    version: "v1.5.0",
    title: "Light Theme & User Data Management",
    date: "June 2026",
    changes: [
      {
        type: "Added",
        text: "Global Light/Dark theme toggle with user preference persistence.",
      },
      {
        type: "Added",
        text: "Clear History feature to permanently delete all historical data.",
      },
      {
        type: "Added",
        text: "Delete Account feature for complete data removal.",
      },
    ],
  },
  {
    version: "v1.4.0",
    title: "Global Theming Architecture",
    date: "June 2026",
    changes: [
      {
        type: "Added",
        text: "ThemeProvider Context to handle theme state across the application.",
      },
      {
        type: "Added",
        text: "Version indicator moved to the sidebar title container.",
      },
      {
        type: "Fixed",
        text: "Changelog modal rendering issues by implementing React Portals.",
      },
    ],
  },
  {
    version: "v1.3.1",
    title: "Stability Patches",
    date: "June 2026",
    changes: [
      {
        type: "Fixed",
        text: "Bug where camera status was stuck on 'CONNECTING...' due to MQTT retained message drops. LiveCam now sets a 3-second timeout.",
      },
    ],
  },
  {
    version: "v1.3.0",
    title: "Live Camera Integration",
    date: "June 2026",
    changes: [
      {
        type: "Added",
        text: "Real-time video streaming from ESP32-CAM via WebSockets.",
      },
      {
        type: "Added",
        text: "Flashlight toggle control to activate the ESP32-CAM flash.",
      },
      {
        type: "Added",
        text: "Camera Resolution dropdown control (ranging from UXGA to QQVGA).",
      },
      {
        type: "Added",
        text: "Photo Capture button to download a frame directly from the video stream.",
      },
    ],
  },
  {
    version: "v1.2.0",
    title: "Smart Incubator Dashboard",
    date: "June 2026",
    changes: [
      {
        type: "Added",
        text: "Real-time Temperature and Humidity charts with Min, Max, and Avg calculations.",
      },
      {
        type: "Added",
        text: "Manual Motor controls (Trigger Motor instantly).",
      },
      {
        type: "Added",
        text: "Automatic Motor Interval adjustment (dropdown control from 1 to 240 minutes).",
      },
      {
        type: "Added",
        text: "ESP32 Connection Tracker (Dashboard detects when the device is offline/online).",
      },
      { type: "Added", text: "Responsive grid layout for monitoring devices." },
    ],
  },
  {
    version: "v1.1.0",
    title: "Authentication & User Profiles",
    date: "June 2026",
    changes: [
      {
        type: "Added",
        text: "Email & Password Authentication flow with Firebase.",
      },
      {
        type: "Added",
        text: "'Remember Me' session persistence logic during login.",
      },
      {
        type: "Added",
        text: "Registration fields expanded to require First Name, Last Name, and Username.",
      },
      {
        type: "Added",
        text: "Existing User Profile Completion Modal on login.",
      },
      {
        type: "Added",
        text: "User Management settings page to update names and usernames.",
      },
      { type: "Added", text: "Username-to-email login resolution." },
    ],
  },
  {
    version: "v1.0.0",
    title: "Initial MVP Setup",
    date: "May 2026",
    changes: [
      {
        type: "Added",
        text: "Initial React application architecture with Vite.",
      },
      {
        type: "Added",
        text: "Tailwind CSS framework setup and styling foundation.",
      },
      {
        type: "Added",
        text: "Firebase integration and structural database rules.",
      },
      { type: "Added", text: "Sidebar and Top Navigation components." },
    ],
  },
];

export function ChangelogModal({ onClose }: ChangelogModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Release Notes</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover what's new in Smart Egg Incubator
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-8">
            {CHANGELOG_DATA.map((release) => (
              <div
                key={release.version}
                className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800" />

                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {release.version}
                    </h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {release.date}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{release.title}</p>
                </div>

                <ul className="space-y-3">
                  {release.changes.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm"
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold mt-0.5 ${
                          change.type === "Added"
                            ? "bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                            : change.type === "Fixed"
                              ? "bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                              : "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {change.type}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        {change.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
