# 📜 Kelly's Folio Illuminator

> *"To read, or not to read, that is no longer a question of eye strain."*

Welcome to **Kelly's Folio Illuminator**—a bespoke, Shakespearean-themed, alchemical PDF color profile customizer. This offline-first tool is specifically crafted for Kelly to comfortably read, adjust, and re-bind her PDF documents with gentle, eye-friendly color templates (like *Midnight Hamlet*, *Othello Blue*, and *First Folio Parchment*). 

This is a **100% client-side, browser-based React application**. It processes PDFs entirely inside the user's web browser using local GPU/CPU cycles. Because of this, it is highly secure (no documents are ever uploaded to any servers) and is incredibly simple to host for free or convert into a standalone Windows application.

---

## 🏛️ Standalone Web Hosting (Free & Private)

To give Kelly a clean, standalone web application without the AI Studio developer workspace frame, you can host the application on several free hosting providers.

### Option 1: GitHub Pages (Highly Recommended, Free & Automated)
Since the app generates pure static files, GitHub Pages can host it entirely for free. 

Because GitHub blocks third-party apps like AI Studio from writing automatic "Workflow" files directly to your repo (causing a push error), I have removed the local `.github/workflows/deploy.yml` folder to **fully unblock your sync and push**. You can now push your code perfectly! 

Here is the extremely easy way to activate the automatic builder directly on GitHub's website in 1 minute:

1. **Push your code to GitHub first:**
   - Go ahead and sync or push your code from AI Studio. It will now succeed perfectly without errors!

2. **Add the workflow file directly on GitHub:**
   - Go to your repository on [GitHub.com](https://github.com).
   - Click the **Add file** button near the top right of your file list and select **Create new file**.
   - In the name field, type exactly: `.github/workflows/deploy.yml`
   - Paste the following content into the file editor:

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
   - Click **Commit changes...** at the top right to save the file.

3. **Enable GitHub Actions Pages Deployment:**
   - On your GitHub repository page, click the **Settings** tab.
   - On the left sidebar, click **Pages**.
   - Under **Build and deployment** > **Source**, change the dropdown from *"Deploy from a branch"* to **GitHub Actions**.

4. **Enjoy Standalone Access!**
   - GitHub will automatically start a runner, build the app, and host it! Kelly can access her app at: `https://<your-username>.github.io/<your-repository-name>/` (e.g., `https://tadd31.github.io/PDF-Converted/`).
   - Every future push from AI Studio will automatically rebuild and update her standalone page in 30 seconds!

### Option 2: Netlify (Easiest - 1-Minute Drag & Drop)
If you don't want to use command lines or Git, you can use Netlify's instant deploy:
1. Export the project from AI Studio as a ZIP file (accessible from the settings menu).
2. Unzip it on your computer, open a terminal, and run:
   ```bash
   npm install
   npm run build
   ```
3. Locate the generated `dist/` folder.
4. Go to [Netlify Drop](https://app.netlify.com/drop).
5. Drag and drop the `dist/` folder directly onto the screen.
6. **Presto!** Netlify will instantly give you a live, standalone link (e.g., `https://kellys-folio.netlify.app`) that you can share with Kelly.

### Option 3: Vercel (Free & High Performance)
1. Go to [Vercel](https://vercel.com/) and sign up with a free account.
2. Install the Vercel CLI or link your GitHub account.
3. Import the repository and set the framework preset to **Vite**.
4. Click **Deploy**, and Vercel will host it permanently under an elegant, custom subdomain.

---

## 💻 Making It an Installable Windows App

If Kelly prefers a traditional desktop icon that she can double-click on her taskbar, you can easily wrap this web app into a Windows executable (`.exe`).

### Method A: The Modern Browser "Install" (Easiest & Cleanest)
Because this app runs beautifully in the browser, modern browsers can install it as a **Progressive Web App (PWA)** or standalone window:
1. Open the hosted URL (on Netlify, GitHub Pages, or Vercel) in **Microsoft Edge** or **Google Chrome**.
2. Look at the right side of the address bar:
   - In **Edge**: Click the **"App available. Install Kelly's Folio Illuminator"** icon (looks like three squares and a plus sign).
   - In **Chrome**: Click the **Install** button or click the three dots (`...`) and choose **"Save and share" > "Install page as app"**.
3. Choose to add a desktop shortcut or pin it to the Windows Taskbar.
4. When opened, it will launch in an elegant borderless window, feeling exactly like a native Windows desktop application!

---

### Method B: Nativefier (Package into a standalone `.exe`)
Nativefier is a command-line tool that packages any web page into an executable app utilizing Electron:
1. Ensure you have Node.js installed on your computer.
2. Open your Command Prompt (cmd) or PowerShell and install Nativefier globally:
   ```bash
   npm install -g nativefier
   ```
3. Run the packaging command, referencing your hosted URL:
   ```bash
   nativefier --name "Kelly's Folio Illuminator" "https://your-hosted-url-here.com" --platform "windows" --internal-urls ".*"
   ```
4. This command will output a Windows folder containing `Kelly's Folio Illuminator.exe`.
5. Move this folder to her computer (e.g., in `C:\Program Files`), create a desktop shortcut for the `.exe`, and Kelly will have her own native application!

---

### Method C: Tauri (Ultra-Lightweight Native App)
If you want an extremely lightweight, premium, native installer (`.msi` / `.exe` that takes up less than 5MB and is fully offline-capable):
1. Create a Tauri project wrapper around this Vite build:
   ```bash
   npm install @tauri-apps/cli
   npx tauri init
   ```
2. Configure Tauri to target the `dist/` directory as its frontend dist path.
3. Build the native Windows package:
   ```bash
   npx tauri build
   ```
4. Tauri will compile a ready-to-run Windows installer inside `src-tauri/target/release/bundle/msi/`. Double-click this installer to install the program natively on Kelly's Windows system!

---

### Method D: WebCatalog (Desktop wrapper - No coding required)
If you want a quick, premium desktop app builder:
1. Download [WebCatalog Desktop](https://webcatalog.io/) on Windows.
2. Click **"Create Custom App"**.
3. Enter the name: `Kelly's Folio Illuminator`.
4. Paste the hosted web link.
5. Click **Install**. WebCatalog will instantly create a dedicated Windows desktop shortcut, customize the window borders, and run it as an independent application.

---

## 🛠️ Local Development & Alchemical Assembly

To run the Illuminator or make changes locally on your machine:

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to start tuning your colors.
3. **Assemble static production bundle:**
   ```bash
   npm run build
   ```
   This generates the pure client-side folder `dist/` to be used for hosting or app compilation.
