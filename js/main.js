/**
 * Yugal Doddamani — Atelier Core Engine
 * Zero-dependency, 60fps hardware-accelerated scroll, parallax & micro-interactions.
 */

/* ============================================================
   1. THEME PERSISTENCE & VIEW TRANSITIONS
   ============================================================ */
(function initThemeEngine() {
    var savedTheme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    function applyTheme(dark) {
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.classList.toggle('light', !dark);
        updateThemeIcons(dark);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: dark } }));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { applyTheme(isDark); });
    } else {
        applyTheme(isDark);
    }

    window.toggleTheme = function(event) {
        var isCurrentlyDark = document.documentElement.classList.contains('dark');
        var nextDark = !isCurrentlyDark;

        var x = event ? (event.clientX || window.innerWidth / 2) : window.innerWidth / 2;
        var y = event ? (event.clientY || window.innerHeight / 2) : window.innerHeight / 2;
        var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        function commit() {
            applyTheme(nextDark);
            localStorage.setItem('theme', nextDark ? 'dark' : 'light');
        }

        if (document.startViewTransition && window.innerWidth > 768) {
            var transition = document.startViewTransition(commit);
            transition.ready.then(function() {
                document.documentElement.animate(
                    [
                        { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' },
                        { clipPath: 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)' }
                    ],
                    {
                        duration: 550,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
        } else {
            commit();
        }
    };
})();

function updateThemeIcons(isDark) {
    var sun = document.getElementById('theme-icon-sun');
    var moon = document.getElementById('theme-icon-moon');
    if (sun && moon) {
        sun.classList.toggle('hidden', isDark);
        moon.classList.toggle('hidden', !isDark);
    }
}

/* ============================================================
   2. ATELIER PRELOADER & PAGE TRANSITIONS (SLOWED DOWN)
   ============================================================ */
(function initLoaderAndTransitions() {
    var screen = document.getElementById('loading-screen');
    var fill = document.getElementById('loading-fill');
    var icon = document.getElementById('loading-icon-img');
    var label = document.getElementById('loading-label');
    var percent = document.getElementById('loading-percent');
    var transitionEl = document.getElementById('page-transition');

    // Loader Sequence — Slower, more cinematic
    if (screen) {
        var icons = [
            'assets/tooth-svgrepo-com.svg',
            'assets/tools-svgrepo-com.svg',
            'assets/design-svgrepo-com.svg',
            'assets/camera-svgrepo-com.svg'
        ];
        
        var labels = [
            'Initializing',
            'Loading',
            'Preparing',
            'Ready'
        ];
        
        var progress = 0;
        var iconIdx = 0;
        var labelIdx = 0;
        var startTime = null;
        var duration = 2800; // Slower, more cinematic (was 1200)
        var lastLabelChange = 0;

        function loop(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            progress = Math.min((elapsed / duration) * 100, 100);

            // Update progress bar
            if (fill) fill.style.width = progress + '%';
            if (percent) percent.textContent = Math.floor(progress) + '%';

            // Change icon every ~25% of progress
            var iconSegment = Math.floor(progress / 25);
            if (iconSegment > iconIdx && icon && icons[iconSegment % icons.length]) {
                iconIdx = iconSegment;
                icon.src = icons[iconIdx % icons.length];
                // Fade transition for icon
                icon.style.transition = 'opacity 0.3s ease';
                icon.style.opacity = '0.5';
                setTimeout(function() {
                    icon.style.opacity = '1';
                }, 50);
            }

            // Change label at milestones
            var labelSegment = Math.floor(progress / 25);
            if (labelSegment > labelIdx && label && labels[labelSegment % labels.length]) {
                labelIdx = labelSegment;
                label.textContent = labels[labelIdx % labels.length];
                // Fade transition for label
                label.style.transition = 'opacity 0.4s ease';
                label.style.opacity = '0.4';
                setTimeout(function() {
                    label.style.opacity = '1';
                }, 50);
            }

            if (progress < 100) {
                requestAnimationFrame(loop);
            } else {
                // Complete — wait a beat then hide
                setTimeout(function() {
                    screen.classList.add('hide');
                    document.body.classList.add('page-loaded');
                    setTimeout(function() {
                        screen.style.display = 'none';
                    }, 800);
                }, 400);
            }
        }
        requestAnimationFrame(loop);
    } else {
        document.body.classList.add('page-loaded');
    }

    // Page Transition Controller
    window.navigateTo = function(url) {
        if (!transitionEl) {
            window.location.href = url;
            return;
        }
        transitionEl.style.display = 'block';
        void transitionEl.offsetWidth;
        transitionEl.classList.add('active');

        setTimeout(function() {
            window.location.href = url;
        }, 500);
    };

    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('wa.me') || href.startsWith('http') || link.target === '_blank') {
            return;
        }

        e.preventDefault();
        navigateTo(href);
    });
})();

