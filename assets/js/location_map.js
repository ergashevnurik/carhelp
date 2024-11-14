let map;
let shopData = [];
let nearbyShops = [];
let radius = 2; // Default radius in km
let userMarker, userRadiusCircle;
let markers = []; // Track markers for later removal

function initMap() {
  // Create the map without setting the initial view yet
  map = L.map('map');

  // Add the tile layer (replace with the desired tile layer)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  // Get the user's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = [position.coords.latitude, position.coords.longitude];

        // Set the map view to the user's current location
        map.setView(userLocation, 14); // Set zoom level to 14 (can adjust as needed)

        // Optionally, add a marker for the user's location
        // L.marker(userLocation).addTo(map)
        //   .bindPopup("You are here")
        //   .openPopup();

        // Call loadShopsData after setting the view
        loadShopsData(userLocation);
      },
      () => {
        alert("Location access denied. Defaulting to New York.");
        // Fallback if geolocation is not available or denied
        map.setView([40.7128, -74.0060], 11); // Default to New York
        loadShopsData([40.7128, -74.0060]);
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
    // Fallback if geolocation is not supported
    map.setView([40.7128, -74.0060], 11); // Default to New York
    loadShopsData([40.7128, -74.0060]);
  }
}

async function loadShopsData(userLocation) {
  try {
    const response = await fetch("http://localhost:8083/places/v1/api/loadPlaces");
    if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
    const data = await response.json();
    
    shopData = data.map(shop => ({
      name: shop.name,
      address: shop.address,
      rating: shop.rating.toFixed(1),
      phone: shop.phone,
      availability: shop.availability,
      location: { lat: parseFloat(shop.location.lat), lng: parseFloat(shop.location.lng) },
      tags: shop.tags || []
    }));

    getUserLocation(userLocation);  // Pass user's location to getUserLocation
  } catch (error) {
    console.error("Failed to load shop data:", error);
  }
}

function getUserLocation(userLocation) {
  // Clear previous user marker and circle if they exist
  clearPreviousMarkers();

  // Create a new circle with the updated radius
  userRadiusCircle = L.circle(userLocation, {
    color: 'red',
    fillColor: '#FF0000',
    fillOpacity: 0.2,
    radius: radius * 1000, // Convert radius to meters
  }).addTo(map);

  // Create a new user marker
  userMarker = L.marker(userLocation, {
    icon: L.icon({
      iconUrl: 'assets/img/animated/here.gif',
      iconSize: [80, 80]
    })
  }).addTo(map);

  findNearestShops(userLocation);
}

function calculateDistance(loc1, loc2) {
  const latLng1 = L.latLng(loc1);
  const latLng2 = L.latLng(loc2);
  return latLng1.distanceTo(latLng2) / 1000; // Convert to km
}

function findNearestShops(userLocation) {
  const maxDistance = radius; // Use the radius selected by the user
  nearbyShops = shopData.filter(shop => calculateDistance(userLocation, shop.location) <= maxDistance);

  if (nearbyShops.length > 0) {
    map.setView(userLocation, 14);  // Set map center and zoom level

    addMarkersAndSidebar(userLocation);
  } else {
    alert("No shops found within the specified range.");
  }
}

function addMarkersAndSidebar(userLocation) {
  // Clear any existing markers and sidebar content before adding new data
  clearMarkers();
  clearSidebar();

  nearbyShops.forEach(shop => {
    // const icon = new L.DivIcon({
    //   className: 'icon-div',
    //   html: `<div class="rating-marker">${shop.rating} ⭐</div>`,
    // }); 

    // const marker = L.marker(shop.location).setIcon(icon).addTo(map);
    const marker = L.marker(shop.location).addTo(map);
    markers.push(marker); // Keep track of markers

    const popupContent = `
      <div>
        <h5>${shop.name}</h5>
        <p>Rating: ${shop.rating} ⭐</p>
        <p>${shop.address}</p>
        <p>Phone: ${shop.phone}</p>
        <p>Availability: ${shop.availability}</p>
      </div>
    `;
    marker.bindPopup(popupContent);

    // Handle mouse events
    marker.on('mouseover', () => marker.openPopup());
    marker.on('mouseout', () => marker.closePopup());

    addShopToSidebar(shop, marker);
  });
}

