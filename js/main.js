// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
	const open = links.classList.toggle('open');
	toggle.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
	links.classList.remove('open');
	toggle.setAttribute('aria-expanded', false);
}));

// Highlight the nav link for the section in view
const navLinks = [...links.querySelectorAll('a')];
const observer = new IntersectionObserver(entries => {
	entries.forEach(entry => {
		if (!entry.isIntersecting) return;
		navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
	});
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(s => observer.observe(s));

// Typing effect
const words = ['networks', 'servers', 'systems', 'SOC labs'];
const typed = document.getElementById('typed');
let wordIndex = 0, charIndex = words[0].length, deleting = true;
function type() {
	const word = words[wordIndex];
	charIndex += deleting ? -1 : 1;
	typed.textContent = word.slice(0, charIndex);
	let delay = deleting ? 50 : 90;
	if (!deleting && charIndex === word.length) { deleting = true; delay = 1800; }
	else if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 300; }
	setTimeout(type, delay);
}
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(type, 1800);

document.getElementById('year').textContent = new Date().getFullYear();
