const weatherSection = document.querySelector('.city-weather');
const weatherDeg = document.querySelector('.city-header__degrees');
const cityOverlay = document.querySelector('.city-overlay');
const forecastCard = document.querySelector('#forecast-card');
const forecastInfoText = document.querySelector('#forecast__info-text');
const localStorageCard = document.querySelector('#localstorage-card');
const localStorageInfoText = document.querySelector('#localstorage__info-text');
const cardDaysList = document.querySelector('.card__list');
const cardLocalStorageList = document.querySelector('.localstorage__list');

const storageCheckbox = document.querySelector('#save-checkbox');

const months = ["Enero","Febrero","Marzo","Abril","Marzo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]; 
const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const generalLoader = document.querySelector('.loader-container');

const cityContainer = document.querySelector('.city-container');
const cityCurrentTemperature = document.querySelector('#city-temperature');
const cityName = document.querySelector('#city-name');
const cityWeatherIconContainer = document.querySelector('#city-header__icon-container');
const cityWeatherIcon = document.querySelector('#city-header__icon');
const cityWeatherDescription = document.querySelector('.city-header__description');

const citySelect = document.querySelector('#city-select');

let averageMax = [];
let averageMin = [];

let storageData = {
    dates: [],
    mins: [],
    maxs: []
};

class City {
    constructor(id, name, picture) {
        this.id = id,
        this.name = name,
        this.picture = picture
        
        this.Forecast = [];
    }
}

class Forecast {
    constructor(){
        this.date = "";
        this.maxTemperature = "";
        this.minTemperature = "";
    }
}



window.onload = () => {
    if(!localStorage.getItem("storageCity")){
        
        console.log("No hay data almacenada");
        
        localStorageInfoText.innerText = " Actualmente no hay información almacenada en tu localStorage."
        
    } else {
        console.log("Hay data almacenada");
        
        localStorageInfoText.innerText = "Tienes información almacenada en tu localStorage."
        
        document.getElementById('overlay').classList.add('is-visible');
        document.getElementById('modal').classList.add('is-visible');
        document.querySelector('#localStorage-button').removeAttribute('disabled');
    }
}


const updateCityForecast = () => {
    let cityID = citySelect.value;
    
    storageData.dates = [];
    storageData.mins = [];
    storageData.max = [];
    
    averageMax = [];
    averageMin = [];
    
    cityOverlay.style.opacity = 1;
    weatherDeg.classList.remove('ninja');
    forecastInfoText.style.display = "none";
    
    showLoading();
    cityForecast(cityID);
}



const cityForecast = (cityID) =>{
    let city = cities.find( item => item.id == cityID );
    //console.log(city)
    
    citySelect.value = city.id;
    
    let cleanSelects = citySelect.children;
    
    
    for(select of cleanSelects){
        select.removeAttribute("selected")
    }
    
    updateWeekForecast(city.name);
    updateUI(city.name, city.picture);
}


const checkSave = () => {
    if(storageCheckbox.checked){
        saveInLocalStorage();
        localStorageInfoText.innerText = "Tienes información almacenada en tu localStorage."
        document.querySelector('#localStorage-button').removeAttribute('disabled');
        document.querySelector('#localStorage-button').innerText = "Actualizar Información";
    }
}


const updateWeekForecast = async (citiesValue) => {
    
    
    
    let updateCity = citiesValue
    
    const callCurrentForecast = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${updateCity},CL&&appid=85a07f96bde4d123ce53787fcaa556c2`)
    const todayData = await callCurrentForecast.json();
    //console.log(todayData);
    updateCurrentWeather(todayData)
    
    const callWeekForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${updateCity},CL&&appid=85a07f96bde4d123ce53787fcaa556c2`);
    const weekData = await callWeekForecast.json();
    console.log("week data is: ", weekData);
    updateWeekWeather(weekData).then(checkSave);
    
    
}



const updateCurrentWeather = (currentArray) => {
    
    cityWeatherIcon.className = '';
    
    const {temp, temp_max, temp_min, humidity} = currentArray.main;
    let description = currentArray.weather[0].main;
    let celsius = temp - 273.15;
    //console.log(temp_max, temp_min, humidity);
    cityCurrentTemperature.textContent = Math.floor(celsius);
    
    
    switch (description) {
        case "Clouds":
        cityWeatherIcon.classList.add('icofont-clouds', 'city-header__icon');
        cityWeatherDescription.textContent = "Nublado";
        break;
        case "Clear":
        cityWeatherIcon.classList.add('icofont-sun', 'city-header__icon');
        cityWeatherDescription.textContent = "Despejado";
        break;
        case "Rain":
        cityWeatherIcon.classList.add('icofont-rainy', 'city-header__icon');
        cityWeatherDescription.textContent = "Lluvia";
        break;
        case "Snow":
        cityWeatherIcon.classList.add('icofont-snowy', 'city-header__icon');
        cityWeatherDescription.textContent = "Nieve";
        break;
    }
    
}

