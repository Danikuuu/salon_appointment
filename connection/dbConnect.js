const mongoose = require('mongoose');

const dbConnection = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB online');
    } catch (error) {
        console.log(error);
        throw new Error('Error starting the database');
    }
}

module.exports = dbConnection;