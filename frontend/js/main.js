// Comportamento da home do Via Saúde.
// Dados fictícios ficam em data.js para facilitar troca por base real.

const viaSaudeState = {
  activeRegion: 'plano-piloto',
  selectedService: 'todos'
};

const setupHeaderScrollState = () => {
  const header = document.querySelector('.site-header');
  if (!header) {
    return;
  }

  const toggleHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  toggleHeader();
  window.addEventListener('scroll', toggleHeader, { passive: true });
};

const setupHeroCarousel = () => {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) {
    return;
  }

  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const previousButton = carousel.querySelector('.carousel-btn.prev');
  const nextButton = carousel.querySelector('.carousel-btn.next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let autoplayTimer = null;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-pressed', String(isActive));
    });
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const startAutoplay = () => {
    if (reduceMotion) {
      return;
    }

    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 5000);
  };

  previousButton?.addEventListener('click', () => {
    showSlide(currentIndex - 1);
    startAutoplay();
  });

  nextButton?.addEventListener('click', () => {
    showSlide(currentIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoplay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoplay();
    }
  });

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(currentIndex + 1);
      startAutoplay();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(currentIndex - 1);
      startAutoplay();
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;

  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  carousel.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        showSlide(currentIndex + 1);
      } else {
        showSlide(currentIndex - 1);
      }
    }

    startAutoplay();
  }, { passive: true });

  showSlide(0);
  startAutoplay();
};

const getFilteredUnits = () => {
  const allRegions = window.viaSaudeData?.regions || [];

  const regionsToUse = viaSaudeState.activeRegion === 'todos'
    ? allRegions
    : allRegions.filter((region) => region.id === viaSaudeState.activeRegion);

  const units = regionsToUse.flatMap((region) => region.units);

  if (viaSaudeState.selectedService === 'todos') {
    return units;
  }

  return units.filter((unit) => unit.services.includes(viaSaudeState.selectedService));
};

const setStatusClass = (value) => {
  if (value === 'verde') return 'verde';
  if (value === 'amarelo') return 'amarelo';
  return 'vermelho';
};

const renderTabs = () => {
  const tabsElement = document.querySelector('[data-tabs]');
  if (!tabsElement || !window.viaSaudeData) {
    return;
  }

  tabsElement.innerHTML = '';

  const regions = window.viaSaudeData.regions;

  regions.forEach((region) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab-button';
    button.textContent = region.name;
    button.setAttribute('aria-pressed', String(region.id === viaSaudeState.activeRegion));

    if (region.id === viaSaudeState.activeRegion) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', () => {
      viaSaudeState.activeRegion = region.id;
      renderTabs();
      renderUnits();
    });

    tabsElement.appendChild(button);
  });
};

const renderUnits = () => {
  const unitList = document.querySelector('[data-unit-list]');
  if (!unitList || !window.viaSaudeData) {
    return;
  }

  const filteredUnits = getFilteredUnits();

  if (!filteredUnits.length) {
    unitList.innerHTML = `
      <div class="card unit-card" aria-live="polite">
        <h3>Nenhuma unidade encontrada</h3>
        <p>Não há unidades para esse filtro no momento. Tente outra especialidade ou região.</p>
      </div>
    `;
    return;
  }

  unitList.innerHTML = filteredUnits
    .map(
      (unit) => `
        <article class="unit-card card">
          <div class="unit-card-header">
            <span class="unit-badge ${setStatusClass(unit.status)}">${unit.lotacao}</span>
            <span>${unit.type}</span>
          </div>

          <div>
            <h3>${unit.name}</h3>
            <p>${unit.district}</p>
          </div>

          <div class="unit-meta">
            <div class="unit-meta-item">
              <span>Fila</span>
              <strong>${unit.queue}</strong>
            </div>
            <div class="unit-meta-item">
              <span>Distância</span>
              <strong>${unit.distance}</strong>
            </div>
            <div class="unit-meta-item">
              <span>Lotação</span>
              <strong>${unit.lotacao}</strong>
            </div>
          </div>

          <div class="unit-card-footer">
            <small>${unit.services.length} serviços</small>
            <a href="#ajuda">Ver mais</a>
          </div>
        </article>
      `
    )
    .join('');
};

const bindFilters = () => {
  const serviceSelect = document.getElementById('serviceSelect');
  const regionSelect = document.getElementById('regionSelect');
  const searchButton = document.getElementById('searchButton');

  if (serviceSelect) {
    serviceSelect.addEventListener('change', (event) => {
      viaSaudeState.selectedService = event.target.value;
      renderUnits();
    });
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', (event) => {
      viaSaudeState.activeRegion = event.target.value;
      renderTabs();
      renderUnits();
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', () => {
      renderUnits();
      document.querySelector('#unidades')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
};

const initHome = () => {
  setupHeaderScrollState();
  setupHeroCarousel();

  if (!window.viaSaudeData) {
    return;
  }

  renderTabs();
  renderUnits();
  bindFilters();
};

document.addEventListener('DOMContentLoaded', () => {
  initHome();
});
