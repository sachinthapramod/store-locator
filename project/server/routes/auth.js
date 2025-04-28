import express from 'express';

const router = express.Router();

// Simple login route (in a production app, you would use JWT tokens, bcrypt for passwords, etc.)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // This is a simple example - in a real app, you would query your database
  // Here we're using hardcoded credentials for demo purposes only
  if (username === 'admin' && password === 'password') {
    res.status(200).json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

export default router; 