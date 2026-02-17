# Sweat & Stress - Color Scanner

A modern web application that identifies colors via the device camera and maps them to physical/emotional stress levels.

## Features
- **Real-time Scanning**: Bank-style square scanner with laser animation.
- **Color Stability Tracking**: Requires holding the camera on a color for 5 seconds for accurate detection.
- **Stress Analysis**: Provides numeric stress levels and personalized Thai-language advice.
- **Modern UI**: Clean, responsive design optimized for mobile and iPad.

## Setup & Development

### Local Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Local Network Testing (iPad/Mobile)
To test on a physical device over WiFi:
1. Note your local IP address (e.g., `192.168.1.x`).
2. Ensure your computer's firewall allows port `5173`.
3. Open `https://<your-ip>:5173/` on your mobile device.
   *Note: HTTPS is required for camera access. The app uses `vite-plugin-mkcert` for local SSL.*

## Deployment on Render.com

This project is ready for deployment as a **Static Site** on Render.

1. Create a new **Static Site** on Render.
2. Connect your GitHub/GitLab repository.
3. Use the following settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Render will automatically provide an HTTPS URL, enabling camera access out of the box.

## Technology Stack
- **Vite**: Build tool and dev server.
- **Vanilla JavaScript**: Core logic and HSL color detection.
- **CSS3**: Responsive layout and animations.
- **mkcert**: Local development SSL certificates.
