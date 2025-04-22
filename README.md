# Pokekemon

Pokekemon is an interactive Pokémon battle simulator web application built with React. This application allows users to browse Pokémon, build teams, battle against other Pokémon, and even conduct QR code-based battles with friends.

## Prerequisites

- Node.js
- npm
- A modern web browser

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the JSON server:
```bash
npm run server
# or
yarn server
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Features

### Pokémon Browsing
- **Search**: Find Pokémon by name, type, color, habitat, and shape
- **Filtering**: Filter Pokémon by multiple criteria simultaneously
- **Pagination**: Browse through the complete Pokédex with ease

### Pokémon Details
- View comprehensive Pokémon information including:
  - Base stats (HP, Attack, Speed, etc.)
  - Type information
  - Abilities
  - Moves
  - Physical attributes (height, weight)
  - Habitat information

### Team Building
- Create a team of up to 6 Pokémon
- Easily add/remove Pokémon from your team
- Navigate to the team page to see all your selected Pokémon

### Favorites System
- Save your favorite Pokémon for quick access
- View all your favorite Pokémon in one place

### Battle Simulator
- Battle Pokémon against each other with a stat-based battle system
- Battles are determined by:
  - HP (Health Points)
  - Attack
  - Speed
- The Pokémon that wins 2 out of 3 stat comparisons wins the battle
- In case of a tie, the winner is determined by total stats

### QR Code Battles
- Generate a QR code to battle with friends
- Scan QR codes to accept battle requests
- Real-time battle status updates
- View detailed battle results

### Battle History
- Keep track of all your previous battles
- View detailed information about each battle
- See which stats determined the winner

## Project Structure

- `src/components/`: React components
- `src/pages/`: Page components
- `src/services/`: API services
- `db/`: JSON database files

## Technologies

- React
- React Router
- Tailwind CSS
- Axios
- JSON Server
- PokéAPI (for Pokémon data)
- QRCode SVG
