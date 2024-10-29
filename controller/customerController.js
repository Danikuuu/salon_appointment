const Customer = require('../model/customerModel')
const admin = require('../model/adminModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Appointment = require('../model/appointmentModel')

exports.Home = async (req, res) => {
    res.render('home', { user: req.user });
};

exports.Service = async (req, res) => {
    const success = req.session.success || null;
    req.session.success = null;
    res.render('service', { user: req.user, success });
};

exports.Profile = async (req, res) => {
    const appointments = await Appointment.find({ customerId: req.user._id });
    const success = req.session.success || null;
    req.session.success = null;
    res.render('profile', { user: req.user, appointments, success });
};

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ customerId: req.user._id });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addBooking = async (req, res) => {
    try {
        const { service, category, additional, appointmentDate, appointmentTime, appointmentNotes } = req.body;

        const customerId = req.user._id;

        const appointment = new Appointment({
            customerId,
            service, 
            category,
            additional, 
            date: new Date(appointmentDate), 
            time: appointmentTime, 
            notes: appointmentNotes,
        });

        await appointment.save();
        req.session.success = 'Appointment created successfully';
        res.redirect('/customer/service');
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this appointment' });
        }

        await Appointment.findByIdAndDelete(appointmentId);

        req.session.success = 'Appointment deleted successfully';

        res.redirect('/customer/profile');
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateBooking = async (req, res) => {
    try {
        console.log(req.body)
        const appointmentId = req.body.appointmentId;
        const { rescheduleDate, rescheduleTime, rescheduleNotes } = req.body;

        console.log(appointmentId)
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this appointment' });
        }

        appointment.status = 'for approval';
        appointment.date = new Date(rescheduleDate);
        appointment.time = rescheduleTime;
        appointment.notes = rescheduleNotes;

        await appointment.save();

        req.session.success = 'Appointment updated successfully';

        res.redirect('/customer/profile');
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