const updateWeekWeather = (currentWeekArray) => {
    
    return new Promise((resolve,reject) => {
        
        const weekForecast = currentWeekArray.list;
        
        let uniqueDays = [];
        
        weekForecast.forEach(value => {
            let addDay = uniqueDays.find( day => day.date == value.dt_txt.substring(0, 10) );
            
            if(!addDay){
                uniqueDays.push({   
                    date: value.dt_txt.substring(0, 10),
                    promedioMax : [value.main.temp_max],
                    promedioMin: [value.main.temp_min]
                });
            } else {
                addDay.promedioMax.push(value.main.temp_max);
                addDay.promedioMin.push(value.main.temp_min);
            }
        });
        //console.log("dias unicos:", uniqueDays);
        
        
        getAverageTemperatures(uniqueDays);
        //console.log(uniqueDays)
        
        
        let dates = weekForecast.map(date => date.dt_txt.substring(0, 10));
        //("dates: ", dates)
        
        
        let uniqueDates = [...new Set(dates)]
        let transformedDates = uniqueDates.map(d => {

            let dateArray = d.split("-");
            //console.log(dateArray)
            let year = dateArray[0];
            let month = parseInt(dateArray[1], 10) - 1;
            let date = dateArray[2];

            let newTransformedDate = new Date(year, month, date);
            //console.log(_entryDate);
            return newTransformedDate
        });
        
        
        
        
        
        
        let listedDates = transformedDates.map( d => {
            let month = months[d.getMonth()];
            let weekday = days[d.getDay()];
            let day = d.getDate() ;

            let fullDate = `${weekday}, ${day} ${month}`;
            
            storageData.dates.push(fullDate);
            //console.log(fullDate);
            return fullDate
        })
        
        
        
        cardDaysList.innerText = '';
        
        listedDates.forEach( (container, index) => {
            
            let itemList = document.createElement('li');
            let day = document.createElement('p');
            let dayTemperatures = document.createElement('div');
            
            itemList.classList.add('card__list-item');
            day.classList.add('card__list-item-text');
            dayTemperatures.classList.add('card__list-item-average')
            
            day.innerHTML = `${listedDates[index]}`;
            dayTemperatures.innerHTML  = `<p class="weekylyforecast-temp weeklyforecast-temp--mintemp">${averageMin[index]} °</p><p class="weekylyforecast-temp weeklyforecast-temp--maxtemp">${averageMax[index]} °</p>`;
            
            itemList.append(day, dayTemperatures);
            cardDaysList.appendChild(itemList);
            
        });
        
        
        
        const error = false;
        
        if(!error){
            resolve();
        } else {
            reject('Error: No se pudo completar la carga de datos.')
        }
        
    });
    
    
}


const updateUI = (name, image) =>{
    cityName.innerText = name;
    cityContainer.style.backgroundImage = `url('${image}')`; 
}

const averageTemp = (totalTemp, length) =>{
    return ((totalTemp / length) - 273.15).toFixed(1);
}

const getAverageTemperatures = (week) =>{
    week.forEach( (dia) => {
        let reducidoMax = dia.promedioMax.reduce((acc, el) => acc + el, 0)
        averageMax.push(averageTemp(reducidoMax, dia.promedioMax.length));
        storageData.maxs.push(averageTemp(reducidoMax, dia.promedioMax.length));
        
        
        let reducidoMin = dia.promedioMin.reduce((acc, el) => acc + el, 0)
        averageMin.push(averageTemp(reducidoMin, dia.promedioMin.length));
        storageData.mins.push(averageTemp(reducidoMin, dia.promedioMin.length));
        
    })
}

const showLoading = () => {
    generalLoader.style.display = 'flex';
    hideLoading();
}


const hideLoading = () => {
    setTimeout(() =>{
        generalLoader.style.display = 'none';
    }, 2500)
}


const saveInLocalStorage = async () => {
    
    localStorage.clear();
    localStorage.setItem("storageCity", null);
    
    
    let city = cities.find( item => item.id == document.querySelector('#city-select').value );
    
    storageData.dates.forEach( (day, index) => {
        let dayName = storageData.dates[index];
        let dayMinTemp = storageData.mins[index];
        let dayMaxTemp = storageData.maxs[index];
        
        let dayForecast = new Forecast();
        
        dayForecast.date = dayName;
        dayForecast.maxTemperature = dayMaxTemp;
        dayForecast.minTemperature = dayMinTemp;
        
        city.Forecast.push(dayForecast);
    });
    
    localStorage.setItem("storageCity", JSON.stringify(city));
    
    
}


const getFromLocalStorage = () =>{
    if(localStorage.getItem("storageCity")){
        
        showLoading();
        
        
        setTimeout(() =>{
            dismissModal();
            updateLocalStorageUI()
            
            cardLocalStorageList.innerText = '';
            
            let city = JSON.parse(localStorage.getItem("storageCity"));
            console.log(city);
            
            const {name, Forecast} = city;
            
            document.querySelector('#localstorage-title').innerText = name;
            
            Forecast.forEach( weekDay => {
                let itemList = document.createElement('li');
                let day = document.createElement('p');
                let dayTemperatures = document.createElement('div');
                
                itemList.classList.add('card__list-item');
                day.classList.add('card__list-item-text');
                dayTemperatures.classList.add('card__list-item-average')
                
                day.innerHTML = `${weekDay.date}`;
                dayTemperatures.innerHTML  = `<p class="weekylyforecast-temp weeklyforecast-temp--mintemp">${weekDay.minTemperature}°</p><p class="weekylyforecast-temp weeklyforecast-temp--maxtemp">${weekDay.maxTemperature}°</p>`;
                
                itemList.append(day, dayTemperatures);
                cardLocalStorageList.appendChild(itemList);
                
            });
        }, 1000)
        
        
        
        
    } else{
        console.log("No hay data almacenada");
    }
    
}

const updateLocalStorageUI = () =>{
    localStorageInfoText.style.display = "none";
    document.querySelector('#localStorage-button').removeAttribute('disabled');
    document.querySelector('.localStorage-badge').classList.remove('ninja');
}


const dismissModal = () =>{
    document.getElementById('overlay').classList.remove('is-visible');
    document.getElementById('modal').classList.remove('is-visible');
}

