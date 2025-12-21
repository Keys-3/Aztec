# Google Technologies Setup Guide

This application uses free Google technologies to enhance functionality:

1. **Google Gemini AI** - Powers the intelligent chatbot assistant
2. **Google Maps** - Enables real-time delivery tracking

## Setup Instructions

### 1. Google Gemini API Key

The AI chatbot uses Google's Gemini API for natural language responses about hydroponic farming.

#### Steps to Get Your Free API Key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file:
   ```
   VITE_GOOGLE_GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

#### Features:
- Real-time AI assistance for farming questions
- Expert hydroponic growing advice
- Plant health diagnostics
- Nutrient and pH management tips
- Pest and disease solutions

### 2. Google Maps API Key

Google Maps enables visual delivery tracking with route optimization.

#### Steps to Get Your Free API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Go to "Credentials" and create an API key
5. Copy the API key
6. Add it to your `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your-actual-maps-api-key-here
   ```

#### Features:
- Live delivery tracking on interactive maps
- Route visualization from hub to delivery address
- Estimated delivery time calculation
- Interactive markers with order details
- Address geocoding for precise location

## Free Tier Limits

### Gemini API
- **Free tier**: 60 requests per minute
- Perfect for small to medium applications
- No credit card required for basic usage

### Google Maps
- **Free tier**: $200 monthly credit
- Covers approximately:
  - 28,000 map loads
  - 40,000 geocoding requests
  - 40,000 directions requests
- More than sufficient for development and small deployments

## Testing the Integration

### Test Gemini Chatbot:
1. Start the application
2. Click the chatbot button (bottom right)
3. Ask questions like:
   - "How to optimize nutrient levels?"
   - "My plants are wilting, what should I do?"
   - "Best pH levels for lettuce?"

### Test Google Maps Tracking:
1. Create an order (sign in first)
2. Go to User Profile > My Orders
3. Click "Track Delivery" on any order with status "processing" or "shipped"
4. View the interactive map with route and location markers

## Troubleshooting

### Gemini Not Working:
- Check API key is correctly added to `.env`
- Ensure no spaces or quotes around the key
- Verify the key is active in Google AI Studio
- Check browser console for error messages

### Maps Not Loading:
- Verify API key in `.env` file
- Ensure all required APIs are enabled in Google Cloud Console
- Check for any billing alerts (though free tier should work)
- Confirm no API restrictions are blocking your domain

## Security Best Practices

1. Never commit your `.env` file to version control
2. Keep API keys secure and private
3. Use environment variables for production deployments
4. Consider adding API key restrictions in Google Cloud Console:
   - HTTP referrers for Maps API
   - IP restrictions if deploying on specific servers

## Additional Resources

- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Google Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Free Tier Details](https://cloud.google.com/free)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify API keys are correctly configured
3. Ensure all required Google APIs are enabled
4. Review the free tier limits haven't been exceeded
