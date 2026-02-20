let all_asteroids = [];
let hazard_chart = null;
let timeline_chart = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetch_data();
});

async function fetch_data() {
    const res = await fetch('/api/asteroids');
    all_asteroids = await res.json();
    update_dashboard(all_asteroids);
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