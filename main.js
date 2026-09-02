/* ============================================================
   THEME PERSISTENCE
   ============================================================ */

(function initThemePersistence() {
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    var sun = document.getElementById('theme-icon-sun');
    var moon = document.getElementById('theme-icon-moon');
    var isDarkNow = document.documentElement.classList.contains('dark');
    if (sun && moon) {
        if (isDarkNow) {
            sun.classList.add('hidden');
            moon.classList.remove('hidden');
        } else {
            sun.classList.remove('hidden');
            moon.classList.add('hidden');
        }
    }
})();


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
            void transitionEl.offsetWidth;
            transitionEl.classList.add(type);
            transitionEl.classList.add('active');
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
   LOADING SCREEN
   ============================================================ */

(function() {
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
    var interval = 20;
    var steps = duration / interval;
    var increment = 100 / steps;
    var iconChangeInterval = duration / iconFiles.length;
    
    function setIcon(index) {
        var iconPath = iconFiles[index % iconFiles.length];
        iconImg.src = iconPath;
        iconContainer.classList.remove('pulse');
        void iconContainer.offsetWidth;
        iconContainer.classList.add('pulse');
    }
    
    setIcon(0);
    var lastIconChange = Date.now();
    
    function updateProgress() {
        progress = Math.min(progress + increment, 100);
        if (fillBar) {
            fillBar.style.width = progress + '%';
        }
        
        var now = Date.now();
        if (now - lastIconChange > iconChangeInterval && progress < 100) {
            currentIconIndex++;
            setIcon(currentIconIndex);
            lastIconChange = now;
        }
        
        if (progress < 100) {
            setTimeout(updateProgress, interval);
        } else {
            setIcon(iconFiles.length - 1);
            setTimeout(function() {
                loadingScreen.classList.add('hide');
                setTimeout(function() {
                    if (typeof initScrollReveals === 'function') {
                        initScrollReveals();
                    }
                }, 300);
            }, 300);
        }
    }
    
    setTimeout(updateProgress, 100);
})();


/* ============================================================
   MAIN APPLICATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing...');
    initThemeToggle();
    initCursor();
    initCanvas();
    initMobileMenu();
    initCaseStudies();
    initContactForm();
    initDropdown();
    
    // Safely trigger scroll reveals if the loading screen isn't present to delay it
    if (!document.getElementById('loading-screen')) {
        initScrollReveals();
    }
    
    console.log('✅ All features initialized');
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
        }
    });
}

function toggleDropdown(event) {
    event.stopPropagation();
    var container = document.getElementById('services-dropdown');
    if (container) {
        container.classList.toggle('open');
    }
}


/* ============================================================
   THEME TOGGLE
   ============================================================ */

function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
        var isDark = document.documentElement.classList.contains('dark');
        var x = e.clientX || window.innerWidth / 2;
        var y = e.clientY || window.innerHeight / 2;
        var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        function toggle() {
            var dark = document.documentElement.classList.toggle('dark');
            var sun = document.getElementById('theme-icon-sun');
            var moon = document.getElementById('theme-icon-moon');
            if (sun) sun.classList.toggle('hidden', dark);
            if (moon) moon.classList.toggle('hidden', !dark);
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        }

        if (document.startViewTransition) {
            var transition = document.startViewTransition(toggle);
            transition.ready.then(function() {
                document.documentElement.animate(
                    [{ clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)' }],
                    { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
                );
            });
        } else {
            toggle();
        }
    });
}


/* ============================================================
   CUSTOM CURSOR
   ============================================================ */

