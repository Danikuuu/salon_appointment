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
        const appointmentsToday = await Appointment.countDocuments({ date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });

        const appointments = await Appointment.find()
            .populate('customerId', 'fullName')
            .sort({ createdAt: -1 });

        const users = await Customer.find();

        res.render('admin', {
            admin: req.admin,
            totalUsers,
            totalAppointments,
            feedbackCount,
            feedbacksToday,
            appointmentsToday,
            appointments,
            users
        });
    } catch (error) {
        console.error("Error displaying admin dashboard:", error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getFilteredStats = async (req, res) => {
    try {
        const { period } = req.params; // period can be daily, weekly, monthly, annually

        const startDate = new Date();
        switch (period) {
            case 'daily':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'annually':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                return res.status(400).send('Invalid period');
        }

        const totalUsers = await Customer.countDocuments();
        const totalAppointments = await Appointment.countDocuments({ createdAt: { $gte: startDate } });
        const feedbackCount = await Feedback.countDocuments({ createdAt: { $gte: startDate } });

        res.json({
            totalUsers,
            totalAppointments,
            feedbackCount
        });
    } catch (error) {
        console.error("Error getting filtered stats:", error);
        res.status(500).send('Internal Server Error');
    }
};
