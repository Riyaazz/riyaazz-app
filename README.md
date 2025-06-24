# Lehra/Nagma Player (Riyaazz-app)

A simple web application for practicing Indian classical music with Lehra/Nagma backing tracks. The app provides pitch and tempo controls, and supports multiple Taals and instruments.

## Features

- **Progressive Web App (PWA):** Fully offline-capable and installable on mobile devices ("Add to Home Screen").
- **Real-time Playback Control:** Play, pause, and seek through tracks.
- **Pitch and Tempo Shifting:** Adjust the pitch (scale) and tempo (BPM) in real-time.
- **Taal and Instrument Selection:** Filter tracks by rhythmic cycle and instrument.
- **Responsive Design:** Clean, mobile-friendly UI that works on any device.
- **Efficient Caching:** Audio files and app assets are cached for fast loading and offline use.

## Tech Stack

- **Progressive Web App (PWA):**
  - **Service Workers:** For robust offline caching of all app assets and audio files.
  - **Web App Manifest:** To make the application installable on user devices.
- **Core Libraries:**
  - [**Tone.js**](https://tonejs.github.io/): For all audio playback and manipulation (BPM, pitch).
  - [**Unpoly.js**](https://unpoly.com/): For fast, seamless navigation between pages without full reloads.
  - [**Alpine.js**](https://alpinejs.dev/): For lightweight and reactive UI components.
- **Build & Development:**
  - [**Bun**](https://bun.sh/): Fast JavaScript runtime for development and building.
  - [**Vite**](https://vitejs.dev/): Modern frontend build tool.
- **Styling:**
  - [**Pico CSS**](https://picocss.com/): Minimal CSS framework for a clean, responsive design (using the "Jade" theme).

## Project Structure

```
index.html                # Main entry point (home page)
public/
  audio/                  # Lehra/Nagma MP3 files
  static/                 # Static assets (icons, logo, favicon)
  templates/
    disclaimers.html      # Disclaimers partial
    footer.html           # Footer partial
    header.html           # Header partial
  tracks.json             # Track metadata
  player.html             # Player page template
  manifest.json           # PWA manifest file
  service-worker.js       # PWA service worker script
src/
  app.js                  # Main JS entry, initializations (Alpine, Unpoly, Service Worker)
  styles.css              # Main stylesheet
  toast.js                # Toast notification utility
  utils.js                # Shared helper functions
  components/
    playerPage.js         # Alpine.js component for the player
    tracks.js             # Alpine.js component for the track list
package.json              # Project metadata and scripts
vite.config.js            # Vite build configuration
bun.lock                  # Bun dependency lock file
README.md                 # This documentation
```

## Getting Started

### Install dependencies

```bash
bun install
```

### Run in development mode

```bash
bun run dev
```

### Build for production

```bash
bun run build
```

## Deployment

- The production build (via `bun run build`) outputs to the `../riyaaz.github.io/` directory by default.
- Deploy the contents of the `../riyaaz.github.io` directory to any static hosting provider (e.g., GitHub Pages, Vercel, Netlify).
- The service worker will handle caching and offline functionality automatically.

## Contributing

Contributions are welcome! If you have new Lehra recordings or suggestions, please contact the team at [riyaaz4result@gmail.com](mailto:riyaaz4result@gmail.com).

## Disclaimers

- This application is under construction and may have some defects.
- Only a limited set of Lehra/Nagma audio files are currently available. Other Taals and Instruments may use placeholder data.
- The source and copyright status of the current MP3 files are unverified, as they have been converted from public sources.
- If you have concerns about any content, please contact the team for review or removal.
- This project is not affiliated with any official organization or institution.
- The app is intended for educational and practice purposes only.
- Please do not use this app for commercial purposes without proper licensing of the audio files.
- The app is open-source, but the audio files may have their own copyright restrictions.
- The app does not store any user data or track usage.
- The app is provided "as is" without any warranties or guarantees.
- The team reserves the right to modify or remove any content at any time.
- The team is not responsible for any misuse or misrepresentation of the app or its content.
- Please use the app responsibly and respect the rights of the original content creators.
- The team is committed to maintaining a respectful and inclusive community around this project.
- By using this app, you agree to the terms and conditions outlined above.
- We encourage users to provide feedback and report any issues or concerns.
- If you have any feedback or suggestions, please reach out to: [riyaaz4result@gmail.com](mailto:riyaaz4result@gmail.com)

## License

This project is licensed under the MIT License. However, the audio files included in this project are not licensed under this license.
Please refer to the individual audio file sources for their respective licenses and usage terms.
## Acknowledgements
- Huge Thanks to [Tone.js](https://tonejs.github.io/) for providing the audio library that powers this application.
- This project is inspired by the rich tradition of Indian classical music and aims to support learners and practitioners in their musical journey.
- Thanks to all contributors and the Indian classical music community for their support.
- Special thanks to the original artists and creators of the Lehra/Nagma recordings used in this project.
- This project is inspired by the rich tradition of Indian classical music and aims to support learners and practitioners in their musical journey.
- We acknowledge the contributions of the open-source community and the tools that made this project possible.
- If you have any suggestions or improvements, please feel free to contribute or contact us.
- We appreciate your interest in this project and hope it serves as a valuable resource for your musical practice.
- Let's keep the spirit of Indian classical music alive and thriving through technology and community collaboration!
- Tone js is used for audio playback and manipulation, providing a modern and efficient way to handle audio in the browser.

## Contact
For any inquiries, suggestions, or contributions, please contact the team at [riyaaz4result@gmail.com](mailto:riyaaz4result@gmail.com)
