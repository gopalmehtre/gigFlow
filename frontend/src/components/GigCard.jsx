import { Link } from 'react-router-dom';

const GigCard = ({ gig }) => {
  return (
    <Link to={`/gig/${gig._id}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {gig.title}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
            gig.status === 'open' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {gig.status}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{gig.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            by <span className="font-medium text-gray-700">{gig.ownerId?.name}</span>
            {gig.status === 'assigned' && gig.hiredFreelancer?.name && (
              <div className="mt-1 text-xs text-gray-600">
                Assigned to <span className="font-medium text-gray-700">{gig.hiredFreelancer.name}</span>
              </div>
            )}
          </div>
          <div className="text-lg font-bold text-blue-600">
            ${gig.budget}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;