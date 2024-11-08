$('.advanced_button').click(function() {
    $('.advanced-filter').toggleClass('show');
});

async function fetchData() {
    try {
        const response = await fetch('http://localhost:8083/cars/v1/api/');
        const cars = await response.json();

        console.log(cars);

        const parentContainer = document.querySelector('.choose_car_container');
        parentContainer.innerHTML = '';
        cars.forEach(car =>{
            const brandItem = document.createElement('div');
            brandItem.classList.add('col-md-6');

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
            parentContainer.appendChild(brandItem);
        });

    } catch (error) {
        console.error("Error fetching car data:", error);
    }
}

fetchData();