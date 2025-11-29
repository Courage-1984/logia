# GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions to fetch Google Reviews and Instagram posts during the build process.

## Overview

The build process fetches Google Reviews and Instagram posts at build time. Since GitHub Actions doesn't have access to your local `.env` file, you need to configure GitHub Secrets.

## Required Secrets

You need to set up the following secrets in your GitHub repository:

1. **GOOGLE_PLACES_API_KEY** - Your Google Places API key
2. **GOOGLE_PLACE_ID** - Your Google Business Place ID
3. **INSTAGRAM_ACCESS_TOKEN** (optional) - Instagram Graph API access token

**Note:** The `GITHUB_TOKEN` is automatically provided by GitHub Actions and doesn't need to be set manually. It's used by Lighthouse CI to post status checks and comments on pull requests.

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `GOOGLE_PLACES_API_KEY`
   - Value: Your Google Places API key
   - Click **Add secret**
5. Repeat for `GOOGLE_PLACE_ID` and `INSTAGRAM_ACCESS_TOKEN` (if needed)

## How It Works

### During Local Development
- Uses `.env` file (via `dotenv-cli`)
- Run: `npm run build:gh-pages`

### During GitHub Actions Build
- Uses GitHub Secrets (passed as environment variables)
- Automatically runs when you push to `main` branch
- Secrets are securely passed to the build process

## Fallback Behavior

If the API keys are not set:
- **Google Reviews**: Falls back to `data/manual-reviews.json`
- **Instagram Posts**: Falls back to manual posts from `config/app.config.js`

## Workflow Configuration

The workflow (`.github/workflows/static.yml`) is already configured to:
1. Pass secrets as environment variables
2. Run the fetch scripts before building
3. Deploy the built site to GitHub Pages

## Troubleshooting

### Reviews Not Updating
- Check that secrets are set correctly in GitHub
- Verify the API key has the correct permissions
- Check GitHub Actions logs for errors

### Build Failing
- Ensure all required secrets are set
- Check that API keys are valid
- Review the Actions logs for specific error messages

## Security Notes

- Never commit `.env` file to the repository
- GitHub Secrets are encrypted and only accessible during workflow runs
- Secrets are not exposed in logs (they're masked automatically)

