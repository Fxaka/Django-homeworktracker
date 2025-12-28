// static/js/assignment-form.js
// Enhances the assignment form with UX improvements and validation

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form.needs-validation');
    if (!form) return;

    // Add consistent form class for styling
    form.classList.add('assignment-form');

    // Autofocus title field (Django template ID)
    const titleField = document.getElementById('{{ form.title.id_for_label }}');
    if (titleField) {
        setTimeout(() => titleField.focus(), 300);
    }

    // Handle form submission
    form.addEventListener('submit', function (event) {
        if (!this.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            this.classList.add('was-validated');

            // Scroll to first invalid field
            const firstError = this.querySelector('.is-invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
                firstError.classList.add('field-error');
            }
        } else {
            // Disable submit button to prevent double submission
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
                this.classList.add('form-loading');
            }
        }
    });

    // Clear error styles on user input
    const formFields = form.querySelectorAll('.form-control');
    formFields.forEach(field => {
        field.addEventListener('input', () => {
            field.classList.remove('field-error', 'is-invalid');
        });
    });

    // Apply consistent styling to known fields (from Django form)
    const fieldIds = [
        '{{ form.title.id_for_label }}',
        '{{ form.description.id_for_label }}',
        '{{ form.due_date.id_for_label }}',
        '{{ form.course.id_for_label }}'
    ];

    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;

        field.classList.add('form-control');

        // Handle server-side errors
        if (field.classList.contains('error')) {
            field.classList.add('is-invalid', 'field-error');

            // Insert error message below the field
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.innerHTML = `<i class="fas fa-times-circle"></i>${field.dataset.error || 'This field is required'}`;

            const next = field.nextElementSibling;
            if (!next || !next.classList.contains('error-message')) {
                field.parentNode.insertBefore(errorDiv, next);
            }
        }
    });

    // Enhance date/time input UX
    const dateField = document.getElementById('{{ form.due_date.id_for_label }}');
    if (dateField) {
        dateField.addEventListener('focus', () => {
            dateField.type = 'datetime-local';
        });
        dateField.addEventListener('blur', () => {
            if (!dateField.value) {
                dateField.type = 'text'; // fallback for empty state
            }
        });
    }
});

// Warn before leaving if form has content
window.addEventListener('beforeunload', function (e) {
    const form = document.querySelector('form.needs-validation');
    if (!form) return;

    const formData = new FormData(form);
    let hasContent = false;
    for (let value of formData.values()) {
        if (value.trim()) {
            hasContent = true;
            break;
        }
    }

    if (hasContent) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl+Enter → submit valid form
    if (e.ctrlKey && e.key === 'Enter') {
        const form = document.querySelector('form.needs-validation');
        if (form && form.checkValidity()) {
            form.submit();
        }
    }

    // Escape → cancel (navigate to assignment list)
    if (e.key === 'Escape') {
        const cancelLink = document.querySelector('a[href*="assignment_list"]');
        if (cancelLink) cancelLink.click();
    }
});