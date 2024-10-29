const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    customerName: String,
    email: String,
    address: String,
    gender: String,
    contact: String,
    selectedServices: [String], // Assuming it's an array of strings
    appointmentDate: Date,
    appointmentTime: String,
    notes: String,
    totalPrice: Number
}, { collection: 'service' });

let Service;
try {
    Service = mongoose.model('Service');
} catch (error) {
    Service = mongoose.model('Service', serviceSchema);
}

module.exports = Service;