/* =========================================================================
   MedQuire Hero Visual Concept Prototype Script
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const heroVisual = document.getElementById('heroVisual');
  const queryBubble = document.getElementById('queryBubble');
  const queryText = document.getElementById('queryText');
  const particleField = document.getElementById('particleField');
  const quireStructure = document.getElementById('quireStructure');
  const aiKernel = document.getElementById('aiKernel');
  
  const card1 = document.getElementById('infoCard1');
  const card2 = document.getElementById('infoCard2');
  const card3 = document.getElementById('infoCard3');

  const cardPill1 = document.getElementById('cardPill1');
  const cardDesc1 = document.getElementById('cardDesc1');
  const cardPill2 = document.getElementById('cardPill2');
  const cardDesc2 = document.getElementById('cardDesc2');
  const cardPill3 = document.getElementById('cardPill3');
  const cardDesc3 = document.getElementById('cardDesc3');

  // Multi-query workflow for rich variety
  const heroQueries = [
    {
      text: "Can I take Lisinopril with Ibuprofen?",
      cards: [
        { pill: "What it does", desc: "Lowers high blood pressure safely by widening blood vessels.", type: "normal" },
        { pill: "Key Warning", desc: "Do not take if pregnant. Can cause a dry tickly cough.", type: "warning" },
        { pill: "Interactions", desc: "Avoid taking with Ibuprofen without doctor guidance.", type: "normal" }
      ],
      particles: ["✚", "Lisinopril", "Ibuprofen", "⚠️", "Pill", "10mg", "•", "•"]
    },
    {
      text: "What does Metformin do?",
      cards: [
        { pill: "What it does", desc: "Helps control blood sugar levels by improving insulin response.", type: "normal" },
        { pill: "How to take", desc: "Take with meals to prevent stomach upset.", type: "normal" },
        { pill: "Key Warning", desc: "Limit alcohol intake to prevent rare lactic acidosis risks.", type: "warning" }
      ],
      particles: ["Metformin", "Glucophage", "Sugar", "✚", "500mg", "⚠️", "•", "•"]
    },
    {
      text: "Lisinopril side effects?",
      cards: [
        { pill: "What it does", desc: "Treats high blood pressure and heart failure effectively.", type: "normal" },
        { pill: "Side Effects", desc: "Common effects include dizziness, headaches, and dry cough.", type: "warning" },
        { pill: "Dosage", desc: "Usually started at 10mg once daily, adjusted by physician.", type: "normal" }
      ],
      particles: ["Lisinopril", "Dizzy", "Cough", "10mg", "✚", "⚠️", "•", "•"]
    }
  ];

  let currentQueryIndex = 0;

  // Typing helper script (unique namespace to prevent conflicts)
  function typeTextProto(text, element, callback) {
    element.textContent = "";
    let i = 0;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, 55);
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  function runHeroAnimationCycle() {
    if (!heroVisual) return;
    const currentData = heroQueries[currentQueryIndex];

    // SCENE 1: Type Query
    queryBubble.classList.add('active');
    typeTextProto(currentData.text, queryText, () => {
      
      // Wait 1.5s after typing query, then dissolve
      setTimeout(() => {
        // SCENE 2: Dissolve bubble into particles
        queryBubble.classList.remove('active');
        
        // Spawn particles
        const bubbleRect = queryBubble.getBoundingClientRect();
        const visualRect = heroVisual.getBoundingClientRect();
        
        // Calculate start position relative to visual wrapper
        const startX = bubbleRect.left - visualRect.left + (bubbleRect.width / 2);
        const startY = bubbleRect.top - visualRect.top + (bubbleRect.height / 2);

        // Core target position (center of Quire)
        const targetX = visualRect.width / 2;
        const targetY = visualRect.height / 2;

        currentData.particles.forEach((pText, index) => {
          setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'particle-element';
            p.textContent = pText;
            p.style.left = `${startX}px`;
            p.style.top = `${startY}px`;
            
            // Random scatter offsets
            const scatterX = (Math.random() - 0.5) * 60;
            const scatterY = (Math.random() - 0.5) * 60;
            
            particleField.appendChild(p);

            // Force reflow
            p.offsetHeight;

            // Animate: first scatter
            p.style.transform = `translate(${scatterX}px, ${scatterY}px) scale(1.1) rotate(${scatterX}deg)`;

            // SCENE 3: Pull to Quire Core
            setTimeout(() => {
              p.style.left = `${targetX}px`;
              p.style.top = `${targetY}px`;
              p.style.transform = `translate(-50%, -50%) scale(0.4) rotate(${scatterY * 2}deg)`;
              p.style.opacity = '0';
              p.style.filter = 'blur(4px)';
              
              // Remove element after transition completes
              setTimeout(() => {
                p.remove();
              }, 1800);
            }, 400);

          }, index * 100);
        });

        // Trigger AI Kernel synthesis pulse
        setTimeout(() => {
          aiKernel.classList.add('synthesizing');
        }, 600);

        // SCENE 4 & 5: Populate and slide out Cards
        setTimeout(() => {
          aiKernel.classList.remove('synthesizing');

          // Populate card content
          cardPill1.textContent = currentData.cards[0].pill;
          cardDesc1.textContent = currentData.cards[0].desc;
          if (currentData.cards[0].type === "warning") {
            cardPill1.className = "card-pill warning-pill";
          } else {
            cardPill1.className = "card-pill";
          }

          cardPill2.textContent = currentData.cards[1].pill;
          cardDesc2.textContent = currentData.cards[1].desc;
          if (currentData.cards[1].type === "warning") {
            cardPill2.className = "card-pill warning-pill";
          } else {
            cardPill2.className = "card-pill";
          }

          cardPill3.textContent = currentData.cards[2].pill;
          cardDesc3.textContent = currentData.cards[2].desc;
          if (currentData.cards[2].type === "warning") {
            cardPill3.className = "card-pill warning-pill";
          } else {
            cardPill3.className = "card-pill";
          }

          // Slide cards out in staggered fashion
          setTimeout(() => card1.classList.add('active'), 0);
          setTimeout(() => card2.classList.add('active'), 250);
          setTimeout(() => card3.classList.add('active'), 500);

        }, 1600);

        // SCENE 6 & 7: Hover and Dissolve
        setTimeout(() => {
          // Slide cards back in/fade out
          card1.classList.remove('active');
          card2.classList.remove('active');
          card3.classList.remove('active');

          // Advance loop
          setTimeout(() => {
            currentQueryIndex = (currentQueryIndex + 1) % heroQueries.length;
            runHeroAnimationCycle();
          }, 1200);

        }, 8500);

      }, 2000);

    });
  }

  // --- CURSOR PARALLAX INTERACTION ---
  function initHeroParallax() {
    if (!heroVisual || !quireStructure) return;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    // Check media queries to avoid mobile layout lag
    if (window.innerWidth > 992) {
      window.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        targetRotateY = (deltaX / (window.innerWidth / 2)) * 12;
        targetRotateX = -(deltaY / (window.innerHeight / 2)) * 12;
      });

      function updateParallax() {
        currentRotateX += (targetRotateX - currentRotateX) * 0.08;
        currentRotateY += (targetRotateY - currentRotateY) * 0.08;

        quireStructure.style.transform = `rotateY(${currentRotateY}deg) rotateX(${currentRotateX}deg)`;
        requestAnimationFrame(updateParallax);
      }
      requestAnimationFrame(updateParallax);
    }
  }

  // Launch visual engine
  setTimeout(() => {
    runHeroAnimationCycle();
    initHeroParallax();
  }, 1000);
});
