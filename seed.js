const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./model/adminModel'); // Adjust the path to your admin model

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb+srv://spaappointment485:spaappointment485@cluster0.jyudk.mongodb.net/appointment", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin', 10);

        // Create a new admin instance
        const admin = new Admin({
            email: 'admin@example.com',
            password: hashedPassword,
        });

        // Save the admin to the database
        await admin.save();

        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        // Close the connection
        mongoose.connection.close();
    }
};

// Run the seed function
seedAdmin();
