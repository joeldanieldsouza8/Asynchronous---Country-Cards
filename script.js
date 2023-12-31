'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

//////////////////////////////////////////////////////////////////////////

// const getCountryAndNeighbour = function (country) {
//   // AJAX call country 1
//   const request = new XMLHttpRequest();
//   request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
//   request.send();

//   request.addEventListener('load', function () {
//     const [data] = JSON.parse(this.responseText);
//     // console.log(data);

//     // Render country 1
//     renderCountry(data);

//     // Get neighbour country (2)
//     const [neighbour] = data.borders;

//     if (!neighbour) return;

//     // AJAX call country 2
//     const request2 = new XMLHttpRequest();
//     request2.open('GET', `https://restcountries.com/v3.1/alpha/${neighbour}`);
//     request2.send();

//     request2.addEventListener('load', function () {
//       const data2 = JSON.parse(this.responseText);
//       // console.log(data2);

//       renderCountry(data2, 'neighbour');
//     });
//   });
// };

// getCountryAndNeighbour('portugal');
// getCountryAndNeighbour('usa');

//////////////////////////////////////////////////////////////////////////

//   /* Note to self:
//   - Promise: In JavaScript, a Promise is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value.
//   - Fetch API: The Fetch API provides a JavaScript interface for accessing and manipulating parts of the HTTP pipeline, such as requests and responses. It provides a more modern way to make web requests than the older XMLHttpRequest.
//   - The fetch() function is being called. It's making a request to the URL https://restcountries.com/v3.1/name/${country}`
//   - Once the data has been fetched, the .then() method will be executed. It receives a callback function that is executed once the Promise (from the fetch) is resolved.
//   - The 'response.json()' is a method that reads the body of the response and returns another Promise that will resolve with the parsed JSON content. In simpler words, it's converting the data received from the server (which is typically in a string format) into a JavaScript object so that it can be easily used.
//   - This is another .then() method which receives the parsed JSON data (the JavaScript object). This is the actual data about the country that was fetched from the server.

//   Analogy:
//   - Imagine you order a pizza (the Fetch request).
//   - The promise is like the pizza place saying, "Your order will be ready in 30 minutes."
//   - You don't get the pizza immediately (asynchronous), but you get an assurance (Promise).
//   - Once the pizza is ready (data received from the server), you can then decide what to do with it (the .then() method) - maybe eat it (use the data) or share it with a neighbour (fetching more related data, like in the case of the neighbouring country).
//   */

// function getCountryData(country) {
// Country 1
//   getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
//     .then(data => {
//       // console.log(data);
//       renderCountry(data[0]);
//       const neighbour = data[0].borders?.[0];
//       // if (!neighbour) return;
//       // Guard clause
//       if (!neighbour) {
//         throw new Error('No neighbour found!');
//       }
//       // Country 2
//       return getJSON(
//         `https://restcountries.com/v3.1/alpha/${neighbour}`,
//         'Country not found'
//       );
//     })
//     .then(data => renderCountry(data[0], 'neighbour'))
//     .catch(err => {
//       // console.log(err);
//       renderError(`Something went wrong 💥💥💥 ${err.message}. Try again!`);
//     })
//     .finally(() => {
//       countriesContainer.style.opacity = 1;
//     });
// }

