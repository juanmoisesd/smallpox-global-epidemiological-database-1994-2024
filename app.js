let filteredData = [];
let chartsInstances = {};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    filteredData = [...epidemiologicalData];
    initializeMap();
    updateStatistics();
    renderTable();
    renderCharts();
});

// Cambiar de tab
function showTab(tabName) {
    // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
  });

  // Remover clase active de botones
  document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
  });

  // Mostrar tab seleccionado y activar botón
  const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
          selectedTab.classList.add('active');
    }

  event.target.classList.add('active');

  // Redibujar gráficos si es necesario
  if (tabName === 'overview') {
        setTimeout(() => chartsInstances.trendsChart?.resize(), 100);
  } else if (tabName === 'top10') {
        setTimeout(() => chartsInstances.top10Chart?.resize(), 100);
  }
}

// Aplicar filtros
function applyFilters() {
    const country = document.getElementById('countryFilter').value.toLowerCase();
    const yearStart = parseInt(document.getElementById('yearStart').value) || 1994;
    const yearEnd = parseInt(document.getElementById('yearEnd').value) || 2024;
    const virusType = document.getElementById('virusType').value;

  filteredData = epidemiologicalData.filter(record => {
        let matches = true;

                                                if (country && !record.country.toLowerCase().includes(country)) {
                                                        matches = false;
                                                }
        if (record.year < yearStart || record.year > yearEnd) {
                matches = false;
        }
        if (virusType && record.virus_type !== virusType) {
                matches = false;
        }

                                                return matches;
  });

  updateStatistics();
    renderTable();
    renderCharts();
}

// Restablecer filtros
function resetFilters() {
    document.getElementById('countryFilter').value = '';
    document.getElementById('yearStart').value = 1994;
    document.getElementById('yearEnd').value = 2024;
    document.getElementById('virusType').value = '';

  filteredData = [...epidemiologicalData];
    updateStatistics();
    renderTable();
    renderCharts();
}

// Exportar datos a CSV
function exportData() {
    let csv = 'País,Año,Casos,Tipo de Virus,Región\n';

  filteredData.forEach(record => {
        const row = [
                record.country,
                record.year,
                record.cases,
                record.virus_type,
                record.region
              ];
        csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smallpox-data-' + new Date().getTime() + '.csv';
    link.click();
}

// Actualizar estadísticas
function updateStatistics() {
    const totalCases = filteredData.reduce((sum, record) => sum + record.cases, 0);
    const uniqueCountries = new Set(filteredData.map(r => r.country)).size;
    const avgCases = uniqueCountries > 0 ? Math.round(totalCases / uniqueCountries) : 0;

  document.getElementById('totalCases').textContent = totalCases.toLocaleString();
    document.getElementById('totalCountries').textContent = uniqueCountries;
    document.getElementById('avgCasesPerCountry').textContent = avgCases.toLocaleString();
}

// Renderizar tabla
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

  if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">No hay datos que coincidan con los filtros</td></tr>';
        return;
  }

  filteredData.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.cases - a.cases;
  }).forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
              <td><strong>${record.country}</strong></td>
                    <td>${record.year}</td>
                          <td><span style="background: #667eea; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 600;">${record.cases}</span></td>
                                <td>${record.virus_type === 'variola_major' ? '🦠 Variola Major' : '🦠 Variola Minor'}</td>
                                      <td>${record.region}</td>
                                          `;
        tbody.appendChild(row);
  });
}

// Renderizar gráficos
function renderCharts() {
    renderTrendsChart();
    renderTop10Chart();
}

function renderTrendsChart() {
    const years = [...new Set(filteredData.map(r => r.year))].sort();
    const countries = [...new Set(filteredData.map(r => r.country))];

  const datasets = countries.slice(0, 5).map((country, idx) => {
        const countryData = years.map(year => {
                const record = filteredData.find(r => r.country === country && r.year === year);
                return record ? record.cases : 0;
        });

                                                 const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
        return {
                label: country,
                data: countryData,
                borderColor: colors[idx % colors.length],
                backgroundColor: colors[idx % colors.length] + '20',
                borderWidth: 3,
                tension: 0.4,
                fill: false
        };
  });

  const ctx = document.getElementById('trendsChart');

  if (chartsInstances.trendsChart) {
        chartsInstances.trendsChart.destroy();
  }

  chartsInstances.trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
                labels: years,
                datasets: datasets
        },
        options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                          legend: {
                                      display: true,
                                      position: 'top'
                          }
                },
                scales: {
                          y: {
                                      beginAtZero: true,
                                      title: {
                                                    display: true,
                                                    text: 'Número de Casos'
                                      }
                          }
                }
        }
  });
}

function renderTop10Chart() {
    // Agrupar por país
  const countryStats = {};
    filteredData.forEach(record => {
          if (!countryStats[record.country]) {
                  countryStats[record.country] = 0;
          }
          countryStats[record.country] += record.cases;
    });

  // Obtener top 10
  const sorted = Object.entries(countryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

  const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);

  const ctx = document.getElementById('top10Chart');

  if (chartsInstances.top10Chart) {
        chartsInstances.top10Chart.destroy();
  }

  chartsInstances.top10Chart = new Chart(ctx, {
        type: 'bar',
        data: {
                labels: labels,
                datasets: [{
                          label: 'Total de Casos',
                          data: data,
                          backgroundColor: [
                                      '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
                                      '#43e97b', '#fa709a', '#30b0fe', '#ffa751', '#ffd89b'
                                    ]
                }]
        },
        options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                          legend: {
                                      display: false
                          }
                },
                scales: {
                          x: {
                                      beginAtZero: true
                          }
                }
        }
  });
}

// Mapa interactivo
let map;
function initializeMap() {
    map = L.map('map').setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
  }).addTo(map);

  // Agregar marcadores
  updateMapMarkers();

  // Redibujar cuando cambia tab
  setTimeout(() => map.invalidateSize(), 100);
}

function updateMapMarkers() {
    // Limpiar marcadores previos
  map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
                map.removeLayer(layer);
        }
  });

  // Agrupar casos por país
  const countryCases = {};
    filteredData.forEach(record => {
          if (!countryCases[record.country]) {
                  countryCases[record.country] = 0;
          }
          countryCases[record.country] += record.cases;
    });

  // Agregar nuevos marcadores
  Object.entries(countryCases).forEach(([country, cases]) => {
        const coords = countryCoordinates[country];
        if (coords) {
                const intensity = Math.min(cases / 1000, 1);
                const color = intensity > 0.7 ? '#e74c3c' : intensity > 0.4 ? '#f39c12' : '#3498db';
                const radius = 10 + (intensity * 30);

          L.circleMarker([coords.lat, coords.lng], {
                    radius: radius,
                    fillColor: color,
                    color: '#000',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7
          }).addTo(map).bindPopup(`
                  <strong>${country}</strong><br>
                          Casos: ${cases}<br>
                                  Intensidad: ${(intensity * 100).toFixed(0)}%
                                        `);
        }
  });
}
