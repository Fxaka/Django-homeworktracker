# assignments/forms.py

from django import forms
from .models import Assignment
from courses.models import Course


class AssignmentForm(forms.ModelForm):
    """
    Form for creating or updating an assignment.
    Filters course choices to only those owned by the current user
    and applies consistent Bootstrap styling across all fields.
    """

    class Meta:
        model = Assignment
        fields = ['title', 'description', 'due_date', 'course']
        widgets = {
            'due_date': forms.DateTimeInput(attrs={
                'type': 'datetime-local',
                'class': 'form-control',
                'placeholder': 'Select due date and time',
            }),
        }

    def __init__(self, *args, **kwargs):
        # Extract the 'user' argument to filter course options
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        # Apply consistent Bootstrap classes to all form fields
        self._add_bootstrap_classes()

        # Restrict course choices to the current user's courses
        if user:
            self.fields['course'].queryset = Course.objects.filter(owner=user)
        else:
            self.fields['course'].queryset = Course.objects.none()

        # Customize the empty option label for better UX
        self.fields['course'].empty_label = 'Select a course (optional)'

        # Autofocus the title field for faster input
        self.fields['title'].widget.attrs['autofocus'] = True

    def _add_bootstrap_classes(self):
        """Applies Bootstrap CSS classes and placeholders for consistent UI."""
        self.fields['title'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter assignment title',
        })

        self.fields['description'].widget.attrs.update({
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Add description (optional)',
        })

        # Use 'form-select' for <select> elements per Bootstrap 5 standards
        self.fields['course'].widget.attrs.update({
            'class': 'form-select',
        })