const renderCountry = function (data, className = '') {
  // console.log(data);

  const html = `
    <article class="country ${className}">
      <img class="country__img" src="${data.flags.svg}" />
      <div class="country__data">
        <h3 class="country__name">${data.name.common}</h3>
        <h4 class="country__region">${data.region}</h4>
        <p class="country__row"><span>👫</span>${(
          +data.population / 1000000
        ).toFixed(1)} million people</p>
        <p class="country__row"><span>🗣️</span>${Object.values(
          data.languages
        )}</p>
        <p class="country__row"><span>💰</span>${Object.keys(
          data.currencies
        )}</p>
      </div>
    </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
};

function renderError(msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
}

async function getJSON(url, errorMsg = 'Something went wrong') {
  const response = await fetch(url);
  // console.log(response);

  // Handling errors
  if (!response.ok) {
    throw new Error(`${errorMsg} (${response.status})`);
  }
  return await response.json();
}

async function getCountryData(country) {
  // console.log(country);
  try {
    // Country 1
    const [data] = await getJSON(
      `https://restcountries.com/v3.1/name/${country}`,
      'Country not found'
    );

    // console.log(data);

    renderCountry(data);

    const neighbour = data.borders?.[0];
    // if (!neighbour) return;
    // Guard clause
    if (!neighbour) {
      throw new Error('No neighbour found!');
    }

    // Add a timeout to the fetch request
    const timeoutPromise = timeout(10); // Timeout after 10 seconds

    // Country 2
    const data2Promise = await getJSON(
      `https://restcountries.com/v3.1/alpha/${neighbour}`,
      'Country not found'
    );

    // Use Promise.race to handle either a timeout or a successful fetch
    /*
      Note to self:
      - The await keyword is used to pause the execution of the code until the promise returned by Promise.race() settles. 
      - This line effectively waits for either data2Promise or timeoutPromise to complete, whichever happens first.
      - The result of the Promise.race() is an array containing the resolved value of the winning promise (either data2Promise or timeoutPromise). 
      - By using destructuring assignment, you're extracting the value from the winning promise and storing it in the variable data2. 
      - This allows you to access the data from the successful AJAX request if it completes first.

      - The order does matter in the sense that the first promise to settle (either resolve or reject) will determine the outcome of the race. 
      - So, if data2Promise settles first (i.e., the neighboring country data is successfully fetched), then data2 will be assigned that data. 
      - On the other hand, if timeoutPromise settles first (i.e., the timeout occurs before data2Promise completes), then data2 will be undefined, and you can handle it as a timeout error.
      - The order is significant because it defines the priority of which promise you want to handle first in the race condition. 
      - In this case, you typically want to prioritize the AJAX request (data2Promise) over the timeout (timeoutPromise).
    */
    const [data2] = await Promise.race([data2Promise, timeoutPromise]);

    // Check if data 2 is undefined (indicating that the timeout has occurred)
    if (!data2) {
      throw new Error('Request for neighbouring country timed out!');
    }

    renderCountry(data2[0], 'neighbour');
  } catch (err) {
    // console.log(err);
    renderError(`Something went wrong 💥💥💥 ${err.message}. Try again!`);
  } finally {
    countriesContainer.style.opacity = 1;
  }
}

function getPosition() {
  return new Promise(function (resolve, reject) {
    // navigator.geolocation.getCurrentPosition(
    //   position => resolve(position),
    //   err => reject(err)
    // );

    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function timeout(sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error('Request took too long!'));
    }, sec * 1000);
  });
}

async function whereAmI() {
  // Geolocation
  try {
    const position = await getPosition();
    // console.log(position);
    const { latitude: lat, longitude: lng } = position.coords;

    // Reverse geocoding
    const resGeo = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    // console.log(resGeo);
    if (!resGeo.ok) {
      throw new Error('Problem getting location data');
    }

    const dataGeo = await resGeo.json();
    // console.log(dataGeo);
    // Country 1
    await getCountryData(dataGeo.countryCode);
    // console.log(dataGeo.countryCode);
  } catch (err) {
    console.error(err);
    renderError(`💥💥💥 ${err.message}`);
  }
}

btn.addEventListener('click', whereAmI);

//////////////////////////////////////////////////////////////////////////

// Promise.race
// (async function () {
//   const res = await Promise.race([
//     getJSON(`https://restcountries.com/v3.1/name/italy`),
//     getJSON(`https://restcountries.com/v3.1/name/egypt`),
//     getJSON(`https://restcountries.com/v3.1/name/mexico`),
//   ]);

//   console.log(res[0]);
// })();