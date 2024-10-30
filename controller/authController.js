const Customer = require('../model/customerModel')
const Admin = require('../model/adminModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


exports.displayLanding = async (req, res) => {
    res.render('landing');
}

exports.displayLogin = async (req, res) => {
    res.render('login');
}

exports.displayRegister = async = (req, res) => {
    res.render('signup');
}

exports.Register = async (req, res) => {
    const { fullName, email, address, contact, gender, username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 

        const customer = new Customer({
            fullName,
            email,
            address,
            contact,
            gender,
            username,
            password: hashedPassword 
        });

        await customer.save();
        res.redirect('/login');
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("Internal server error"); 
    }
};

exports.Login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Customer.findOne({ email });

        if (!user) {
            return res.status(401).send("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send("Invalid email or password");
        }

        // Include role in the token
        const token = jwt.sign({ id: user._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

        res.redirect('/customer/home');
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal server error");
    }
};

// exports.Login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await Customer.findOne({ email });

//         if (!user) {e
//             return res.status(401).send("Invalid email or password");
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (!passwordMatch) {
//             return res.status(401).send("Invalid email or password");
//         }
//         // add id role is admin or user
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

//         res.redirect('/customer/home');
//     } catch (error) {
//         console.error("Login error:", error);
//         res.status(500).send("Internal server error");
//     }
// };

// exports.isAuthenticated = async (req, res, next) => {
//     try {
//         const token = req.cookies.token;

//         if (!token) {
//             return res.render('home', { error: 'Unauthorized Action' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id);

//         if (!user) {
//             return res.status(404).render('home', { error: 'User not found' });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error("Authentication error:", error);
//         res.status(500).json({ message: error.message });
//     }
// };

exports.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.render('home', { error: 'Unauthorized Action' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Customer.findById(decoded.id);

        if (!user) {
            return res.status(404).render('home', { error: 'User not found' });
        }

        req.user = user;

        // Check the role
        if (decoded.role === 'customer') {
            return next(); // Proceed to customer routes
        } else if (decoded.role === 'admin') {
            return res.json({ message: "Admin access granted." }); // Admin response
        }

        return res.status(403).json({ message: "Access denied." });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ message: error.message });
    }
};


exports.isAdminAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.render('home', { error: 'Unauthorized Action' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(404).render('home', { error: 'Admin not found' });
        }

        req.admin = admin;

        if (decoded.role === 'admin') {
            return next(); 
        }

        return res.status(403).json({ message: "Access denied." });
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ message: error.message });
    }
};


exports.Logout = async (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};