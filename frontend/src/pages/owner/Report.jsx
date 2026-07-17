// import { useEffect, useState } from 'react';
// import { Home, DoorOpen, DoorClosed } from 'lucide-react';
// import { getStatistics } from '../../services/ownerService';

// const STAT_CARDS = [
//   { key: 'total', label: 'Total Posted', icon: Home, color: 'bg-gold-dark' },
//   { key: 'available', label: 'Available', icon: DoorOpen, color: 'bg-emerald-600' },
//   { key: 'unavailable', label: 'Unavailable', icon: DoorClosed, color: 'bg-red-600' },
//   { key: 'totalRequest', label: 'Total Viewing Requests', icon: Home, color: 'bg-gold-dark' },
//   { key: 'confirmRequest', label: 'Confirmed Requests', icon: DoorOpen, color: 'bg-emerald-600' },
//   { key: 'rejectedRequest', label: 'Rejected Requests', icon: DoorClosed, color: 'bg-red-600' },
//   { key: 'pendingRequest', label: 'Pending Requests', icon: DoorClosed, color: 'bg-yellow-600' },
// ];

// export default function Report() {
//   const [values, setValues] = useState({ total: 0, available: 0, unavailable: 0, totalRequest: 0, confirmRequest: 0, rejectedRequest: 0, pendingRequest: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     setLoading(true);
//     getStatistics()
//       .then((data) => {
//         setValues({
//           total: data.statistics.TotalRoom,
//           available: data.statistics.AVAILABLE,
//           unavailable: data.statistics.RENTED,
//           totalRequest: data.statistics.totalViewingRequests,
//           confirmRequest: data.statistics.confirmedRequests,
//           rejectedRequest: data.statistics.rejectedRequests,
//           pendingRequest: data.statistics.pendingRequests,
//         });
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message || 'Failed to fetch statistics.');
//         setLoading(false);
//       });
      
//   }, []);

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-text">Reports</h1>

//       {loading && <p>Loading statistics...</p>}
//       {error && <p className="text-red-600">{error}</p>}

//       {!loading && !error && (
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {STAT_CARDS.map((card) => (
//             <div key={card.key} className={`flex items-center gap-4 rounded-lg p-4 shadow ${card.color} text-white`}>
//               <card.icon size={32} />
//               <div>
//                 <p className="text-lg font-semibold">{values[card.key]}</p>
//                 <p className="text-sm">{card.label}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