/* ============================================================
   3. ENHANCED CINEMATIC SCROLL & PARALLAX ENGINE
   ============================================================ */
(function initCinematicScroll() {
    var parallaxNodes = [];
    var curtainNodes = [];
    var zoomNodes = [];
    var tunnelNodes = [];
    var scrollProgress = null;
    var header = null;

    var latestY = window.scrollY;
    var lerpedY = window.scrollY;
    var isTicking = false;
    var vh = window.innerHeight;

    function cacheNodes() {
        // Standard parallax
        parallaxNodes = Array.from(document.querySelectorAll('[data-parallax]')).map(function(el) {
            return {
                el: el,
                speed: parseFloat(el.getAttribute('data-parallax')) || 0.1,
                direction: el.getAttribute('data-parallax-dir') || 'vertical'
            };
        });

        // Curtain reveals
        curtainNodes = Array.from(document.querySelectorAll('.curtain-reveal'));

        // Zoom-on-scroll nodes
        zoomNodes = Array.from(document.querySelectorAll('[data-zoom]')).map(function(el) {
            return {
                el: el,
                start: parseFloat(el.getAttribute('data-zoom-start')) || 0.9,
                end: parseFloat(el.getAttribute('data-zoom-end')) || 1.0,
                offset: parseFloat(el.getAttribute('data-zoom-offset')) || 0.2
            };
        });

        // Tunnel effect nodes (items that move toward/away from viewer)
        tunnelNodes = Array.from(document.querySelectorAll('[data-tunnel]')).map(function(el) {
            return {
                el: el,
                depth: parseFloat(el.getAttribute('data-tunnel')) || 1.0,
                offset: parseFloat(el.getAttribute('data-tunnel-offset')) || 0.3
            };
        });

        header = document.querySelector('header');

        if (!scrollProgress) {
            scrollProgress = document.getElementById('scroll-progress');
            if (!scrollProgress) {
                scrollProgress = document.createElement('div');
                scrollProgress.id = 'scroll-progress';
                document.body.appendChild(scrollProgress);
            }
        }
    }

    function onScroll() {
        latestY = window.scrollY;
        vh = window.innerHeight;
        if (!isTicking) {
            requestAnimationFrame(renderScrollFrame);
            isTicking = true;
        }
    }

    function renderScrollFrame() {
        lerpedY += (latestY - lerpedY) * 0.1;
        var maxScroll = document.documentElement.scrollHeight - vh;
        var scrollPercent = maxScroll > 0 ? Math.min(1, Math.max(0, lerpedY / maxScroll)) : 0;

        // 1. Scroll Progress Bar & Glass Header
        if (maxScroll > 0 && scrollProgress) {
            scrollProgress.style.width = (scrollPercent * 100) + '%';
        }
        if (header) {
            header.classList.toggle('is-scrolled', lerpedY > 20);
        }

        // 2. Multi-Plane Parallax Offsets
        parallaxNodes.forEach(function(item) {
            var rect = item.el.getBoundingClientRect();
            if (rect.top < vh + 100 && rect.bottom > -100) {
                var centerDelta = (rect.top + rect.height / 2) - (vh / 2);
                var shift = centerDelta * item.speed;
                if (item.direction === 'vertical') {
                    item.el.style.transform = 'translate3d(0, ' + (-shift.toFixed(2)) + 'px, 0)';
                } else if (item.direction === 'horizontal') {
                    item.el.style.transform = 'translate3d(' + (-shift.toFixed(2)) + 'px, 0, 0)';
                }
            }
        });

        // 3. Curtain Reveal Triggering
        curtainNodes.forEach(function(el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < vh * 0.85) {
                el.classList.add('in-view');
            }
        });

        // 4. TUNNEL EFFECT — Items scale and translate as they scroll
        tunnelNodes.forEach(function(item) {
            var rect = item.el.getBoundingClientRect();
            var centerY = rect.top + rect.height / 2;
            var viewportCenter = vh / 2;
            var distanceFromCenter = (centerY - viewportCenter) / vh;
            
            // Normalize: -1 to 1 (top to bottom of viewport)
            var normalized = Math.max(-1, Math.min(1, distanceFromCenter * 1.5));
            
            // Scale: smaller when far from center, larger when near center
            var scale = 1 + (1 - Math.abs(normalized)) * 0.15 * item.depth;
            var opacity = 1 - Math.abs(normalized) * 0.3;
            
            // Horizontal drift for tunnel feel
            var driftX = normalized * 20 * item.depth;
            
            item.el.style.transform = 'translate3d(' + driftX + 'px, 0, 0) scale(' + scale + ')';
            item.el.style.opacity = Math.max(0.4, opacity);
            item.el.style.transition = 'none';
        });

        // 5. ZOOM EFFECT — Elements zoom in as they enter viewport
        zoomNodes.forEach(function(item) {
            var rect = item.el.getBoundingClientRect();
            var progress = 1 - (rect.top - vh * item.offset) / (vh * (1 + item.offset));
            var clamped = Math.max(0, Math.min(1, progress));
            
            var scale = item.start + (item.end - item.start) * clamped;
            var opacity = 0.2 + 0.8 * clamped;
            
            item.el.style.transform = 'scale(' + scale + ')';
            item.el.style.opacity = opacity;
            item.el.style.transition = 'none';
        });

        // Continue RAF loop while momentum stabilizes
        if (Math.abs(latestY - lerpedY) > 0.2) {
            requestAnimationFrame(renderScrollFrame);
        } else {
            isTicking = false;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function() {
        vh = window.innerHeight;
        cacheNodes();
        onScroll();
    }, { passive: true });

    document.addEventListener('DOMContentLoaded', function() {
        cacheNodes();
        onScroll();
    });
})();

