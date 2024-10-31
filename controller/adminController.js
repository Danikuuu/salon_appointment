const Customer = require('../model/customerModel')
const Admin = require('../model/adminModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Appointment = require('../model/appointmentModel')
const Feedback = require('../model/feedbackModel')

exports.displayLogin = async (req, res) => {
    res.render('adminlogin');
}

// exports.adminLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const adminData = await Admin.findOne({ email: email });
//         if (adminData) {
//             const passwordMatch = await bcrypt.compare(password, adminData.password);
//             if (passwordMatch) {
//                 const token = jwt.sign({ adminId: adminData._id }, process.env.JWT_SECRET, { expiresIn: '5d' });
//                 res.cookie('jwt', token, { httpOnly: true, maxAge: 48 * 60 * 60 * 1000 });
//                 res.redirect('/admin/dashboard');
//             } else {
//                 res.render('adminlogin', { message: 'Password is incorrect' });
//             }
//         } else {
//             res.render('adminlogin', { message: 'Email not found' });
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };

exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).send("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(401).send("Invalid email or password");
        }

        // Include role in the token
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '5d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

        res.redirect('/admin/dashboard'); // Redirect to the admin dashboard
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal server error");
    }
};


exports.displayAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await Customer.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const feedbackCount = await Feedback.countDocuments();
        const feedbacksToday = await Feedback.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
        
        // Dates for today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Count appointments and feedbacks for today
        const appointmentsToday = await Appointment.countDocuments({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });
        const feedBackToday = await Feedback.countDocuments({
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        // Count appointments and feedbacks for the past week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        
        const weeklyAppointments = await Appointment.countDocuments({
            createdAt: { $gte: startOfWeek, $lte: endOfToday }
        });
        const weeklyFeedbacks = await Feedback.countDocuments({
            createdAt: { $gte: startOfWeek, $lte: endOfToday }
        });

        // Count appointments and feedbacks for the past month
        const startOfMonth = new Date();
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);
        
        const monthlyAppointments = await Appointment.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfToday }
        });
        const monthlyFeedbacks = await Feedback.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfToday }
        });

        // Count appointments and feedbacks for the past year
        const startOfYear = new Date();
        startOfYear.setFullYear(startOfYear.getFullYear() - 1);
        
        const annualAppointments = await Appointment.countDocuments({
            createdAt: { $gte: startOfYear, $lte: endOfToday }
        });
        const annualFeedbacks = await Feedback.countDocuments({
            createdAt: { $gte: startOfYear, $lte: endOfToday }
        });

        const appointments = await Appointment.find()
            .populate('customerId', 'fullName email contact address gender')
            .sort({ createdAt: -1 });

        const users = await Customer.find();


        const serviceCounts = await Appointment.aggregate([
            {
                $match: { status: "completed" }  // Filter to include only completed appointments
            },
            {
                $group: {
                    _id: "$service",              // Group by service name
                    count: { $sum: 1 }            // Count occurrences
                }
            },
            {
                $project: {
                    serviceName: "$_id",         // Rename _id to serviceName
                    timesAvailed: "$count",      // Rename count to timesAvailed
                    _id: 0                        // Exclude the default _id field
                }
            }
        ]);

        const feedbacks = await Feedback.find();

        res.render('admin', {
            admin: req.admin,
            totalUsers,
            totalAppointments,
            feedbackCount,
            feedbacksToday,
            appointmentsToday,
            appointments,
            completedAppointments: appointments.filter(appointment => appointment.status === 'completed'),
            completedAppointmentsCount: appointments.filter(appointment => appointment.status === 'completed').length,
            users,
            feedBackToday,
            weeklyAppointments,
            weeklyFeedbacks,
            monthlyAppointments,
            monthlyFeedbacks,
            annualAppointments,
            annualFeedbacks,
            serviceCounts,
            feedbacks
        });
    } catch (error) {
        console.error("Error displaying admin dashboard:", error);
        res.status(500).send('Internal Server Error');
    }
}


const getDateRange = (period) => {
    const today = new Date();
    switch (period) {
        case 'weekly':
            return new Date(today.setDate(today.getDate() - 7));
        case 'monthly':
            return new Date(today.setMonth(today.getMonth() - 1));
        case 'annually':
            return new Date(today.setFullYear(today.getFullYear() - 1));
        default: // 'daily'
            return new Date(today.setHours(0, 0, 0, 0));
    }
};

exports.getStats = async (req, res) => {
    try {
        const { period } = req.params;
        const startDate = getDateRange(period);

        const totalUsers = await Customer.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const feedbackCount = await Feedback.countDocuments({ createdAt: { $gte: startDate } });

        res.json({
            totalUsers,
            totalAppointments,
            feedbackCount,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).send('Error fetching data');
    }
};


exports.displayReports = async(req, res) => {
    try {
        const appointments = await Appointment.find()

        res.render('reports', { appointments, admin: req.admin });
    } catch {
        return res.status(404, {message: error});
    }
}

exports.updateBooking = async (req, res) => {
    try {
        const appointmentId = req.body.appointmentId;
        const { rescheduleDate, rescheduleTime, rescheduleNotes } = req.body;

        console.log(appointmentId)
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = 'approved';
        appointment.date = new Date(rescheduleDate);
        appointment.time = rescheduleTime;
        appointment.notes = rescheduleNotes;

        await appointment.save();

        req.session.success = 'Appointment updated successfully';

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error updating booking:", error);
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

            // Admin can delete any appointment
            await Appointment.findByIdAndDelete(appointmentId);
            req.session.success = 'Appointment deleted successfully';
            res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.approveBooking = async(req,res) => {
    try {
        const appointmentId = req.params.id;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = 'approved';

        await appointment.save();

        req.session.success = 'Appointment approved successfully';

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error approving booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.completeBooking = async(req, res) => {
    try {
        const appointmentId = req.params.id;
        console.log("Appointment ID:", appointmentId); // Debugging output

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            console.log("Appointment not found"); // Debugging output
            return res.status(404).json({ message: 'Appointment not found' });
        }

        console.log("Current status:", appointment.status); // Debugging output
        appointment.status = 'completed';
        await appointment.save();

        req.session.success = 'Appointment completed successfully';
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error completing booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.addBooking = async(req,res) => {
    try {
        const { customerId, service, category, additional, appointmentDate, appointmentTime, appointmentNotes } = req.body;
        console.log(req.body);
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
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}