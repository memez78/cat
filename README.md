# Cyber Cat - Cybersecurity Learning Game

A fun and educational game that teaches children about cybersecurity through interactive gameplay and an AI assistant.

## Features

- 🎮 Interactive virus-blocking gameplay
- 🤖 AI chat assistant for cybersecurity guidance
- 👨‍👩‍👧‍👦 Parent and child user modes
- 🛡️ Progressive difficulty levels
- 🏆 Score and achievement tracking
- 🎵 Sound effects and animations
- 📱 Mobile-friendly design
- 🔄 Offline functionality (PWA)

## Setup

1. Clone the repository
2. Ensure all assets are in their correct directories:
   - Images in `assets/images/`
   - Sounds in `assets/sounds/`
3. Open `index.html` in a modern web browser

## Directory Structure

```
cyber-cat/
├── assets/
│   ├── images/
│   │   ├── background.png
│   │   ├── cyber_cat.png
│   │   ├── icon-192.png
│   │   ├── shield.png
│   │   └── virus.png
│   └── sounds/
│       ├── click.mp4
│       ├── collect.mp4
│       └── gameover.mp4
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── game.js
│   └── ai.js
├── index.html
├── manifest.json
└── sw.js
```

## Game Controls

- Click/tap to place shields
- Block viruses before they reach the bottom
- Earn points and coins for successful blocks
- Level up to face faster viruses

## Parent Dashboard

Parents can:
- Monitor their child's progress
- View gameplay statistics
- Get cybersecurity guidance tips
- Set up child profiles

## Technical Details

- Built with vanilla JavaScript
- Uses CSS Grid and Flexbox for responsive layout
- Implements the Web Audio API for sound effects
- Service Worker for offline functionality
- Local Storage for game state persistence

## Browser Support

Supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

All rights reserved. This project and its assets are proprietary. 