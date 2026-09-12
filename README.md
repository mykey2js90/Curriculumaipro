# CurriculumAI — Free Lead Magnet Funnel (GitHub Pages)

A high-converting lead generation landing page and thank-you delivery sequence designed for [CurriculumAI](https://www.curriculumaipro.com).

## 📁 Repository Structure
- `index.html` — The main landing page giving away *The AI Curriculum Architecture & Course Design Blueprint*
- `thank_you.html` — The delivery & thank you page bridging subscribers to the CurriculumAI platform trial
- `Code.gs` — Ready-to-deploy Google Apps Script for saving email opt-ins directly to Google Sheets

---

## 🚀 How to Publish on GitHub Pages in 4 Steps

### Step 1: Create a GitHub Repository
1. Go to [GitHub](https://github.com) and click **New repository**.
2. Repository name: `curriculumai-blueprint` (or any name you prefer).
3. Set visibility to **Public** (required for free GitHub Pages).
4. Click **Create repository**.

### Step 2: Upload Files to the Repository
**Option A: Web Browser Upload (Easiest)**
1. On your new repository page, click **uploading an existing file**.
2. Drag and drop `index.html` and `thank_you.html` into the upload box.
3. Click **Commit changes**.

**Option B: Using Git Command Line**
```bash
git init
git add index.html thank_you.html README.md
git commit -m "Initial commit of CurriculumAI landing page funnel"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/curriculumai-blueprint.git
git push -u origin main
```

### Step 3: Turn on GitHub Pages
1. In your GitHub repository, click **Settings** (gear icon at the top).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
4. Set Branch to `main` and folder to `/(root)`.
5. Click **Save**.
6. Wait ~30-60 seconds. Your live URL will appear at the top:
   `https://<YOUR_GITHUB_USERNAME>.github.io/curriculumai-blueprint/`

### Step 4 (Optional): Connect Your Custom Domain
If you want the landing page to live on `curriculumaipro.com` or a subdomain like `get.curriculumaipro.com`:
1. In the **Pages** settings under **Custom domain**, enter `get.curriculumaipro.com` (or `curriculumaipro.com`).
2. Add a `CNAME` record in your DNS (Cloudflare/registrar) pointing to `<YOUR_GITHUB_USERNAME>.github.io`.

---

## 📊 Connecting the Email Capture to Your Google Sheet

Opt-ins can be sent automatically into your Google Sheet:
**[CurriculumAI — Marketing Leads & Subscriber Database](https://docs.google.com/spreadsheets/d/1ExyZ6hXU1Q3XguQAl2qcTNjxVCZevQS3-PRvXSia0mk/edit)**

1. Open your Google Sheet.
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Replace any default code with the contents of `Code.gs`.
4. Click **Deploy** > **New deployment**.
5. Select type: **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Click **Deploy**, authorize permissions, and copy the **Web app URL**.
7. In `index.html`, find `const SCRIPT_URL = '';` around line 575 and paste your Web app URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
8. Commit the change to GitHub. Every subscriber will now be automatically recorded into your Google Sheet!
