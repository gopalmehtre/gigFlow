const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

const getGigs = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {
      status: { $in: ['open', 'assigned'] }
    };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const enhanced = await Promise.all(
      gigs.map(async (gig) => {
        const g = gig.toObject();
        if (g.status === 'assigned') {
          const hiredBid = await Bid.findOne({ gigId: gig._id, status: 'hired' })
            .populate('freelancerId', 'name email');
          g.hiredFreelancer = hiredBid ? hiredBid.freelancerId : null;
        } else {
          g.hiredFreelancer = null;
        }
        return g;
      })
    );

    return res.json(enhanced);
  } catch (err) {
    console.error('GET GIGS ERROR:', err);
    return res.status(500).json({ message: 'server error' });
  }
};

const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    const gig = new Gig({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    await gig.save();
    await gig.populate('ownerId', 'name email');

    res.status(201).json(gig);
  } catch (err) {
    console.error('CREATE GIG ERROR:', err);
    res.status(500).json({ message: 'server error' });
  }
};

module.exports = { getGigs, createGig };