# Store Locator Application

A full-stack application built with React, TypeScript, Express, and MongoDB that helps users locate stores on a map.

## Tech Stack

- **Frontend:**
  - React
  - TypeScript
  - Vite
  - Tailwind CSS
  - Google Maps API
  - Lucide React (Icons)

- **Backend:**
  - Node.js
  - Express
  - MongoDB (Mongoose)
  - CORS

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Available Scripts

In the project directory, you can run:

### Frontend Development
```bash
npm run dev
```
Runs the frontend in development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Backend Development
```bash
npm run dev:server
```
Runs the backend server with nodemon for auto-reloading.

### Database Seeding
```bash
npm run seed
```
Populates the database with initial store data.

### Production Build
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality.

## Project Structure

```
project/
├── src/              # Frontend source code
├── server/           # Backend source code
├── public/           # Static assets
├── .bolt/            # Bolt configuration
├── node_modules/     # Dependencies
├── package.json      # Project configuration
├── tsconfig.json     # TypeScript configuration
├── vite.config.ts    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js # PostCSS configuration
```

## Features

- Interactive map interface using Google Maps
- Store location search and filtering
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- RESTful API backend
- MongoDB database integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 