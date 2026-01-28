const { User, sequelize } = require('./models');

async function createAdmin() {
    try {
        await sequelize.sync(); // Ensure tables exist

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            console.log(`Email: ${adminEmail}`);
            console.log('Password: (unchanged)');
            process.exit(0);
        }

        // Create new admin
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            phone: '1234567890',
            onboardingStep: 'completion',
            onboardingCompleted: true
        });

        const fs = require('fs');
        fs.writeFileSync('admin_status.txt', `Success: Admin user created/found.\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
        console.log('Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    } catch (error) {
        console.error('Failed to create admin user:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
