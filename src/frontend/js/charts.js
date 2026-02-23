let hazard_chart = null;
let timeline_chart = null;
let earth_scene = null;
let earth_camera = null;
let earth_renderer = null;
let earth_controls = null;
let earth_mesh = null;
let earth_hazard_points = null;
let earth_safe_points = null;
let earth_animation_id = null;
let earth_resize_listener_added = false;

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

function draw_earth_3d_chart(data) {
    const container = document.getElementById('earth-3d-container');
    if (!container) return;

    if (typeof THREE === 'undefined') {
        container.innerHTML = '<div class="no-results">3D engine not available</div>';
        return;
    }

    if (!earth_renderer) {
        init_earth_scene(container);
    }

    update_asteroid_points(data);
}

function init_earth_scene(container) {
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    earth_scene = new THREE.Scene();
    earth_camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    earth_camera.position.set(0, 0, 42);

    earth_renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    earth_renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    earth_renderer.setSize(width, height);
    earth_renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(earth_renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    earth_scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(18, 15, 20);
    earth_scene.add(directionalLight);

    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.85,
        metalness: 0.05,
        emissive: 0x0b1e36,
        emissiveIntensity: 0.12
    });
    earth_mesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earth_scene.add(earth_mesh);
    apply_earth_texture(earthMaterial);

    if (typeof THREE.OrbitControls === 'function') {
        earth_controls = new THREE.OrbitControls(earth_camera, earth_renderer.domElement);
        earth_controls.target.set(0, 0, 0);
        earth_controls.enableDamping = true;
        earth_controls.dampingFactor = 0.08;
        earth_controls.minDistance = 12;
        earth_controls.maxDistance = 120;
        earth_controls.enablePan = false;
    }

    if (!earth_resize_listener_added) {
        window.addEventListener('resize', handle_earth_resize);
        earth_resize_listener_added = true;
    }

    animate_earth_scene();
}

function apply_earth_texture(earthMaterial) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        "assets/4k_earth.jpg",
        (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = earth_renderer ? earth_renderer.capabilities.getMaxAnisotropy() : 1;
            earthMaterial.map = texture;
            earthMaterial.needsUpdate = true;
        },
        undefined,
        () => {
            earthMaterial.color = new THREE.Color(0x2b6cb0);
            earthMaterial.emissiveIntensity = 0.3;
            earthMaterial.needsUpdate = true;
        }
    );
}

function animate_earth_scene() {
    earth_animation_id = requestAnimationFrame(animate_earth_scene);

    if (earth_mesh) {
        earth_mesh.rotation.y += 0.002;
    }

    if (earth_hazard_points) {
        earth_hazard_points.rotation.y += 0.0005;
    }

    if (earth_safe_points) {
        earth_safe_points.rotation.y += 0.0005;
    }

    if (earth_controls) {
        earth_controls.update();
    }

    if (earth_renderer && earth_scene && earth_camera) {
        earth_renderer.render(earth_scene, earth_camera);
    }
}

function handle_earth_resize() {
    const container = document.getElementById('earth-3d-container');
    if (!container || !earth_renderer || !earth_camera) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;
    earth_camera.aspect = width / height;
    earth_camera.updateProjectionMatrix();
    earth_renderer.setSize(width, height);
}

function update_asteroid_points(data) {
    if (!earth_scene) return;

    clear_asteroid_point_clouds();

    const asteroids = data.filter(a => {
        if (a.miss_distance_km === null || a.miss_distance_km === undefined) return false;
        const distance = parseFloat(a.miss_distance_km);
        return !Number.isNaN(distance) && distance > 0;
    });

    if (asteroids.length === 0) return;

    const hazardAsteroids = asteroids.filter(a => Boolean(a.is_potentially_hazardous));
    const safeAsteroids = asteroids.filter(a => !Boolean(a.is_potentially_hazardous));

    const hazardDistances = hazardAsteroids.map(a => parseFloat(a.miss_distance_km));
    const safeDistances = safeAsteroids.map(a => parseFloat(a.miss_distance_km));

    const hazardMinDistance = hazardDistances.length ? Math.min(...hazardDistances) : 0;
    const hazardMaxDistance = hazardDistances.length ? Math.max(...hazardDistances) : 1;
    const safeMinDistance = safeDistances.length ? Math.min(...safeDistances) : 0;
    const safeMaxDistance = safeDistances.length ? Math.max(...safeDistances) : 1;

    const hazardMinRadius = 7;
    const hazardMaxRadius = 22;
    const safeMinRadius = 24;
    const safeMaxRadius = 55;

    const hazardPositions = [];
    const safePositions = [];

    hazardAsteroids.forEach((asteroid, index) => {
        const distance = parseFloat(asteroid.miss_distance_km);
        const orbitRadius = scale_distance_to_radius(
            distance,
            hazardMinDistance,
            hazardMaxDistance,
            hazardMinRadius,
            hazardMaxRadius
        );

        const direction = fibonacci_sphere_direction(index, hazardAsteroids.length);
        hazardPositions.push(
            orbitRadius * direction.x,
            orbitRadius * direction.y,
            orbitRadius * direction.z
        );
    });

    safeAsteroids.forEach((asteroid, index) => {
        const distance = parseFloat(asteroid.miss_distance_km);
        const orbitRadius = scale_distance_to_radius(
            distance,
            safeMinDistance,
            safeMaxDistance,
            safeMinRadius,
            safeMaxRadius
        );

        const direction = fibonacci_sphere_direction(index, safeAsteroids.length);
        safePositions.push(
            orbitRadius * direction.x,
            orbitRadius * direction.y,
            orbitRadius * direction.z
        );
    });

    if (safePositions.length > 0) {
        const safeGeometry = new THREE.BufferGeometry();
        safeGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(safePositions), 3));

        const safeMaterial = new THREE.PointsMaterial({
            size: 0.28,
            color: 0x22c55e,
            transparent: true,
            opacity: 0.88,
            sizeAttenuation: true
        });

        earth_safe_points = new THREE.Points(safeGeometry, safeMaterial);
        earth_scene.add(earth_safe_points);
    }

    if (hazardPositions.length > 0) {
        const hazardGeometry = new THREE.BufferGeometry();
        hazardGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(hazardPositions), 3));

        const hazardMaterial = new THREE.PointsMaterial({
            size: 0.48,
            color: 0xff0000,
            transparent: true,
            opacity: 1,
            sizeAttenuation: true
        });

        earth_hazard_points = new THREE.Points(hazardGeometry, hazardMaterial);
        earth_scene.add(earth_hazard_points);
    }
}

function clear_asteroid_point_clouds() {
    if (earth_safe_points) {
        earth_scene.remove(earth_safe_points);
        earth_safe_points.geometry.dispose();
        earth_safe_points.material.dispose();
        earth_safe_points = null;
    }

    if (earth_hazard_points) {
        earth_scene.remove(earth_hazard_points);
        earth_hazard_points.geometry.dispose();
        earth_hazard_points.material.dispose();
        earth_hazard_points = null;
    }
}

function fibonacci_sphere_direction(index, total) {
    if (total <= 1) {
        return { x: 0, y: 1, z: 0 };
    }

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (2 * index) / (total - 1);
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;

    return {
        x: Math.cos(theta) * radius,
        y,
        z: Math.sin(theta) * radius
    };
}

function scale_distance_to_radius(distance, minDistance, maxDistance, minRadius, maxRadius) {
    const denominator = maxDistance - minDistance || 1;
    const normalizedDistance = (distance - minDistance) / denominator;
    return minRadius + normalizedDistance * (maxRadius - minRadius);
}
