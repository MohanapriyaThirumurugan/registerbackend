import express from 'express';
import registerdata from '../register/login.js';

const app = express.Router();

// User registration
app.post('/', registerdata.register);

// Request password reset (sends reset email)
app.post('/reset', registerdata.requestPasswordReset);

// Reset password (use token to reset password)
app.post('/reset-password/:token', registerdata.resetPassword);

app.get('/login', registerdata.login);


export default app;
