# ☯️ InkShift

> ### *High-Contrast PDF Style Converter*

**InkShift** (白黒 - *Shirokuro*) is a beautiful, local-first, high-contrast PDF reader and style converter designed to transform blindingly bright documents and manga tankōbon into high-contrast, dark-mode masterpieces. 

Unlike crude, standard browser inversion—which ruins covers, muddies ink, and destroys illustrations—InkShift uses advanced, high-fidelity pixel-mapping filters to preserve color relationships while gracefully mapping bright backdrops into elegant, dark, or custom-toned sheets.

***

## 🌟 What This App Does

- ⚡ **Graceful Color Inversion**: Preserves colored splash pages, covers, and original illustration colors while gracefully darkening paper backgrounds.
- 🔒 **Absolute Local Security**: Your documents never leave your machine! All rendering, conversion, and assembly run entirely inside your browser's local sandbox. No servers, no tracking, and 100% offline-capable.
- 🎨 **Manga-Themed Presets (Shirokuro 白黒)**:
  - **InkShift**: Deep newsprint charcoal optimized for manga screentone contrast, preserving full-page splash art.
  - **Cyber Tokyo**: Deep midnight blue background reminiscent of Neo-Tokyo, with electric cyber-blue highlight ink.
  - **Classic Tankōbon**: Aged pulpy paper and soft warm manga ink, replicating vintage tankōbon print editions.
  - **Mecha HUD**: Tactical cockpit screen green glow, from inside a giant piloting suit.
  - **Neo Noir**: Sleek dark-teal cyberpunk tone, relaxing to the eyes.
  - **Manga Café**: Rich dark espresso canvas with cozy cream-toned text for hours of peaceful reading.
- 📥 **High-Resolution Assembly**: Re-compile and export your newly illuminated manga chapters or PDF pages at customizable resolutions (Standard, High, or Max Resolution).

***

## 💻 How to Install as an App (PWA)

You don't need an app store! You can install InkShift directly to your computer or mobile device in seconds for a distraction-free, standalone app experience with its own desktop icon.

### On Google Chrome & Microsoft Edge (Desktop)
1. Navigate to your hosted page (e.g., `https://tadd31.github.io/PDF-Converted/`).
2. Look at the address bar at the top right:
   - **Chrome**: Click the **Install** icon (a monitor with an arrow) next to the bookmark star, or click **Settings (three dots) > Save and share > Install page as app**.
   - **Edge**: Click the **App Available** icon or go to **Settings (three dots) > Apps > Install this site as an app**.
3. The app will now have its own icon on your desktop and start menu, and run in a clean window without browser tabs!

### On iPhone & iPad (Safari)
1. Open Safari and go to your hosted URL.
2. Tap the **Share** button (a box with an upward arrow) at the bottom or top of the screen.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** at the top right. It will instantly appear as an app on your home screen!

### On Android (Chrome)
1. Open Google Chrome and go to your hosted URL.
2. Tap the **three dots** in the top-right corner.
3. Select **Install app** or **Add to Home screen**.

***

## 🛠️ For Developers: Replicating & Hosting Your Own

If you would like to duplicate this project, modify the source code, or deploy it to your own GitHub Pages hosting, follow these simple steps.

### 1. Local Development Setup
First, make sure you have [Node.js](https://nodejs.org) installed on your system.

```bash
# Clone or download this repository to your local computer
cd PDF-Converted

# Install the necessary packages
npm install

# Run the local development server
npm run dev
```
Open the local URL shown in your terminal (usually `http://localhost:3000`) to test the app locally.

### 2. Tailoring for Your GitHub Repository
Because Vite compiles static assets with relative paths, you must configure the project to match your specific GitHub username and repository name.

1. Open `vite.config.ts`.
2. Locate the `base` configuration line:
   ```typescript
   base: '/PDF-Converted/',
   ```
3. Change `/PDF-Converted/` to match your repository's name. For example, if your repository is named `my-pdf-reader`, change it to:
   ```typescript
   base: '/my-pdf-reader/',
   ```
4. Save and commit this change!

### 3. Setting Up Automatic Deployment to GitHub Pages
To avoid third-party application token and security conflicts, GitHub blocks direct pushing of "workflow" files from external coding tools. To activate automatic builder deployments, simply create the workflow directly on GitHub's website:

1. Push your code to your new GitHub repository.
2. Go to your repository page on **GitHub.com**.
3. Near the top right of the file list, click **Add file > Create new file**.
4. In the name box, paste this exact path: `.github/workflows/deploy.yml`
5. Copy and paste the following workflow YAML content into the editor:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

6. Click **Commit changes...** at the top right to save and publish the file.

### 4. Enable GitHub Actions in Settings
1. On your GitHub repository page, click the **Settings** tab.
2. In the left-hand sidebar under the *Code and automation* section, click **Pages**.
3. Under **Build and deployment > Source**, change the dropdown from *"Deploy from a branch"* to **GitHub Actions**.
4. Within seconds, a runner will spin up under the **Actions** tab to compile your code and serve your new standalone web application!

***

## ⚖️ License
This project is licensed under the Apache-2.0 License. See the `LICENSE` file for details.
