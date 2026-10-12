// Premium frontend script — builds the UI from SITE_CONFIG and handles booking
const cfg = SITE_CONFIG;
const money = n => `₹${Number(n).toLocaleString('en-IN')}`;
const waUrl = message => `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(message)}`;
const generalMessage = `Hello, I would like to book a professional home massage from ${cfg.businessName}.`;

// Populate services
const serviceGrid = document.getElementById('service-grid');
if (serviceGrid) {
  serviceGrid.innerHTML = cfg.services.map((service, i) => `
    <article class="service-card">
      <div class="service-img" aria-hidden="true"></div>
      <h3>${service.name}</h3>
      <p class="service-desc">${service.description}</p>
      <div class="service-meta"><span class="service-duration">—</span></div>
    </article>
  `).join('');
}

// Populate service select
const serviceSelect = document.getElementById('service-select');
if (serviceSelect) {
  serviceSelect.innerHTML = `<option value="">Select service</option>` + cfg.services.map((s,i) => `<option value="${s.name}">${s.name}</option>`).join('');
}

// Populate prices
const priceGrid = document.getElementById('price-grid');
if (priceGrid) {
  priceGrid.innerHTML = Object.entries(cfg.prices).map(([duration, price], i) => `
    <article class="price-card ${i === 1 ? 'featured': ''}">
      <p class="price-duration">${duration}</p>
      <p class="price-amount">${money(price)}</p>
      <button class="btn price-book" data-duration="${duration}">Book</button>
    </article>
  `).join('');
}

// Areas list
const areasList = document.getElementById('areas-list');
if (areasList) areasList.innerHTML = `<div class="area-pills">${cfg.serviceAreas.map(a => `<span>${a}</span>`).join('')}</div>`;

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Floating WhatsApp links
document.querySelectorAll('[data-whatsapp]').forEach(el => { el.href = waUrl(generalMessage); el.target = '_blank'; el.rel = 'noopener'; });
const waBtn = document.getElementById('wa-book-now');
if (waBtn) { waBtn.href = waUrl(generalMessage); waBtn.target = '_blank'; waBtn.rel = 'noopener'; }

// Mobile menu
const menu = document.getElementById('site-menu');
document.querySelector('.menu-toggle')?.addEventListener('click', e => { const open = menu.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', open); });
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Booking form handling — saves to Supabase then shows confirmation; WhatsApp remains available as fallback
const bookingForm = document.getElementById('booking-form');
const statusEl = document.getElementById('booking-status');
if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('mobile').value.trim();
    const service = document.getElementById('service-select').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const notes = document.getElementById('notes').value.trim();

    if (!name || !phone || !service || !date || !time) {
      statusEl.textContent = 'Please complete all required fields.';
      return;
    }

    // basic phone validation
    if (phone.replace(/\D/g,'').length < 10) {
      statusEl.textContent = 'Please enter a valid mobile number.';
      return;
    }

    const btn = bookingForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    // Construct message for WhatsApp (kept as fallback)
    const waMessage = `Hello, I would like to book a ${service} on ${date} at ${time}.\n\nName: ${name}\nMobile: ${phone}\nNotes: ${notes}`;

    // Try to save to Supabase (uses existing supabase-client.js which defines window.supabaseClient)
    try {
      if (!window.supabaseClient) throw new Error('Supabase client not available');

      const payload = {
        name,
        phone,
        service,
        preferred_date: date,
        preferred_time: time,
        notes,
      };

      const { data, error } = await window.supabaseClient.from('appointment_inquiries').insert([payload]).select();
      if (error) {
        console.warn('Supabase insert error:', error);
        statusEl.textContent = 'Could not save booking to server. Please try using WhatsApp to book.';
        // provide WA fallback (open in new tab)
        // Do not auto-open — show link
        const waLink = document.createElement('a');
        waLink.href = waUrl(waMessage);
        waLink.className = 'btn btn-ghost';
        waLink.target = '_blank';
        waLink.rel = 'noopener';
        waLink.textContent = 'Book on WhatsApp';
        statusEl.appendChild(document.createElement('br'));
        statusEl.appendChild(waLink);
        btn.disabled = false;
        btn.textContent = 'Confirm booking';
        return;
      }

      // Success — show confirmation and optionally a WA share button
      statusEl.innerHTML = `Thank you — your booking request has been received. We will confirm shortly.`;
      const waShare = document.createElement('a');
      waShare.href = waUrl(waMessage);
      waShare.className = 'btn btn-ghost';
      waShare.target = '_blank';
      waShare.rel = 'noopener';
      waShare.textContent = 'Share on WhatsApp';
      statusEl.appendChild(document.createElement('div'));
      statusEl.appendChild(waShare);

      bookingForm.reset();
    } catch (err) {
      console.error('Booking error:', err);
      statusEl.textContent = 'An unexpected error occurred. Please try booking via WhatsApp.';
      const waLink = document.createElement('a');
      waLink.href = waUrl(waMessage);
      waLink.className = 'btn btn-ghost';
      waLink.target = '_blank';
      waLink.rel = 'noopener';
      waLink.textContent = 'Book on WhatsApp';
      statusEl.appendChild(document.createElement('br'));
      statusEl.appendChild(waLink);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirm booking';
    }
  });
}
