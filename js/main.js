/* ============================================================
   THEME PERSISTENCE - Store and load theme from localStorage
   ============================================================ */

(function initThemePersistence() {
    // Check if user has a saved theme preference
    var savedTheme = localStorage.getItem('theme');
    var isDark = document.documentElement.classList.contains('dark');
    
    // If there's a saved theme, apply it
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } else {
        // If no saved theme, use system preference
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    // Update icons based on current theme
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

/**************************************************************************/
/* ============================================================
   PAGE TRANSITIONS - Full Screen Color Wipe
   ============================================================ */

(function initPageTransitions() {
    var transitionEl = document.getElementById('page-transition');
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    var isTransitioning = false;

    // Function to navigate with transition
    window.navigateTo = function(url, transitionType) {
        if (isTransitioning || url === currentPath) return;
        isTransitioning = true;

        var type = transitionType || 'wipe-up';

        if (transitionEl) {
            // Reset and set the transition type
            transitionEl.className = '';
            transitionEl.style.display = 'block'; // Make visible
            // Force reflow
            void transitionEl.offsetWidth;
            transitionEl.classList.add(type);
            transitionEl.classList.add('active');
        }

        setTimeout(function() {
            window.location.href = url;
        }, 600);
    };

    // Handle page load - complete transition
    window.addEventListener('pageshow', function() {
        if (transitionEl) {
            transitionEl.classList.remove('active');
            transitionEl.className = '';
            transitionEl.style.display = 'none'; // Hide after transition
        }
        isTransitioning = false;
    });

    // Also handle when page first loads
    if (transitionEl) {
        transitionEl.style.display = 'none';
    }

    // Intercept all navigation clicks
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href) return;

        // Skip if external link, anchor, or javascript:
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) return;

        // Skip if it's the same page
        var targetPath = href.split('/').pop() || 'index.html';
        if (targetPath === currentPath) return;

        // Skip if it's a download or mailto
        if (href.includes('.pdf') || href.includes('.zip') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        e.preventDefault();

        // Determine transition direction
        var isBack = href.includes('index.html') && currentPath.includes('graphic-design');
        var type = isBack ? 'wipe-down' : 'wipe-up';

        // Navigate with transition
        navigateTo(href, type);
    });
})();


/* ============================================================
   LOADING SCREEN WITH CUSTOM SVG ICONS
   ============================================================ */
(function() {
    var loadingScreen = document.getElementById('loading-screen');
    var fillBar = document.getElementById('loading-fill');
    var iconImg = document.getElementById('loading-icon-img');
    var iconContainer = document.getElementById('loading-icon');
    
    if (!loadingScreen || !iconImg) return;
    
    // ============================================================
    // ICON SET - SVG files in sequence
    // ============================================================
    var iconFiles = [
        'assets/tooth-svgrepo-com.svg',      // 1. Dental
        'assets/design-svgrepo-com.svg',     // 2. Graphic Design
        'assets/code-tech-dev-svgrepo-com.svg', // 3. Web/Code
        'assets/camera-svgrepo-com.svg',     // 4. Video/Photography
        'assets/tools-svgrepo-com.svg'       // 5. Multidisciplinary Tools
    ];
    
    var currentIconIndex = 0;
    var progress = 0;
    var duration = 2000; // 2 seconds total
    var interval = 20;
    var steps = duration / interval;
    var increment = 100 / steps;
    var iconChangeInterval = duration / iconFiles.length; // Change every ~400ms
    
    // Set initial icon
    function setIcon(index) {
        var iconPath = iconFiles[index % iconFiles.length];
        iconImg.src = iconPath;
        // Add pulse animation
        iconContainer.classList.remove('pulse');
        // Force reflow
        void iconContainer.offsetWidth;
        iconContainer.classList.add('pulse');
    }
    
    // Set first icon
    setIcon(0);
    
    // Icon cycling timer
    var lastIconChange = Date.now();
    
    function updateProgress() {
        progress = Math.min(progress + increment, 100);
        if (fillBar) {
            fillBar.style.width = progress + '%';
        }
        
        // Change icon at intervals
        var now = Date.now();
        if (now - lastIconChange > iconChangeInterval && progress < 100) {
            currentIconIndex++;
            setIcon(currentIconIndex);
            lastIconChange = now;
        }
        
        if (progress < 100) {
            setTimeout(updateProgress, interval);
        } else {
            // Set final icon (tools) and hide
            setIcon(iconFiles.length - 1);
            setTimeout(function() {
                loadingScreen.classList.add('hide');
            }, 300);
        }
    }
    
    // Start after a tiny delay
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
    initScrollReveals();
    initMobileMenu();
    initCaseStudies();
    initContactForm();
    initDropdown();
    console.log('✅ All features initialized');
});