/* ============================================================
   4. EDITORIAL WORD-BY-WORD SCROLL HIGHLIGHT
   ============================================================ */
function initTextHighlight() {
    var targets = document.querySelectorAll('.text-scroll-highlight');
    if (!targets.length) return;

    targets.forEach(function(container) {
        if (container.getAttribute('data-highlight-init') === 'true') return;
        container.setAttribute('data-highlight-init', 'true');

        var text = container.textContent.trim();
        if (!text) return;

        var words = text.split(/\s+/);
        container.innerHTML = '';

        words.forEach(function(w, i) {
            var span = document.createElement('span');
            span.className = 'word';
            var clean = w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (['micrometers', 'zirconia', 'failure', 'physics', 'prosthetics', 'carnix', 'dental', 'systems', 'precision'].includes(clean)) {
                span.classList.add('emphasis');
            }
            span.textContent = w + (i === words.length - 1 ? '' : ' ');
            container.appendChild(span);
        });
    });

    function update() {
        var vh = window.innerHeight;
        targets.forEach(function(container) {
            var rect = container.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > vh) return;

            var start = vh * 0.82;
            var end = vh * 0.25;
            var progress = Math.max(0, Math.min(1, (start - rect.top) / (rect.height + (start - end))));
            var words = container.querySelectorAll('.word');
            var activeLimit = Math.floor(progress * words.length);

            words.forEach(function(word, idx) {
                word.classList.toggle('active', idx <= activeLimit);
            });
        });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}

/* ============================================================
   5. ATELIER CUSTOM CURSOR & MAGNETIC PHYSICS
   ============================================================ */
(function initCursorAndMagnetic() {
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var isFine = window.matchMedia('(pointer: fine)').matches;
    if (!isFine) {
        dot.style.display = 'none';
        ring.style.display = 'none';
        return;
    }

    document.body.classList.add('custom-cursor-active');

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var ringX = mouseX;
    var ringY = mouseY;
    var isVisible = false;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isVisible) {
            isVisible = true;
            dot.style.opacity = '1';
            ring.style.opacity = '0.7';
        }
    });

    document.addEventListener('mouseleave', function() {
        isVisible = false;
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });

    // Event delegation for interactive hover state
    var interactiveQuery = 'a, button, [onclick], .tool-card, .editorial-frame, input, textarea, .tunnel-item, .zoom-item';
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest(interactiveQuery)) {
            dot.classList.add('hover');
            ring.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest(interactiveQuery)) {
            dot.classList.remove('hover');
            ring.classList.remove('hover');
        }
    });

    function renderCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        dot.style.transform = 'translate3d(' + mouseX + 'px, ' + mouseY + 'px, 0) translate(-50%, -50%)';
        ring.style.transform = 'translate3d(' + ringX + 'px, ' + ringY + 'px, 0) translate(-50%, -50%)';

        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Magnetic Button Physics
    var magnets = document.querySelectorAll('.magnetic-btn');
    magnets.forEach(function(btn) {
        btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = 'translate3d(' + (x * 0.2).toFixed(2) + 'px, ' + (y * 0.2).toFixed(2) + 'px, 0)';
        });
        btn.addEventListener('mouseleave', function() {
            btn.style.transform = 'translate3d(0, 0, 0)';
        });
    });
})();

