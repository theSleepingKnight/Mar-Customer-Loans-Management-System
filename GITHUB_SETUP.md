# How to Upload Your Loan Management System to GitHub

## Step 1: Install Git

1. **Download Git for Windows:**
   - Go to: https://git-scm.com/download/win
   - Download the installer
   - Run the installer and follow the installation wizard
   - Use default settings (they're fine for most users)

2. **Verify Installation:**
   - Open a new PowerShell window (close and reopen your terminal)
   - Type: `git --version`
   - You should see something like: `git version 2.x.x`

## Step 2: Create a GitHub Account

1. **Go to GitHub:**
   - Visit: https://github.com
   - Click "Sign up"
   - Fill in your details and create an account
   - Verify your email address

## Step 3: Create a New Repository on GitHub

1. **Log in to GitHub** and click the **"+"** icon in the top right
2. Select **"New repository"**
3. **Repository settings:**
   - **Repository name:** `loan-management-system` (or any name you prefer)
   - **Description:** "Customer and Loan Management System - Marfyang"
   - **Visibility:** Choose **Public** (free) or **Private** (if you want to keep it private)
   - **DO NOT** check "Initialize this repository with a README" (we already have files)
   - Click **"Create repository"**

## Step 4: Initialize Git in Your Project

Open PowerShell in your project folder (`C:\Users\Noir\Desktop\loan-app`) and run these commands:

### 4.1. Initialize Git Repository
```powershell
git init
```

### 4.2. Configure Git (First time only - replace with your info)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4.3. Add All Files
```powershell
git add .
```

### 4.4. Create Your First Commit
```powershell
git commit -m "Initial commit: Loan Management System"
```

## Step 5: Connect to GitHub and Push

### 5.1. Add GitHub Remote
After creating your repository on GitHub, you'll see a page with setup instructions. Copy the repository URL (it looks like: `https://github.com/yourusername/loan-management-system.git`)

Then run:
```powershell
git remote add origin https://github.com/yourusername/loan-management-system.git
```
*(Replace with your actual repository URL)*

### 5.2. Rename Main Branch (if needed)
```powershell
git branch -M main
```

### 5.3. Push to GitHub
```powershell
git push -u origin main
```

You'll be prompted for your GitHub username and password. Use a **Personal Access Token** instead of your password (see below).

## Step 6: Create Personal Access Token (For Authentication)

GitHub requires a Personal Access Token instead of password:

1. **Go to GitHub Settings:**
   - Click your profile picture → **Settings**
   - Scroll down to **Developer settings** (left sidebar)
   - Click **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token** → **Generate new token (classic)**

2. **Configure Token:**
   - **Note:** "Loan App Access"
   - **Expiration:** Choose your preference (90 days, or no expiration)
   - **Select scopes:** Check **`repo`** (this gives full repository access)
   - Click **Generate token**

3. **Copy the Token:**
   - **IMPORTANT:** Copy it immediately - you won't see it again!
   - Use this token as your password when pushing

## Step 7: Verify Upload

1. **Refresh your GitHub repository page**
2. You should see all your files there!
3. Your code is now on GitHub! 🎉

## Important Notes

### What Gets Uploaded:
✅ All your source code (`.js`, `.jsx`, `.json`, etc.)
✅ Configuration files
✅ README.md and documentation

### What Does NOT Get Uploaded (thanks to .gitignore):
❌ `node_modules/` folders (too large, can be reinstalled)
❌ `database.sqlite` (your data stays local)
❌ `.env` files (sensitive information)
❌ Build/dist folders

## Future Updates

When you make changes and want to upload them:

```powershell
git add .
git commit -m "Description of your changes"
git push
```

## Troubleshooting

### If you get "repository not found" error:
- Check that your repository URL is correct
- Make sure you're using the Personal Access Token, not your password

### If you get "authentication failed":
- Make sure you're using a Personal Access Token, not your GitHub password
- Check that the token has `repo` scope enabled

### If you want to update your code later:
```powershell
git add .
git commit -m "Your update message"
git push
```

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Documentation: https://git-scm.com/doc

