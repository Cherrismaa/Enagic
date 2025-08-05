window.addEventListener("scroll", () => {
const header = document.querySelector(".header");
if (window.scrollY > 10) {
    header.classList.add("scrolled");
} else {
    header.classList.remove("scrolled");
}
});

document.addEventListener("DOMContentLoaded", () => {
const menu = document.getElementById('mobileMenu');
const hamburger = document.getElementById('hamburger');

function toggleMenu() {
    const isOpen = menu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
}

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
    }
});
});

// Animation fade-up observer
const animatedElements = document.querySelectorAll('.animate-fade-up');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

animatedElements.forEach(el => observer.observe(el));

const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-track img');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let index = 0;

function updateCarousel() {
  track.style.transform = `translateX(-${index * 100}%)`;
}

// Auto-scroll every 5 seconds
let autoScrollInterval = setInterval(() => {
  index = (index + 1) % slides.length;
  updateCarousel();
}, 6000);

function resetAutoScroll() {
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(() => {
    index = (index + 1) % slides.length;
    updateCarousel();
  }, 5000);
}

nextBtn?.addEventListener('click', () => {
  index = (index + 1) % slides.length;
  updateCarousel();
  resetAutoScroll();
});

prevBtn?.addEventListener('click', () => {
  index = (index - 1 + slides.length) % slides.length;
  updateCarousel();
  resetAutoScroll();
});
