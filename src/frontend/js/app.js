let all_asteroids = [];
let filtered_asteroids = [];
let debounce_timer = null;

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
    const open_btn = document.getElementById('open-search-modal');
    const close_btn = document.getElementById('close-modal');
    const search_input = document.getElementById('search-name');
    const filter_hazard = document.getElementById('filter-hazard');
    const filter_sentry = document.getElementById('filter-sentry');
    const filter_date_from = document.getElementById('filter-date-from');
    const filter_date_to = document.getElementById('filter-date-to');
    const reset_btn = document.getElementById('reset-filters');
    const clear_dates_btn = document.getElementById('clear-dates');

    open_btn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        render_asteroids(filtered_asteroids);
    });

    close_btn.addEventListener('click', () => {
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

    search_input.addEventListener('input', debounced_apply_filters);
    filter_hazard.addEventListener('change', apply_filters);
    filter_sentry.addEventListener('change', apply_filters);
    filter_date_from.addEventListener('change', apply_filters);
    filter_date_to.addEventListener('change', apply_filters);
    
    reset_btn.addEventListener('click', () => {
        search_input.value = '';
        filter_hazard.value = '';
        filter_sentry.value = '';
        filter_date_from.value = '';
        filter_date_to.value = '';
        apply_filters();
    });

    clear_dates_btn.addEventListener('click', () => {
        filter_date_from.value = '';
        filter_date_to.value = '';
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
    clearTimeout(debounce_timer);
    debounce_timer = setTimeout(() => {
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

    const unique_asteroids = {};
    asteroids.forEach(a => {
        const key = `${a.id}_${a.close_approach_date}`;
        if (!unique_asteroids[key]) {
            unique_asteroids[key] = a;
        }
    });

    const uniqueList = Object.values(unique_asteroids);

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