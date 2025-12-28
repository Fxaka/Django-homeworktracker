// Handles password strength validation and form enhancements for authentication pages

document.addEventListener('DOMContentLoaded', function () {

    /**
     * Evaluate password strength based on length, character variety, and common weak patterns
     * @param {string} password - The password to evaluate
     * @returns {{ score: number, level: string, percentage: number }}
     */
    function calculatePasswordStrength(password) {
        if (!password) {
            return { score: 0, level: 'very-weak', percentage: 0 };
        }

        // Score based on criteria
        const checks = [
            password.length >= 8,           // Minimum length
            password.length >= 12,          // Strong length
            /[a-z]/.test(password),         // Lowercase
            /[A-Z]/.test(password),         // Uppercase
            /\d/.test(password),            // Digit
            /[^A-Za-z0-9]/.test(password)   // Special character
        ];

        let score = checks.filter(Boolean).length;

        // Penalize known weak patterns
        const weakPatterns = ['password', '123456', 'admin', 'letmein'];
        if (weakPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
            score = Math.max(0, score - 2);
        }

        // Map score to user-friendly level and progress percentage
        let level, percentage;
        if (score <= 1) {
            level = 'very-weak'; percentage = 20;
        } else if (score <= 2) {
            level = 'weak'; percentage = 40;
        } else if (score <= 3) {
            level = 'fair'; percentage = 60;
        } else if (score <= 4) {
            level = 'good'; percentage = 80;
        } else {
            level = 'excellent'; percentage = 100;
        }

        return { score, level, percentage };
    }

    /**
     * Attach real-time password strength feedback to a form field
     * @param {string|HTMLElement} inputSelector - Password input element or selector
     * @param {string|HTMLElement} barSelector - Progress bar element or selector
     * @param {string|HTMLElement} textSelector - Feedback text element or selector
     */
    function initPasswordStrength(inputSelector, barSelector, textSelector) {
        const input = typeof inputSelector === 'string'
            ? document.querySelector(inputSelector)
            : inputSelector;

        const bar = typeof barSelector === 'string'
            ? document.querySelector(barSelector)
            : barSelector;

        const text = typeof textSelector === 'string'
            ? document.querySelector(textSelector)
            : textSelector;

        if (!input || !bar || !text) return;

        // Prevent duplicate event listeners
        if (input.hasStrengthListener) return;
        input.hasStrengthListener = true;

        input.addEventListener('input', () => {
            const { level, percentage } = calculatePasswordStrength(input.value);

            // Update progress bar style
            const strengthClasses = [
                'password-strength-very-weak',
                'password-strength-weak',
                'password-strength-fair',
                'password-strength-good',
                'password-strength-excellent'
            ];
            bar.classList.remove(...strengthClasses);

            const classMap = {
                'very-weak': 'password-strength-very-weak',
                'weak': 'password-strength-weak',
                'fair': 'password-strength-fair',
                'good': 'password-strength-good',
                'excellent': 'password-strength-excellent'
            };

            bar.classList.add(classMap[level] || 'password-strength-very-weak');
            bar.style.width = `${percentage}%`;

            // Update descriptive text
            const labelMap = {
                'very-weak': 'Very weak',
                'weak': 'Weak',
                'fair': 'Fair',
                'good': 'Good',
                'excellent': 'Excellent'
            };
            text.textContent = `Password strength: ${labelMap[level] || 'Very weak'}`;
        });
    }

    // ==============================
    // Registration Page Integration
    // ==============================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        initPasswordStrength(
            'input[name="password1"]',
            '#passwordStrengthBar',
            '#passwordStrengthText'
        );
    }

    // ==============================
    // Password Change Page Integration
    // ==============================
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        initPasswordStrength(
            '#id_new_password1',
            '#passwordStrength .progress-bar',
            '#passwordStrengthText'
        );

        // --- Additional logic specific to password change ---
        const oldPasswordField = document.getElementById('id_old_password');
        const newPasswordField = document.getElementById('id_new_password1');
        const confirmPasswordField = document.getElementById('id_new_password2');
        const submitButton = passwordChangeForm.querySelector('button[type="submit"]');

        /**
         * Validate that new password matches confirmation
         */
        function validatePasswordMatch() {
            if (
                confirmPasswordField.value &&
                newPasswordField.value !== confirmPasswordField.value
            ) {
                confirmPasswordField.setCustomValidity('Passwords do not match');
                confirmPasswordField.classList.add('is-invalid');
            } else {
                confirmPasswordField.setCustomValidity('');
                confirmPasswordField.classList.remove('is-invalid');
            }
        }

        if (newPasswordField && confirmPasswordField) {
            newPasswordField.addEventListener('input', validatePasswordMatch);
            confirmPasswordField.addEventListener('input', validatePasswordMatch);
        }

        // Enhanced form submission handling
        passwordChangeForm.addEventListener('submit', function (e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.add('was-validated');

                const firstError = this.querySelector('.is-invalid');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            } else if (submitButton) {
                // Disable button and show loading state
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Updating...';
            }
        });

        // Autofocus on old password field
        if (oldPasswordField) {
            setTimeout(() => oldPasswordField.focus(), 300);
        }

        // ESC key cancels and redirects
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const cancelUrl = passwordChangeForm.dataset.cancelUrl;
                if (cancelUrl) {
                    window.location.href = cancelUrl;
                }
            }
        });
    }
});