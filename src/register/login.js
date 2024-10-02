import userdetails from '../database/Register.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken'; // Make sure to install jsonwebtoken package if not already installed

const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate the fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the user already exists
        const existingUser = await userdetails.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new userdetails({
            name,
            email,
            phone,
            password: hashedPassword
        });

        // Save user in the database
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};




const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    console.log("Email received for password reset:", email);

    try {
        // Check if the user exists
        const user = await userdetails.findOne({ email: email.toLowerCase() }); // Convert email to lowercase
        console.log("User found: ", user);

        if (!user) {
            console.log("User not found with this email.");
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate a reset token and set expiration time
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiration = Date.now() + 3 * 60 * 60 * 1000; // 3 hours

        // Update user with reset token and expiration
        await userdetails.updateOne(
            { _id: user._id },
            { resetToken, resetTokenExpiry: expiration }
        );

        // Create transporter with your email configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetLink = `http://localhost:5173/resetpassword/${resetToken}`; // Adjust the port if needed

        // Send the reset email
        await transporter.sendMail({
            to: email,
            subject: 'Password Reset Request',
            text: `Please click the following link to reset your password: ${resetLink}`
        });

        return res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;  // Use reset token from the URL
    const { newPassword } = req.body;

    console.log("Token received: ", token);

    try {
        const user = await userdetails.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() } // Check if token is not expired
        });

        console.log("User found: ", user);

        if (!user) {
            console.log("No user found or token has expired.");
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Continue with password reset logic...
        // Hash the new password and save it
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined; // Clear the reset token
        user.resetTokenExpiry = undefined; // Clear the expiration

        await user.save();
        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt with email: ", email);

    try {
        // Validate the fields
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if the user exists
        const user = await userdetails.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log("User not found with this email.");
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match.");
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Optionally, create a JWT token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with user information and token
        return res.status(200).json({
            message: 'Login successful',
            token, // Include the token in the response
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

export default {
    register,
    requestPasswordReset,
    resetPassword,
    login
};
