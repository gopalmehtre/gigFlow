const Gig = require('../models/Gig');

const getGigs = async (req, res) => {
    try {
        const {search} = req.query;
        const query = {
            status : 'open'
        };

        if(search) {
            query.title = {$regex: search, $options: 'i'};
        }

        const gigs = await Gig.find(query)
        .populate('ownerId', 'name email')
        .sort({createdAt: -1})
        .limit(20);

        res.json(gigs);
    } catch(err) {
        res.status(500).json({message: 'server error'});
    }
};

const createGig = async (req, res) => {
    try {
        const {title, description, budget} = req.body;
        const gig = new Gig({
            title,
            description,
            budget,
            ownerId: req.user._id
        });

        await gig.save();
        await gig.populate('ownerId', 'name email');

        res.status(201).json(gig);
    } catch(err) {
        res.status(500).json({message: 'server error'});
    }
};

module.exports = {getGigs, createGig};