let all_asteroids = [];
let filtered_asteroids = [];
let hazard_chart = null;
let timeline_chart = null;
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetch_data();
    init_modal_listeners();
});

async function fetch_data() {
    const res = await fetch('/api/asteroids');
    all_asteroids = await res.json();
    filtered_asteroids = [...all_asteroids];
    update_dashboard(all_asteroids);
}

function init_modal_listeners() {
    const modal = document.getElementById('search-modal');
    const openBtn = document.getElementById('open-search-modal');
    const closeBtn = document.getElementById('close-modal');
    const searchInput = document.getElementById('search-name');
    const filterHazard = document.getElementById('filter-hazard');
    const filterSentry = document.getElementById('filter-sentry');
    const filterDateFrom = document.getElementById('filter-date-from');
    const filterDateTo = document.getElementById('filter-date-to');
    const resetBtn = document.getElementById('reset-filters');
    const clearDatesBtn = document.getElementById('clear-dates');

    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        render_asteroids(filtered_asteroids);
    });

    closeBtn.addEventListener('click', () => {
        close_modal(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            close_modal(modal);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            close_modal(modal);
        }
    });

    searchInput.addEventListener('input', debounced_apply_filters);
    filterHazard.addEventListener('change', apply_filters);
    filterSentry.addEventListener('change', apply_filters);
    filterDateFrom.addEventListener('change', apply_filters);
    filterDateTo.addEventListener('change', apply_filters);
    
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterHazard.value = '';
        filterSentry.value = '';
        filterDateFrom.value = '';
        filterDateTo.value = '';
        apply_filters();
    });

    clearDatesBtn.addEventListener('click', () => {
        filterDateFrom.value = '';
        filterDateTo.value = '';
        apply_filters();
    });
}

function close_modal(modal) {
    modal.classList.add('closing');
    setTimeout(() => {
        modal.classList.remove('active', 'closing');
        document.body.style.overflow = '';
    }, 300);
}

function debounced_apply_filters() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        apply_filters();
    }, 300);
}

function apply_filters() {
    const search_term = document.getElementById('search-name').value.toLowerCase();
    const hazard_filter = document.getElementById('filter-hazard').value;
    const sentry_filter = document.getElementById('filter-sentry').value;
    const date_from = document.getElementById('filter-date-from').value;
    const date_to = document.getElementById('filter-date-to').value;

    filtered_asteroids = all_asteroids.filter(asteroid => {
        if (search_term && !asteroid.name.toLowerCase().includes(search_term)) {
            return false;
        }
        if (hazard_filter === 'hazardous' && !asteroid.is_potentially_hazardous) {
            return false;
        }
        if (hazard_filter === 'safe' && asteroid.is_potentially_hazardous) {
            return false;
        }
        if (sentry_filter === 'sentry' && !asteroid.is_sentry_object) {
            return false;
        }
        if (sentry_filter === 'non-sentry' && asteroid.is_sentry_object) {
            return false;
        }

        const asteroidDate = asteroid.close_approach_date ? asteroid.close_approach_date.split('T')[0] : '';
        if (date_from && asteroidDate < date_from) {
            return false;
        }
        if (date_to && asteroidDate > date_to) {
            return false;
        }

        return true;
    }); 

    render_asteroids(filtered_asteroids);
}

function render_asteroids(asteroids) {
    const container = document.getElementById('asteroids-list');
    
    if (asteroids.length === 0) {
        container.innerHTML = '<div class="no-results"><i class="bi bi-search"></i><br>No asteroids found matching your criteria</div>';
        return;
    }

    const uniqueAsteroids = {};
    asteroids.forEach(a => {
        const key = `${a.id}_${a.close_approach_date}`;
        if (!uniqueAsteroids[key]) {
            uniqueAsteroids[key] = a;
        }
    });

    const uniqueList = Object.values(uniqueAsteroids);

    container.innerHTML = uniqueList.map((asteroid, index) => {
        const animation_delay = index < 30 ? `animation-delay: ${index * 0.05}s` : '';
        const diameter_min = asteroid.estimated_diameter_min_m ? parseFloat(asteroid.estimated_diameter_min_m).toFixed(1) : 'N/A';
        const diameter_max = asteroid.estimated_diameter_max_m ? parseFloat(asteroid.estimated_diameter_max_m).toFixed(1) : 'N/A';
        const velocity = asteroid.relative_velocity_kmh ? parseFloat(asteroid.relative_velocity_kmh).toLocaleString() : 'N/A';
        const miss_distance = asteroid.miss_distance_km ? parseFloat(asteroid.miss_distance_km).toLocaleString() : 'N/A';
        const magnitude = asteroid.absolute_magnitude_h ? parseFloat(asteroid.absolute_magnitude_h).toFixed(2) : 'N/A';
        
        let approach_date = 'N/A';
        if (asteroid.close_approach_date) {
            const dateStr = asteroid.close_approach_date.split('T')[0];
            const [year, month, day] = dateStr.split('-');
            approach_date = `${day}/${month}/${year}`;
        }
        
        const hazard_badge = asteroid.is_potentially_hazardous 
            ? '<span class="badge-hazard badge-hazardous">Hazardous</span>'
            : '<span class="badge-hazard badge-safe">Safe</span>';
        
        const sentry_badge = asteroid.is_sentry_object 
            ? '<span class="badge-hazard badge-sentry">Sentry Object</span>'
            : '';

        return `
            <div class="asteroid-card" style="${animation_delay}">
                <h4>${asteroid.name}</h4>
                <div class="mb-2">
                    ${hazard_badge}
                    ${sentry_badge}
                </div>
                <div class="asteroid-info">
                    <div class="info-row">
                        <span class="info-value"><i class="bi bi-calendar3"></i> ${approach_date}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Diameter:</span>
                        <span class="info-value">${diameter_min} - ${diameter_max} m</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Velocity:</span>
                        <span class="info-value">${velocity} km/h</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Miss Distance:</span>
                        <span class="info-value">${miss_distance} km</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Magnitude (H):</span>
                        <span class="info-value">${magnitude}</span>
                    </div>
                </div>
                ${asteroid.nasa_jpl_url ? `
                    <a href="${asteroid.nasa_jpl_url}" target="_blank" class="nasa-link">
                        <i class="bi bi-box-arrow-up-right"></i>
                        View more details in NASA JPL Database
                    </a>
                ` : ''}
            </div>
        `;
    }).join('');
}


