const { exec } = require('child_process');

console.log('Starting the Store Locator backend server...');

// Start the server
const server = exec('node server/index.js');

server.stdout.on('data', (data) => {
  console.log(`Backend: ${data}`);
  
  // Check if MongoDB connection is successful
  if (data.includes('Connected to MongoDB')) {
    console.log('MongoDB connection successful!');
  }
});

server.stderr.on('data', (data) => {
  console.error(`Backend Error: ${data}`);
});

server.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
});

console.log('Server started. Press Ctrl+C to stop.'); 