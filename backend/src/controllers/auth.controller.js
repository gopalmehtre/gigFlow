const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async(req, res) => {
    try {
        const {name, email, password} = req.body;
        let user = await User.findOne({email});

        if(user) {
            return res.status(400).json({message: 'User already exists'});
        }

        user = new User({name,email, password});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7*24*60*1000
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {id: user._id, name: user.name, email: user.email}
        });
    } catch(err) {
        res.status(500).json({message: 'server error'});
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7*24*60*60*1000
        });

        res.json({
            message: 'Login successful',
            user: {id: user._id, name: user.name, email: user.email}
        });

    } catch(err) {
        res.status(500).json({message: 'server error'}, err);
    }
};

module.exports = {register, login};