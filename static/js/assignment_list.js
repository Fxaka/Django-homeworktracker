// static/js/assignment_list.js
// Handles inline toggle of assignment completion status with optimistic UI update

document.addEventListener('DOMContentLoaded', function () {
    // Use event delegation for all "toggle complete" buttons
    document.addEventListener('click', function (e) {
        const button = e.target.closest('.toggle-complete');
        if (!button) return;

        e.preventDefault();

        // Optimistically update UI immediately
        toggleUIState(button);

        // Send async request in background
        sendBackgroundRequest(button);
    });
});

/**
 * Update UI to reflect new completion state (optimistic update)
 */
function toggleUIState(button) {
    const isCurrentlyCompleted = button.classList.contains('btn-warning');
    const isNowCompleted = !isCurrentlyCompleted;
    const assignmentId = button.dataset.assignmentId;

    // Update button appearance
    button.className = button.className.replace(/\b(btn-warning|btn-success)\b/g, '');
    button.classList.add(isNowCompleted ? 'btn-warning' : 'btn-success');

    const icon = isNowCompleted ? 'fa-undo' : 'fa-check';
    const text = isNowCompleted ? 'Reopen' : 'Complete';
    button.innerHTML = `<i class="fas ${icon} me-1"></i>${text}`;

    // Update corresponding status badge
    const badge = document.querySelector(`[data-assignment-badge="${assignmentId}"]`);
    if (badge) {
        const statusText = isNowCompleted ? 'Completed' : 'Pending';
        const badgeClass = isNowCompleted ? 'badge bg-success ms-2' : 'badge bg-warning text-dark ms-2';
        const badgeIcon = isNowCompleted ? 'fa-check' : 'fa-clock';

        badge.className = badgeClass;
        badge.innerHTML = `<i class="fas ${badgeIcon} me-1"></i>${statusText}`;
    }
}

/**
 * Send POST request to toggle completion status (fire-and-forget)
 */
function sendBackgroundRequest(button) {
    const url = button.dataset.url;
    const csrfToken = getCookie('csrftoken');

    fetch(url, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error('Toggle failed:', response.status);
            // Optional: restore UI or show toast on failure
        }
    })
    .catch(error => {
        console.error('Network error:', error);
        // Optional: handle offline case
    });
}

/**
 * Helper: Get CSRF token from cookie (Django-compatible)
 */
function getCookie(name) {
    if (!document.cookie) return null;
    return document.cookie
        .split(';')
        .map(c => c.trim())
        .find(cookie => cookie.startsWith(name + '='))
        ?.substring(name.length + 1);
}