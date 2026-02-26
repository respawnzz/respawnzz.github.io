const DISCORD_LINK = "https://discord.gg/ZSg4CrbEXR";

// Planes con precios numéricos para poder calcular descuentos
const planTypes = [
  { name: "BASIC", class: "basic", icon: "fa-circle", iconColor: "var(--neonBlue)", price: 5.99, users: "1 conexión", gaming: "COD/RDR/GTA friendly" },
  { name: "STANDARD", class: "standard", icon: "fa-star", iconColor: "var(--neonCyan)", price: 12.99, users: "Hasta 3", gaming: "Optimizado gaming" },
  { name: "PREMIUM", class: "premium", icon: "fa-gem", iconColor: "var(--neonPurple)", price: 19.99, users: "Hasta 6", gaming: "Máximo rendimiento" },
  { name: "DUAL", class: "dual", icon: "fa-globe", iconColor: "var(--neonPink)", price: 24.99, users: "Hasta 4", gaming: "Doble ubicación" }
];

const locations = [
  { id: "los-angeles", displayName: "LOS ANGELES", flag: "🇺🇸", description: "Costa Oeste USA - Ideal para gaming", ping: 45, comingSoon: false },
  { id: "dallas", displayName: "DALLAS", flag: "🇺🇸", description: "Centro USA - Latencia ultra baja", ping: 35, comingSoon: false },
  { id: "miami", displayName: "MIAMI", flag: "🇺🇸", description: "Conectividad con Latinoamérica", ping: 60, comingSoon: true },
  { id: "paris", displayName: "PARIS", flag: "🇫🇷", description: "Primera ubicación europea", ping: 90, comingSoon: true },
  { id: "new-york", displayName: "NEW YORK", flag: "🇺🇸", description: "Costa Este - Negocios", ping: 50, comingSoon: true },
  { id: "chicago", displayName: "CHICAGO", flag: "🇺🇸", description: "Medio Oeste - Gaming", ping: 40, comingSoon: true }
];

// Variable global para el período actual
let currentPeriod = 'monthly';

// Función para obtener precio según período
function getPriceForPeriod(basePrice, period) {
  const prices = {
    monthly: basePrice,
    quarterly: basePrice * 0.9,  // 10% descuento
    semesterly: basePrice * 0.8,  // 20% descuento
    yearly: basePrice * 0.7       // 30% descuento
  };
  return prices[period] || basePrice;
}

// Función para formatear precio
function formatPrice(price, period, planName) {
  let formatted = '$' + price.toFixed(2);
  
  // Añadir badge de 20% para DUAL en períodos no mensuales
  if (planName === 'DUAL' && period !== 'monthly') {
    formatted += ' <span class="dual-discount"><i class="fas fa-tag"></i> -20%</span>';
  }
  
  return formatted;
}

// 3D Animation
const canvas = document.getElementById('canvas-3d');
if (canvas) {
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
  if (hamburger && menu) {
    hamburger.classList.toggle('active');
    menu.classList.toggle('open');
  }
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem('securenet-theme', theme);
  
  document.querySelectorAll('.theme-btn-dashboard').forEach(btn => {
    btn.classList.remove('active');
    // Detectar por icono también
    if ((theme === 'dark' && btn.innerHTML.includes('moon')) ||
        (theme === 'light' && btn.innerHTML.includes('sun')) ||
        (theme === 'hacker' && btn.innerHTML.includes('code')) ||
        btn.textContent.toLowerCase().includes(theme)) {
      btn.classList.add('active');
    }
  });
}

// Función para cambiar período (para usar desde HTML)
function setPeriod(period, btn) {
  currentPeriod = period;
  
  // Actualizar botones activos
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  // Re-renderizar planes si existen
  const plansContainer = document.getElementById("plans-container");
  if (plansContainer) renderPlans();
  
  const locationPlansGrid = document.getElementById('location-plans-grid');
  if (locationPlansGrid && window.selectedLocation) {
    // Si hay una ubicación seleccionada, actualizar sus planes
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
    </div>
  `).join('');
}

// Render plans para una ubicación específica
function renderLocationPlans(location) {
  const grid = document.getElementById('location-plans-grid');
  if (!grid) return;
  
  grid.innerHTML = planTypes.map(p => {
    const periodPrice = getPriceForPeriod(p.price, currentPeriod);
    const formattedPrice = formatPrice(periodPrice, currentPeriod, p.name);
    
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
        </div>
        ${!location.comingSoon 
          ? `<a href="${DISCORD_LINK}" target="_blank" class="plan-button"><i class="fas fa-shopping-cart"></i> COMPRAR ${p.name}</a>`
          : `<button class="plan-button" disabled><i class="fas fa-clock"></i> PRÓXIMAMENTE</button>`}
      </div>
    `;
  }).join('');
}

// Función para seleccionar ubicación (para pages/locations.html)
function selectLocation(id) {
  window.selectedLocation = id;
  const location = locations.find(l => l.id === id);
  
  const selectedPlans = document.getElementById('selected-location-plans');
  const locationName = document.getElementById('selected-location-name');
  const plansGrid = document.getElementById('location-plans-grid');
  
  if (selectedPlans && locationName && plansGrid) {
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
    </div>

    <div class="plans-grid">
      ${planTypes.map(plan => {
        const periodPrice = getPriceForPeriod(plan.price, currentPeriod);
        const formattedPrice = formatPrice(periodPrice, currentPeriod, plan.name);
        
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

// Copy username function
function copyUsername(username) {
  navigator.clipboard.writeText(username).then(() => showToast(`Copiado: ${username}`));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  // Si el toast tiene estructura con icono y span
  const toastSpan = toast.querySelector('span');
  if (toastSpan) {
    toastSpan.textContent = message;
  } else {
    toast.textContent = message;
  }
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
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
});