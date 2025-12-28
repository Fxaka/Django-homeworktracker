// static/js/calendar.js
// A lightweight calendar component to display assignments by due date

class SimpleCalendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Calendar container #${containerId} not found`);
            return;
        }

        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        this.assignments = options.assignments || [];
        this.showOtherMonths = options.showOtherMonths !== false;

        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        this.init();
    }

    init() {
        this.renderCalendar();
        this.setupEventListeners();
    }

    // Render the full calendar grid for the current month
    renderCalendar() {
        const monthTitle = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        const titleEl = document.getElementById('currentMonth');
        if (titleEl) titleEl.textContent = monthTitle;

        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayIndex = firstDay.getDay();

        const grid = document.getElementById('calendarGrid');
        if (!grid) return;
        grid.innerHTML = '';

        // Previous month days (if enabled)
        if (this.showOtherMonths) {
            const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();
            for (let i = firstDayIndex - 1; i >= 0; i--) {
                const dayNum = prevMonthDays - i;
                const date = new Date(this.currentYear, this.currentMonth - 1, dayNum);
                this.createDayElement(grid, dayNum, date, 'calendar-day other-month');
            }
        } else {
            // Empty placeholders for alignment
            for (let i = 0; i < firstDayIndex; i++) {
                const empty = document.createElement('div');
                empty.className = 'calendar-day empty';
                grid.appendChild(empty);
            }
        }

        // Current month days
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            let className = 'calendar-day';
            if (this.isSameDay(date, today)) className += ' today';
            this.createDayElement(grid, day, date, className);
        }

        // Next month days (fill up to 6 weeks = 42 cells)
        if (this.showOtherMonths) {
            const totalCells = firstDayIndex + daysInMonth;
            const nextMonthDays = 42 - totalCells;
            for (let day = 1; day <= nextMonthDays; day++) {
                const date = new Date(this.currentYear, this.currentMonth + 1, day);
                this.createDayElement(grid, day, date, 'calendar-day other-month');
            }
        }
    }

    // Create a single day cell with optional assignment indicators
    createDayElement(container, dayNumber, date, baseClass) {
        const dayEl = document.createElement('div');
        dayEl.className = baseClass;
        dayEl.dataset.date = date.toISOString().split('T')[0];

        // Day number
        const numberEl = document.createElement('div');
        numberEl.className = 'calendar-day-number';
        numberEl.textContent = dayNumber;
        dayEl.appendChild(numberEl);

        // Assignments due on this day
        const assignments = this.getAssignmentsForDate(date);
        if (assignments.length > 0) {
            dayEl.classList.add('has-assignment');

            const eventsEl = document.createElement('div');
            eventsEl.className = 'calendar-day-events';

            // Show up to 3 assignment dots
            assignments.slice(0, 3).forEach(assignment => {
                const dot = document.createElement('div');
                dot.className = `calendar-event event-${assignment.status}`;
                dot.title = `${assignment.title} – ${assignment.course}`;
                dot.textContent = '•';
                eventsEl.appendChild(dot);
            });

            // Show "+N more" if there are additional assignments
            if (assignments.length > 3) {
                const more = document.createElement('div');
                more.className = 'calendar-event event-more';
                more.textContent = `+${assignments.length - 3} more`;
                eventsEl.appendChild(more);
            }

            dayEl.appendChild(eventsEl);

            // Click to show details
            dayEl.addEventListener('click', () => this.showDayDetails(date, assignments));
        }

        container.appendChild(dayEl);
    }

    // Filter assignments due on a specific date
    getAssignmentsForDate(date) {
        return this.assignments
            .filter(a => this.isSameDay(new Date(a.due_date), date))
            .map(a => ({
                ...a,
                status: a.completed ? 'completed' :
                         a.is_overdue ? 'overdue' : 'pending'
            }));
    }

    // Helper: Check if two dates fall on the same calendar day
    isSameDay(d1, d2) {
        return d1.getDate() === d2.getDate() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getFullYear() === d2.getFullYear();
    }

    // Display a simple alert with assignment details for a given date
    showDayDetails(date, assignments) {
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let msg = `Assignments for ${formattedDate}:\n\n`;
        if (assignments.length === 0) {
            msg += 'No assignments due.';
        } else {
            assignments.forEach((a, i) => {
                const status = a.completed ? '✅ Completed' :
                              a.is_overdue ? '⏰ Overdue' : '⏳ Pending';
                msg += `${i + 1}. ${a.title}\n   Course: ${a.course || '—'}\n   Status: ${status}\n\n`;
            });
        }
        alert(msg); // Replace with modal in production
    }

    // Attach navigation button listeners
    setupEventListeners() {
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            if (--this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.renderCalendar();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            if (++this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.renderCalendar();
        });

        document.getElementById('todayBtn')?.addEventListener('click', () => {
            const now = new Date();
            this.currentYear = now.getFullYear();
            this.currentMonth = now.getMonth();
            this.renderCalendar();
        });
    }

    // Update assignments and re-render
    setAssignments(assignments) {
        this.assignments = assignments;
        this.renderCalendar();
    }

    // Navigate to a specific date
    gotoDate(date) {
        this.currentYear = date.getFullYear();
        this.currentMonth = date.getMonth();
        this.renderCalendar();
    }
}

// Initialize calendar when DOM is ready
function initCalendar() {
    if (!document.getElementById('calendarGrid')) return;

    let assignments = [];

    try {
        // Option 1: Global variable from Django template
        if (typeof window.calendarAssignments !== 'undefined') {
            assignments = window.calendarAssignments;
        }

        // Option 2: Embedded JSON in a data attribute
        const dataEl = document.getElementById('calendarData');
        if (dataEl?.dataset.events) {
            const events = JSON.parse(dataEl.dataset.events);
            assignments = events.map(e => ({
                title: e.title,
                due_date: new Date(e.start),
                completed: e.extendedProps?.completed || false,
                is_overdue: e.extendedProps?.is_overdue || false,
                course: e.extendedProps?.course || 'No Course'
            }));
        }
    } catch (err) {
        console.error('Failed to load calendar data:', err);
    }

    window.calendar = new SimpleCalendar('calendarGrid', {
        assignments,
        showOtherMonths: true
    });

    console.log('SimpleCalendar initialized');
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
} else {
    initCalendar();
}