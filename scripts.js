const DISCORD_LINK = "https://discord.gg/ZSg4CrbEXR";

// Planes con precios numéricos para poder calcular descuentos
const planTypes = [
  { name: "BASIC", class: "basic", icon: "fa-circle", iconColor: "var(--neonBlue)", price: 5.99, users: "1 conexión", gaming: "COD/RDR/GTA friendly" },
  { name: "STANDARD", class: "standard", icon: "fa-star", iconColor: "var(--neonCyan)", price: 12.99, users: "Hasta 3", gaming: "Optimizado gaming" },
  { name: "PREMIUM", class: "premium", icon: "fa-gem", iconColor: "var(--neonPurple)", price: 19.99, users: "Hasta 6", gaming: "Máximo rendimiento" },
  { name: "DUAL", class: "dual", icon: "fa-globe", iconColor: "var(--neonPink)", price: 24.99, users: "Hasta 4", gaming: "Doble ubicación" }
];

const locations = [
  { id: "los-angeles", displayName: "LOS ANGELES", flag: "🇺🇸", description: "Costa Oeste USA - Ideal para gaming", ping: 45, comingSoon: false, host: "Akamai" },
  { id: "dallas", displayName: "DALLAS", flag: "🇺🇸", description: "Centro USA - Latencia ultra baja", ping: 35, comingSoon: false, host: "OVH" },
  { id: "miami", displayName: "MIAMI", flag: "🇺🇸", description: "Conectividad con Latinoamérica", ping: 60, comingSoon: true, host: "Akamai" },
  { id: "paris", displayName: "PARIS", flag: "🇫🇷", description: "Primera ubicación europea", ping: 90, comingSoon: true, host: "OVH" },
  { id: "new-york", displayName: "NEW YORK", flag: "🇺🇸", description: "Costa Este - Negocios", ping: 50, comingSoon: true, host: "Akamai" },
  { id: "chicago", displayName: "CHICAGO", flag: "🇺🇸", description: "Medio Oeste - Gaming", ping: 40, comingSoon: true, host: "OVH" }
];

let currentPeriod = 'monthly';
let selectedLocation = null;

// Función para obtener precio según período (precio mensual)
function getPriceForPeriod(basePrice, period) {
  const discounts = {
    monthly: 1,
    quarterly: 0.9,  // 10% descuento
    semesterly: 0.8,  // 20% descuento
    yearly: 0.7       // 30% descuento
  };
  return basePrice * (discounts[period] || 1);
}

// Función para obtener precio total del período (multiplicado por meses)
function getTotalPriceForPeriod(basePrice, period) {
  const multipliers = {
    monthly: 1,
    quarterly: 3,
    semesterly: 6,
    yearly: 12
  };
  const discounts = {
    monthly: 1,
    quarterly: 0.9,
    semesterly: 0.8,
    yearly: 0.7
  };
  return basePrice * multipliers[period] * discounts[period];
}

// Función para formatear precio con badge de descuento
function formatPrice(price, period, planName) {
  let formatted = '$' + price.toFixed(2);
  if (planName === 'DUAL' && period !== 'monthly') {
    formatted += ' <span class="dual-discount"><i class="fas fa-tag"></i> -20%</span>';
  }
  return formatted;
}

// 3D Animation
function init3DAnimation() {
  const canvas = document.getElementById('canvas-3d');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  for(let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1
    });
  }
  
  function animate3D() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const theme = document.body.dataset.theme;
    const color = theme === 'hacker' ? '#0f0' : theme === 'light' ? '#06f' : '#0ff';
    
    particles.forEach(p => {
      p.z -= p.speed;
      if(p.z <= 0) {
        p.z = 1000;
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      }
      
      const scale = 500 / p.z;
      const x2d = (p.x - canvas.width / 2) * scale + canvas.width / 2;
      const y2d = (p.y - canvas.height / 2) * scale + canvas.height / 2;
      
      ctx.beginPath();
      ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
    });
    
    requestAnimationFrame(animate3D);
  }
  
  animate3D();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Menu functions
function toggleMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('dashboardMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (hamburger && menu) {
    hamburger.classList.toggle('active');
    menu.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  }
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem('securenet-theme', theme);
  
  document.querySelectorAll('.theme-btn-dashboard').forEach(btn => {
    btn.classList.remove('active');
    if ((theme === 'dark' && btn.innerHTML.includes('moon')) ||
        (theme === 'light' && btn.innerHTML.includes('sun')) ||
        (theme === 'hacker' && btn.innerHTML.includes('code')) ||
        btn.textContent.toLowerCase().includes(theme)) {
      btn.classList.add('active');
    }
  });
}

