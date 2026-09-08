(function () {
  const header = document.getElementById('header');
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const navCollapse = document.getElementById('mainNav');

  // Sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Close Bootstrap mobile menu on nav link click
  if (navCollapse) {
    navCollapse.querySelectorAll('.nav-link, .btn-fiber').forEach(link => {
      link.addEventListener('click', () => {
        const collapse = bootstrap.Collapse.getInstance(navCollapse);
        if (collapse && navCollapse.classList.contains('show')) collapse.hide();
      });
    });
  }

  // Animated counters
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // Video tabs + scroll autoplay
  const videoSection = document.getElementById('videoShowcase');
  const videoTabs = document.querySelectorAll('.video-tab');
  const showcaseVideo = document.getElementById('showcaseVideo');
  const videoLabel = document.getElementById('videoLabel');
  const videoPlayHint = document.getElementById('videoPlayHint');
  let sectionInView = false;

  function playShowcaseVideo() {
    if (!showcaseVideo || !sectionInView) return;
    showcaseVideo.play().then(() => {
      videoPlayHint?.classList.add('visible');
    }).catch(() => {
      videoPlayHint?.classList.remove('visible');
    });
  }

  function pauseShowcaseVideo() {
    if (!showcaseVideo) return;
    showcaseVideo.pause();
    videoPlayHint?.classList.remove('visible');
  }

  function loadShowcaseVideo(src, poster, label) {
    if (!showcaseVideo) return;
    const wasPlaying = sectionInView && !showcaseVideo.paused;
    showcaseVideo.pause();
    showcaseVideo.querySelector('source').src = src;
    showcaseVideo.poster = poster;
    videoLabel.textContent = label;
    showcaseVideo.load();
    if (wasPlaying || sectionInView) playShowcaseVideo();
  }

  videoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      videoTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      loadShowcaseVideo(tab.dataset.video, tab.dataset.poster, tab.dataset.label);
    });
  });

  if (videoSection && showcaseVideo) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        sectionInView = e.isIntersecting;
        if (e.isIntersecting) playShowcaseVideo();
        else pauseShowcaseVideo();
      });
    }, { threshold: 0.45 });
    videoObserver.observe(videoSection);

    showcaseVideo.addEventListener('pause', () => videoPlayHint?.classList.remove('visible'));
    showcaseVideo.addEventListener('play', () => {
      if (sectionInView) videoPlayHint?.classList.add('visible');
    });
  }

  // Testimonials
  const testimonials = document.querySelectorAll('.testimonial');
  const dots = document.querySelectorAll('.testimonial-dots .dot');
  let testimonialIndex = 0;
  let testimonialTimer;

  function showTestimonial(i) {
    testimonialIndex = i;
    testimonials.forEach((t, idx) => t.classList.toggle('active', idx === i));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    showTestimonial(i);
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => showTestimonial((testimonialIndex + 1) % testimonials.length), 6000);
  }));

  if (testimonials.length) {
    testimonialTimer = setInterval(() => showTestimonial((testimonialIndex + 1) % testimonials.length), 6000);
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(
    '.service-card, .software-card, .client-card, .experience-card, .gallery-item, .process-step, .location-card, .contact-form, .section-header, .metric-card, .testimonial-slider, .experience-footnote, .about-visual, .hero-image-wrap'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => observer.observe(el));

  // Image fallback
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = 'assets/images/poster-global.jpg';
      }
    }, { once: true });
  });

  // Contact form
  form.addEventListener('submit', e => {
    e.preventDefault();
    formNote.className = 'form-note text-center mt-2 mb-0';
    const data = new FormData(form);
    const required = ['name', 'phone', 'email', 'city', 'message'];
    if (required.some(f => !data.get(f)?.trim())) {
      formNote.textContent = 'Please fill in all required fields.';
      formNote.classList.add('error');
      return;
    }
    formNote.textContent = 'Thank you! We\'ll get back to you within one business day.';
    formNote.classList.add('success');
    form.reset();
  });
})();
