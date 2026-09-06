/* ==========================================================================
   WONDERLAND HOTEL — SCRIPT
   1. Header scroll state + active nav link
   2. Mobile navigation menu
   3. Scroll reveal animations (IntersectionObserver)
   4. Gallery lightbox
   5. Reservation form validation + WhatsApp message builder
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------------------
     Business contact info — kept in one place so it is easy to update
     ---------------------------------------------------------------------- */
  var HOTEL = {
    whatsappNumber: '251715812856' // no plus sign, used for wa.me links
  };

  /* ------------------------------------------------------------------ */
  /* 1. HEADER SCROLL STATE + ACTIVE NAV LINK                            */
  /* ------------------------------------------------------------------ */
  var header = document.getElementById('site-header');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    })
    .filter(Boolean);

  function updateHeaderState() {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  function updateActiveNav() {
    var scrollPos = window.scrollY + window.innerHeight * 0.3;
    var current = sections[0];

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section;
      }
    });

    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', current && id === current.id);
    });
  }

  var onScroll = function () {
    updateHeaderState();
    updateActiveNav();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* 2. MOBILE NAVIGATION MENU                                           */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById('nav-toggle');
  var navMain = document.getElementById('nav-main');

  function openMenu() {
    navMain.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navMain.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    if (navMain.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when a nav link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside the menu panel (on the backdrop)
  navMain.addEventListener('click', function (e) {
    if (e.target === navMain) {
      closeMenu();
    }
  });

  // Close with Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMain.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* 3. SCROLL REVEAL ANIMATIONS                                         */
  /* ------------------------------------------------------------------ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-img'));
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. GALLERY LIGHTBOX                                                 */
  /* ------------------------------------------------------------------ */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var currentIndex = 0;
  var lastFocusedEl = null;

  var galleryData = galleryItems.map(function (item) {
    var img = item.querySelector('img');
    return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
  });

  function showImage(index) {
    if (index < 0) index = galleryData.length - 1;
    if (index >= galleryData.length) index = 0;
    currentIndex = index;

    var data = galleryData[currentIndex];
    lightboxImage.setAttribute('src', data.src);
    lightboxImage.setAttribute('alt', data.alt);
    lightboxCaption.textContent = (currentIndex + 1) + ' / ' + galleryData.length;
  }

  function openLightbox(index) {
    lastFocusedEl = document.activeElement;
    showImage(index);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocusedEl) {
      lastFocusedEl.focus();
    }
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener('click', function () {
      openLightbox(index);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function () { showImage(currentIndex - 1); });
  lightboxNext.addEventListener('click', function () { showImage(currentIndex + 1); });

  // Click outside the figure to close
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showImage(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showImage(currentIndex + 1);
    }
  });

  /* ------------------------------------------------------------------ */
  /* 5. RESERVATION FORM                                                 */
  /* ------------------------------------------------------------------ */
  var form = document.getElementById('reservation-form');
  var successPanel = document.getElementById('form-success');
  var whatsappSendLink = document.getElementById('whatsapp-send-link');
  var roomTypeSelect = document.getElementById('room-type');

  // Pre-fill room type when a "Check Availability" button is clicked on a room card
  document.querySelectorAll('[data-room-select]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var room = btn.getAttribute('data-room-select');
      window.setTimeout(function () {
        roomTypeSelect.value = room;
      }, 400);
    });
  });

  function setError(fieldId, message) {
    var errorEl = document.getElementById('err-' + fieldId);
    var inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message || '';
    if (inputEl) inputEl.classList.toggle('has-error', Boolean(message));
  }

  function isValidPhone(value) {
    // Accepts digits, spaces, parentheses, dashes and an optional leading +
    // Requires at least 7 digits total.
    var digitCount = (value.match(/\d/g) || []).length;
    var validChars = /^[+()\-\s\d]+$/.test(value);
    return validChars && digitCount >= 7;
  }

  function todayISO() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  // Prevent picking past dates in the date pickers themselves
  var checkInInput = document.getElementById('check-in');
  var checkOutInput = document.getElementById('check-out');
  checkInInput.setAttribute('min', todayISO());
  checkOutInput.setAttribute('min', todayISO());

  checkInInput.addEventListener('change', function () {
    if (checkInInput.value) {
      checkOutInput.setAttribute('min', checkInInput.value);
    }
  });

  function validateForm(data) {
    var valid = true;

    // Guest name
    if (!data.guestName.trim()) {
      setError('guest-name', 'Please enter the guest name.');
      valid = false;
    } else {
      setError('guest-name', '');
    }

    // Phone
    if (!data.guestPhone.trim()) {
      setError('guest-phone', 'Please enter a phone number.');
      valid = false;
    } else if (!isValidPhone(data.guestPhone.trim())) {
      setError('guest-phone', 'Please enter a valid phone number.');
      valid = false;
    } else {
      setError('guest-phone', '');
    }

    // Check-in
    var today = todayISO();
    if (!data.checkIn) {
      setError('check-in', 'Please select a check-in date.');
      valid = false;
    } else if (data.checkIn < today) {
      setError('check-in', 'Check-in date cannot be in the past.');
      valid = false;
    } else {
      setError('check-in', '');
    }

    // Check-out
    if (!data.checkOut) {
      setError('check-out', 'Please select a check-out date.');
      valid = false;
    } else if (data.checkIn && data.checkOut <= data.checkIn) {
      setError('check-out', 'Check-out date must be after check-in date.');
      valid = false;
    } else {
      setError('check-out', '');
    }

    // Guests
    var guestCount = parseInt(data.guestCount, 10);
    if (!data.guestCount || isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
      setError('guest-count', 'Please enter a valid number of guests (1–20).');
      valid = false;
    } else {
      setError('guest-count', '');
    }

    // Room type
    if (!data.roomType) {
      setError('room-type', 'Please select a room type.');
      valid = false;
    } else {
      setError('room-type', '');
    }

    return valid;
  }

  function formatDateReadable(isoDate) {
    if (!isoDate) return '';
    var parts = isoDate.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function buildWhatsAppMessage(data) {
    var lines = [
      'Wonderland Hotel Reservation Request',
      '',
      'Guest:',
      data.guestName.trim(),
      '',
      'Phone:',
      data.guestPhone.trim(),
      '',
      'Check-in:',
      formatDateReadable(data.checkIn),
      '',
      'Check-out:',
      formatDateReadable(data.checkOut),
      '',
      'Guests:',
      data.guestCount,
      '',
      'Room:',
      data.roomType,
      '',
      'Message:',
      data.message.trim() || 'None'
    ];
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = {
      guestName: form.guestName.value,
      guestPhone: form.guestPhone.value,
      checkIn: form.checkIn.value,
      checkOut: form.checkOut.value,
      guestCount: form.guestCount.value,
      roomType: form.roomType.value,
      message: form.message.value
    };

    if (!validateForm(data)) {
      // Focus first invalid field for accessibility
      var firstError = form.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    var message = buildWhatsAppMessage(data);
    var url = 'https://wa.me/' + HOTEL.whatsappNumber + '?text=' + encodeURIComponent(message);
    whatsappSendLink.setAttribute('href', url);

    form.classList.add('is-hidden');
    successPanel.classList.add('is-visible');
    successPanel.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
  });

});
