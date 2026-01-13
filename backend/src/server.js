require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const gigRoutes = require('./routes/gigs.routes');
const bidRoutes = require('./routes/bids.routes');

const socketUtil = require('./utils/socket');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors({
    origin:['http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);



const PORT = process.env.PORT || 8000;

socketUtil.init(server, {
    corsOrigin: ['http://localhost:3000', process.env.FRONTEND_URL]
});

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});