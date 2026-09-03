/* ============================================================
   THEME PERSISTENCE & INITIALIZATION
   ============================================================ */

(function initThemePersistence() {
    var savedTheme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    updateThemeIcons(isDark);
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
   PAGE TRANSITIONS
   ============================================================ */

(function initPageTransitions() {
    var transitionEl = document.getElementById('page-transition');
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    var isTransitioning = false;

    window.navigateTo = function(url, transitionType) {
        if (isTransitioning || url === currentPath) return;
        isTransitioning = true;

        var type = transitionType || 'wipe-up';

        if (transitionEl) {
            transitionEl.className = '';
            transitionEl.style.display = 'block';
            // Smooth transform triggering without forced layout thrashing
            requestAnimationFrame(function() {
                transitionEl.classList.add(type, 'active');
            });
        }

        setTimeout(function() {
            window.location.href = url;
        }, 600);
    };

    window.addEventListener('pageshow', function() {
        if (transitionEl) {
            transitionEl.classList.remove('active');
            transitionEl.className = '';
            transitionEl.style.display = 'none';
        }
        isTransitioning = false;
    });

    if (transitionEl) {
        transitionEl.style.display = 'none';
    }

    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href) return;

        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) return;

        var targetPath = href.split('/').pop() || 'index.html';
        if (targetPath === currentPath) return;

        if (href.includes('.pdf') || href.includes('.zip') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        e.preventDefault();

        var isBack = href.includes('index.html') && currentPath.includes('graphic-design');
        var type = isBack ? 'wipe-down' : 'wipe-up';

        navigateTo(href, type);
    });
})();

/* ============================================================
   LOADING SCREEN (Optimized with requestAnimationFrame)
   ============================================================ */

(function initLoadingScreen() {
    var loadingScreen = document.getElementById('loading-screen');
    var fillBar = document.getElementById('loading-fill');
    var iconImg = document.getElementById('loading-icon-img');
    var iconContainer = document.getElementById('loading-icon');
    
    if (!loadingScreen || !iconImg) return;
    
    var iconFiles = [
        'assets/tooth-svgrepo-com.svg',
        'assets/design-svgrepo-com.svg',
        'assets/code-tech-dev-svgrepo-com.svg',
        'assets/camera-svgrepo-com.svg',
        'assets/tools-svgrepo-com.svg'
    ];
    
    var currentIconIndex = 0;
    var progress = 0;
    var duration = 2000;
    var startTime = null;
    var iconChangeInterval = duration / iconFiles.length;
    var lastIconChange = Date.now();
    var isWindowLoaded = false;
    
    window.addEventListener('load', function() {
        isWindowLoaded = true;
    });

    function setIcon(index) {
        var iconPath = iconFiles[index % iconFiles.length];
        iconImg.src = iconPath;
        if (iconContainer) {
            iconContainer.classList.remove('pulse');
            void iconContainer.offsetWidth;
            iconContainer.classList.add('pulse');
        }
    }
    
    setIcon(0);
    
    function updateProgress(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;

        progress = Math.min((elapsed / duration) * 100, 100);
        
        if (fillBar) {
            fillBar.style.width = progress + '%';
        }
        
        var now = Date.now();
        if (now - lastIconChange > iconChangeInterval && progress < 100) {
            currentIconIndex++;
            setIcon(currentIconIndex);
            lastIconChange = now;
        }
        
        if (progress >= 95 && !isWindowLoaded) {
            requestAnimationFrame(updateProgress);
            return;
        }

        if (progress < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            setIcon(iconFiles.length - 1);
            setTimeout(function() {
                loadingScreen.classList.add('hide');
                setTimeout(function() {
                    document.body.classList.add('page-loaded');
                    if (typeof initScrollReveals === 'function') {
                        initScrollReveals();
                    }
                }, 300);
            }, 300);
        }
    }

    requestAnimationFrame(updateProgress);
})();

/* ============================================================
   MAIN APPLICATION DOM LOADED
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();
    initCursor();
    initCanvas();
    initMobileMenu();
    initCaseStudies();
    initContactForm();
    initDropdown();
    initProficiency();
    
    initSectionHeaders();
    initCardInteractions();
    checkReducedMotion();

    if (!document.getElementById('loading-screen')) {
        initScrollReveals();
    }
});

/* ============================================================
   DROPDOWN TOGGLE
   ============================================================ */

