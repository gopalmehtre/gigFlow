import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GigDetailsCard from '../components/GigDetailsCard';
import BidsList from '../components/BidList';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch gig details
      const { data: gigsData } = await api.get('/gigs');
      const foundGig = gigsData.find(g => g._id === id);
      
      if (!foundGig) {
        setError('Gig not found');
        setLoading(false);
        return;
      }
      
      setGig(foundGig);
      
      if (foundGig.ownerId._id === user.id) {
        const { data: bidsData } = await api.get(`/bids/${id}`);
        setBids(bidsData);
      }
    } catch (err) {
      setError('Failed to load gig details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (bidData) => {
    setError('');
    setSuccess('');

    try {
      await api.post('/bids', {
        gigId: id,
        ...bidData
      });
      
      setSuccess('Bid submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid');
    }
  };

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer? This will reject all other bids.')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      await api.patch(`/bids/${bidId}/hire`);
      setSuccess('Freelancer hired successfully!');
      await fetchGigDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hire freelancer');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gig not found</h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwner = gig.ownerId._id === user.id;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <GigDetailsCard 
        gig={gig}
        isOwner={isOwner}
        onBidSubmit={handleBidSubmit}
      />

      {isOwner && (
        <BidsList 
          bids={bids}
          gigStatus={gig.status}
          onHire={handleHire}
        />
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
           Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default GigDetails;