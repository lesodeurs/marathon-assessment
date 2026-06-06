# The Marathon of Imperative Synchronization — Assessment Site

## Setup Instructions

### 1. Deploy to Netlify
- Push this entire folder to your GitHub repo
- Connect the repo to Netlify (it will auto-detect netlify.toml)

### 2. Add Environment Variables in Netlify
Go to: Site Settings → Environment Variables → Add the following:

| Key | Value | Where to get it |
|-----|-------|-----------------|
| `ANTHROPIC_API_KEY` | Your Claude API key | console.anthropic.com |
| `BREVO_API_KEY` | Your Brevo API key | app.brevo.com → Settings → API Keys |
| `BREVO_LIST_ID` | Your Brevo list ID (number) | app.brevo.com → Contacts → Lists |

### 3. Set Up Brevo (Free Email List)
1. Go to brevo.com → sign up free (no credit card)
2. Go to Settings → API Keys → Generate a new key
3. Go to Contacts → Lists → Create a new list called "Marathon Assessment"
4. Copy the List ID number (shown next to the list name)
5. Add both values to Netlify environment variables above

### 4. Set Up Anthropic API Key
1. Go to console.anthropic.com → sign in or create account
2. Go to API Keys → Create new key
3. Copy and add to Netlify environment variables above
4. Note: API usage costs roughly $0.003 per transcript generated

### 5. Redeploy
After adding environment variables, trigger a redeploy:
Netlify Dashboard → Deploys → Trigger deploy → Deploy site

---

## Folder Structure
```
marathon-site/
├── netlify.toml              # Netlify config (routing + functions)
├── README.md                 # This file
├── public/
│   └── index.html            # The full assessment app
└── netlify/
    └── functions/
        ├── transcript.js     # Proxies Claude API (keeps key secure)
        └── subscribe.js      # Adds contacts to Brevo list
```

## What Each Subscriber Record Contains
- First name
- Email address
- HEAD_STATE (e.g. "Balanced", "Front-Heavy", "Back-Heavy")
- FEET_STATE (e.g. "Marathon-Pace", "Fast-Pace", "Slow-Pace")

This lets you segment future emails by result type.
