//app is for general control over the application
//and connections between the other components
const APP = {
  KEY: '67a8835b5b606f17a40522e9ff643ea8',
  baseURL: 'https://api.themoviedb.org/3/',
  IMG_BASE_URL: 'https://image.tmdb.org/t/p/w1280',

  init: () => {
    history.replaceState({}, '', '#')
    window.addEventListener('popstate', NAV.poppy)

    let searchBtn = document.getElementById('btnSearch');
    searchBtn.addEventListener('click', SEARCH.getInput)
  },
}; // end APP nameSpace

//search is for anything to do with the fetch api
const SEARCH = {
  results: [],
  input: '',

  getInput: (ev) => {
    ev.preventDefault()
    
    SEARCH.input = document.getElementById('search').value;
    if (SEARCH.input) 
    history.pushState({}, SEARCH.input, `#${SEARCH.input}`)
    console.log (location.hash)

    let input = location.hash
    SEARCH.doSearch(input)
  },

  doSearch: (input) => {
    let key = STORAGE.BASE_KEY + input;
    if (key in localStorage) {
      ACTORS.actors = localStorage.getItem(key);
      ACTORS.displayActors(JSON.parse(ACTORS.actors));
    } else { 
      if (!SEARCH.input) {
        alert("Please, enter actor's name to search")
      } else {
        SEARCH.doFetch();
      }
    }
  },

  doFetch() {
    let url = `${APP.baseURL}search/person?api_key=${APP.KEY}&query=${SEARCH.input}&language=en-US`;
    console.log('Doing Fetching...');
    let loader = document.getElementById('loader')
    loader.className = 'active'
    fetch(url)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`ERROR: ${res.status_code} ${res.status_message}`)
        }
      })

      .then((data) => {
        SEARCH.results = data.results;
        STORAGE.setStorages(SEARCH.input, data.results);
        ACTORS.displayActors(data.results);
        loader.className = ''
      })
      
      .catch((err) => {
        alert(err.message);
      });
  },
}; // end SEARCH nameSpace

//actors is for changes connected to content in the actors section
const ACTORS = {
  actors: [],

  sortedActors: [],

  displayActors: (actors) => {
    let homePage = document.getElementById('instructions');
    let actorsPage = document.getElementById('actors');
    let mediaPage = document.getElementById('media')
    let sortDiv = document.getElementById('sortDiv')
    
    homePage.style.display = 'none';
    actorsPage.style.display = 'block';
    mediaPage.classList.remove('active')
    actorsPage.className = 'active'
    sortDiv.style.display = 'block'

    let nameSort = document.getElementById('nameSort')
    nameSort.addEventListener('click', ACTORS.nameSort)

    let popSort = document.getElementById('popSort')
    popSort.addEventListener('click', ACTORS.popSort)
  
    // let actorsBackBtn = document.getElementById("actors-back-btn")
    // actorsBackBtn.addEventListener("click", ACTORS.back)

    let df = document.createDocumentFragment();

    let cardParentDiv = document.createElement('div');
    cardParentDiv.className = 'cards';

    actors.forEach((actor) => {
      let colDiv = document.createElement('div');

      let cardDiv = document.createElement('div');
      cardDiv.className = 'card';
      cardDiv.addEventListener('click', MEDIA.setHistory);
      cardDiv.setAttribute('data-id', actor.id);

      let img = document.createElement('img');
      img.className = 'card-img-top';

      let imgSrc = actor.profile_path
        ? APP.IMG_BASE_URL + actor.profile_path
        : './img/placeholder-img.png';

      img.src = imgSrc;
      img.alt = actor.name;

      let bodyDiv = document.createElement('div');
      bodyDiv.className = 'card-body';

      let h5 = document.createElement('h5');
      h5.className = 'card-title';
      h5.innerHTML = `${actor.name}`;

      let pPopularity = document.createElement('p');
      pPopularity.className = 'card-text';
      pPopularity.innerHTML = `Popularity: ${actor.popularity}`;

      let pKnownFor = document.createElement('p');
      pKnownFor.className = 'card-text';
      pKnownFor.innerHTML = `Known for: ${actor.known_for_department}`;

      bodyDiv.append(h5, pPopularity, pKnownFor);
      cardDiv.append(img, bodyDiv);
      colDiv.append(cardDiv);
      df.append(colDiv);
    }); // end of loop
    
    cardParentDiv.append(df);

    let actorDiv = document.getElementById('actorsCardContainer');
    actorDiv.innerHTML = '';
    actorDiv.append(cardParentDiv);
  },

  nameSort: () => {
    let arrow = document.getElementById('name-sort-arr')
    arrow.classList.toggle('flip')

    let key = STORAGE.BASE_KEY + SEARCH.input;
    let data = JSON.parse(localStorage.getItem(key))
    dataCopy = [...data]

    let newData = dataCopy.sort((a,b) => {
      let actorA = a.name
      let actorB = b.name

      if (arrow.classList.contains('flip')) {
        if (actorA > actorB) {
          return 1
        }

        if (actorA < actorB) {
          return -1;
        }
        return 0;
      } else {
        if (actorB > actorA) {
          return 1
        }

        if (actorB < actorA) {
          return -1;
        }
        
        return 0;
      }
    })

    ACTORS.sortedActors = newData
    ACTORS.displayActors(ACTORS.sortedActors)
  },

  popSort: () => {
    let arrow = document.getElementById('pop-sort-arr')
    arrow.classList.toggle('flip')

    let key = STORAGE.BASE_KEY + SEARCH.input;
    let data = JSON.parse(localStorage.getItem(key))
    dataCopy = [...data]

    let newData = dataCopy.sort((a,b) => {
      let actorA = a.popularity
      let actorB = b.popularity

      if (arrow.classList.contains('flip')) {
        if (actorA > actorB) {
          return 1
        }

        if (actorA < actorB) {
          return -1;
        }
        return 0;
      } else {
        if (actorB > actorA) {
          return 1
        }

        if (actorB < actorA) {
          return -1;
        }
        
        return 0;
      }
    })

    ACTORS.sortedActors = newData
    ACTORS.displayActors(ACTORS.sortedActors)
  },
  
  // back: (ev) => {
  //   ev.preventDefault()
  //   let actorsPage = document.getElementById('actors');
  //   let homePage = document.getElementById('instructions')
  //   actorsPage.style.display = 'none';
  //   homePage.style.display = 'block';

  //   window.history.back()
  // }, 
    
}; // end this.nameSpace