function addShopToSidebar(shop, marker) {
  const shopList = document.getElementById("shop-list");
  const shopCard = document.createElement("div");
  shopCard.classList.add("card", "mb-3", "p-3", "shadow-sm", "shop-card");
  shopCard.innerHTML = `
    <h5>${shop.name}</h5>
    <p>${shop.address}</p>
    <p>Rating: ${shop.rating} ⭐</p>
    <p>${shop.phone}</p>
    <p>Availability: ${shop.availability}</p>
    <button class="btn btn-outline-primary btn-sm">Check Availability</button>
  `;
  shopList.appendChild(shopCard);

  shopCard.addEventListener("mouseenter", () => marker.openPopup());
  shopCard.addEventListener("mouseleave", () => marker.closePopup());

  shopCard.addEventListener("click", () => showDetails(shop));
}

function showDetails(shop) {
  document.getElementById("sidebar-back").classList.add("show");

  document.getElementById("shop-details").innerHTML = `
    <div class="wrapper">
      <div style="background-image: url('https://www.shutterstock.com/image-photo/mechanic-using-wrench-while-working-600nw-2184125681.jpg');" class="gallery_image"></div>
    </div>
    <h5>${shop.name}</h5>
    <p>${shop.address}</p>
    <p>Rating: ${shop.rating} ⭐</p>
    <p>Phone: ${shop.phone}</p>
    <p>Availability: ${shop.availability}</p>
    <p>Description: ${shop.description || "No additional description available."}</p>

    <h5>Open in Waze to navigate</h5>
    <a href="https://www.waze.com/ul?ll=${shop.location.lat}%2C${shop.location.lng}&navigate=yes&zoom=17" class="mb-3 w-100 btn btn-outline-primary">Open Waze</a>

    <h5>Order Call Back</h5>
    <form action="#" class="form-search d-flex align-items-center mb-3">
      <input type="text" class="form-control mr-15" placeholder="Phone number">
      <button type="submit" class="btn btn-outline-dark w-100">ORDER CALL</button>
    </form>
    <p>By clicking order call button, you will share your details</p>

    <h5>Call by yourself</h5>
    <a href="tel:${shop.phone}" target="_blank" class="btn btn-outline-dark w-100">CALL RIGHT NOW</a>

    <h5 class="mt-3">Our price list</h5>
    <ul>
      <li>Car analyzing - 50$</li>
      <li>Car detailing - 100$</li>
      <li>Car tuning - 350$</li>
    </ul>

    <h5 class="mt-3">Feedbacks</h5>
    <div class="card p-3 mb-3">
      <h6>John Smith</h6>
      <p>Car analyzing ⭐⭐⭐⭐⭐</p>
      <p>Feugiat pretium nibh ipsum consequat.</p>
    </div>
  `;

  history.pushState(null, "", `?shop=${encodeURIComponent(shop.name)}`);
}

function closeDetails() {
  document.getElementById("sidebar-back").classList.remove("show");
  history.pushState(null, "", "");
}

function updateRadius(value) {
  const rangeValueElement = document.getElementById("range-value");
  rangeValueElement.textContent = value + " km";
  radius = value;
  if (userMarker && userRadiusCircle) {
    getUserLocation(userMarker.getLatLng()); // Update user location and refresh nearby shops
  }
}

function clearPreviousMarkers() {
  if (userMarker) {
    map.removeLayer(userMarker);
  }
  if (userRadiusCircle) {
    map.removeLayer(userRadiusCircle);
  }
  clearMarkers(); // Clear other markers as well
}

function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
}

function clearSidebar() {
  document.getElementById("shop-list").innerHTML = "";
}

document.getElementById("range-slider").addEventListener("input", function (e) {
  updateRadius(e.target.value);
});