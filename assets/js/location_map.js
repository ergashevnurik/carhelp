let map;
const shopData = [
  {
    name: "Meisterwerkstatt",
    address: "102 Huntington Street, Brooklyn, NY",
    rating: 4.6,
    phone: "(347) 727-1913",
    availability: "Fri, Nov 1 at 9 am",
    location: { lat: 40.6782, lng: -73.9442 },
  },
  {
    name: "Key Auto Center",
    address: "240 Green St, Brooklyn, NY",
    rating: 4.9,
    phone: "(718) 690-7940",
    availability: "Mon, Nov 4 at 8 am",
    location: { lat: 40.7128, lng: -74.006 },
  },
  {
    name: "Car Experts",
    address: "120 5th Ave, Brooklyn, NY",
    rating: 4.8,
    phone: "(718) 234-5678",
    availability: "Tue, Nov 5 at 10 am",
    location: { lat: 40.7128, lng: -74.0061 },
  },
  {
    name: "Car Experts",
    address: "120 5th Ave, Brooklyn, NY",
    rating: 4.8,
    phone: "(718) 234-5678",
    availability: "Tue, Nov 5 at 10 am",
    location: { lat: 56.96983479279139, lng: 24.1578652520115 },
  },
];

// Initialize and add the map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
  });

  // Add markers and populate sidebar
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

    marker.addListener('click', () => showDetails(shop));
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