const cursor = document.querySelector('.cursor');
const trail = document.querySelector('.cursor-trail');
const hoverEls = document.querySelectorAll('a, button, .work-card, .skill-tag');

let mouseX = 0;
let mouseY = 0;
let trailX = 0;
let trailY = 0;
let scrollY = 0;
let ticking = false;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateTrail() {
  trailX += (mouseX - trailX) * 0.15;
  trailY += (mouseY - trailY) * 0.15;
  trail.style.left = trailX + 'px';
  trail.style.top = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();

hoverEls.forEach((el) => {
  el.addEventListener('mouseenter', () => trail.classList.add('hover'));
  el.addEventListener('mouseleave', () => trail.classList.remove('hover'));
});

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
reveals.forEach((el) => observer.observe(el));

const bigTextLines = document.querySelectorAll('.big-text-line');
const bigTextObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.3 }
);
bigTextLines.forEach((el) => bigTextObserver.observe(el));

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const scrollProgress = document.querySelector('.scroll-progress');

function onScroll() {
  scrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(updateScroll);
    ticking = true;
  }
}

function updateScroll() {
  ticking = false;

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollY / docHeight) * 100;
  scrollProgress.style.width = progress + '%';

  const vh = window.innerHeight;

  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const heroOffset = scrollY * 0.4;
    const heroOpacity = 1 - scrollY / (vh * 0.8);
    const heroScale = 1 - scrollY / (vh * 3);
    heroContent.style.transform = `translateY(${heroOffset}px) scale(${Math.max(heroScale, 0.5)})`;
    heroContent.style.opacity = Math.max(heroOpacity, 0);
  }

  const blobs = document.querySelectorAll('.blob');
  blobs.forEach((blob, i) => {
    const speed = 0.05 + i * 0.03;
    blob.style.transform = `translateY(${scrollY * speed}px)`;
  });

  const heroGlows = document.querySelectorAll('.hero-glow');
  heroGlows.forEach((glow, i) => {
    const speed = 0.15 + i * 0.05;
    glow.style.transform = `translateY(${scrollY * speed}px)`;
  });

  const parallaxSections = document.querySelectorAll('[data-parallax-section]');
  parallaxSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = vh / 2;
    const offset = (sectionCenter - viewportCenter) * 0.05;

    const inner = section.querySelector('.section-inner, .big-text-inner, .manifesto-inner, .marquee-track');
    if (inner) {
      inner.style.transform = `translateY(${offset}px)`;
    }
  });

  const processLine = document.querySelector('.process-line');
  if (processLine) {
    const timeline = document.querySelector('.process-timeline');
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const progress = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
      processLine.style.background = `linear-gradient(180deg, 
        var(--cyan) 0%, 
        var(--purple) ${progress * 50}%, 
        var(--pink) ${progress * 80}%, 
        rgba(236, 72, 153, 0.1) 100%)`;
    }
  }

  const visionRings = document.querySelectorAll('.vision-ring');
  visionRings.forEach((ring) => {
    const rect = ring.getBoundingClientRect();
    if (rect.top < vh && rect.bottom > 0) {
      const progress = (vh - rect.top) / (vh + rect.height);
      const rotate = progress * 360;
      ring.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
    }
  });

  const manifesto = document.querySelector('.manifesto');
  if (manifesto) {
    const rect = manifesto.getBoundingClientRect();
    if (rect.top < vh && rect.bottom > 0) {
      const progress = (vh - rect.top) / (vh + rect.height);
      const texts = manifesto.querySelectorAll('.manifesto-text');
      texts.forEach((text, i) => {
        const speed = parseFloat(text.dataset.speed) || 1;
        const offset = (progress - 0.5) * 60 * speed;
        text.style.transform = text.classList.contains('visible')
          ? `translateY(${offset}px)`
          : `translateY(40px)`;
      });
    }
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
updateScroll();

const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 120;
let canvasMouseX = window.innerWidth / 2;
let canvasMouseY = window.innerHeight / 2;

const particleColors = [
  'rgba(34, 211, 238, 0.5)',
  'rgba(168, 85, 247, 0.5)',
  'rgba(236, 72, 153, 0.5)',
  'rgba(251, 146, 60, 0.4)',
  'rgba(232, 230, 227, 0.4)',
];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', (e) => {
  canvasMouseX = e.clientX;
  canvasMouseY = e.clientY;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.radius = Math.random() * 2 + 0.5;
    this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
  }

  update() {
    const dx = canvasMouseX - this.x;
    const dy = canvasMouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) {
      const force = (200 - dist) / 200 * 0.02;
      this.vx += dx * force;
      this.vy += dy * force;
    }

    this.vx *= 0.99;
    this.vy *= 0.99;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECTION_DISTANCE) {
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.12;
        const gradient = ctx.createLinearGradient(
          particles[i].x, particles[i].y,
          particles[j].x, particles[j].y
        );
        gradient.addColorStop(0, particles[i].color.replace('0.5', String(alpha)));
        gradient.addColorStop(1, particles[j].color.replace('0.5', String(alpha)));
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

const heroName = document.querySelector('.hero-name');
const originalText = heroName.getAttribute('data-text');
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
let scrambleInterval = null;

function scrambleText() {
  let iteration = 0;
  clearInterval(scrambleInterval);
  scrambleInterval = setInterval(() => {
    heroName.textContent = originalText
      .split('')
      .map((char, i) => {
        if (i < iteration) return originalText[i];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');
    if (iteration >= originalText.length) {
      clearInterval(scrambleInterval);
      heroName.textContent = originalText;
    }
    iteration += 1 / 3;
  }, 30);
}

setTimeout(scrambleText, 600);

const tiltCards = document.querySelectorAll('[data-tilt]');
tiltCards.forEach((card) => {
  const shine = card.querySelector('.work-card-shine');

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -8;
    const rotateY = (x - centerX) / centerX * 8;

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

    if (shine) {
      const shineX = (x / rect.width) * 100;
      const shineY = (y / rect.height) * 100;
      shine.style.setProperty('--shine-x', shineX + '%');
      shine.style.setProperty('--shine-y', shineY + '%');
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
  });
});

const magneticEls = document.querySelectorAll('.magnetic');
magneticEls.forEach((el) => {
  const strength = parseFloat(el.dataset.strength) || 0.3;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0, 0)';
  });
});

const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, 16);
        statsObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);
statNumbers.forEach((el) => statsObserver.observe(el));

const manifestoTexts = document.querySelectorAll('.manifesto-text');
const manifestoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.3 }
);
manifestoTexts.forEach((el) => manifestoObserver.observe(el));

const ixdCards = document.querySelectorAll('.ixd-card');
ixdCards.forEach((card) => {
  const glow = card.querySelector('.ixd-card-glow');
  const rgb = card.dataset.glowColor || '100, 108, 255';

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(${rgb}, 0.15) 0%, transparent 60%)`;
  });
});