/* ============================================================
   6. 3D CARD TILT WITH SPECULAR REFLECTION
   ============================================================ */
function initToolCardTilt() {
    var cards = document.querySelectorAll('.tool-card, .tunnel-item, .zoom-item');
    if (!cards.length || !window.matchMedia('(pointer: fine)').matches) return;

    cards.forEach(function(card) {
        card.addEventListener('pointermove', function(e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;

            var tiltX = ((0.5 - y) * 12).toFixed(2);
            var tiltY = ((x - 0.5) * 12).toFixed(2);

            card.style.setProperty('--tilt-x', tiltX + 'deg');
            card.style.setProperty('--tilt-y', tiltY + 'deg');
            card.style.setProperty('--shine-x', (x * 100).toFixed(1) + '%');
            card.style.setProperty('--shine-y', (y * 100).toFixed(1) + '%');
            card.style.transform = 'perspective(900px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateZ(0)';
        });

        card.addEventListener('pointerleave', function() {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            card.style.setProperty('--shine-x', '50%');
            card.style.setProperty('--shine-y', '50%');
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
        });
    });
}

/* ============================================================
   7. DYNAMIC PARTICLES CANVAS (THEME HARMONIZED)
   ============================================================ */
(function initAmbientCanvas() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h;
    var mouse = { x: -2000, y: -2000 };
    var particles = [];
    var count = window.innerWidth < 768 ? 20 : 38;
    var rgbColor = '217, 119, 87';

    function syncColor() {
        var hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d97757';
        if (hex.startsWith('#')) {
            var c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(function(ch) { return ch + ch; }).join('');
            var num = parseInt(c, 16);
            rgbColor = ((num >> 16) & 255) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255);
        }
    }

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    syncColor();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('themeChanged', syncColor);

    window.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    for (var i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.8 + 0.8,
            baseAlpha: Math.random() * 0.25 + 0.1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        particles.forEach(function(p) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            var dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
            var alpha = dist < 220 ? p.baseAlpha * 2.2 : p.baseAlpha;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + rgbColor + ', ' + alpha + ')';
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

/* ============================================================
   8. NAVIGATION & DROPDOWNS
   ============================================================ */
function initNavigation() {
    var dropdown = document.getElementById('services-dropdown');
    window.toggleDropdown = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (dropdown) {
            var open = dropdown.classList.toggle('open');
            var trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
    };

    document.addEventListener('click', function(e) {
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            var trigger = dropdown.querySelector('.dropdown-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
    });

    var menuToggle = document.getElementById('menu-toggle');
    var mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            var isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden', isOpen);
            menuToggle.setAttribute('aria-expanded', !isOpen);
            
            if (!isOpen) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        });

        mobileMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            });
        });
    }

    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            window.toggleTheme(e);
        });
    }
}

/* ============================================================
   9. CASE STUDY MODAL SYSTEM
   ============================================================ */