// ============================================================
// DROPDOWN TOGGLE
// ============================================================
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

// ============================================================
// THEME TOGGLE - Now saves to localStorage
// ============================================================
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
            
            // Save theme preference to localStorage
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

// ============================================================
// CUSTOM CURSOR
// ============================================================
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

    // Show custom cursor
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

    // Navigation elements - show default cursor
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
        // When hovering nav, hide custom cursor
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

    // Interactive elements - show custom cursor hover effect
    var interactiveElements = document.querySelectorAll('article, .group, [onclick]');
    interactiveElements.forEach(function(el) {
        // Skip if inside header
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
    
    // Make sure nav elements show default cursor
    navElements.forEach(function(el) {
        el.style.cursor = 'pointer';
    });
}

// ============================================================
// ENHANCED AMBIENT CANVAS
// ============================================================
function initCanvas() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var w, h;
    var mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000 };
    var mouseTrail = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function(e) {
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        mouseTrail.push({ x: mouse.x, y: mouse.y, life: 1 });
        if (mouseTrail.length > 20) {
            mouseTrail.shift();
        }
    });

    var particles = [];
    for (var i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.8 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            a: Math.random() * 0.5 + 0.1,
            baseX: Math.random() * window.innerWidth,
            baseY: Math.random() * window.innerHeight,
            phase: Math.random() * Math.PI * 2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        var isDark = document.documentElement.classList.contains('dark');

        if (mouse.x > 0 && mouse.y > 0) {
            var speed = Math.hypot(mouse.x - mouse.prevX, mouse.y - mouse.prevY);
            var glowRadius = 250 + Math.min(speed * 2, 150);

            var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius);
            grad.addColorStop(0, isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)');
            grad.addColorStop(0.5, isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }

        mouseTrail.forEach(function(t, index) {
            t.life -= 0.03;
            if (t.life > 0) {
                var size = 3 * t.life;
                ctx.beginPath();
                ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
                ctx.fillStyle = isDark ?
                    'rgba(239, 68, 68, ' + (0.15 * t.life) + ')' :
                    'rgba(239, 68, 68, ' + (0.1 * t.life) + ')';
                ctx.fill();
            }
        });

        mouseTrail = mouseTrail.filter(function(t) { return t.life > 0; });

        particles.forEach(function(p) {
            p.x += p.vx;
            p.y += p.vy;

            if (mouse.x > 0 && mouse.y > 0) {
                var dx = mouse.x - p.x;
                var dy = mouse.y - p.y;
                var dist = Math.hypot(dx, dy);

                if (dist < 200) {
                    var force = (1 - dist / 200) * 0.15;
                    p.x += dx * force;
                    p.y += dy * force;
                }

                if (dist < 30) {
                    var repel = (1 - dist / 30) * 0.5;
                    p.x -= dx * repel;
                    p.y -= dy * repel;
                }
            }

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            var alpha = p.a * (0.7 + 0.3 * Math.sin(Date.now() / 2000 + p.phase));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

            var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
            glow.addColorStop(0, isDark ?
                'rgba(239, 68, 68, ' + alpha + ')' :
                'rgba(239, 68, 68, ' + (alpha * 0.7) + ')');
            glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = glow;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = isDark ?
                'rgba(239, 68, 68, ' + (alpha * 1.2) + ')' :
                'rgba(239, 68, 68, ' + (alpha * 0.8) + ')';
            ctx.fill();

            particles.forEach(function(p2) {
                if (p === p2) return;
                var dx2 = p.x - p2.x;
                var dy2 = p.y - p2.y;
                var dist2 = Math.hypot(dx2, dy2);
                if (dist2 < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    var lineAlpha = (1 - dist2 / 120) * 0.15 * (isDark ? 1 : 0.7);
                    ctx.strokeStyle = 'rgba(239, 68, 68, ' + lineAlpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// ============================================================
// SCROLL REVEALS
// ============================================================
function initScrollReveals() {
    var elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        elements.forEach(function(el) { el.classList.add('visible'); });
        return;
    }
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    elements.forEach(function(el) { observer.observe(el); });
}

// ============================================================
// MOBILE MENU
// ============================================================
function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function() { menu.classList.toggle('hidden'); });
}

// ============================================================
// CASE STUDIES
// ============================================================
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

// ============================================================
// CONTACT FORM
// ============================================================
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
   SOFTWARE PROFICIENCY - Scroll Triggered Bars
   ============================================================ */

(function initProficiency() {
    var container = document.getElementById('proficiency-container');
    if (!container) return;

    // Get all proficiency items and set their target widths
    var items = container.querySelectorAll('.proficiency-item');
    var fills = container.querySelectorAll('.proficiency-fill');

    // Set CSS custom property for each fill
    items.forEach(function(item, index) {
        var percent = parseInt(item.getAttribute('data-percent'), 10);
        var fill = fills[index];
        if (fill) {
            fill.style.setProperty('--target-width', percent + '%');
        }
    });

    // Use IntersectionObserver to trigger animation
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                container.classList.add('is-visible');
                
                // Update aria-valuenow for accessibility
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

    // Also trigger if already visible on load
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
   MICRO-INTERACTIONS & SCROLL TYPOGRAPHY FX
   ============================================================ */

// ============================================================
// 1. TYPOGRAPHY SCROLL REVEAL
// ============================================================

(function initScrollRevealsEnhanced() {
    // Target all major headings and section kickers
    var targets = document.querySelectorAll(
        'h1, h2, h3, ' +
        '.section-header, ' +
        '.page-kicker, ' +
        '.section-kicker, ' +
        '.hero-title, ' +
        '.section-title, ' +
        '.card-title, ' +
        '.stat-title, ' +
        '.philosophy-quote, ' +
        '.mindset-title, ' +
        '.contact-title'
    );

    // Filter out elements that are already hidden or in the header
    var filteredTargets = [];
    targets.forEach(function(el) {
        // Skip if inside header or footer
        if (el.closest('header') || el.closest('footer')) return;
        // Skip if already has scroll-reveal class
        if (el.classList.contains('scroll-reveal')) return;
        filteredTargets.push(el);
    });

    // Add scroll-reveal class to filtered elements
    filteredTargets.forEach(function(el, index) {
        el.classList.add('scroll-reveal');
        // Add staggered delay (up to 6 levels)
        var delayClass = 'scroll-reveal-delay-' + ((index % 6) + 1);
        el.classList.add(delayClass);
    });

    // Use IntersectionObserver
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
        // Fallback: reveal all immediately
        document.querySelectorAll('.scroll-reveal').forEach(function(el) {
            el.classList.add('is-visible');
        });
    }
})();


// ============================================================
// 2. SECTION HEADER HOVER - Add class for targeting
// ============================================================

// This adds the section-header class to appropriate elements
(function initSectionHeaders() {
    var headers = document.querySelectorAll(
        'section h2, ' +
        'section .font-display.text-3xl, ' +
        'section .font-display.text-4xl, ' +
        '.section-title, ' +
        '.mindset-title, ' +
        '.contact-title'
    );

    headers.forEach(function(el) {
        // Skip if inside header/footer
        if (el.closest('header') || el.closest('footer')) return;
        // Skip if already has class
        if (el.classList.contains('section-header')) return;
        el.classList.add('section-header');
    });
})();


// ============================================================
// 3. CARD INTERACTIVE - Add hover effects to existing cards
// ============================================================

(function initCardInteractions() {
    // Target project cards and capability cards
    var cards = document.querySelectorAll(
        '.project-card, ' +
        '.capability-card, ' +
        '.proficiency-item, ' +
        '.service-card, ' +
        '.specialization-card, ' +
        '.pipeline-step, ' +
        '.grid > .p-6, ' +
        '.grid > .p-8, ' +
        '.grid > article'
    );

    cards.forEach(function(el) {
        // Skip if inside header/footer
        if (el.closest('header') || el.closest('footer')) return;
        // Skip if already has class
        if (el.classList.contains('card-interactive')) return;
        el.classList.add('card-interactive');
    });
})();


// ============================================================
// 4. REDUCED MOTION - Check and respect user preference
// ============================================================

(function checkReducedMotion() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
        // Remove all animation classes if user prefers reduced motion
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
    
    // Listen for changes in motion preference
    prefersReducedMotion.addEventListener('change', function(e) {
        if (e.matches) {
            // User prefers reduced motion - disable animations
            document.querySelectorAll('.scroll-reveal').forEach(function(el) {
                el.classList.remove('scroll-reveal');
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'none';
            });
        } else {
            // User prefers motion - re-enable (will need page refresh to re-init observers)
            location.reload();
        }
    });
})();