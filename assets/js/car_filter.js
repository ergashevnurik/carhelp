// Function to fetch car data from the API and populate dropdowns
async function fetchCarData() {
    try {
        const response = await fetch('http://localhost:8083/cars/v1/api/');
        const cars = await response.json();

        // Populate brand dropdown
        const brandDropdownContent = document.querySelector('.custom-dropdown .dropdown-content');
        brandDropdownContent.innerHTML = ''; // Clear existing content

        cars.forEach(car => {
            const brandItem = document.createElement('div');
            brandItem.classList.add('dropdown-item');

            // Add brand logo image
            const brandImage = document.createElement('img');
            brandImage.src = car.imgSrc;
            brandImage.alt = car.name;
            brandImage.style.width = '20px';
            brandImage.style.marginRight = '8px';
            brandItem.appendChild(brandImage);

            // Add brand name
            const brandText = document.createTextNode(car.name);
            brandItem.appendChild(brandText);

            // Set brand selection action to populate models
            brandItem.onclick = () => selectBrand(car.name, car.carModels);
            brandDropdownContent.appendChild(brandItem);
        });
    } catch (error) {
        console.error("Error fetching car data:", error);
    }
}

// Function to handle brand selection and populate models with images if available
function selectBrand(brand, models) {
    // Update the "Марка авто" dropdown button text
    document.querySelector('.custom-dropdown .dropdown-btn').innerText = brand;

    // Populate the "Модель" dropdown based on the selected brand models
    const modelDropdownContent = document.querySelectorAll('.custom-dropdown')[1].querySelector('.dropdown-content');
    modelDropdownContent.innerHTML = ''; // Clear existing models

    if (models && models.length > 0) {
        models.forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.classList.add('dropdown-item');
            modelItem.textContent = model.name;

            // Set model selection action
            modelItem.onclick = () => selectModel(model.name);
            modelDropdownContent.appendChild(modelItem);
        });
    } else {
        const noModels = document.createElement('div');
        noModels.classList.add('dropdown-item');
        noModels.textContent = 'No models available';
        modelDropdownContent.appendChild(noModels);
    }
}

// Function to handle model selection
function selectModel(model) {
    document.querySelectorAll('.custom-dropdown')[1].querySelector('.dropdown-btn').innerText = model;
}

// Toggle dropdown visibility
document.querySelectorAll('.dropdown-btn').forEach(btn => {
    btn.addEventListener('click', function(event) {
        const dropdownContent = this.nextElementSibling;
        dropdownContent.classList.toggle('show');
        event.stopPropagation();
    });
});

// Close dropdowns when clicking outside
window.onclick = function(event) {
    document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.remove('show');
    });
};

// Fetch car data on page load
fetchCarData();