function initDropdown() {
    var container = document.getElementById('services-dropdown');
    if (!container) return;

    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            container.classList.remove('open');
            var trigger = container.querySelector('.dropdown-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        }
    });
}

function toggleDropdown(event) {
    event.stopPropagation();
    var container = document.getElementById('services-dropdown');
    if (container) {
        var isOpen = container.classList.toggle('open');
        var trigger = container.querySelector('.dropdown-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */

function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
        var x = e.clientX || window.innerWidth / 2;
        var y = e.clientY || window.innerHeight / 2;
        var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        function toggle() {
            var isDark = document.documentElement.classList.toggle('dark');
            updateThemeIcons(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Dispatch event for canvas theme color syncing
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: isDark } }));
        }

        if (document.startViewTransition && window.innerWidth > 768) {
            var transition = document.startViewTransition(toggle);
            transition.ready.then(function() {
                document.documentElement.animate(
                    [
                        { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' },
                        { clipPath: 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)' }
                    ],
                    { 
                        duration: 500, 
                        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
                        pseudoElement: '::view-transition-new(root)'
                    }
                );
            });
        } else {
            toggle();
        }
    });
}

/* ============================================================
   CUSTOM CURSOR (Delegated Event Handlers)
   ============================================================ */

function initCursor() {
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    var ringX = mouseX, ringY = mouseY;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('mouseleave', function() {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function() {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
    });

    // Efficient Event Delegation instead of binding N DOM nodes
    var interactiveSelectors = 'a, button, .dropdown-trigger, article, .group, [onclick], input, textarea, .card-interactive';
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest(interactiveSelectors)) {
            dot.classList.add('hover');
            ring.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest(interactiveSelectors)) {
            dot.classList.remove('hover');
            ring.classList.remove('hover');
        }
    });

    function animate() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================================
   AMBIENT CANVAS (Dynamic CSS Var Sync)
   ============================================================ */

