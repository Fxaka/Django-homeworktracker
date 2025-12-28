// static/js/profile.js

class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.initAvatarPreview();
        this.initFormValidation();
    }

    initAvatarPreview() {
        const avatarInput = document.getElementById('avatarInput');
        if (!avatarInput) return;

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && this.validateImage(file)) {
                this.previewImage(file);
            }
        });
    }

    validateImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            alert('Please select a JPG, PNG, or GIF image.');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 5MB.');
            return false;
        }

        return true;
    }

    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatarPreview');
            if (preview.tagName === 'IMG') {
                preview.src = e.target.result;
            } else {
                // Replace placeholder with image
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'profile-avatar';
                img.id = 'avatarPreview';
                img.alt = 'Profile Picture';
                preview.parentNode.replaceChild(img, preview);
            }
            this.showMessage('Image selected. Click Save to update.', 'success');
        };
        reader.readAsDataURL(file);
    }

    initFormValidation() {
        const form = document.getElementById('profileForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const username = document.querySelector('input[name="username"]');

            if (!this.validateForm(username)) {
                e.preventDefault();
            } else {
                this.showLoading(true);
            }
        });
    }

    validateForm(username) {
        let isValid = true;

        // Reset error states
        username.classList.remove('is-invalid');

        // Validate username
        if (!username.value.trim()) {
            username.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            this.showMessage('Please fix the errors above.', 'warning');
        }

        return isValid;
    }

    showLoading(show) {
        const submitBtn = document.querySelector('#profileForm button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
                submitBtn.disabled = false;
            }
        }
    }

    showMessage(text, type = 'info') {
        if (typeof HomeworkTracker !== 'undefined' && HomeworkTracker.showToast) {
            HomeworkTracker.showToast(text, type);
        } else {
            // Fallback alert
            alert(text);
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('profileForm')) {
        new ProfileManager();
    }
});