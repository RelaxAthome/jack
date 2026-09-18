const cfg = SITE_CONFIG;
const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const waUrl = message => `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(message)}`;
const generalMessage = `Hello, I would like to book a professional home massage from ${cfg.businessName}.`;

document.getElementById('service-grid').innerHTML = cfg.services.map((service, i) => `<article class="service-card"><span class="service-icon">${service.icon}</span><h3>${service.name}</h3><p>${service.description}</p><span class="duration">60 / 90 / 120 MINUTES</span><a class="btn btn-primary service-book" href="#booking" data-service="${service.name}">Book Now <span>↗</span></a></article>`).join('');
document.getElementById('service-select').innerHTML = `<option value="">Select service</option>` + cfg.services.map(s => `<option>${s.name}</option>`).join('');
document.getElementById('price-grid').innerHTML = Object.entries(cfg.prices).map(([duration, price], i) => `<article class="price-card ${i === 1 ? 'featured' : ''}"><p>${i === 1 ? 'Most popular' : 'Wellness session'}</p><h3>${duration}</h3><div class="price">${money(price)}<small> / session</small></div><a class="btn ${i === 1 ? 'btn-accent' : 'btn-primary'} price-book" href="#booking" data-duration="${duration}">Book Now <span>↗</span></a></article>`).join('');
document.getElementById('areas-list').innerHTML = `<div class="area-pills">${cfg.serviceAreas.map(a => `<span>${a}</span>`).join('')}</div>`;
document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('[data-whatsapp]').forEach(el => { el.href = waUrl(generalMessage); el.target = '_blank'; el.rel = 'noopener'; });
const menu = document.getElementById('site-menu');
document.querySelector('.menu-toggle').addEventListener('click', e => { const open = menu.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
document.querySelectorAll('.service-book').forEach(a => a.addEventListener('click', () => { document.getElementById('service-select').value = a.dataset.service; }));
document.querySelectorAll('.price-book').forEach(a => a.addEventListener('click', () => { document.querySelector('[name="duration"]').value = a.dataset.duration; }));

document.getElementById('booking-form').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const date = data.get('date') ? new Date(`${data.get('date')}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const message = `Hello, I would like to book a professional home massage.\n\nName: ${data.get('name')}\nMobile: ${data.get('mobile')}\nGender: ${data.get('gender')}\nService: ${data.get('service')}\nDuration: ${data.get('duration')}\nDate: ${date}\nTime: ${data.get('time')}\nLocation: ${data.get('location')}\nTherapist Preference: ${data.get('therapist')}\nAdditional Instructions: ${data.get('instructions') || 'None'}`;
  window.open(waUrl(message), '_blank', 'noopener');
});

document.getElementById('business-schema').textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: cfg.businessName, description: cfg.tagline, telephone: cfg.phone, email: cfg.email, areaServed: cfg.serviceAreas, openingHours: cfg.businessHours, url: window.location.href, sameAs: [`https://wa.me/${cfg.whatsappNumber}`] });
