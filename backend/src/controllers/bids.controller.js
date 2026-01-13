const Gig = require('../models/Gig');
const Bid = require('../models/Bid');
const mongoose = require('mongoose');
const socketUtil = require('../utils/socket');

const submitBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot bid on this gig' });
    }

    if (gig.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot bid on your own gig' });
    }

    const bid = new Bid({
      gigId,
      freelancerId: req.user.id,
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
    if (!gig || gig.ownerId.toString() !== req.user.id) {
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
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Only gig owner can hire' });
    }

    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'This gig has already been assigned to someone else' 
      });
    }

    const gigUpdate = await Gig.findOneAndUpdate(
      { 
        _id: gig._id, 
        status: 'open'
      },
      { status: 'assigned' },
      { 
        session,
        new: true 
      }
    );

    
    if (!gigUpdate) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Failed to hire - gig was just assigned by someone else' 
      });
    }

    await Bid.updateOne(
      { _id: bidId },
      { status: 'hired' },
      { session }
    );

    await Bid.updateMany(
      { 
        gigId: gig._id, 
        _id: { $ne: bidId }
      },
      { status: 'rejected' },
      { session }
    );
    await session.commitTransaction();

  
    try {
      const io = socketUtil.getIO();
      if (io) {
        const userRoom = bid.freelancerId.toString();
        io.to(userRoom).emit('hired', {
          message: `You have been hired for ${gig.title}!`,
          gigId: gig._id,
          bidId: bid._id
        });
      }
    } catch (emitErr) {
      console.error('Socket emit error:', emitErr);
    }

    res.json({
      message: 'Freelancer hired successfully',
      gigId: gig._id,
      bidId: bid._id
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Hire transaction failed:', error);
    res.status(500).json({ 
      message: 'Failed to hire freelancer',
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

module.exports = { submitBid, getBids, hireBid };