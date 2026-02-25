let map;
let guessMarker = null;
let actualLocation = null;
let guessLocation = null;

// Random world coordinates (biased toward land regions)
function randomCoordinates() {
  const lat = Math.random() * 140 - 60;
  const lng = Math.random() * 360 - 180;
  return { lat, lng };
}

// Distance formula (Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function loadRandomLocation() {
  const coords = randomCoordinates();

  // Mapillary public image API (demo key)
  const url = `https://graph.mapillary.com/images?access_token=MLY|YOUR_PUBLIC_TOKEN&fields=thumb_1024_url,computed_geometry&closeto=${coords.lng},${coords.lat}&radius=100000`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.data && data.data.length > 0) {
    const image = data.data[0];
    document.getElementById("streetImage").src = image.thumb_1024_url;

    actualLocation = {
      lat: image.computed_geometry.coordinates[1],
      lng: image.computed_geometry.coordinates[0]
    };
  } else {
    loadRandomLocation();
  }
}

function init() {
  map = L.map('map').setView([20,0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  map.on('click', function(e) {
    guessLocation = e.latlng;

    if (guessMarker) map.removeLayer(guessMarker);

    guessMarker = L.marker(e.latlng).addTo(map);
  });

  document.getElementById("guessBtn").addEventListener("click", () => {
    if (!guessLocation) {
      alert("Click the map!");
      return;
    }

    const distance = getDistance(
      guessLocation.lat,
      guessLocation.lng,
      actualLocation.lat,
      actualLocation.lng
    );

    document.getElementById("result").innerText =
      `You were ${distance.toFixed(2)} km away`;

    loadRandomLocation();
  });

  loadRandomLocation();
}

init();
