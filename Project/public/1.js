<<<<<<< HEAD

/* SPLASH LOGIC */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash-screen");
  const main = document.getElementById("mainpage");

  // Show splash for 4 seconds
  setTimeout(() => {
    splash.classList.add("hide");

    // After fade animation
    setTimeout(() => {
      splash.style.display = "none";
      main.classList.remove("hidden");
    }, 1000); // must match CSS transition

  }, 4000); // 4 seconds exactly
});


/* VERTICAL SLIDE CONTROL */
let currentSlide = 0;
const totalSlides = 3;
const slider = document.getElementById("slider");

let isScrolling = false;

/* Scroll-based slide navigation */
window.addEventListener("wheel", (event) => {
  if (isScrolling) return;

  if (event.deltaY > 0) {
    // Scroll down → next slide
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      goToSlide(currentSlide);
    }
  } else {
    // Scroll up → previous slide
    if (currentSlide > 0) {
      currentSlide--;
      goToSlide(currentSlide);
    }
  }

  isScrolling = true;
  setTimeout(() => {
    isScrolling = false;
  }, 900); // must match CSS transition time
});

/* Slide function */
function goToSlide(index) {
  slider.style.transform = `translateY(-${index * 100}vh)`;
}

/* Login redirect */
function login() {
  window.location.href = "dashboard.html";
}


function openLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function closeLogin() {
  document.getElementById("login-modal").classList.add("hidden");
}

function login() {
  // later: real auth
  window.location.href = "dashboard.html";
}




const nav = document.querySelector('nav');
const slide3 = document.querySelector('.slide3');

const observerOptions = {
  root: null,
  threshold: 0.5 // Triggers when 50% of Slide 3 is visible
};

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // We are on Slide 3
      nav.classList.add('nav-slide-3');
    } else {
      // We are on Slide 1 or 2
      nav.classList.remove('nav-slide-3');
    }
  });
}, observerOptions);

=======

/* SPLASH LOGIC */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash-screen");
  const main = document.getElementById("mainpage");

  // Show splash for 4 seconds
  setTimeout(() => {
    splash.classList.add("hide");

    // After fade animation
    setTimeout(() => {
      splash.style.display = "none";
      main.classList.remove("hidden");
    }, 1000); 

  }, 4000); 
});


/* VERTICAL SLIDE CONTROL */
let currentSlide = 0;
const totalSlides = 3;
const slider = document.getElementById("slider");

let isScrolling = false;

/* Scroll-based */
window.addEventListener("wheel", (event) => {
  if (isScrolling) return;

  if (event.deltaY > 0) {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      goToSlide(currentSlide);
    }
  } else {
    if (currentSlide > 0) {
      currentSlide--;
      goToSlide(currentSlide);
    }
  }

  isScrolling = true;
  setTimeout(() => {
    isScrolling = false;
  }, 900); 
});

/* Slide function */
function goToSlide(index) {
  slider.style.transform = `translateY(-${index * 100}vh)`;
}

/* Login redirect */
function login() {
  window.location.href = "dashboard.html";
}


function openLogin() {
  document.getElementById("login-modal").classList.remove("hidden");
}

function closeLogin() {
  document.getElementById("login-modal").classList.add("hidden");
}

function login() {
  window.location.href = "dashboard.html";
}



const nav = document.querySelector('nav');
const slide3 = document.querySelector('.slide3');

const observerOptions = {
  root: null,
  threshold: 0.5 
};

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Slide 3
      nav.classList.add('nav-slide-3');
    } else {
      // Slide 1 or 2
      nav.classList.remove('nav-slide-3');
    }
  });
}, observerOptions);

>>>>>>> f5a7339ef1e2bf4e8ae79bb2c84004edd69907ef
navObserver.observe(slide3);