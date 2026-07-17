document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. PREMIUM FLOATING NAVIGATION SYSTEM
  // =========================================================================
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const heroSection = document.getElementById('hero');
  const menuOverlay = document.getElementById('menuOverlay');
  const textNavLinks = navLinks ? navLinks.querySelectorAll('a:not(.btn)') : [];
  const navWrapper = document.querySelector('nav[aria-label="Main Navigation"]');
  const indicator = document.getElementById('navIndicator');

  let lastLeft = 0;

  // Recalculate sliding indicator position & width relative to navigation container
  const updateIndicator = () => {
    if (!indicator || !navWrapper) return;
    
    // Hide indicator if element is hidden via CSS (e.g. mobile viewports)
    if (window.getComputedStyle(indicator).display === 'none') {
      indicator.style.opacity = '0';
      return;
    }

    const activeLink = Array.from(textNavLinks).find(link => link.classList.contains('active'));
    if (activeLink) {
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = navWrapper.getBoundingClientRect();
      
      const newLeft = linkRect.left - navRect.left;
      const newRight = navRect.width - (newLeft + linkRect.width);

      // Elastic stretch motion effect: adjust transition timing based on direction
      if (newLeft > lastLeft) {
        // Moving Right: right edge transitions faster, leading the stretch
        indicator.style.transition = 'left 0.3s cubic-bezier(0.25, 1, 0.5, 1), right 0.22s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
      } else if (newLeft < lastLeft) {
        // Moving Left: left edge transitions faster, leading the stretch
        indicator.style.transition = 'left 0.22s cubic-bezier(0.25, 1, 0.5, 1), right 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease';
      }

      indicator.style.left = `${newLeft}px`;
      indicator.style.right = `${newRight}px`;
      indicator.style.opacity = '1';
      
      lastLeft = newLeft;
    } else {
      indicator.style.opacity = '0';
    }
  };

  // Trigger floating sticky navigation once scrolled beyond the hero section
  const handleScroll = () => {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const triggerHeight = heroSection ? heroSection.offsetHeight - 80 : 600;
    
    if (scrollTop > triggerHeight) {
      if (!header.classList.contains('sticky-floating')) {
        header.classList.add('sticky-floating');
        setTimeout(updateIndicator, 50);
      }

      // Secondary scroll state trigger (further down)
      const deepTriggerHeight = triggerHeight + 150;
      if (scrollTop > deepTriggerHeight) {
        if (!header.classList.contains('scrolled-deep')) {
          header.classList.add('scrolled-deep');
          setTimeout(updateIndicator, 50);
        }
      } else {
        if (header.classList.contains('scrolled-deep')) {
          header.classList.remove('scrolled-deep');
          setTimeout(updateIndicator, 50);
        }
      }
    } else {
      if (header.classList.contains('sticky-floating')) {
        header.classList.remove('sticky-floating');
        header.classList.remove('scrolled-deep');
        setTimeout(updateIndicator, 50);
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run initially to check status on load

  // Accessible & Animated Mobile Menu Dropdown Toggle
  if (navToggle && navLinks) {
    const toggleMenu = () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open');
      if (menuOverlay) {
        menuOverlay.classList.toggle('active', isOpen);
      }
    };

    navToggle.addEventListener('click', toggleMenu);

    if (menuOverlay) {
      menuOverlay.addEventListener('click', toggleMenu);
    }
  }

  // Smooth Offset Scrolling on Link Clicks
  const navItems = header ? header.querySelectorAll('a') : [];
  navItems.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        try {
          const targetSection = document.querySelector(href);
          if (targetSection) {
            e.preventDefault();
  
            // Close mobile menu if open
            if (navToggle && navLinks) {
              navToggle.classList.remove('open');
              navLinks.classList.remove('open');
              navToggle.setAttribute('aria-expanded', 'false');
              document.body.classList.remove('menu-open');
              if (menuOverlay) {
                menuOverlay.classList.remove('active');
              }
            }
  
            // Highlight immediately for crisp visual feedback
            if (!link.classList.contains('btn')) {
              textNavLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
              updateIndicator();
            }
  
            // Calculate precise floating navigation offset (toolbar has fixed height)
            const offset = header.classList.contains('sticky-floating') ? 90 : 110;
            const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;
  
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
  
            // Safely push to history without jumping the page
            history.pushState(null, null, href);
          }
        } catch (err) {
          console.error("Invalid scroll selector", err);
        }
      }
    });
  });

  // Active Section Highlighting & Sliding Indicator (Intersection Observer)
  const sections = document.querySelectorAll('section[id], footer[id]');
  
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px', // Trigger when section is in active view area
    threshold: 0
  };

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        textNavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
        updateIndicator();
      }
    });
  }, observerOptions);

  sections.forEach(section => activeObserver.observe(section));

  // Update sliding indicator on resize or load
  window.addEventListener('resize', updateIndicator);
  setTimeout(updateIndicator, 200);

  // =========================================================================
  // 2. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // Unobserve after showing so we don't re-trigger
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully in view
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });





  // =========================================================================
  // 5. CHAT / DEMO SIMULATION (METFORMIN SEARCH)
  // =========================================================================
  const chatArea = document.getElementById('chatArea');
  const typingInput = document.getElementById('typingInput');
  let demoTimer = null;

  if (chatArea && typingInput) {

  // Render a chat bubble in the simulation
  const appendBubble = (type, content) => {
    const bubble = document.createElement('div');
    bubble.className = `demo-bubble ${type}`;
    bubble.innerHTML = content;
    chatArea.appendChild(bubble);
    
    // Trigger CSS animation delay
    setTimeout(() => {
      bubble.classList.add('visible');
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 50);

    return bubble;
  };

  // Render a loading typing indicator bubble
  const appendLoadingBubble = () => {
    const loader = document.createElement('div');
    loader.className = 'demo-bubble ai loading-bubble';
    loader.innerHTML = `
      <div class="demo-loading">
        <div class="demo-dot"></div>
        <div class="demo-dot"></div>
        <div class="demo-dot"></div>
      </div>
    `;
    chatArea.appendChild(loader);
    
    setTimeout(() => {
      loader.classList.add('visible');
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 5);

    return loader;
  };

  // Type string into the typing placeholder
  const typeText = (text, delay = 80) => {
    return new Promise(resolve => {
      let index = 0;
      typingInput.textContent = '';
      typingInput.classList.add('typing-active');
      
      const interval = setInterval(() => {
        typingInput.textContent += text[index];
        index++;
        
        if (index >= text.length) {
          clearInterval(interval);
          typingInput.classList.remove('typing-active');
          typingInput.classList.add('has-value');
          resolve();
        }
      }, delay);
    });
  };

  // The custom simulation runner
  const startDemoSimulation = async () => {
    // Clear chat
    chatArea.innerHTML = '';
    typingInput.textContent = 'Search for a medication...';
    typingInput.classList.remove('has-value');

    // 1. Initial Greeting
    appendBubble('ai', 'Hi! I\'m MedQuire AI. Type your prescription name or snap a photo of its label to translate.');
    
    // Wait before typing query
    await new Promise(r => demoTimer = setTimeout(r, 2200));

    // 2. Type "Metformin"
    await typeText('Metformin', 120);

    // Wait slightly
    await new Promise(r => demoTimer = setTimeout(r, 600));

    // 3. User sends "Metformin"
    appendBubble('user', 'Translate: Metformin');
    typingInput.textContent = 'Search for a medication...';
    typingInput.classList.remove('has-value');

    // 4. Loading indicator
    const loader = appendLoadingBubble();
    await new Promise(r => demoTimer = setTimeout(r, 1400));

    // Remove loading indicator
    loader.remove();

    // 5. Append translated results card
    const resultCardContent = `
      <div class="result-card">
        <div class="result-card-header">
          <span class="result-title">Metformin</span>
          <span class="result-tag">1st Line Therapy</span>
        </div>
        <div class="result-subtitle">Brand Names: Glucophage, Fortamet</div>
        
        <div class="result-section">
          <div class="result-section-title">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            What it does
          </div>
          <div class="result-text" id="resultExplanation">
            Helps your body respond better to insulin and lowers the amount of sugar made by your liver, controlling your blood sugar.
          </div>
        </div>

        <div class="result-section">
          <div class="result-section-title" style="color: var(--accent-gold);">
            <svg style="fill: var(--accent-gold);" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            How to take & Warning
          </div>
          <div class="result-text">
            Take with meals to prevent stomach upset. Do not drink heavy alcohol while taking it.
          </div>
        </div>

        <div style="margin-top: 1rem; text-align: center;">
          <button id="eli12Btn" class="btn btn-secondary" style="padding: 0.35rem 0.85rem; font-size: 0.7rem; border-radius: 8px; width: 100%;">
            ✨ Translate to "Explain Like I'm 12" Mode
          </button>
        </div>
      </div>
    `;

    appendBubble('ai', 'Here is the plain-language summary for Metformin:');
    await new Promise(r => demoTimer = setTimeout(r, 200));
    appendBubble('ai', resultCardContent);

    // Setup interactive ELI12 click capability
    setTimeout(() => {
      const eliBtn = document.getElementById('eli12Btn');
      const explanationDiv = document.getElementById('resultExplanation');
      
      if (eliBtn && explanationDiv) {
        let isEli12 = false;

        const toggleEli = () => {
          isEli12 = !isEli12;
          if (isEli12) {
            explanationDiv.textContent = 'Metformin works like a key that helps body cells unlock and let sugar in from your blood, so sugar doesn\'t build up where it shouldn\'t. It also tells your liver to chill out on making extra sugar.';
            explanationDiv.parentElement.style.background = 'var(--accent-purple-soft)'; // AI Tertiary container highlight
            explanationDiv.parentElement.style.borderRadius = '8px';
            explanationDiv.parentElement.style.padding = '0.5rem';
            eliBtn.textContent = '↩ Switch back to Standard Mode';
          } else {
            explanationDiv.textContent = 'Helps your body respond better to insulin and lowers the amount of sugar made by your liver, controlling your blood sugar.';
            explanationDiv.parentElement.style.background = 'none';
            explanationDiv.parentElement.style.padding = '0';
            eliBtn.textContent = '✨ Translate to "Explain Like I\'m 12" Mode';
          }
          chatArea.scrollTop = chatArea.scrollHeight;
        };

        eliBtn.addEventListener('click', toggleEli);

        // Automate ELI12 mode toggle for observers who just watch
        demoTimer = setTimeout(() => {
          if (document.getElementById('eli12Btn')) {
            toggleEli();
            // Wait, then reset the entire loop
            demoTimer = setTimeout(() => {
              // start simulation again
              startDemoSimulation();
            }, 6000);
          }
        }, 4000);
      }
    }, 200);
  };

    // Launch simulated demo loop
    startDemoSimulation();

    window.addEventListener('blur', () => {
      if (demoTimer) clearTimeout(demoTimer);
    });
    window.addEventListener('focus', () => {
      if (demoTimer) {
        clearTimeout(demoTimer);
      }
      startDemoSimulation();
    });
  }

  // =========================================================================
  // 5B. VIDEO DEMO SECTION CONTROLLER
  // =========================================================================
  const demoVideo = document.getElementById('demoVideo');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const muteBtn = document.getElementById('muteBtn');

  if (demoVideo) {
    // Reduce video playback rate to 0.75 for improved readability
    demoVideo.playbackRate = 0.75;
    demoVideo.addEventListener('loadedmetadata', () => {
      demoVideo.playbackRate = 0.75;
    });

    // 1. Intersection Observer for Playback Control (Pause when off-screen)
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Play the video when in view (if not paused manually)
          if (!demoVideo.dataset.pausedManually) {
            demoVideo.play().catch(e => console.log('Autoplay blocked:', e));
          }
        } else {
          // Pause when scrolled out of view
          demoVideo.pause();
        }
      });
    }, { threshold: 0.25 });

    videoObserver.observe(demoVideo);

    // 2. Play/Pause toggle
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        if (demoVideo.paused) {
          demoVideo.play();
          delete demoVideo.dataset.pausedManually;
          playPauseBtn.classList.remove('paused');
        } else {
          demoVideo.pause();
          demoVideo.dataset.pausedManually = 'true';
          playPauseBtn.classList.add('paused');
        }
      });
    }

    // 3. Mute/Unmute toggle
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        demoVideo.muted = !demoVideo.muted;
        if (demoVideo.muted) {
          muteBtn.classList.add('muted');
        } else {
          muteBtn.classList.remove('muted');
        }
      });
    }
  }

  // --- FLAGSHIP HERO SVG PARALLAX CONTROLLER ---
  const heroVisual = document.getElementById('heroVisual');

  function initHeroParallax() {
    if (!heroVisual) return;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    if (window.innerWidth > 992) {
      window.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        targetRotateY = (deltaX / (window.innerWidth / 2)) * 10;
        targetRotateX = -(deltaY / (window.innerHeight / 2)) * 10;
      });

      function updateParallax() {
        currentRotateX += (targetRotateX - currentRotateX) * 0.08;
        currentRotateY += (targetRotateY - currentRotateY) * 0.08;

        heroVisual.style.transform = `rotateY(${currentRotateY}deg) rotateX(${currentRotateX}deg)`;
        requestAnimationFrame(updateParallax);
      }
      requestAnimationFrame(updateParallax);
    }
  }

  initHeroParallax();

  // --- THE CONVERSATIONAL RIPPLE CYCLE MANAGER ---
  function initConversationalRipple() {
    const rippleWrapper = document.getElementById('conversationalRipple');
    const queryText = document.getElementById('rippleQuery');
    
    const cap1 = document.getElementById('content-cap-1');
    const cap2 = document.getElementById('content-cap-2');
    const cap3 = document.getElementById('content-cap-3');
    
    const txt1 = document.getElementById('badge-txt-1');
    const txt2 = document.getElementById('badge-txt-2');
    const txt3 = document.getElementById('badge-txt-3');

    const badge1 = document.getElementById('badge-cap-1');
    const badge2 = document.getElementById('badge-cap-2');
    const badge3 = document.getElementById('badge-cap-3');

    if (!rippleWrapper || !queryText) return;

    const dataset = [
      {
        query: "Side effects?",
        capsules: [
          { text: "Dizziness", badge: "1", bg: "rgba(255, 145, 0, 0.1)", color: "#FF9100" },
          { text: "Headache", badge: "2", bg: "rgba(255, 145, 0, 0.1)", color: "#FF9100" },
          { text: "Nausea (rare)", badge: "3", bg: "rgba(255, 145, 0, 0.1)", color: "#FF9100" }
        ]
      },
      {
        query: "Interactions?",
        capsules: [
          { text: "No major interactions found", badge: "✓", bg: "rgba(5, 150, 105, 0.1)", color: "#059669" },
          { text: "Avoid with grapefruit juice", badge: "!", bg: "rgba(255, 145, 0, 0.1)", color: "#FF9100" },
          { text: "Safe with common painkillers", badge: "✓", bg: "rgba(5, 150, 105, 0.1)", color: "#059669" }
        ]
      },
      {
        query: "Dosage?",
        capsules: [
          { text: "1 tablet daily", badge: "1", bg: "rgba(64, 119, 241, 0.1)", color: "#1256ED" },
          { text: "Take after meals", badge: "2", bg: "rgba(64, 119, 241, 0.1)", color: "#1256ED" },
          { text: "Same time each day", badge: "3", bg: "rgba(64, 119, 241, 0.1)", color: "#1256ED" }
        ]
      },
      {
        query: "Purpose?",
        capsules: [
          { text: "Lowers blood pressure", badge: "♥", bg: "rgba(124, 58, 237, 0.1)", color: "#7C3AED" },
          { text: "Relaxes blood vessels", badge: "♥", bg: "rgba(124, 58, 237, 0.1)", color: "#7C3AED" },
          { text: "Long-term use typical", badge: "♥", bg: "rgba(124, 58, 237, 0.1)", color: "#7C3AED" }
        ]
      }
    ];

    let currentIndex = 0;

    function runCycle() {
      // 1. Fade out by removing active
      rippleWrapper.classList.remove('active');

      // 2. Wait for fade out animation (1s) to update content
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % dataset.length;
        const current = dataset[currentIndex];

        // Update textual queries
        queryText.textContent = current.query;
        
        if (cap1) cap1.textContent = current.capsules[0].text;
        if (cap2) cap2.textContent = current.capsules[1].text;
        if (cap3) cap3.textContent = current.capsules[2].text;

        if (txt1) txt1.textContent = current.capsules[0].badge;
        if (txt2) txt2.textContent = current.capsules[1].badge;
        if (txt3) txt3.textContent = current.capsules[2].badge;

        if (badge1) {
          badge1.style.background = current.capsules[0].bg;
          badge1.style.color = current.capsules[0].color;
        }
        if (badge2) {
          badge2.style.background = current.capsules[1].bg;
          badge2.style.color = current.capsules[1].color;
        }
        if (badge3) {
          badge3.style.background = current.capsules[2].bg;
          badge3.style.color = current.capsules[2].color;
        }

        // Force browser reflow to restart CSS transitions
        void rippleWrapper.offsetWidth;

        // 3. Fade in / slide in
        rippleWrapper.classList.add('active');
      }, 1000);
    }

    // Wrap in reduced motion verification
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!prefersReducedMotion.matches) {
      setInterval(runCycle, 12000);
    }
  }

  initConversationalRipple();

  // =========================================================================
  // Google Form Waitlist Integration
  // =========================================================================
  const waitlistForm = document.querySelector('.waitlist-form');
  if (waitlistForm) {
    let errorMsgEl = null;

    const showError = (message) => {
      if (!errorMsgEl) {
        errorMsgEl = document.createElement('div');
        errorMsgEl.className = 'waitlist-error-message';
        waitlistForm.parentNode.appendChild(errorMsgEl);
      }
      errorMsgEl.textContent = message;
      errorMsgEl.style.display = 'block';
    };

    const clearError = () => {
      if (errorMsgEl) {
        errorMsgEl.textContent = '';
        errorMsgEl.style.display = 'none';
      }
    };

    // Modal creation helper
    const showSuccessModal = () => {
      let backdrop = document.getElementById('waitlistSuccessModal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'waitlistSuccessModal';
        backdrop.className = 'waitlist-modal-backdrop';
        backdrop.innerHTML = `
          <div class="waitlist-modal-card">
            <div class="waitlist-modal-check">✓</div>
            <h3 class="waitlist-modal-title">You're on the list!</h3>
            <p class="waitlist-modal-message">Thanks for joining the MedQuire waitlist. We'll let you know as soon as early access is available.</p>
            <button class="waitlist-modal-btn">Dismiss</button>
          </div>
        `;
        document.body.appendChild(backdrop);

        // Dismiss actions
        const closeBtn = backdrop.querySelector('.waitlist-modal-btn');
        closeBtn.addEventListener('click', () => {
          backdrop.classList.remove('active');
        });
        
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            backdrop.classList.remove('active');
          }
        });
      }
      
      // Trigger animation
      setTimeout(() => {
        backdrop.classList.add('active');
      }, 10);
    };

    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearError();
      
      const emailInput = waitlistForm.querySelector('.waitlist-input');
      const submitBtn = waitlistForm.querySelector('.waitlist-btn');
      if (!emailInput || !submitBtn) return;
      
      const emailVal = emailInput.value.trim();
      if (!emailVal) {
        showError("Please enter your email address.");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        showError("Please enter a valid email address.");
        return;
      }
      
      // Update UI to submitting state
      submitBtn.disabled = true;
      emailInput.disabled = true;
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Joining...';
      
      // Form parameters
      const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe1GCuT8fXF_7VpcFboeVoQ8zmNq6ojWRX5_kmJFqoVcwT7BQ/formResponse';
      const params = new URLSearchParams();
      params.append('entry.1538647705', emailVal);
      
      fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      .then(() => {
        // Show success modal
        showSuccessModal();
        emailInput.value = ''; // Clear form input
        
        // Reset inputs and buttons
        submitBtn.disabled = false;
        emailInput.disabled = false;
        submitBtn.textContent = originalBtnText;
      })
      .catch((error) => {
        console.error('Waitlist submission failed:', error);
        showError("Something went wrong. Please check your network and try again.");
        
        // Reset inputs and buttons
        submitBtn.disabled = false;
        emailInput.disabled = false;
        submitBtn.textContent = originalBtnText;
      });
    });
  }

  // =========================================================================
  // FAQ Accordion Manager & Show More Toggle
  // =========================================================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const panel = item.querySelector('.faq-panel');
    
    if (trigger && panel) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Collapse all other items first
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherTrigger = otherItem.querySelector('.faq-trigger');
            const otherPanel = otherItem.querySelector('.faq-panel');
            if (otherPanel) otherPanel.style.maxHeight = '0px';
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          panel.style.maxHeight = '0px';
          trigger.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  const faqToggleBtn = document.getElementById('faqToggleBtn');
  const faqMoreWrapper = document.getElementById('faqMoreWrapper');
  
  if (faqToggleBtn && faqMoreWrapper) {
    const moreItems = faqMoreWrapper.querySelectorAll('.faq-item-more');
    
    faqToggleBtn.addEventListener('click', () => {
      const isExpanded = faqToggleBtn.classList.contains('active');
      
      if (!isExpanded) {
        // Expand action:
        faqToggleBtn.classList.add('active');
        faqMoreWrapper.style.display = 'flex';
        
        // Staggered animation reveal
        moreItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('reveal-show');
          }, index * 80); // Staggered by 80ms
        });
        
        // Update button text
        const btnText = faqToggleBtn.querySelector('.faq-btn-text');
        if (btnText) btnText.textContent = 'Show less questions';
      } else {
        // Collapse action:
        faqToggleBtn.classList.remove('active');
        
        // Scroll smoothly to top of FAQ section first
        const faqSection = document.getElementById('faq');
        if (faqSection) {
          faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Wait for scroll/transition then collapse
        moreItems.forEach(item => {
          item.classList.remove('reveal-show');
        });
        
        setTimeout(() => {
          faqMoreWrapper.style.display = 'none';
          // Collapse all panels inside the wrapper to reset state
          moreItems.forEach(item => {
            item.classList.remove('active');
            const panel = item.querySelector('.faq-panel');
            const trigger = item.querySelector('.faq-trigger');
            if (panel) panel.style.maxHeight = '0px';
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          });
        }, 300);
        
        const btnText = faqToggleBtn.querySelector('.faq-btn-text');
        if (btnText) btnText.textContent = 'Show more questions';
      }
    });
  }

});

