const faqNav = document.querySelector('.faq-nav.mobile-only');
const footer = document.querySelector('footer');

function handleNavPosition() {
  if (!faqNav || !footer) return;

  const navHeight = faqNav.offsetHeight;
  const navBottom = window.scrollY + window.innerHeight;
  const footerTop = footer.offsetTop;

  if (navBottom >= footerTop) {
    faqNav.classList.add('stuck');
  } else {
    faqNav.classList.remove('stuck');
  }
}

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

window.addEventListener('scroll', handleNavPosition);
window.addEventListener('resize', handleNavPosition);
document.addEventListener('DOMContentLoaded', handleNavPosition);

function toggleUniversalMenu(el) {
  const wrapper = el.closest('.universal-hamburger-wrapper');
  const menu = wrapper.querySelector('.universal-menu');
  menu.classList.toggle('show');
}

document.addEventListener('click', function (e) {
  document.querySelectorAll('.universal-hamburger-wrapper').forEach(wrapper => {
    if (!wrapper.contains(e.target)) {
      wrapper.querySelector('.universal-menu')?.classList.remove('show');
    }
  });
});

function toggleUniversalMenu(el) {
  const menu = el.parentElement.querySelector(".universal-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Accordion toggle — only one open at a time
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentItem = btn.parentElement;

    // Close all other items
    document.querySelectorAll('.faq-item.open').forEach(item => {
      if (item !== currentItem) item.classList.remove('open');
    });

    currentItem.classList.toggle('open');
  });
});

// Live search with delayed scroll-to-first-match behavior
const searchEl = document.getElementById('faq-search');
const items = Array.from(document.querySelectorAll('.faq-item'));
const noRes = document.getElementById('no-results');

searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  let found = false;
  let firstMatch = null;

  // Minimum characters required before auto-scroll
  const shouldScroll = q.length >= 4;

  items.forEach(item => {
    const txt = item.innerText.toLowerCase();
    const isMatch = txt.includes(q);

    if (q && isMatch) {
      if (!firstMatch) {
        firstMatch = item;
      }

      // Only open matching items
      item.classList.add('open');
    } else {
      item.classList.remove('open');
    }
  });

  // Scroll to first match only if enough letters are typed
  if (shouldScroll && firstMatch) {
    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    found = true;
  }

  // Show or hide "no results"
  noRes.style.display = (!firstMatch && q) ? 'block' : 'none';
});

// Back-to-top
const backBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  const firstBottom = document.querySelector('.faq-category').getBoundingClientRect().bottom;
  backBtn.style.display = (firstBottom < 0) ? 'block' : 'none';
});
backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Optional category dropdown handler (won't break if removed in HTML)
const catToggle = document.getElementById('catToggle');
if (catToggle) {
  catToggle.addEventListener('click', () => {
    document.getElementById('catMenu').classList.toggle('open');
  });
}