function initCursor() {
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    var isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) {
        dot.style.display = 'none';
        ring.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    dot.style.display = 'block';
    ring.style.display = 'block';
    dot.style.opacity = '1';
    ring.style.opacity = '1';

    var mouseX = window.innerWidth / 2,
        mouseY = window.innerHeight / 2;
    var ringX = mouseX,
        ringY = mouseY;

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

    var navElements = document.querySelectorAll(
        '.glass-header a, ' +
        '.glass-header button, ' +
        '.glass-header .dropdown-trigger, ' +
        '.glass-header .dropdown-menu a, ' +
        '.glass-header #menu-toggle, ' +
        'nav a, ' +
        'nav button'
    );
    
    navElements.forEach(function(el) {
        el.style.cursor = 'pointer';
        el.addEventListener('mouseenter', function() {
            dot.style.display = 'none';
            ring.style.display = 'none';
        });
        el.addEventListener('mouseleave', function() {
            dot.style.display = 'block';
            ring.style.display = 'block';
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
    });

    var interactiveElements = document.querySelectorAll('article, .group, [onclick]');
    interactiveElements.forEach(function(el) {
        if (el.closest('.glass-header')) return;
        
        el.addEventListener('mouseenter', function() {
            dot.classList.add('hover');
            ring.classList.add('hover');
        });
        el.addEventListener('mouseleave', function() {
            dot.classList.remove('hover');
            ring.classList.remove('hover');
        });
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
    document.body.style.cursor = 'none';
    
    navElements.forEach(function(el) {
        el.style.cursor = 'pointer';
    });
}


/* ============================================================
   AMBIENT CANVAS
   ============================================================ */

function initCanvas() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h;
    var mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    var particles = [];
    var isDark = document.documentElement.classList.contains('dark');

    var ORBIT_RADIUS = 55;
    var ATTRACTION_STRENGTH = 0.25;
    var DISPERSION_STRENGTH = 0.08;
    var MAX_PARTICLES = 40;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function(e) {
        mouse.targetX = e.clientX;
        mouse.targetY = e.clientY;
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
    });

    document.addEventListener('mouseleave', function() {
        mouse.targetX = -1000;
        mouse.targetY = -1000;
    });

    for (var i = 0; i < MAX_PARTICLES; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            r: Math.random() * 2 + 1,
            a: Math.random() * 0.3 + 0.15,
            orbitAngle: Math.random() * Math.PI * 2,
            orbitSpeed: (Math.random() * 0.04 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
            orbitRadius: ORBIT_RADIUS + (Math.random() - 0.5) * 25,
            isOrbiting: false
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        if (mouse.targetX > 0 && mouse.targetY > 0) {
            mouse.x += (mouse.targetX - mouse.x) * 0.3;
            mouse.y += (mouse.targetY - mouse.y) * 0.3;
        }

        var isDarkNow = document.documentElement.classList.contains('dark');
        if (isDarkNow !== isDark) {
            isDark = isDarkNow;
        }

        if (mouse.x > 0 && mouse.y > 0) {
            var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
            grad.addColorStop(0, isDark ? 'rgba(239, 68, 68, 0.04)' : 'rgba(239, 68, 68, 0.03)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }

        particles.forEach(function(p) {
            var dx = mouse.x - p.x;
            var dy = mouse.y - p.y;
            var dist = Math.hypot(dx, dy);

            if (mouse.x > 0 && mouse.y > 0 && dist < 500) {
                p.orbitAngle += p.orbitSpeed * 0.8;
                var targetX = mouse.x + Math.cos(p.orbitAngle) * p.orbitRadius;
                var targetY = mouse.y + Math.sin(p.orbitAngle) * p.orbitRadius;

                var dxOrbit = targetX - p.x;
                var dyOrbit = targetY - p.y;
                var distOrbit = Math.hypot(dxOrbit, dyOrbit);

                if (distOrbit > 0.5) {
                    var force = Math.min(ATTRACTION_STRENGTH, 1 / (distOrbit + 1));
                    p.vx += dxOrbit * force * 0.12;
                    p.vy += dyOrbit * force * 0.12;
                }

                p.vx *= 0.82;
                p.vy *= 0.82;
                p.x += p.vx;
                p.y += p.vy;
                p.isOrbiting = true;

            } else {
                if (mouse.x > 0 && mouse.y > 0 && dist < 300) {
                    var repelForce = (1 - dist / 300) * DISPERSION_STRENGTH;
                    p.vx -= dx * repelForce * 0.2;
                    p.vy -= dy * repelForce * 0.2;
                }

                p.vx += (Math.random() - 0.5) * 0.12;
                p.vy += (Math.random() - 0.5) * 0.12;
                p.vx *= 0.93;
                p.vy *= 0.93;
                p.x += p.vx;
                p.y += p.vy;
                p.isOrbiting = false;
            }

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            var alpha = p.isOrbiting ? p.a * 1.2 : p.a * 0.6;
            ctx.fillStyle = 'rgba(239, 68, 68, ' + alpha + ')';
            ctx.fill();
        });

        var orbitingParticles = particles.filter(function(p) { return p.isOrbiting; });

        for (var i = 0; i < orbitingParticles.length; i++) {
            for (var j = i + 1; j < orbitingParticles.length; j++) {
                var p1 = orbitingParticles[i];
                var p2 = orbitingParticles[j];
                var dx2 = p1.x - p2.x;
                var dy2 = p1.y - p2.y;
                var dist2 = Math.hypot(dx2, dy2);
                
                if (dist2 < 80) {
                    var lineAlpha = (1 - dist2 / 80) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(239, 68, 68, ' + lineAlpha + ')';
                    ctx.lineWidth = 0.7;
                    ctx.stroke();

                    for (var k = j + 1; k < orbitingParticles.length; k++) {
                        var p3 = orbitingParticles[k];
                        var dx3 = p1.x - p3.x;
                        var dy3 = p1.y - p3.y;
                        var dist3 = Math.hypot(dx3, dy3);
                        var dx32 = p2.x - p3.x;
                        var dy32 = p2.y - p3.y;
                        var dist32 = Math.hypot(dx32, dy32);

                        if (dist3 < 80 && dist32 < 80) {
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p3.x, p3.y);
                            ctx.strokeStyle = 'rgba(239, 68, 68, ' + (lineAlpha * 0.6) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(p2.x, p2.y);
                            ctx.lineTo(p3.x, p3.y);
                            ctx.strokeStyle = 'rgba(239, 68, 68, ' + (lineAlpha * 0.6) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.lineTo(p3.x, p3.y);
                            ctx.closePath();
                            var fillAlpha = (1 - Math.max(dist2, dist3, dist32) / 80) * 0.04;
                            ctx.fillStyle = 'rgba(239, 68, 68, ' + fillAlpha + ')';
                            ctx.fill();
                        }
                    }
                }
            }
        }

        requestAnimationFrame(draw);
    }

    draw();

    var themeObserver = new MutationObserver(function() {
        isDark = document.documentElement.classList.contains('dark');
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}


/* ============================================================
   MOBILE MENU
   ============================================================ */

function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function() { menu.classList.toggle('hidden'); });
}


/* ============================================================
   SCROLL REVEALS
   ============================================================ */

function initScrollReveals() {
    var elements = document.querySelectorAll('.reveal');
    
    var loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hide')) {
        setTimeout(initScrollReveals, 200);
        return;
    }
    
    if (!('IntersectionObserver' in window)) {
        elements.forEach(function(el) { el.classList.add('visible'); });
        return;
    }
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    
    elements.forEach(function(el) { observer.observe(el); });
}


/* ============================================================
   CASE STUDIES
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
            <div class="space-y-4">
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
    inputs.forEach(function(input) {
        input.addEventListener('blur', function() {
            validateField(input);
        });
        input.addEventListener('input', function() {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });

    function validateField(input) {
        var group = input.closest('.form-group');
        if (!group) return;

        var errorEl = group.querySelector('.error-message');
        var isValid = true;

        if (input.type === 'email') {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = input.value.trim() !== '' && emailRegex.test(input.value.trim());
        } else if (input.tagName === 'TEXTAREA') {
            isValid = input.value.trim().length >= 10;
        } else {
            isValid = input.value.trim() !== '';
        }

        if (!isValid) {
            input.classList.add('error');
            if (errorEl) errorEl.classList.add('show');
        } else {
            input.classList.remove('error');
            if (errorEl) errorEl.classList.remove('show');
        }

        return isValid;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var allValid = true;
        inputs.forEach(function(input) {
            if (!validateField(input)) {
                allValid = false;
                if (allValid === false && !document.querySelector('.error:focus')) {
                    input.focus();
                }
            }
        });

        if (!allValid) return;

        var btn = document.getElementById('submit-btn');
        var feedback = document.getElementById('form-feedback');
        if (!btn || !feedback) return;

        btn.disabled = true;
        btn.classList.add('opacity-70');
        var span = btn.querySelector('span');
        if (span) span.textContent = 'Transmitting...';

        setTimeout(function() {
            btn.disabled = false;
            btn.classList.remove('opacity-70');
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
            inputs.forEach(function(input) {
                input.classList.remove('error');
                var group = input.closest('.form-group');
                if (group) {
                    var errorEl = group.querySelector('.error-message');
                    if (errorEl) errorEl.classList.remove('show');
                }
            });
        }, 1000);
    });
}


/* ============================================================
   SOFTWARE PROFICIENCY
   ============================================================ */

(function initProficiency() {
    var container = document.getElementById('proficiency-container');
    if (!container) return;

    var items = container.querySelectorAll('.proficiency-item');
    var fills = container.querySelectorAll('.proficiency-fill');

    items.forEach(function(item, index) {
        var percent = parseInt(item.getAttribute('data-percent'), 10);
        var fill = fills[index];
        if (fill) {
            fill.style.setProperty('--target-width', percent + '%');
        }
    });

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                container.classList.add('is-visible');
                
                var fills2 = container.querySelectorAll('.proficiency-fill');
                var items2 = container.querySelectorAll('.proficiency-item');
                fills2.forEach(function(fill, idx) {
                    var percent = parseInt(items2[idx].getAttribute('data-percent'), 10);
                    fill.setAttribute('aria-valuenow', percent);
                });
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(container);

    if (container.getBoundingClientRect().top < window.innerHeight) {
        container.classList.add('is-visible');
        var fills3 = container.querySelectorAll('.proficiency-fill');
        var items3 = container.querySelectorAll('.proficiency-item');
        fills3.forEach(function(fill, idx) {
            var percent = parseInt(items3[idx].getAttribute('data-percent'), 10);
            fill.setAttribute('aria-valuenow', percent);
        });
    }
})();


/* ============================================================
   SCROLL REVEALS ENHANCED
   ============================================================ */

(function initScrollRevealsEnhanced() {
    var targets = document.querySelectorAll(
        'h1, h2, h3, .section-header, .page-kicker, .section-kicker, .hero-title, .section-title'
    );

    var filteredTargets = [];
    targets.forEach(function(el) {
        if (el.closest('header') || el.closest('footer')) return;
        if (el.classList.contains('scroll-reveal')) return;
        filteredTargets.push(el);
    });

    filteredTargets.forEach(function(el, index) {
        el.classList.add('scroll-reveal');
        var delayClass = 'scroll-reveal-delay-' + ((index % 6) + 1);
        el.classList.add(delayClass);
    });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        var revealElements = document.querySelectorAll('.scroll-reveal');
        revealElements.forEach(function(el) {
            observer.observe(el);
        });
    } else {
        document.querySelectorAll('.scroll-reveal').forEach(function(el) {
            el.classList.add('is-visible');
        });
    }
})();


/* ============================================================
   SECTION HEADERS
   ============================================================ */

(function initSectionHeaders() {
    var headers = document.querySelectorAll(
        'section h2, section .font-display.text-3xl, section .font-display.text-4xl'
    );

    headers.forEach(function(el) {
        if (el.closest('header') || el.closest('footer')) return;
        if (el.classList.contains('section-header')) return;
        el.classList.add('section-header');
    });
})();


/* ============================================================
   CARD INTERACTIVE
   ============================================================ */

(function initCardInteractions() {
    var cards = document.querySelectorAll(
        '.project-card, .capability-card, .proficiency-item, .service-card, .specialization-card'
    );

    cards.forEach(function(el) {
        if (el.closest('header') || el.closest('footer')) return;
        if (el.classList.contains('card-interactive')) return;
        el.classList.add('card-interactive');
    });
})();


/* ============================================================
   REDUCED MOTION
   ============================================================ */

(function checkReducedMotion() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        document.querySelectorAll('.scroll-reveal').forEach(function(el) {
            el.classList.remove('scroll-reveal');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.transition = 'none';
        });
        
        document.querySelectorAll('.card-interactive').forEach(function(el) {
            el.style.transform = 'none';
            el.style.transition = 'none';
        });
    }
    
    prefersReducedMotion.addEventListener('change', function(e) {
        if (e.matches) {
            document.querySelectorAll('.scroll-reveal').forEach(function(el) {
                el.classList.remove('scroll-reveal');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'none';
            });
        } else {
            location.reload();
        }
    });
})();