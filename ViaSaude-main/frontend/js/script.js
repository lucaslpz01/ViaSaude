document.addEventListener('DOMContentLoaded', () => {
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const metricValues = [...document.querySelectorAll('.metric strong')];
  const footerText = document.querySelector('.footer-inner p');

  if (footerText) {
    footerText.innerHTML = `© ${new Date().getFullYear()} ViaSaude. Cuidando da sua saúde com tecnologia.`;
  }

  const activateLink = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');

      if (!targetId || !targetId.startsWith('#')) {
        return;
      }

      const targetSection = document.querySelector(targetId);
      if (!targetSection) {
        return;
      }

      event.preventDefault();
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      activateLink(targetId.replace('#', ''));
      history.replaceState(null, '', targetId);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          activateLink(visibleEntry.target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-10% 0px -30% 0px',
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  const animateNumber = (element) => {
    const target = Number(element.dataset.value || element.textContent.replace(/\D/g, ''));
    if (!Number.isFinite(target)) {
      return;
    }

    const duration = 1000;
    const start = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);

      element.textContent = `${currentValue}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${target}`;
      }
    };

    requestAnimationFrame(step);
  };

  metricValues.forEach((metric) => {
    const numericValue = Number(metric.textContent.replace(/\D/g, ''));
    if (Number.isFinite(numericValue) && numericValue > 0) {
      metric.dataset.value = String(numericValue);
      metric.textContent = '0';
      animateNumber(metric);
    }
  });

  const observerCards = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll('.feature, .card, .status-box').forEach((item) => {
    item.classList.add('reveal');
    observerCards.observe(item);
  });
});