// Función para cambiar período
function setPeriod(period, btn) {
  currentPeriod = period;
  
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  // Re-renderizar según la página
  if (document.getElementById("plans-container")) {
    renderPlans();
  }
  
  if (document.getElementById('location-plans-grid') && window.selectedLocation) {
    const l = locations.find(l => l.id === window.selectedLocation);
    if (l) renderLocationPlans(l);
  }
}

// Render locations grid
function renderLocationsGrid() {
  const grid = document.getElementById('locations-grid');
  if (!grid) return;
  
  grid.innerHTML = locations.map(l => `
    <div class="location-card ${window.selectedLocation === l.id ? 'selected' : ''}" onclick="selectLocation('${l.id}')">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
        <h3><i class="fas fa-map-pin"></i> ${l.flag} ${l.displayName}</h3>
        <span class="status-badge ${l.comingSoon ? 'status-soon' : 'status-available'}">
          <i class="fas ${l.comingSoon ? 'fa-clock' : 'fa-check-circle'}"></i>
          ${l.comingSoon ? 'PRÓXIMAMENTE' : 'DISPONIBLE'}
        </span>
      </div>
      <p style="color:var(--muted);margin-bottom:20px;"><i class="fas fa-info-circle"></i> ${l.description}</p>
      <div style="display:flex;align-items:center;gap:8px;">
        <span><i class="fas fa-signal"></i> ${l.ping}ms</span>
        <div style="flex:1;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;">
          <div style="width:${Math.min(100, 100 - l.ping/2)}%;height:100%;background:linear-gradient(90deg,var(--neonCyan),var(--neonBlue));border-radius:2px;"></div>
        </div>
      </div>
      <div style="margin-top:15px; font-size:12px; color:var(--muted);">
        <i class="fas fa-cloud"></i> Host: ${l.host}
      </div>
    </div>
  `).join('');
}

// Render plans para una ubicación específica
function renderLocationPlans(location) {
  const grid = document.getElementById('location-plans-grid');
  if (!grid) return;
  
  grid.innerHTML = planTypes.map(p => {
    const periodPrice = getPriceForPeriod(p.price, currentPeriod);
    const totalPrice = getTotalPriceForPeriod(p.price, currentPeriod);
    const formattedPrice = formatPrice(totalPrice, currentPeriod, p.name);
    
    return `
      <div class="plan-card ${p.class} ${p.name === 'STANDARD' ? 'recommended' : ''}">
        <div class="plan-header">
          <div class="plan-name"><i class="fas ${p.icon}" style="color:${p.iconColor};"></i> ${p.name}</div>
          <div class="plan-price price-${currentPeriod}">${formattedPrice}</div>
        </div>
        <div class="plan-features">
          <div class="feature-item"><i class="fas fa-users"></i><div><div>Usuarios</div><small>${p.users}</small></div></div>
          <div class="feature-item"><i class="fas fa-map-pin"></i><div><div>Ubicación</div><small>${location.displayName}</small></div></div>
          <div class="feature-item"><i class="fas fa-shield-virus"></i><div><div>Protección</div><small>Anti-DDoS</small></div></div>
          <div class="feature-item"><i class="fas fa-gamepad"></i><div><div>Gaming</div><small>${p.gaming}</small></div></div>
          <div class="feature-item"><i class="fas fa-cloud"></i><div><div>Infraestructura</div><small>${location.host}</small></div></div>
        </div>
        ${!location.comingSoon 
          ? `<a href="${DISCORD_LINK}" target="_blank" class="plan-button"><i class="fas fa-shopping-cart"></i> COMPRAR ${p.name}</a>`
          : `<button class="plan-button" disabled><i class="fas fa-clock"></i> PRÓXIMAMENTE</button>`}
      </div>
    `;
  }).join('');
}

// Función para seleccionar ubicación
function selectLocation(id) {
  window.selectedLocation = id;
  const location = locations.find(l => l.id === id);
  
  const selectedPlans = document.getElementById('selected-location-plans');
  const locationName = document.getElementById('selected-location-name');
  
  if (selectedPlans && locationName) {
    selectedPlans.style.display = 'block';
    locationName.innerHTML = `<i class="fas fa-map-pin"></i> ${location.flag} ${location.displayName}`;
    renderLocationPlans(location);
  }
  
  renderLocationsGrid();
}

