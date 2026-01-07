
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
/* TOUCH CONTROL FOR MOBILE */
let touchStartY = 0;
let touchEndY = 0;

window.addEventListener("touchstart", (event) => {
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener("touchend", (event) => {
  touchEndY = event.changedTouches[0].screenY;
  handleGesture();
}, { passive: true });

function handleGesture() {
  if (isScrolling) return;

  // Calculate the distance swiped
  const swipeDistance = touchStartY - touchEndY;
  const threshold = 50; // Minimum pixels to count as a swipe

  if (swipeDistance > threshold) {
    // Swiped up -> Show next slide
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      goToSlide(currentSlide);
      lockScroll();
    }
  } else if (swipeDistance < -threshold) {
    // Swiped down -> Show previous slide
    if (currentSlide > 0) {
      currentSlide--;
      goToSlide(currentSlide);
      lockScroll();
    }
  }
}

// Helper to handle the timeout logic in one place
function lockScroll() {
  isScrolling = true;
  setTimeout(() => {
    isScrolling = false;
  }, 900);
}

/* AUTH LOGIC */

// 1. REGISTRATION
/* AUTH LOGIC */

async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    if (!name || !username || !password) {
        return alert("Please fill all fields");
    }

    try {
        const response = await fetch('https://nook-your-comfort-corner.onrender.com/api/v1/users/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! Now please login.");
            closeLogin(); 
            goToSlide(2); 
        } else {
            // Your controller might send errors in 'msg' or 'error'
            alert(data.msg || data.error || "Registration failed");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}
//2.login
async function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('https://nook-your-comfort-corner.onrender.com/api/v1/users/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token); 
            window.location.href = "dashboard.html";
        } else {
            alert(data.msg || "Invalid credentials");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

function openLogin() {
    document.getElementById("login-modal").classList.remove("hidden");
}

function closeLogin() {
    document.getElementById("login-modal").classList.add("hidden");
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

navObserver.observe(slide3);
