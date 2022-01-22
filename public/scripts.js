/*-------------
 API requests
-------------*/
// Get first 20 movies
async function getFirst20() {
  const res = await fetch("/api/movies");
  const movies = await res.json();
  return movies;
}

// Get movie by id
async function getMovieById(id) {
  const res = await fetch(`/api/movies/${id}`);
  const movie = await res.json();
  return movie;
}

// Get movie's genre
async function getMovieGenre(movieId) {
  const res = await fetch(`/api/movies/${movieId}/genres`);
  const genre = await res.json();
  return genre;
}

// Get movie's producer
async function getMovieProducer(movieId) {
  const res = await fetch(`/api/movies/${movieId}/producers`);
  const producer = await res.json();
  return producer;
}

// Search movie
async function searchMovie(title) {
  const res = await fetch(`/api/search?title=${title}`);
  const movies = await res.json();
  return movies;
}

let page = 1;
// Infinite scroll
async function fetchData() {
  const res = await fetch(`/api/home-infinite?page=${page}`);
  const movies = await res.json();
  return movies;
}

/*--------------------
    HOME PAGE
--------------------*/
// Show 20 movies on home
async function populateHome() {
  let out = "";
  const res = await getFirst20();
  res.movies.forEach((movie) => {
    out += `
        <div class="col">
          <div class="card h-100 border-primary">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${movie.title}</h5>
              <h5 class="card-title text-muted text-uppercase">${movie.genre_name}</h5>
              <p class="card-text baz-ellipsis text-uppercase">
                ${movie.summary}
              </p>
              <div class="btn btn-primary mt-auto text-uppercase" data-movie="${movie.id}" data-title="${movie.title}">+ More</div>
            </div>
          </div>
        </div>
    `;
  });
  const appHome = document.getElementById("APP_HOME");
  if (appHome) {
    appHome.insertAdjacentHTML("beforeend", out);
  }
  //   console.log(res);
}

// Show movie details
async function showMovie(e) {
  if (
    e.target &&
    !e.target.closest("#search-form") &&
    !e.target.closest("#movie-modal")
  ) {
    clearSearch();
  }
  if (e.target && e.target.dataset.movie) {
    const domModal = document.getElementById("movie-modal");
    const domModalTitle = domModal.querySelector(".modal-title");
    const domModalBody = domModal.querySelector(".modal-body");
    domModalTitle.innerHTML = e.target.dataset.title;
    domModalBody.innerHTML = "Loading...";

    const myModal = new bootstrap.Modal(domModal, {
      keyboard: false,
    });
    myModal.show();

    try {
      const id = e.target.dataset.movie;
      const { movie } = await getMovieById(id);
      const { genre } = await getMovieGenre(id);
      const { producer } = await getMovieProducer(id);
      //   console.log(movie, genre, producer);
      domModalBody.innerHTML = `
            <div>
              <div class="fw-bold text-primary">Synopsys</div>
              <div class="text-uppercase">
                ${movie.summary}
              </div>
            </div>
            ${
              genre && genre.name
                ? `
                <div class="mt-3">
                    <div class="fw-bold text-primary">Genre</div>
                    <div class="text-uppercase">${genre.name}</div>
                </div>
            `
                : ""
            }

            ${
              movie && movie.prod_year
                ? `
                    <div class="mt-3">
                        <div class="fw-bold text-primary">Date of release</div>
                        <div class="text-uppercase">${movie.prod_year}</div>
                    </div>
              `
                : ""
            }

            ${
              producer && producer.name
                ? `
                    <div class="mt-3">
                        <div class="fw-bold text-primary">Producer</div>
                        <div class="text-uppercase">${producer.name}</div>
                    </div>
                `
                : ""
            }  
      `;
    } catch (error) {
      domModalBody.innerHTML = "An error occured.";
    }
  }
}

// Search
function clearSearch() {
  const resContainer = document.querySelector("#search-result");
  resContainer.innerHTML = "";
  resContainer.classList.add("d-none");
}
async function search() {
  const { value } = document.querySelector("#search-input");
  const resContainer = document.querySelector("#search-result");
  if (!value) {
    return clearSearch();
  }

  const { movies } = await searchMovie(value);
  //   console.log(movies);
  let out = "";
  movies.forEach((movie) => {
    out += `
        <div class="col mt-4">
            <div class="card h-100 border-primary">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${movie.title}</h5>
                <h5 class="card-title text-muted text-uppercase">${movie.genre_name}</h5>
                <p class="card-text baz-ellipsis text-uppercase">
                ${movie.summary}
                </p>
                <div class="btn btn-primary mt-auto text-uppercase align-self-end" data-movie="${movie.id}" data-title="${movie.title}">+ More</div>
            </div>
            </div>
        </div>
      `;
  });
  resContainer.innerHTML = out;
  resContainer.classList.remove("d-none");
}
async function searchSubmit(e) {
  e.preventDefault();
  search();
}

document.addEventListener("DOMContentLoaded", async function (event) {
  //   console.log(await getMovieProducer(0));
  await populateHome();

  document.addEventListener("click", showMovie);

  const searchForm = document.querySelector("#search-form");
  if (searchForm) {
    search();
    searchForm.addEventListener("submit", searchSubmit);
  }
  const searchInput = document.querySelector("#search-input");
  if (searchInput) {
    search();
    searchInput.addEventListener("keyup", search);
    searchInput.addEventListener("focus", search);
    // searchInput.addEventListener("blur", clearSearch);
  }

  // Infinite scroll
  function handleIntersect(entries) {
    if (entries[0].isIntersecting) {
      //   console.warn("something is intersecting with the viewport");
      getData();
    }
  }
  async function getData() {
    let out = "";
    const res = await fetchData();
    page++;
    res.movies.forEach((movie) => {
      out += `
        <div class="col">
          <div class="card h-100 border-primary">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${movie.title}</h5>
              <h5 class="card-title text-muted text-uppercase">${movie.genre_name}</h5>
              <p class="card-text baz-ellipsis text-uppercase">
                ${movie.summary}
              </p>
              <div class="btn btn-primary mt-auto text-uppercase" data-movie="${movie.id}" data-title="${movie.title}">+ More</div>
            </div>
          </div>
        </div>
    `;
    });
    const appHome = document.getElementById("APP_HOME");
    if (appHome) {
      appHome.insertAdjacentHTML("beforeend", out);
    }
  }
  //set up the IntersectionObserver to load more results if the end is near.
  let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.5,
  };
  const observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(document.querySelector("#infite-trigger"));
  //an initial load of some data
  getData();
});
