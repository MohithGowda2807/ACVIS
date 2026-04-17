import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { HelpCircle, CheckCircle } from 'lucide-react';

interface Ticket {
  ticket_id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    try {
      const data = await api.getTickets();
      setTickets(data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please fill out all fields');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.createTicket(subject, description, category);
      setSubject('');
      setDescription('');
      setCategory('General');
      await loadTickets(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 px-2">
        <span className="text-amazon-link hover:underline hover:text-amazon-warning cursor-pointer">Your Account</span> 
        {' > '} 
        <span className="text-gray-900 font-bold">Help & Support</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submit Ticket Form */}
        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-bold mb-4">Create a Ticket</h2>
            {error && <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                >
                  <option value="General">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing">Billing Issue</option>
                  <option value="Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="w-full p-2 border border-gray-300 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Details</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide more details..."
                  className="w-full h-32 p-2 border border-gray-300 rounded focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full btn-amazon disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Tickets List */}
        <div className="md:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-lg font-bold mb-4">Your Support Tickets</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading your tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded border border-dashed border-gray-300">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-700 font-bold">No active tickets</h3>
                <p className="text-sm text-gray-500">Need help? Create a ticket to the left to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.ticket_id} className="border border-gray-200 rounded p-4 pb-3 flex flex-col hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-gray-500 block mb-1">
                          {ticket.ticket_id} • {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-md text-amazon-link">{ticket.subject}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        ticket.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amazon-yellow text-amazon-dark'
                      }`}>
                        {ticket.status === 'resolved' && <CheckCircle className="w-3 h-3" />}
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 border-l-2 pl-3 py-1 border-gray-200">
                      {ticket.description}
                    </p>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                      <span>Category: <strong>{ticket.category}</strong></span>
                      {ticket.status === 'resolved' && (
                        <span className="text-green-600 font-medium">Resolution provided</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
