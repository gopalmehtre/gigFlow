const BidsList = ({ bids, gigStatus, onHire }) => {
  const isOpen = gigStatus === 'open';

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bids Received ({bids.length})
        </h2>
        {!isOpen && (
          <span className="text-sm text-gray-500">This gig has been assigned</span>
        )}
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-gray-500">No bids yet. Share your gig to attract freelancers!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <BidCard 
              key={bid._id} 
              bid={bid} 
              isOpen={isOpen}
              onHire={onHire}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BidCard = ({ bid, isOpen, onHire }) => {
  return (
    <div 
      className={`border rounded-lg p-6 transition-all ${
        bid.status === 'hired' 
          ? 'bg-green-50 border-green-300' 
          : bid.status === 'rejected'
          ? 'bg-gray-50 border-gray-300 opacity-75'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-lg">
              {bid.freelancerId.name[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {bid.freelancerId.name}
            </h3>
            <p className="text-sm text-gray-500">{bid.freelancerId.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Submitted {new Date(bid.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            ${bid.price}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            bid.status === 'hired'
              ? 'bg-green-200 text-green-800'
              : bid.status === 'rejected'
              ? 'bg-red-200 text-red-800'
              : 'bg-yellow-200 text-yellow-800'
          }`}>
            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="bg-white bg-opacity-50 rounded p-4 mb-4">
        <p className="text-gray-700 whitespace-pre-wrap">{bid.message}</p>
      </div>

      {bid.status === 'pending' && isOpen && (
        <button
          onClick={() => onHire(bid._id)}
          className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors"
        >
          Hire This Freelancer
        </button>
      )}
    </div>
  );
};

export default BidsList;