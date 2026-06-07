# Google Maps Step-by-Step Setup

The website now has two map modes:

- If `GOOGLE_MAPS_EMBED_API_KEY` is empty, it uses a simple Google Maps iframe fallback.
- If `GOOGLE_MAPS_EMBED_API_KEY` is set, it uses the official Google Maps Embed API.

## 1. Set the Location in the CMS

1. Login to the admin CMS.
2. Go to **Support Info**.
3. Fill in:

- Foundation Address
- Google Maps Search Query

Use the exact place name or exact address.

Example:

```text
Mary Mother of Mercy Home For the Elderly And Abandoned Foundation Philippines
```

Save the form.

## 2. Test Without API Key

Leave this empty:

```env
GOOGLE_MAPS_EMBED_API_KEY=
```

Restart the server and open the site. The footer and contact page should show a Google Maps iframe fallback.

## 3. Use the Official Maps Embed API

1. Open Google Cloud Console.
2. Create a project.
3. Enable billing.
4. Enable **Maps Embed API**.
5. Create an API key.
6. Add it to `.env`:

```env
GOOGLE_MAPS_EMBED_API_KEY=your_google_maps_embed_api_key
```

7. Restart the server.

## 4. Restrict the API Key

For production:

1. Open Google Cloud Console.
2. Go to APIs & Services > Credentials.
3. Select the API key.
4. Application restrictions: choose **Websites**.
5. Add allowed referrers:

```text
https://yourdomain.com/*
https://www.yourdomain.com/*
```

6. API restrictions: choose **Restrict key**.
7. Select only **Maps Embed API**.
8. Save.

## 5. If the Map Still Does Not Show

Check:

- Maps Embed API is enabled
- billing is enabled
- the key is not misspelled in `.env`
- the server was restarted
- the allowed referrer includes your exact domain
- the Google Maps query is a real searchable location