//media is for changes connected to content in the media section
const MEDIA = {
  setHistory: (ev) => {
    let actorId = ev.target.closest('.card').getAttribute('data-id');
    history.pushState({}, SEARCH.input, `${location.hash}/${actorId}`)
    MEDIA.displayMedia(actorId)
  },
  displayMedia: (actorId) => {
    
    let key = STORAGE.BASE_KEY + SEARCH.input;

    
    let results = JSON.parse(localStorage.getItem(key));

    console.log(results)

    let actorsPage = document.getElementById('actors');
    actorsPage.classList.remove('active')
    let mediaPage = document.getElementById('media')
    mediaPage.className = 'active'

    // let mediaBackBtn = document.getElementById("media-back-btn")
    // mediaBackBtn.addEventListener("click", MEDIA.back)

    let df = document.createDocumentFragment();

    let moviesContainer = document.createElement('div')
    moviesContainer.className = 'movies'

    results.forEach((actor) => {
      if (actor.id == actorId) {
        actorsPage.style.display = 'none';
        mediaPage.style.display = 'block';

        let knownFor = actor.known_for

        knownFor.forEach((movie) => {
          let movieCard = document.createElement('div')
          movieCard.className = ('movieCard')

          let img = document.createElement('img')
          img.src = img.src = APP.IMG_BASE_URL + movie.backdrop_path
                

          let movieName = document.createElement('h5')
          if (movie.title) {
            movieName.innerHTML = movie.title
            img.alt = movie.title
          } else {
            movieName.innerHTML = movie.name
            img.alt = movie.name
          }

          let type = document.createElement('p')
          type.innerHTML = `Type: ${movie.media_type}`

          let rating = document.createElement('p')
          rating.className = 'rating'
          rating.innerHTML = `Rating: ${movie.vote_average}`

          let overview = document.createElement('p')
          overview.innerHTML = movie.overview
          overview.className = 'overview'

          movieCard.append(img, movieName, type, rating, overview)
          df.append(movieCard)
        })
      }
    })
    
    let mediaDiv = document.getElementById('mediaCardContainer')
    mediaDiv.className = 'container'
    moviesContainer.append(df)
    mediaDiv.innerHTML=''
    mediaDiv.append(moviesContainer)
    // mediaPage.className = 'active'
  },

  // back: (ev) => {
  //   ev.preventDefault()
  //   let actorsPage = document.getElementById('actors');
  //   let mediaPage = document.getElementById('media')
  //   let homePage = document.getElementById('instructions');
  //   actorsPage.style.display = 'block';
  //   mediaPage.style.display = 'none';
  //   homePage.style.display = 'none'

  //   window.history.back()
  // }
}; // end MEDIA nameSpace

//storage is for working with localstorage
const STORAGE = {
  BASE_KEY: 'Ksenia-Actors-Search-',

  setStorages: (input, results) => {
    let key = STORAGE.BASE_KEY + input;
    localStorage.setItem(key, JSON.stringify(results));
  },
}; // end STORAGE nameSpace

//nav is for anything connected to the history api and location
const NAV = {
  baseURL: null,
  poppy:() => {
    let input = location.hash.replace('#', '')
    SEARCH.input = input
    SEARCH.doSearch(input)
  },
}; // end NAV nameSpace

//Start everything running
document.addEventListener('DOMContentLoaded', APP.init);
