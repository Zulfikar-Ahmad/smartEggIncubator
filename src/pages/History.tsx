import { useEffect, useState } from 'react';
import { ref, onValue, query, orderByKey, limitToLast } from 'firebase/database';
import { db } from '../lib/firebase';

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

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-left ${history.length > 0 ? 'min-w-[500px]' : ''}`}>
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-400">Time</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-400">Temperature (°C)</th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-400">Humidity (%)</th>
            </tr>
          </thead>
          {history.length > 0 && (
            <tbody className="divide-y divide-gray-700" id="historyTableBody">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white">
                    {row.timestamp ? new Date(row.timestamp).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white">{row.temperature !== undefined && row.temperature !== null ? Number(row.temperature).toFixed(2) : '-'}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white">{row.humidity !== undefined && row.humidity !== null ? Number(row.humidity).toFixed(2) : '-'}</td>
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
    </div>
  );
}
