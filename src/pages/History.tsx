import { useEffect, useState } from 'react';
import { ref, onValue, query, orderByKey, limitToLast, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Trash2, AlertTriangle } from 'lucide-react';

interface HistoryRecord {
  id: string;
  temperature: number;
  humidity: number;
  timestamp: number;
}

export function History() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const historyRef = query(ref(db, 'incubator/history'), orderByKey(), limitToLast(50));
    
    const unsubscribe = onValue(historyRef, (snapshot) => {
      setLoading(false);
      const dataObj = snapshot.val();
      if (dataObj) {
        const data = Object.keys(dataObj).map((key) => ({
          id: key,
          ...dataObj[key]
        })).reverse();
        setHistory(data);
      } else {
        setHistory([]);
      }
    }, (err) => {
      console.error(err);
      setError(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await remove(ref(db, 'incubator/history'));
      setShowClearModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">History Logs</h2>
        {history.length > 0 && (
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${history.length > 0 ? 'min-w-[500px]' : ''}`}>
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Time</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Temperature (°C)</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Humidity (%)</th>
            </tr>
          </thead>
          {history.length > 0 && (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" id="historyTableBody">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-900 dark:text-white">
                    {row.timestamp ? new Date(row.timestamp).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-900 dark:text-white">{row.temperature !== undefined && row.temperature !== null ? Number(row.temperature).toFixed(2) : '-'}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-900 dark:text-white">{row.humidity !== undefined && row.humidity !== null ? Number(row.humidity).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        </div>
        
        {loading && (
          <div className="px-4 py-12 text-center text-gray-500">Loading history...</div>
        )}
        {!loading && error && (
          <div className="px-4 py-12 text-center text-red-500">Failed to load from Firebase.</div>
        )}
        {!loading && !error && history.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">No history data available.</div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Clear History</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete all historical data? 
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isClearing ? 'Clearing...' : 'Yes, clear it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
