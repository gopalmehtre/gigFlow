import { useState } from 'react';

const GigDetailsCard = ({ gig, isOwner, onBidSubmit }) => {
  const [bidForm, setBidForm] = useState({ message: '', price: '' });
  const [submitting, setSubmitting] = useState(false);

  const isOpen = gig.status === 'open';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onBidSubmit({
        message: bidForm.message,
        price: Number(bidForm.price)
      });
      setBidForm({ message: '', price: '' });
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden mb-8">
      
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Posted by <span className="font-medium text-gray-700">{gig.ownerId.name}</span></span>
              <span>•</span>
              <span>{new Date(gig.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>

            {gig.status === 'assigned' && gig.hiredFreelancer?.name && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Assigned to:</span>{' '}
                <span className="font-medium text-blue-600">{gig.hiredFreelancer.name}</span>
              </div>
            )}
          </div>
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
            isOpen 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isOpen ? 'Open' : 'Assigned'}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Budget</span>
            <span className="text-2xl font-bold text-blue-600">${gig.budget}</span>
          </div>
        </div>
      </div>

      {!isOwner && isOpen && (
        <div className="bg-gray-50 border-t border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Your Bid</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Proposal <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Explain why you're the perfect fit for this project..."
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your bid amount"
                value={bidForm.price}
                onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}

      
      {!isOwner && !isOpen && (
        <div className="bg-gray-50 border-t border-gray-200 p-8 text-center">
          <p className="text-gray-600">
            This gig has been assigned{gig.hiredFreelancer?.name ? ` to ${gig.hiredFreelancer.name}` : ''} and is no longer accepting bids.
          </p>
        </div>
      )}
    </div>
  );
};

export default GigDetailsCard;