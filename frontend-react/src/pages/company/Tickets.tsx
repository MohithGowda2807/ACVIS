import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Inbox, CheckCircle, Clock } from 'lucide-react';

interface Ticket {
  ticket_id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  user_email: string;
  created_at: string;
  resolution_note?: string;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  
  // Resolve modal state
  const [resolvingTicket, setResolvingTicket] = useState<Ticket | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const loadTickets = async () => {
    setError(null);
    try {
      const data = await api.getTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setError(`Unexpected response format. Check console.`);
        console.error('Expected array, got:', data);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleResolve = async () => {
    if (!resolvingTicket) return;
    
    setIsResolving(true);
    try {
      await api.resolveTicket(resolvingTicket.ticket_id, resolutionNote);
      await loadTickets();
      setResolvingTicket(null);
      setResolutionNote('');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error resolving ticket');
    } finally {
      setIsResolving(false);
    }
  };

  const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);
  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="p-8 pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Support Tickets</h1>
        <p className="text-sm text-gray-500">Manage customer inquiries and help requests.</p>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-32">
            <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amazon-orange" /> Open
            </div>
            <div className="text-3xl font-light text-gray-900">{openCount}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-32">
            <div className="text-gray-500 text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" /> Resolved
            </div>
            <div className="text-3xl font-light text-gray-900">{tickets.length - openCount}</div>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 self-start md:self-end">
          {['all', 'open', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${
                filter === f ? 'bg-white shadow-sm text-amazon-dark' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
          <h3 className="font-bold text-lg mb-2">Error Loading Tickets</h3>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-gray-500">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-700 font-bold">No tickets found</h3>
          <p className="text-sm text-gray-500 mb-4">No customer inquiries match this filter.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map(ticket => (
            <motion.div 
              key={ticket.ticket_id} 
              variants={item}
              className={`bg-white rounded-lg border-l-4 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[220px] ${
                ticket.status === 'open' ? 'border-amber-500 border-t border-r border-b' : 'border-green-500 border border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {ticket.ticket_id}
                </span>
                <span className="text-[11px] text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 leading-tight mb-2">{ticket.subject}</h3>
              <p className="text-xs font-mono text-amazon-link mb-3 line-clamp-1">{ticket.user_email}</p>
              
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 mb-4 flex-1 line-clamp-3">
                {ticket.description}
              </div>
              
              <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-3">
                <div className="text-xs flex flex-col">
                  <span className="text-gray-400">Category</span>
                  <span className="font-bold text-gray-700">{ticket.category}</span>
                </div>
                
                {ticket.status === 'open' ? (
                  <button 
                    onClick={() => setResolvingTicket(ticket)}
                    className="text-xs bg-amazon-dark hover:bg-black text-white px-3 py-1.5 rounded-md font-semibold transition-colors"
                  >
                    Resolve
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3" /> Resolved
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Resolution Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-amazon-dark text-white p-4">
              <h3 className="font-bold">Resolve Ticket {resolvingTicket.ticket_id}</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4 bg-gray-50 p-3 rounded text-sm text-gray-700 border border-gray-200">
                <span className="font-bold block text-gray-900 mb-1">{resolvingTicket.subject}</span>
                {resolvingTicket.description}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Resolution Note (optional)
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Note for the customer detailing the fix or action taken..."
                  className="w-full h-24 p-3 border border-gray-300 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="btn-amazon-primary disabled:opacity-50 flex items-center gap-2"
                >
                  {isResolving ? 'Resolving...' : <><CheckCircle className="w-4 h-4"/> Mark Resolved</>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
