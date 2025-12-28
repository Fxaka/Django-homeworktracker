// static/js/course-form.js
// Enhances the course creation/edit form with validation, UX, and shortcuts

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form.needs-validation');
    if (!form) return;

    // Add consistent styling class
    form.classList.add('course-form');

    // Initialize form fields
    setupFormFields();

    // Autofocus name field after a short delay
    setTimeout(() => {
        const nameField = document.getElementById('id_name');
        if (nameField) nameField.focus();
    }, 300);

    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);

    // Enable keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Optional: warn before leaving if form has input
    // window.addEventListener('beforeunload', handleBeforeUnload);

    // === Helper Functions ===

    /**
     * Apply consistent styling and real-time validation to key fields
     */
    function setupFormFields() {
        const fields = document.querySelectorAll('#id_name, #id_code');
        fields.forEach(field => {
            if (!field.classList.contains('form-control')) {
                field.classList.add('form-control');
            }

            // Clear invalid state on user input
            field.addEventListener('input', () => {
                field.classList.remove('is-invalid');
            });
        });
    }

    /**
     * Validate form on submit; show errors or proceed
     */
    function handleFormSubmit(event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            handleInvalidForm();
        } else {
            handleValidForm();
        }
        form.classList.add('was-validated');
    }

    /**
     * Scroll to and focus the first invalid field
     */
    function handleInvalidForm() {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }

    /**
     * Disable submit button and show loading state
     */
    function handleValidForm() {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
            form.classList.add('form-loading');
        }
    }

    /**
     * Support Ctrl+Enter to submit and Esc to cancel
     */
    function handleKeyboardShortcuts(event) {
        // Submit with Ctrl+Enter (only if valid)
        if (event.ctrlKey && event.key === 'Enter' && form.checkValidity()) {
            form.submit();
        }

        // Cancel with Escape
        if (event.key === 'Escape') {
            const cancelLink = document.querySelector('a[href*="course_list"]');
            if (cancelLink) cancelLink.click();
        }
    }

    /**
     * Warn user before leaving if form has content (optional)
     */
    function handleBeforeUnload(e) {
        const name = document.getElementById('id_name')?.value?.trim() || '';
        const code = document.getElementById('id_code')?.value?.trim() || '';

        if (name || code) {
            e.preventDefault();
            e.returnValue = ''; // Required for some browsers
        }
    }
});