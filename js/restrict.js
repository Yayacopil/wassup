// Function to check user's country using ipapi.co
  async function checkUserCountry() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const countryCode = data.country_code; // "KE" for Kenya

      // Hide loading message
      document.getElementById('loading').classList.add('hidden');

      // Check if user is in Kenya
      if (countryCode === 'KE') {
        document.getElementById('content').classList.remove('hidden');
      } else {
        document.getElementById('restricted').classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      // Fallback: show restricted message if API fails
      document.getElementById('loading').classList.add('hidden');
      document.getElementById('restricted').classList.remove('hidden');
    }
  }

  // Run the check when the page loads
  window.onload = checkUserCountry;