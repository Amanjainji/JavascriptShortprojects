const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorimg = document.querySelector(".errorimage");

//initially vairables
let oldTab = userTab;  
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage(); //if coordinates is present in local storage then show the weather according to that..

//agr user apna weather dekhna chahe
userTab.addEventListener("click", () => {
  //pass clicked tab as input paramter
  switchTab(userTab);
});

//agr user kisi or ka weather dekhna chahe search krke
searchTab.addEventListener("click", () => {
  //pass clicked tab as input paramter
  switchTab(searchTab);
});

// function for switching tabs from your weather to search weather and vice versa
function switchTab(newTab) {
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab"); //old tab = userTab (just for css activation)
    oldTab = newTab;
    oldTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      //kya search form wala container is invisible, if yes then make it visible
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      //main pehle search wale tab pr tha, ab your weather tab visible karna h
      searchForm.classList.remove("active");
      let notfound= document.querySelector('.errorimage'); //if error is found in previous tab then remove that from user page too.
      notfound.classList.remove('active');

      userInfoContainer.classList.remove("active"); //it is removed so that user weather does not show on search page by default
      //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first, for coordinates, if we haved saved them there.
      getfromSessionStorage();
    }
  }
}

//check if cordinates are already present i n session storage
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");  //use of getItem
  if (!localCoordinates) {
    //agar local coordinates nahi mile
    grantAccessContainer.classList.add("active");
  } 
  else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;
  // make grantcontainer invisible
  grantAccessContainer.classList.remove("active");
  //make loader visible
  loadingScreen.classList.add("active");

  //API CALL to fetch weather of user coordinates
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data); //just to show the information on the UI 
  } catch (err) {
    loadingScreen.classList.remove("active");
    let errorr= document.createElement('h2');
    errorr.innerText='not able to get the user location';
    document.appendChild(errorr); 
  }
}

function renderWeatherInfo(weatherInfo) {
  //fistly, we have to fetch the elements
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  console.log(weatherInfo);
  
    //fetch values from weatherInfo object and put it UI elements , it can be done by checking the json format and inner content for once
    cityName.innerText = weatherInfo?.name; //optional chaining operator ?.
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`; //for flag
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`; 
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
  }
  


function getLocation() {  //how to get location of user coordinates after tapping grant location access button
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition); // syntax checked by w3school site
  } else {
    let geo=document.createElement('h3');
    geo.innerHTML ="Geolocation is not supported by this browser.";
    document.appendChild(geo);
    alert("No location is founded....");
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates)); //setting local storage
  fetchUserWeatherInfo(userCoordinates); //to send the value to collect data from API and then render it
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation); //passed as a callback function to get location and show in the UI by a sequence of functions

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let cityName = searchInput.value;

  if (cityName === "") return;
  else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    loadingScreen.classList.remove("active");
    if(data?.cod === '404'){  //for error image
      let notfound= document.querySelector('.errorimage');
      notfound.classList.add('active');
    }
    else{
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);
    }
  } catch (err) {
    alert('not able to fetch');
  }
}
