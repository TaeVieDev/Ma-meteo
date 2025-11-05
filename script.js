// Configuration de l'API
// La clé API sera injectée automatiquement lors du déploiement via GitHub Actions
const API_KEY = "336dfa98a0376660ad9d55bb76fccc39";

// Fonction principale pour récupérer les données météo
async function fetchWeather() {
    const searchInput = document.getElementById("search").value.trim();
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.style.display = "block";

    // Vérification de l'entrée utilisateur
    if (searchInput === "") {
        displayError("Entrée vide !", "Veuillez réessayer avec un nom de ville valide.");
        return;
    }

    try {
        // Récupération des coordonnées géographiques
        const geocodeData = await getLonAndLat(searchInput);
        if (!geocodeData) return;

        // Récupération des données météo
        await getWeatherData(geocodeData.lon, geocodeData.lat);
        
        // Effacement du champ de recherche après succès
        document.getElementById("search").value = "";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        displayError("Erreur", "Une erreur s'est produite lors de la récupération des données météo. Veuillez réessayer.");
    }
}

// Fonction pour récupérer les coordonnées géographiques
async function getLonAndLat(searchInput) {
    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchInput)}&limit=1&appid=${API_KEY}`;

    try {
        const response = await fetch(geocodeURL);
        if (!response.ok) {
            console.log("Bad response! ", response.status);
            displayError("Erreur API", "Impossible de récupérer les données de géocodage. Veuillez réessayer plus tard.");
            return null;
        }

        const data = await response.json();
        if (data.length === 0) {
            console.log("No location found for:", searchInput);
            displayError(`Entrée invalide : "${searchInput}"`, "Veuillez réessayer avec un nom de ville valide.");
            return null;
        }

        return data[0];
    } catch (error) {
        console.error("Error in getLonAndLat:", error);
        displayError("Erreur réseau", "Impossible de se connecter au service météo. Veuillez réessayer.");
        return null;
    }
}

// Fonction pour récupérer les données météo
async function getWeatherData(lon, lat) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await fetch(weatherURL);
        if (!response.ok) {
            console.log("Bad response! ", response.status);
            displayError("Erreur API", "Impossible de récupérer les données météo. Veuillez réessayer plus tard.");
            return;
        }

        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        console.error("Error in getWeatherData:", error);
        displayError("Erreur réseau", "Impossible de récupérer les informations météo. Veuillez réessayer.");
    }
}

// Fonction pour afficher les données météo
function displayWeatherData(data) {
    const weatherDataSection = document.getElementById("weather-data");
    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const cityName = data.name;

    weatherDataSection.style.display = "flex";
    weatherDataSection.innerHTML = `
        <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                 alt="${description}" />
        </div>
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
            <div class="additional-info">
                <span class="feels-like">Ressenti: ${Math.round(data.main.feels_like - 273.15)}°C</span>
                <span class="humidity">Humidité: ${data.main.humidity}%</span>
            </div>
        </div>
    `;
}

// Fonction utilitaire pour afficher les erreurs
function displayError(title, message) {
    const weatherDataSection = document.getElementById("weather-data");
    weatherDataSection.innerHTML = `
        <div>
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js: DOMContentLoaded');
    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            fetchWeather();
        });
        return;
    }
});
