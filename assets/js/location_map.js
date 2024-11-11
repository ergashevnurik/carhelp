let map;
let shopData = [];
let nearbyShops = [];
let radius = 2; // Default radius in km
let userMarker, userRadiusCircle;
let markers = []; // Track markers for later removal

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
  });

  loadShopsData();
}

async function loadShopsData() {
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

    getUserLocation();
  } catch (error) {
    console.error("Failed to load shop data:", error);
  }
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };

        // Clear the previous user marker and circle if they exist
        clearPreviousMarkers();

        // Create a new circle with the updated radius
        userRadiusCircle = new google.maps.Circle({
          map: map,
          center: userLocation,
          radius: radius * 1000, // Convert radius to meters
          fillColor: "#FF0000",
          fillOpacity: 0.2,
          strokeColor: "#FF0000",
          strokeOpacity: 0.5,
          strokeWeight: 1,
        });

        // Create a new user marker
        userMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
          icon: {
            url: "assets/img/animated/here.gif",
            scaledSize: new google.maps.Size(80, 80)
          }
        });

        findNearestShops(userLocation);
      },
      () => alert("Location access denied.")
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestShops(userLocation) {
  const maxDistance = radius; // Use the radius selected by the user
  nearbyShops = shopData.filter(shop => calculateDistance(userLocation, shop.location) <= maxDistance);

  if (nearbyShops.length > 0) {
    map.setCenter(userLocation);
    map.setZoom(14);

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
    const marker = new google.maps.Marker({
      position: shop.location,
      map: map,
      title: shop.name,
    });
    
    markers.push(marker); // Keep track of markers

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div>
          <h5>${shop.name}</h5>
          <p>Rating: ${shop.rating} ⭐</p>
          <p>${shop.address}</p>
          <p>Phone: ${shop.phone}</p>
          <p>Availability: ${shop.availability}</p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    marker.addListener("mouseover", () => {
      infoWindow.open(map, marker);
    });

    marker.addListener("mouseout", () => {
      infoWindow.close();
    });

    addShopToSidebar(shop, infoWindow, marker);
  });
}

function addShopToSidebar(shop, infoWindow, marker) {
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

  shopCard.addEventListener("mouseenter", () => {
    infoWindow.open(map, marker);
  });

  shopCard.addEventListener("mouseleave", () => {
    infoWindow.close();
  });

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

    <h5>Open in waze to navigate</h5>
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
  // Update the radius value display
  const rangeValueElement = document.getElementById("range-value");
  rangeValueElement.textContent = `${value} km`;

  // You can call your function to update the map with the new radius here
  radius = value;
  getUserLocation();  // Re-fetch the user's location and apply filters again
}

// Clear all markers on the map
function clearMarkers() {
  markers.forEach(marker => marker.setMap(null)); // Remove each marker
  markers = []; // Clear the markers array
}

// Clear previous user marker and radius circle
function clearPreviousMarkers() {
  if (userMarker) userMarker.setMap(null);
  if (userRadiusCircle) userRadiusCircle.setMap(null);
  nearbyShops = []; // Clear the previously found shops
}

// Clear Sidebar Data
function clearSidebar() {
  const shopList = document.getElementById("shop-list");
  shopList.innerHTML = ""; // Clear all previous shop cards
}
