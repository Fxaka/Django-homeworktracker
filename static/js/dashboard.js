// static/js/dashboard.js
// Manages dashboard visualizations: charts, progress bars, and deadline reminders

class DashboardCharts {
    constructor() {
        this.charts = {};
        this.initialized = false;
    }

    /**
     * Initialize all dashboard components once
     */
    init() {
        if (this.initialized) return;

        this.initProgressBars();
        this.initCompletionChart();

        this.initialized = true;
        console.log('Dashboard charts initialized');
    }

    /**
     * Render course completion rate bar chart using Chart.js
     */
    initCompletionChart() {
        const canvas = document.getElementById('completionChart');
        if (!canvas) {
            console.warn('Completion chart canvas not found');
            return;
        }

        // Try global data first, fall back to table parsing
        let chartData = this.getChartDataFromGlobal();
        if (chartData.labels.length === 0 || chartData.data.length === 0) {
            chartData = this.getChartDataFromTable();
        }

        // Debug output (if enabled)
        if (window.debugData) {
            window.debugData.textContent = JSON.stringify(chartData, null, 2);
        }

        if (chartData.labels.length === 0 || chartData.data.length === 0) {
            console.warn('No valid course data for chart:', chartData);
            return;
        }

        this.charts.completionChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Completion Rate %',
                    data: chartData.data,
                    backgroundColor: this.generateColors(chartData.labels.length),
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Completion: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: (value) => `${value}%`,
                            font: { size: 12 }
                        },
                        title: {
                            display: true,
                            text: 'Completion Rate',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 12 } },
                        title: {
                            display: true,
                            text: 'Courses',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                }
            }
        });

        console.log('Course completion chart rendered successfully');
    }

    /**
     * Extract chart data from global variable `window.courseChartData`
     */
    getChartDataFromGlobal() {
        try {
            if (Array.isArray(window.courseChartData)) {
                const labels = [];
                const data = [];
                window.courseChartData.forEach(course => {
                    if (course.course_name && typeof course.completion_rate !== 'undefined') {
                        labels.push(course.course_name);
                        data.push(parseFloat(course.completion_rate));
                    }
                });
                return { labels, data };
            }
        } catch (err) {
            console.error('Failed to parse global chart data:', err);
        }
        return { labels: [], data: [] };
    }

    /**
     * Fallback: extract completion data from HTML table (`#courseTable`)
     */
    getChartDataFromTable() {
        const table = document.getElementById('courseTable');
        if (!table) return { labels: [], data: [] };

        const labels = [];
        const data = [];

        table.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const name = cells[0].textContent.trim();
                const rate = parseFloat(cells[1].textContent);
                if (name && !isNaN(rate)) {
                    labels.push(name);
                    data.push(rate);
                }
            }
        });

        return { labels, data };
    }

    /**
     * Animate progress bars with staggered delays
     */
    initProgressBars() {
        document.querySelectorAll('.progress-bar[data-width]').forEach((bar, index) => {
            const targetWidth = bar.dataset.width + '%';
            bar.style.transition = 'width 0.8s ease';
            bar.style.width = '0';

            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 300 + index * 100);
        });
    }

    /**
     * Generate a repeating palette of distinct colors
     */
    generateColors(count) {
        const palette = [
            '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7',
            '#4caf50', '#ff9800', '#795548', '#9c27b0', '#00bcd4'
        ];
        return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
    }

    /**
     * Handle window resize for responsive charts
     */
    handleResize() {
        Object.values(this.charts).forEach(chart => chart?.resize());
    }

    /**
     * Clean up all Chart.js instances
     */
    destroy() {
        Object.values(this.charts).forEach(chart => chart?.destroy());
        this.charts = {};
        this.initialized = false;
    }
}

/**
 * Main dashboard initializer
 */
function initDashboard() {
    // Only run on dashboard page
    const isDashboard = window.location.pathname === '/' ||
                       window.location.pathname.includes('dashboard');
    if (!isDashboard) return;

    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is required but not loaded');
        const container = document.querySelector('.chart-container');
        if (container) {
            container.innerHTML = '<div class="alert alert-danger">Chart.js failed to load.</div>';
        }
        return;
    }

    // Initialize visual components
    window.dashboardCharts = new DashboardCharts();
    window.dashboardCharts.init();

    // ✅ Load upcoming assignments from JSON script tag for deadline reminders
    const reminderScript = document.getElementById('upcoming-assignments-data');
    if (reminderScript) {
        try {
            window.upcomingAssignmentsForReminder = JSON.parse(reminderScript.textContent);
            console.log('✅ Loaded upcoming assignments for reminders');
            checkDeadlineReminders(); // Trigger initial check
        } catch (e) {
            console.error('❌ Failed to parse assignment reminder data:', e);
        }
    } else {
        console.warn('⚠️ Reminder data element (#upcoming-assignments-data) missing');
    }

    console.log('Dashboard fully initialized');
}

/**
 * Check for assignments due within the next hour and show urgent banner
 */
function checkDeadlineReminders() {
    const now = new Date();
    const banner = document.getElementById('urgentDeadlineReminder');
    if (!banner || !window.upcomingAssignmentsForReminder) return;

    let urgentAssignment = null;

    for (const item of window.upcomingAssignmentsForReminder) {
        const due = new Date(item.due_date);
        const diffMs = due - now;

        // Find first assignment due in ≤1 hour and >0 seconds
        if (diffMs > 0 && diffMs <= 60 * 60 * 1000) {
            urgentAssignment = { item, diffMs };
            break;
        }
    }

    if (urgentAssignment) {
        const { item, diffMs } = urgentAssignment;
        const minutes = Math.floor(diffMs / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        document.getElementById('reminderTitle').textContent = item.title;
        document.getElementById('reminderCountdown').textContent =
            `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}`;

        banner.classList.remove('d-none');
        banner.style.display = 'block';
    } else {
        // Re-check in 1 minute if no urgent task found
        setTimeout(checkDeadlineReminders, 60_000);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

// Responsive chart resizing
window.addEventListener('resize', () => {
    window.dashboardCharts?.handleResize();
});

// Optional debug panel setup
document.addEventListener('DOMContentLoaded', () => {
    const debugEl = document.getElementById('debugData');
    if (debugEl) window.debugData = debugEl;
});