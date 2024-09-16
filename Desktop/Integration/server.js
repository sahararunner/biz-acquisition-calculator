const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');  // For storing session data (optional)

// Initialize Express app
const app = express();

// Middleware
app.use(cors());  // Allow cross-origin requests
app.use(bodyParser.json());  // Parse incoming JSON requests
app.use(session({
  secret: 'your-secret-key',  // Secret for signing session ID
  resave: false,
  saveUninitialized: true,
}));

// Environment Variables (Make sure these are set in Vercel)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const COMPANY_ID = process.env.COMPANY_ID;

// 1. Route to redirect user to QuickBooks for OAuth2 authorization
app.get('/auth/authorize', (req, res) => {
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=com.intuit.quickbooks.accounting&state=123456`;

  // Redirect the user to the QuickBooks authorization page
  res.redirect(authUrl);
});

// 2. OAuth2 callback to exchange authorization code for access token
app.get('/auth/callback', async (req, res) => {
  const authorizationCode = req.query.code;  // Get authorization code from query params

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });

    // Save the access token in the session (or another secure location)
    const accessToken = tokenResponse.data.access_token;
    req.session.accessToken = accessToken;

    res.send('Authorization successful! Access token obtained.');
  } catch (error) {
    console.error('Error during OAuth2 flow:', error);
    res.status(500).send('Failed to obtain access token.');
  }
});

// 3. Endpoint to create an estimate in QuickBooks
app.post('/create-estimate', async (req, res) => {
  const accessToken = req.session.accessToken;  // Retrieve access token from session
  const estimateData = req.body;  // Data for creating an estimate (from Webflow or client)

  if (!accessToken) {
    return res.status(403).send('Access token missing. Please authenticate with QuickBooks.');
  }

  try {
    // Send a request to create an estimate in QuickBooks
    const estimateResponse = await axios.post(
      `https://quickbooks.api.intuit.com/v3/company/${COMPANY_ID}/estimate`,
      estimateData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).send(estimateResponse.data);  // Send response back to client or Webflow
  } catch (error) {
    console.error('Error creating estimate:', error);
    res.status(500).send('Failed to create estimate.');
  }
});

// 4. Test route to check if server is running
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
