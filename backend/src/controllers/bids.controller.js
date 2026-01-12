const Gig = require('../models/Gig');
const Bid = require('../models/Bid');

const submitBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot bid on this gig' });
    }

    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot bid on your own gig' });
    }

    const bid = new Bid({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    await bid.save();
    await bid.populate('freelancerId', 'name email');

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBids = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig || gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const hireBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('gigId');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is no longer open' });
    }

    // Atomic updates
    const gigUpdate = await Gig.updateOne(
      { _id: gig._id, status: 'open' },
      { status: 'assigned' }
    );

    if (gigUpdate.modifiedCount === 0) {
      return res.status(400).json({ message: 'Gig could not be assigned' });
    }

    await Bid.updateOne({ _id: bidId }, { status: 'hired' });
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bidId } },
      { status: 'rejected' }
    );

    res.json({ message: 'Freelancer hired successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitBid, getBids, hireBid };