function update_dashboard(data) {
    update_statistics(data);
    draw_hazard_chart(data);
    draw_timeline_chart(data);
}

function update_statistics(data) {
    const sentry = data.filter(a => a.is_sentry_object).length;
    document.getElementById('stat-sentry').textContent = sentry;
    
    const magnitudes = data.filter(a => a.absolute_magnitude_h);
    const avg_magnitude = magnitudes.reduce((sum, a) => sum + parseFloat(a.absolute_magnitude_h), 0) / magnitudes.length;
    document.getElementById('stat-magnitude').textContent = avg_magnitude.toFixed(1);
    
    const dates = data.map(a => new Date(a.close_approach_date));
    const min_date = new Date(Math.min(...dates));
    const max_date = new Date(Math.max(...dates));
    const diff = Math.ceil((max_date - min_date) / (1000 * 60 * 60 * 24));
    document.getElementById('stat-days').textContent = diff;
}

function draw_hazard_chart(data) {
    const hazardous = data.filter(a => a.is_potentially_hazardous).length;
    const safe = data.length - hazardous;
    
    const hazardousPercent = ((hazardous / data.length) * 100).toFixed(1);
    const safePercent = ((safe / data.length) * 100).toFixed(1);

    const options = {
        series: [hazardous, safe],
        labels: [`Potentially Hazardous (${hazardousPercent}%)`, `Non-Hazardous (${safePercent}%)`],
        chart: { 
            type: 'donut', 
            height: 320, 
            foreColor: '#a8b2d1', 
            background: 'transparent',
            fontFamily: 'inherit'
        },
        theme: { mode: 'dark' },
        colors: ['#dc3545', '#20c997'],
        dataLabels: { 
            enabled: true,
            style: {
                fontSize: '14px',
                fontWeight: 'bold'
            }
        },
        legend: {
            position: 'bottom',
            fontSize: '13px'
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Asteroids',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#a8b2d1',
                            formatter: function () {
                                return data.length;
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + ' asteroids';
                }
            }
        }
    };

    if (hazard_chart) hazard_chart.destroy();
    hazard_chart = new ApexCharts(document.querySelector("#chart-donut"), options);
    hazard_chart.render();
}

function draw_timeline_chart(data) {
    const dateGroups = {};
    
    data.forEach(a => {
        const date = a.close_approach_date;
        if (!dateGroups[date]) {
            dateGroups[date] = { total: 0, hazardous: 0 };
        }
        dateGroups[date].total++;
        if (a.is_potentially_hazardous) {
            dateGroups[date].hazardous++;
        }
    });
    const sortedDates = Object.keys(dateGroups).sort();
    
    const totalData = sortedDates.map(date => ({
        x: new Date(date).getTime(),
        y: dateGroups[date].total
    }));
    
    const hazardousData = sortedDates.map(date => ({
        x: new Date(date).getTime(),
        y: dateGroups[date].hazardous
    }));

    const options = {
        series: [
            {
                name: 'Total Approaches',
                data: totalData
            },
            {
                name: 'Hazardous',
                data: hazardousData
            }
        ],
        chart: {
            type: 'area',
            height: 320,
            foreColor: '#a8b2d1',
            background: 'transparent',
            toolbar: { show: false },
            fontFamily: 'inherit',
            zoom: { enabled: false }
        },
        theme: { mode: 'dark' },
        colors: ['#0d6efd', '#dc3545'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.6,
                opacityTo: 0.1,
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM yyyy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            }
        },
        yaxis: {
            title: {
                text: 'Number of Approaches',
                style: { fontSize: '12px' }
            },
            labels: {
                formatter: function(val) {
                    return Math.floor(val);
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '13px'
        },
        grid: {
            borderColor: '#3a3f5c',
            strokeDashArray: 3
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
            }
        }
    };

    if (timeline_chart) timeline_chart.destroy();
    timeline_chart = new ApexCharts(document.querySelector("#chart-timeline"), options);
    timeline_chart.render();
}