(function initCaseStudyModal() {
    var archiveData = {
        'case-1': {
            discipline: 'PROSTHETICS & CLINICAL CAD',
            title: 'Micron-Margin Zirconia Restorations',
            tagline: 'Achieving absolute marginal fit in multi-unit monolithic zirconia',
            objective: 'Standard intraoral scans typically yield marginal gaps >50μm upon sintering. This protocol creates sub-20-micron seating margins without mechanical compensation.',
            protocol: [
                'Optical scan mesh triangulation audit with manual surface vertex cleaning',
                'Custom sintering shrinkage factor calculation mapped to batch zirconia blanks',
                'Dynamic emergence profile sculpting conforming to biological gingival drape',
                'Split-cast die verification under optical stereomicroscopy'
            ],
            metrics: [
                '≤18μm verified circumferential margin gap',
                '75% reduction in intraoral seating adjustment duration',
                'Zero biological microleakage incidents across clinical cohort'
            ]
        },
        'case-2': {
            discipline: 'WEB SYSTEMS ARCHITECTURE',
            title: 'Zero-JS High-Performance Portfolio',
            tagline: 'Museum-grade editorial aesthetics with 100/100 Lighthouse performance',
            objective: 'Portfolio sites often load heavy animation libraries and slow down. This project uses none—just HTML, CSS, and vanilla JavaScript for fluid parallax, word highlights, and grain.',
            protocol: [
                'Semantic HTML5 scaffold pre-rendered to edge distributions',
                'Continuous RAF scroll loop with lerped spatial translation vectors',
                'SVG turbulence grain layer eliminating heavy background raster images',
                'Clean zero-dependency CSS variable architecture for instantaneous theme switching'
            ],
            metrics: [
                '100/100 Performance, Accessibility, and SEO on Google Lighthouse',
                '< 120ms First Contentful Paint across mobile and desktop',
                '$0 recurring hosting costs through static edge deployment'
            ]
        },
        'case-3': {
            discipline: 'SEARCH SYSTEMS & BRANDING',
            title: 'Organic Search & Brand Engineering',
            tagline: 'Scaling local client visibility to #2 organically with $0 ad spend',
            objective: 'For a local fitness studio, I built a complete brand system—visual identity, Google Business Profile infrastructure, and local search strategy. The result: top-tier organic placement without a single rupee spent on ads.',
            protocol: [
                'Structured local JSON-LD schema deployment targeting local search intent',
                'Google Business Profile photo, category, and review pipeline automation',
                'Consistent typography, apparel, and digital touchpoint redesign',
                'Localized keyword clustering mapped to high-intent regional searches'
            ],
            metrics: [
                '#2 organic ranking achieved in primary regional market',
                '320% increase in inbound telephone & walk-in inquiries',
                '100% organic growth executed with zero paid ad budget'
            ]
        }
    };

    window.openCaseStudy = function(id) {
        var data = archiveData[id];
        if (!data) return;

        var content = document.getElementById('modal-content');
        var backdrop = document.getElementById('modal-backdrop');
        if (!content || !backdrop) return;

        content.innerHTML = `
            <div class="space-y-6 text-left">
                <div class="space-y-2">
                    <span class="font-mono text-[10px] tracking-widest text-brand-400 uppercase block">${data.discipline}</span>
                    <h2 id="modal-title" class="font-editorial italic text-2xl sm:text-3xl font-normal text-white">${data.title}</h2>
                    <p class="font-mono text-xs text-[var(--text-muted)]">${data.tagline}</p>
                </div>

                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span class="font-mono text-[10px] text-brand-400 uppercase tracking-wider block font-medium">Objective</span>
                    <p class="text-xs text-[var(--text-primary)] leading-relaxed font-light">${data.objective}</p>
                </div>

                <div class="space-y-3">
                    <span class="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Execution Protocol</span>
                    <ul class="space-y-2 text-xs text-[var(--text-primary)] font-light">
                        ${data.protocol.map(function(step) {
                            return `<li class="flex items-start gap-2.5">
                                <span class="text-brand-400 font-mono text-[11px] mt-0.5">&mdash;</span>
                                <span>${step}</span>
                            </li>`;
                        }).join('')}
                    </ul>
                </div>

                <div class="pt-4 border-t border-white/10 space-y-3">
                    <span class="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block font-medium">Verified Outcomes</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${data.metrics.map(function(m) {
                            return `<div class="p-2.5 rounded bg-black/40 border border-white/5 font-mono text-[11px] text-white/90">
                                <span class="text-emerald-400 mr-1.5">&bull;</span> ${m}
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        backdrop.classList.remove('hidden');
        setTimeout(function() {
            backdrop.classList.remove('opacity-0');
            document.body.style.overflow = 'hidden';
        }, 10);
    };

    window.closeModal = function() {
        var backdrop = document.getElementById('modal-backdrop');
        if (!backdrop) return;
        backdrop.classList.add('opacity-0');
        document.body.style.overflow = '';
        setTimeout(function() {
            backdrop.classList.add('hidden');
        }, 300);
    };

    var backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', function(e) {
            if (e.target === backdrop) closeModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
})();

/* ============================================================
   10. INITIALIZATION LIFECYCLE
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTextHighlight();
    initToolCardTilt();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('[data-parallax]').forEach(function(el) {
            el.style.transform = 'none';
        });
        document.querySelectorAll('[data-zoom]').forEach(function(el) {
            el.style.transform = 'scale(1)';
            el.style.opacity = '1';
        });
        document.querySelectorAll('[data-tunnel]').forEach(function(el) {
            el.style.transform = 'none';
            el.style.opacity = '1';
        });
        document.querySelectorAll('.curtain-reveal').forEach(function(el) {
            el.classList.add('in-view');
        });
    }
});