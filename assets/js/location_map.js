let map;
let shopData = []; // Initialize an empty array to store shop data

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
  });
  
  // Fetch data from the backend API and initialize map with markers
  loadShopsData();
}

async function loadShopsData() {
  try {
    const response = await fetch("http://localhost:8083/places/v1/api/loadPlaces");
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    shopData = data.map(shop => ({
      name: shop.name,
      address: shop.address,
      rating: shop.rating || "N/A",
      phone: shop.phone || "N/A",
      availability: shop.availability || "N/A",
      location: { lat: parseFloat(shop.location.lat), lng: parseFloat(shop.location.lng) },
    }));

    // After loading data, find user location and nearest shop
    getUserLocation();
  } catch (error) {
    console.error("Failed to load shop data:", error);
  }
}

// Request user's location and find nearest shop
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Add a circle to show the search radius around the user's location
        const userRadiusCircle = new google.maps.Circle({
          map: map,
          center: userLocation,
          radius: 1000, // Radius in meters (5000m = 5km)
          fillColor: "#FF0000",
          fillOpacity: 0.2,
          strokeColor: "#FF0000",
          strokeOpacity: 0.5,
          strokeWeight: 1,
        });

        findNearestShop(userLocation);
      },
      () => alert("Location access denied.")
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}


// Calculate distance between two points using the Haversine formula
function calculateDistance(loc1, loc2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Find the nearest shop
function findNearestShop(userLocation) {
  let nearestShop = null;
  let minDistance = Infinity;

  shopData.forEach((shop) => {
    const distance = calculateDistance(userLocation, shop.location);
    if (distance < minDistance) {
      minDistance = distance;
      nearestShop = shop;
    }
  });

  if (nearestShop) {
    map.setCenter(nearestShop.location);
    map.setZoom(14);
    
    showDetails(nearestShop); // Show nearest shop details
    addMarkersAndSidebar(userLocation); // Add markers for all shops and user location
  }
}

// Initialize markers and sidebar for all shops
function addMarkersAndSidebar(userLocation) {
  const userMarker = new google.maps.Marker({
    position: userLocation,
    map: map,
    title: "Your Location",
    icon: {
        url: "assets/img/animated/here.gif",
        scaledSize: new google.maps.Size(80, 80) // Adjust width and height as needed
    }
  });

  shopData.forEach((shop) => {
    const marker = new google.maps.Marker({
      position: shop.location,
      map: map,
      title: shop.name,
    });

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

// Function to add shop cards to the sidebar
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

// Show details of the selected shop in a sidebar
function showDetails(shop) {
  document.getElementById("sidebar-back").classList.add("show");

  document.getElementById("shop-details").innerHTML = `
    <h5>${shop.name}</h5>
    <p>${shop.address}</p>
    <p>Rating: ${shop.rating} ⭐</p>
    <p>Phone: ${shop.phone}</p>
    <p>Availability: ${shop.availability}</p>
    <p>Description: ${shop.description || "No additional description available."}</p>

    <h5>Order Call Back</h5>
    <form action="#" class="form-search d-flex align-items-center mb-3">
      <input type="text" class="form-control mr-15" placeholder="Phone number">
      <button type="submit" class="btn btn-outline-dark w-100">ORDER CALL</button>
    </form>
    <p>By clicking order call button, you will share your details</p>

    <h5>Call by yourself</h5>
    <a href="tel:+371xxxxxxxx" class="btn btn-outline-dark w-100">CALL RIGHT NOW</a>

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
      <p>Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non.</p>
    </div>
    <div class="card p-3 mb-3">
      <h6>John Smith</h6>
      <p>Car analyzing ⭐⭐⭐⭐⭐</p>
      <p>Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non.</p>
    </div>
    <div class="card p-3 mb-3">
      <h6>John Smith</h6>
      <p>Car analyzing ⭐⭐⭐⭐⭐</p>
      <p>Feugiat pretium nibh ipsum consequat. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus non.</p>
    </div>

    <hr>
    <p>Add some extra data here</p>
  `;

  history.pushState(null, "", `?shop=${encodeURIComponent(shop.name)}`);
}

function closeDetails() {
  document.getElementById("sidebar-back").classList.remove("show");
  history.pushState(null, "", ""); // Reset URL to initial state
}
