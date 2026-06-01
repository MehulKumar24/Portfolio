// Portfolio interactive enhancements
(function () {
    'use strict';

    // Scrollspy: highlight menu links based on section in view
    function initScrollSpy() {
        const links = Array.from(document.querySelectorAll('.menu a'));
        const sections = links
            .map(l => document.querySelector(l.getAttribute('href')))
            .filter(Boolean);

        if (!sections.length) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = links.find(l => l.getAttribute('href') === `#${id}`);
                if (!link) return;
                if (entry.isIntersecting) {
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        }, { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0.15 });

        sections.forEach(s => obs.observe(s));
    }

    // Project cards: open modal with project details
    function initProjectModal() {
        const cards = document.querySelectorAll('.project-card');
        if (!cards.length) return;

        function createModal(title, html) {
            const overlay = document.createElement('div');
            overlay.className = 'pk-modal-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(2,8,18,0.7);z-index:9999;padding:20px;';

            const panel = document.createElement('div');
            panel.className = 'pk-modal-panel';
            panel.style.cssText = 'max-width:900px;width:100%;background:linear-gradient(180deg,rgba(18,28,45,0.98),rgba(12,18,30,0.98));border-radius:14px;padding:20px;border:1px solid rgba(207,166,106,0.12);color:var(--text-100);box-shadow:0 20px 60px rgba(0,0,0,0.6);';

            const h = document.createElement('h3');
            h.textContent = title;
            h.style.marginTop = '0';

            const body = document.createElement('div');
            body.className = 'pk-modal-body';
            body.innerHTML = html;
            body.style.margin = '12px 0';

            const close = document.createElement('button');
            close.type = 'button';
            close.textContent = 'Close';
            close.className = 'btn';

            close.addEventListener('click', () => document.body.removeChild(overlay));

            overlay.addEventListener('click', (ev) => {
                if (ev.target === overlay) document.body.removeChild(overlay);
            });

            document.addEventListener('keydown', function onKey(e) {
                if (e.key === 'Escape' && document.body.contains(overlay)) {
                    document.removeEventListener('keydown', onKey);
                    if (document.body.contains(overlay)) document.body.removeChild(overlay);
                }
            });

            panel.appendChild(h);
            panel.appendChild(body);
            panel.appendChild(close);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            close.focus();
        }

        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // avoid triggering when clicking links inside card
                if (e.target.closest('a')) return;
                const titleEl = card.querySelector('h3');
                const title = titleEl ? titleEl.textContent.trim() : 'Project';
                const content = card.innerHTML;
                createModal(title, content);
            });
        });
    }

    // Feedback form: save to localStorage and show success state
    function initFeedbackForm() {
        const form = document.querySelector('.feedback-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const rating = form.rating.value;
            const message = form.message.value.trim();

            // basic email check
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!name || !emailOk || !rating || !message) {
                showToast('Please complete the form with a valid email.');
                return;
            }

            const entry = { name, email, rating, message, date: new Date().toISOString() };
            try {
                const key = 'portfolio_feedback_entries_v1';
                const existing = JSON.parse(localStorage.getItem(key) || '[]');
                existing.push(entry);
                localStorage.setItem(key, JSON.stringify(existing));
                form.reset();
                showToast('Thanks — your feedback was saved locally.');
            } catch (err) {
                showToast('Unable to save feedback locally.');
                console.error(err);
            }
        });

        function showToast(text) {
            const t = document.createElement('div');
            t.className = 'pk-toast';
            t.textContent = text;
            t.style.cssText = 'position:fixed;right:20px;bottom:20px;background:linear-gradient(90deg,#222,rgba(18,28,45,0.96));color:#fff;padding:12px 16px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.4);z-index:9999;font-weight:700;';
            document.body.appendChild(t);
            setTimeout(() => t.style.opacity = '1', 20);
            setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 3500);
        }
    }

    // Initialize all features on DOM ready
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(() => {
        initScrollSpy();
        initProjectModal();
        initFeedbackForm();
        initNavToggle();
    });

    // Mobile nav toggle
    function initNavToggle() {
        const btn = document.querySelector('.nav-toggle');
        const nav = document.getElementById('primary-nav');
        if (!btn || !nav) return;

        function setOpen(open) {
            document.body.classList.toggle('nav-open', open);
            btn.setAttribute('aria-expanded', String(Boolean(open)));
            if (open) btn.setAttribute('aria-label', 'Close navigation');
            else btn.setAttribute('aria-label', 'Open navigation');
        }

        btn.addEventListener('click', () => {
            setOpen(!document.body.classList.contains('nav-open'));
            if (document.body.classList.contains('nav-open')) {
                // focus first link
                const first = nav.querySelector('a');
                if (first) first.focus();
            }
        });

        // close when a link is clicked
        nav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') setOpen(false);
        });

        // close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
                setOpen(false);
            }
        });
    }

})();