// Función para limpiar ubicación seleccionada
function clearSelectedLocation() {
  window.selectedLocation = null;
  const selectedPlans = document.getElementById('selected-location-plans');
  if (selectedPlans) selectedPlans.style.display = 'none';
  renderLocationsGrid();
}

// Render all plans (para plans.html)
function renderPlans() {
  const container = document.getElementById("plans-container");
  if (!container) return;

  container.innerHTML = locations.map(loc => `
    <div style="margin:50px 0 20px;">
      <h2 style="color:var(--neonCyan);font-size:28px; display:flex; align-items:center; gap:10px;">
        <i class="fas fa-map-pin"></i> ${loc.flag} ${loc.displayName}
      </h2>
      <p style="color:var(--muted);"><i class="fas fa-info-circle"></i> ${loc.description}</p>
      <p style="color:var(--muted); font-size:12px; margin-top:5px;"><i class="fas fa-cloud"></i> Host: ${loc.host}</p>
    </div>

    <div class="plans-grid">
      ${planTypes.map(plan => {
        const periodPrice = getPriceForPeriod(plan.price, currentPeriod);
        const totalPrice = getTotalPriceForPeriod(plan.price, currentPeriod);
        const formattedPrice = formatPrice(totalPrice, currentPeriod, plan.name);
        
        return `
          <div class="plan-card ${plan.class} ${plan.name === 'STANDARD' ? 'recommended' : ''}">
            <div class="plan-header">
              <div class="plan-name"><i class="fas ${plan.icon}" style="color:${plan.iconColor};"></i> ${plan.name}</div>
              <div class="plan-price price-${currentPeriod}">${formattedPrice}</div>
            </div>
            <div class="plan-features">
              <div class="feature-item"><i class="fas fa-users"></i><div><div>Usuarios</div><small>${plan.users}</small></div></div>
              <div class="feature-item"><i class="fas fa-map-pin"></i><div><div>Ubicación</div><small>${loc.displayName}</small></div></div>
              <div class="feature-item"><i class="fas fa-shield-virus"></i><div><div>Protección</div><small>Anti-DDoS</small></div></div>
              <div class="feature-item"><i class="fas fa-gamepad"></i><div><div>Gaming</div><small>${plan.gaming}</small></div></div>
              <div class="feature-item"><i class="fas fa-cloud"></i><div><div>Infraestructura</div><small>${loc.host}</small></div></div>
            </div>
            ${!loc.comingSoon 
              ? `<a href="${DISCORD_LINK}" target="_blank" class="plan-button"><i class="fas fa-shopping-cart"></i> COMPRAR ${plan.name}</a>`
              : `<button class="plan-button" disabled><i class="fas fa-clock"></i> PRÓXIMAMENTE</button>`}
          </div>
        `;
      }).join("")}
    </div>
  `).join("");
}

// Toast functions
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  const toastSpan = toast.querySelector('span');
  if (toastSpan) {
    toastSpan.textContent = message;
  } else {
    toast.textContent = message;
  }
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyUsername(username) {
  navigator.clipboard.writeText(username).then(() => showToast(`Copiado: ${username}`));
}

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar animación 3D
  init3DAnimation();
  
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('securenet-theme') || 'dark';
  document.body.dataset.theme = savedTheme;
  
  // Actualizar botones de tema
  document.querySelectorAll('.theme-btn-dashboard').forEach(btn => {
    btn.classList.remove('active');
    if ((savedTheme === 'dark' && btn.innerHTML.includes('moon')) ||
        (savedTheme === 'light' && btn.innerHTML.includes('sun')) ||
        (savedTheme === 'hacker' && btn.innerHTML.includes('code')) ||
        btn.textContent.toLowerCase().includes(savedTheme)) {
      btn.classList.add('active');
    }
  });

  // Renderizar según la página actual
  if (document.getElementById("plans-container")) {
    renderPlans();
  }
  
  if (document.getElementById('locations-grid')) {
    renderLocationsGrid();
  }
  
  // Hacer funciones globales
  window.toggleMenu = toggleMenu;
  window.setTheme = setTheme;
  window.copyUsername = copyUsername;
  window.setPeriod = setPeriod;
  window.selectLocation = selectLocation;
  window.clearSelectedLocation = clearSelectedLocation;
  window.renderPlans = renderPlans;
  
  // Cerrar menú con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('dashboardMenu')?.classList.contains('open')) {
      toggleMenu();
    }
  });
});