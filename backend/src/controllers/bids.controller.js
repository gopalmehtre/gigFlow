const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const mongoose = require('mongoose');
const { getIO } = require('../utils/socket');

const submitBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    const freelancerId = req.user._id;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer accepting bids' });
    }

    if (gig.ownerId.toString() === freelancerId.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own gig' });
    }

    const existingBid = await Bid.findOne({ gigId, freelancerId });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already submitted a bid for this gig' });
    }

    const bid = new Bid({
      gigId,
      freelancerId,
      message,
      price
    });

    await bid.save();
    await bid.populate('freelancerId', 'name email');

    res.status(201).json(bid);
  } catch (err) {
    console.error('SUBMIT BID ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBids = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view bids for this gig' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (err) {
    console.error('GET BIDS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId)
      .populate('gigId')
      .populate('freelancerId', 'name email')
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = bid.gigId;

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'You are not authorized to hire for this gig' });
    }

    if (gig.status !== 'open') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'This gig has already been assigned' });
    }

    await Gig.findByIdAndUpdate(
      gig._id,
      { status: 'assigned' },
      { session }
    );

    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { session }
    );

    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );
    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    if (io) {
      const freelancerRoom = bid.freelancerId._id.toString();
      io.to(freelancerRoom).emit('hired', {
        message: `You have been hired for "${gig.title}"!`,
        gigId: gig._id,
        gigTitle: gig.title
      });
      console.log(`Emitted 'hired' event to freelancer ${freelancerRoom}`);
    }

    res.json({
      message: 'Freelancer hired successfully',
      bid,
      gig
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('HIRE BID ERROR:', err);
    res.status(500).json({ message: 'Server error during hiring process' });
  }
};

module.exports = { submitBid, getBids, hireBid };