function initCanvas() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h;
    var mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    var particles = [];
    var MAX_PARTICLES = 35;
    
    // Dynamically retrieve accent color from CSS custom properties
    var particleColor = '196, 114, 90';
    function updateCanvasColor() {
        var style = getComputedStyle(document.documentElement);
        var accentHex = style.getPropertyValue('--accent').trim() || '#c4725a';
        // Parse HEX to RGB
        if (accentHex.startsWith('#')) {
            var hex = accentHex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(function(c) { return c + c; }).join('');
            var num = parseInt(hex, 16);
            particleColor = ((num >> 16) & 255) + ', ' + ((num >> 8) & 255) + ', ' + (num & 255);
        }
    }
    updateCanvasColor();
    window.addEventListener('themeChanged', updateCanvasColor);

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function(e) {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
    });

    document.addEventListener('mouseleave', function() {
        mouse.targetX = -1000;
        mouse.targetY = -1000;
    });

    for (var i = 0; i < MAX_PARTICLES; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            r: Math.random() * 2 + 1,
            a: Math.random() * 0.3 + 0.15,
            orbitAngle: Math.random() * Math.PI * 2,
            orbitSpeed: (Math.random() * 0.04 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
            orbitRadius: 55 + (Math.random() - 0.5) * 25,
            isOrbiting: false
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        if (mouse.targetX > 0) {
            mouse.x += (mouse.targetX - mouse.x) * 0.3;
            mouse.y += (mouse.targetY - mouse.y) * 0.3;
        }

        particles.forEach(function(p) {
            var dx = mouse.x - p.x;
            var dy = mouse.y - p.y;
            var dist = Math.hypot(dx, dy);

            if (mouse.x > 0 && dist < 500) {
                p.orbitAngle += p.orbitSpeed * 0.8;
                var targetX = mouse.x + Math.cos(p.orbitAngle) * p.orbitRadius;
                var targetY = mouse.y + Math.sin(p.orbitAngle) * p.orbitRadius;
                var dxOrbit = targetX - p.x;
                var dyOrbit = targetY - p.y;

                p.vx += dxOrbit * 0.03;
                p.vy += dyOrbit * 0.03;
                p.vx *= 0.82;
                p.vy *= 0.82;
                p.isOrbiting = true;
            } else {
                p.vx += (Math.random() - 0.5) * 0.12;
                p.vy += (Math.random() - 0.5) * 0.12;
                p.vx *= 0.93;
                p.vy *= 0.93;
                p.isOrbiting = false;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + particleColor + ', ' + (p.isOrbiting ? p.a * 1.2 : p.a * 0.6) + ')';
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    draw();
}

/* ============================================================
   MOBILE MENU
   ============================================================ */

function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function() {
        var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !isExpanded);
        menu.classList.toggle('hidden');
    });
}

/* ============================================================
   SCROLL REVEALS (Unified Single Observer)
   ============================================================ */

function initScrollReveals() {
    var elements = document.querySelectorAll('.reveal, .scroll-reveal');
    if (!('IntersectionObserver' in window)) {
        elements.forEach(function(el) { el.classList.add('visible', 'is-visible'); });
        return;
    }
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible', 'is-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    
    elements.forEach(function(el) { observer.observe(el); });
}

/* ============================================================
   CASE STUDIES MODAL
   ============================================================ */

function initCaseStudies() {
    var data = {
        'case-1': {
            title: 'Micron-Margin Crown Restoration System',
            tagline: 'Resolving fit discrepancy in zirconia restorations',
            disciplines: ['Dental Tech', 'Precision CAD/CAM'],
            problem_statement: 'Traditional digital scans often produce marginal gaps >60 micrometers.',
            multidisciplinary_inputs: ['Applied optical alignment principles', 'Calculated sintering shrinkage factor', 'Customized emergency profile contours'],
            methodology: ['Scan Audit', '3D CAD Sculpting', 'CAM Toolpath Mill', 'Micro-Fit Check'],
            key_outcomes: ['Achieved <20 micrometer marginal precision', 'Reduced seated adjustment time by 75%']
        },
        'case-2': {
            title: 'Zero-JS High Performance Portfolio Engine',
            tagline: '100/100 Lighthouse score with $0 hosting cost',
            disciplines: ['Web Architecture', 'Astro SSG'],
            problem_statement: 'Modern portfolio websites are burdened with heavy JS libraries.',
            multidisciplinary_inputs: ['Enforced static pre-rendering', 'Constructed multi-tonal dark red theme', 'Eliminated client-side frameworks'],
            methodology: ['Architecture Design', 'Token System', 'Static Build', 'Performance Test'],
            key_outcomes: ['100/100 Lighthouse performance', '$0 recurring hosting costs']
        },
        'case-3': {
            title: 'Secure Contact Ingestion & NFC Tap Pipeline',
            tagline: 'PostgreSQL RLS for instant contact card taps',
            disciplines: ['Data Systems', 'Supabase'],
            problem_statement: 'Handling contact submissions without exposing credentials.',
            multidisciplinary_inputs: ['Constructed strict RLS policies', 'Prevented SELECT/READ access', 'Integrated Zod schema validation'],
            methodology: ['Schema DDL Design', 'RLS Policy Creation', 'API Proxy Setup', 'Validation Audit'],
            key_outcomes: ['Zero exposed service keys', 'Instant ingestion (<120ms)']
        }
    };

    window.openCaseStudy = function(id) {
        var item = data[id];
        if (!item) return;
        var content = document.getElementById('modal-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-4 text-left">
                <div class="flex flex-wrap gap-2">${item.disciplines.map(function(d) {
                    return '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-950 text-brand-400 border border-brand-800/40">' + d + '</span>';
                }).join('')}</div>
                <h2 class="font-display text-2xl font-bold uppercase text-[var(--text-primary)]">${item.title}</h2>
                <p class="text-xs text-[var(--text-muted)] font-mono">${item.tagline}</p>
                <div class="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--bg-border)] space-y-2">
                    <span class="text-xs font-mono text-brand-400 font-semibold block uppercase">Problem Statement</span>
                    <p class="text-xs text-[var(--text-primary)] leading-relaxed">${item.problem_statement}</p>
                </div>
                <div class="space-y-2">
                    <span class="text-xs font-mono text-[var(--text-muted)] font-semibold uppercase block">Multidisciplinary Inputs</span>
                    <ul class="space-y-1 text-xs text-[var(--text-primary)] list-disc list-inside">${item.multidisciplinary_inputs.map(function(i) {
                        return '<li>' + i + '</li>';
                    }).join('')}</ul>
                </div>
                <div class="space-y-2">
                    <span class="text-xs font-mono text-[var(--text-muted)] font-semibold uppercase block">Methodology</span>
                    <div class="flex flex-wrap gap-2">${item.methodology.map(function(m) {
                        return '<span class="px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--bg-border)] text-[11px] font-mono text-[var(--text-primary)]">' + m + '</span>';
                    }).join('')}</div>
                </div>
                <div class="pt-4 border-t border-[var(--bg-border)] space-y-2">
                    <span class="text-xs font-mono text-emerald-400 font-semibold uppercase block">Key Outcomes</span>
                    <ul class="space-y-1 text-xs text-[var(--text-primary)]">${item.key_outcomes.map(function(o) {
                        return '<li class="flex items-center gap-2"><span class="text-emerald-400">✓</span> ' + o + '</li>';
                    }).join('')}</ul>
                </div>
            </div>
        `;
        var backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.classList.remove('hidden');
            setTimeout(function() { backdrop.classList.remove('opacity-0'); }, 10);
        }
    };

    window.closeModal = function() {
        var backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.classList.add('opacity-0');
            setTimeout(function() { backdrop.classList.add('hidden'); }, 300);
        }
    };

    var backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', function(e) {
            if (e.target === backdrop) window.closeModal();
        });
    }
}

/* ============================================================
   CONTACT FORM
   ============================================================ */

function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var inputs = form.querySelectorAll('input[required], textarea[required]');
    
    function validateField(input) {
        var group = input.closest('.form-group');
        var errorEl = group ? group.querySelector('.error-message') : null;
        var isValid = true;

        if (input.type === 'email') {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        } else if (input.tagName === 'TEXTAREA') {
            isValid = input.value.trim().length >= 10;
        } else {
            isValid = input.value.trim() !== '';
        }

        input.classList.toggle('error', !isValid);
        if (errorEl) errorEl.classList.toggle('show', !isValid);
        return isValid;
    }

    inputs.forEach(function(input) {
        input.addEventListener('blur', function() { validateField(input); });
        input.addEventListener('input', function() {
            if (input.classList.contains('error')) validateField(input);
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var allValid = Array.from(inputs).reduce(function(acc, input) {
            return validateField(input) && acc;
        }, true);

        if (!allValid) return;

        var btn = document.getElementById('submit-btn');
        var feedback = document.getElementById('form-feedback');
        if (!btn || !feedback) return;

        btn.disabled = true;
        var span = btn.querySelector('span');
        if (span) span.textContent = 'Transmitting...';

        setTimeout(function() {
            btn.disabled = false;
            if (span) span.textContent = 'Transmit Message';

            feedback.classList.remove('hidden');
            feedback.className = 'mt-4 p-4 rounded-lg border text-xs font-mono bg-emerald-950/60 border-emerald-800 text-emerald-300';
            feedback.innerHTML = `
                <div class="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span>Message submitted successfully! I'll get back to you shortly.</span>
                </div>
            `;
            form.reset();
        }, 1000);
    });
}

/* ============================================================
   SOFTWARE PROFICIENCY
   ============================================================ */

function initProficiency() {
    var container = document.getElementById('proficiency-container');
    if (!container) return;

    var items = container.querySelectorAll('.proficiency-item');
    var fills = container.querySelectorAll('.proficiency-fill');

    items.forEach(function(item, index) {
        var percent = parseInt(item.getAttribute('data-percent'), 10);
        if (fills[index]) fills[index].style.setProperty('--target-width', percent + '%');
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                container.classList.add('is-visible');
            }
        });
    }, { threshold: 0.2 });

    observer.observe(container);
}

/* ============================================================
   UTILITY & ACCESSIBILITY ENHANCEMENTS
   ============================================================ */

function initSectionHeaders() {
    document.querySelectorAll('section h2').forEach(function(el) {
        if (!el.closest('header') && !el.closest('footer')) {
            el.classList.add('section-header');
        }
    });
}

function initCardInteractions() {
    document.querySelectorAll('.project-card, .capability-card, .service-card').forEach(function(el) {
        if (!el.closest('header') && !el.closest('footer')) {
            el.classList.add('card-interactive');
        }
    });
}

function checkReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.scroll-reveal, .card-interactive').forEach(function(el) {
            el.style.transition = 'none';
            el.style.transform = 'none';
            el.style.opacity = '1';
        });
    }
}