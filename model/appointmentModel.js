// models/appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    service: { type: String, required: true },
    category: { type: String, required: true },
    additional: { type: String },
    status: { type: String, default: 'for approval' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    notes: { type: String },
    createdAt: {type: Date, default: Date.now}
});

// Create the model
const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
