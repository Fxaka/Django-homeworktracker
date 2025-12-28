
// Enhances grading forms with real-time preview, validation, and UX improvements

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form.needs-validation');
    if (!form) return;

    // Apply consistent styling class
    form.classList.add('grade-form');

    // Initialize UI components
    setupFormFields();
    setupGradePreview();

    // Attach form submission handler
    form.addEventListener('submit', handleFormSubmit);

    // Auto-focus on score input for faster grading
    setTimeout(() => {
        const scoreField = document.getElementById('id_score');
        if (scoreField) scoreField.focus();
    }, 300);

    // Enable keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
});

/**
 * Enhance form fields with consistent styling and error-clearing behavior
 */
function setupFormFields() {
    const fields = document.querySelectorAll('#id_score, #id_max_score, #id_comment');
    fields.forEach(field => {
        field.classList.add('form-control'); // Ensure Bootstrap styling

        // Clear invalid state on user input
        field.addEventListener('input', function () {
            this.classList.remove('is-invalid');
        });
    });
}

/**
 * Set up real-time grade preview based on score and max score inputs
 */
function setupGradePreview() {
    const scoreField = document.getElementById('id_score');
    const maxScoreField = document.getElementById('id_max_score');

    if (!scoreField || !maxScoreField) return;

    // Initialize preview on load
    updateGradePreview();

    // Update preview on input
    scoreField.addEventListener('input', updateGradePreview);
    maxScoreField.addEventListener('input', updateGradePreview);
}

/**
 * Recalculate and update the grade preview UI
 */
function updateGradePreview() {
    const scoreField = document.getElementById('id_score');
    const maxScoreField = document.getElementById('id_max_score');
    const percentageElement = document.getElementById('percentagePreview');
    const fractionElement = document.getElementById('fractionPreview');
    const progressBar = document.getElementById('progressBar');
    const gradeLabel = document.getElementById('gradeLabel');

    if (!scoreField || !maxScoreField || !percentageElement || !fractionElement || !progressBar || !gradeLabel) {
        return; // Gracefully degrade if elements missing
    }

    const score = parseFloat(scoreField.value) || 0;
    const maxScore = parseFloat(maxScoreField.value) || 0;

    // Update fractional display
    fractionElement.textContent = `${score} / ${maxScore}`;

    // Calculate percentage (avoid division by zero)
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    percentageElement.textContent = `${percentage}%`;
    progressBar.style.width = `${Math.min(percentage, 100)}%`;

    // Update grade label and progress bar color
    updateGradeLabel(percentage, gradeLabel, progressBar);
}

/**
 * Update grade label text and progress bar styling based on percentage
 * @param {number} percentage - Score as a percentage (0–100+)
 * @param {HTMLElement} labelElement - Element to display grade message
 * @param {HTMLElement} progressBar - Progress bar element to style
 */
function updateGradeLabel(percentage, labelElement, progressBar) {
    if (percentage === 0 && (!document.getElementById('id_score')?.value || !document.getElementById('id_max_score')?.value)) {
        labelElement.textContent = 'Enter scores to see grade';
        progressBar.className = 'progress-bar'; // Reset classes
        return;
    }

    let label = '';
    let colorClass = '';

    // Map percentage to letter grade and visual style
    if (percentage >= 90) {
        label = 'Excellent! (A)';
        colorClass = 'bg-gradient-success';
    } else if (percentage >= 80) {
        label = 'Good job! (B)';
        colorClass = 'bg-gradient-success';
    } else if (percentage >= 70) {
        label = 'Satisfactory (C)';
        colorClass = 'bg-gradient-warning';
    } else if (percentage >= 60) {
        label = 'Needs improvement (D)';
        colorClass = 'bg-gradient-warning';
    } else {
        label = 'Fail (F)';
        colorClass = 'bg-gradient-danger';
    }

    labelElement.textContent = label;
    progressBar.className = `progress-bar ${colorClass}`;
}

/**
 * Handle form submission with validation and loading state
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    const form = event.target;

    if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        scrollToFirstError(form);
    } else {
        disableSubmitButton(form);
    }
}

/**
 * Scroll smoothly to the first invalid field and focus it
 * @param {HTMLFormElement} form
 */
function scrollToFirstError(form) {
    const firstError = form.querySelector('.is-invalid');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
    }
}

/**
 * Disable submit button and show loading indicator
 * @param {HTMLFormElement} form
 */
function disableSubmitButton(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Processing...';
        form.classList.add('form-loading');
    }
}

/**
 * Handle global keyboard shortcuts for grading workflow
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcuts(event) {
    // Ctrl+Enter (or Cmd+Enter on Mac) to submit valid form
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const form = document.querySelector('form.needs-validation');
        if (form && form.checkValidity()) {
            form.requestSubmit(); // Safer than .submit() (triggers validation)
        }
    }

    // Escape key: navigate back to assignment detail
    if (event.key === 'Escape') {
        const cancelLink = document.querySelector('a[href*="assignment_detail"]');
        if (cancelLink) {
            cancelLink.click();
        }
    }
}