const swiper = new Swiper('.swiper-container', {
  direction: 'vertical',
  slidesPerView: 5,
  spaceBetween: 20, 
  mousewheel: true,
});

window.addEventListener('DOMContentLoaded', () => {
  const firstLogo = document.querySelector('.machine-logo');
  if (firstLogo) {
    firstLogo.click(); 
  }
});

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

function showMachine(imageName, element) {
  const display = document.getElementById('mainMachineImg');
  const name = document.getElementById('machineName');
  const logos = document.querySelectorAll('.machine-logo');

    // In showMachine():
  const moreBtn = document.getElementById('desktopMoreInfo');
  const urlMap = {
  'jr4.webp':        '../enagic-machines/jr-iv/index.html',
  'sd501.webp':      '../enagic-machines/sd501/index.html',
  'sd501dx.webp':    '../enagic-machines/sd501dx/index.html',
  'sd501platinum.webp': '../enagic-machines/sd501-platinum/index.html',
  'k8.webp':         '../enagic-machines/k8/index.html',
  'super501.webp':   '../enagic-machines/super501/index.html',
  'anespa-dx.webp':     '../enagic-machines/anespa-dx/index.html'
  };

  moreBtn.href = urlMap[imageName] || '#';
  
  // Remove active states
  logos.forEach(logo => logo.classList.remove('active'));
  element.classList.add('active');

  // Reset styles
  display.style.transition = 'none';
  display.style.transform = 'translateX(0)';
  name.style.transition = 'none';
  name.style.opacity = 0;
  name.style.transform = 'translateX(-100%)';
  name.style.fontSize = '7rem'; 
  name.style.lineHeight = '1';
  name.style.whiteSpace = 'pre-line';

  const formattedName = imageName
    .split('.')[0]
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toUpperCase();

  // Custom naming logic
  let displayName = '';

  if (formattedName.includes('JR4')) {
    displayName = 'LEVELUK JR IV';
    name.style.fontSize = '4rem';
  } else if (formattedName === 'SD501') {
    displayName = 'LEVELUK \nSD 501';
    name.style.fontSize = '4rem';
  } else if (formattedName.includes('SD501DX')) {
    displayName = 'LEVELUK\nSD 501 DX';
    name.style.fontSize = '4rem';
  } else if (formattedName.includes('SD501PLATINUM')) {
    displayName = 'LEVELUK SD501\nPLATINUM';
    name.style.fontSize = '4rem';
  } else if (formattedName.includes('K8')) {
    displayName = 'LEVELUK K8';
    name.style.fontSize = '4rem';
  } else if (formattedName.includes('SUPER501')) {
    displayName = 'LEVELUK \nSUPER 501';
    name.style.fontSize = '4rem';
  } else if (formattedName.includes('ANESPA')) {
    displayName = 'ANESPA DX';
    name.style.fontSize = '4rem';
  } else {
    displayName = formattedName;
  }

  display.style.opacity = 0;

  setTimeout(() => {
    display.src = '../assets/store/' + imageName;
    name.textContent = displayName;

    display.onload = () => {
      // Move image slightly left
      display.style.transition = 'all 1s ease';
      display.style.opacity = 1;
      display.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.09)';
      display.style.transform = 'translateX(-250px)';

      // Animate name from behind the image
      name.style.transition = 'all 1.2s ease';
      setTimeout(() => {
        name.style.opacity = 1;
        name.style.transform = 'translateX(-50px)';
      }, 400);
    };
  }, 200);
}