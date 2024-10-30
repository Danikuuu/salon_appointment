import mongoose from 'mongoose';
import Appointment from './model/appointmentModel.js'; // Adjust the path to your appointment model

// Connect to MongoDB
await mongoose.connect("mongodb+srv://spaappointment485:spaappointment485@cluster0.jyudk.mongodb.net/appointment", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedAppointments = async () => {
    const appointments = [
        {
            customerId: new mongoose.Types.ObjectId("6720dcad4665c7c306d70b5b"), // sample user
            service: "Haircut",
            category: "Hair",
            additional: "None",
            status: "completed",
            date: new Date('2024-11-01'),
            time: "10:00 AM",
            notes: "Customer prefers a short style."
        },
        {
            customerId: new mongoose.Types.ObjectId("6721620ad9a6aa215496e99e"), // Raine
            service: "Facial Treatment",
            category: "Skin",
            additional: "Include massage",
            status: "for approval",
            date: new Date('2024-11-02'),
            time: "11:00 AM",
            notes: "Sensitive skin."
        },
        {
            customerId: new mongoose.Types.ObjectId("672180b85a5a857565521e5a"), // dfgh
            service: "Nail Care",
            category: "Nails",
            additional: "Gel finish",
            status: "completed",
            date: new Date('2024-11-03'),
            time: "09:00 AM",
            notes: "Preferred color: red."
        },
        {
            customerId: new mongoose.Types.ObjectId("6721b484c629807d0281fd01"), // Jaira Braza
            service: "Massage Therapy",
            category: "Body",
            additional: "Deep tissue",
            status: "pending",
            date: new Date('2024-11-04'),
            time: "01:00 PM",
            notes: "Focus on back pain."
        }
    ];

    await Appointment.insertMany(appointments);
    console.log('Appointments seeded');
};

// Execute the seeding functions
const seedDatabase = async () => {
    await Appointment.deleteMany({});
    await seedAppointments();
    mongoose.connection.close();
};

seedDatabase().catch(err => {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
});
