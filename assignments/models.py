from django.db import models
from django.conf import settings
from django.utils import timezone


class Assignment(models.Model):
    """Represents a user-created task with a deadline, optionally linked to a course."""

    # Basic info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)  # Optional detailed instructions or notes

    # Timing and status
    due_date = models.DateTimeField()  # Deadline for completion
    completed = models.BooleanField(default=False)  # Manually toggled by user
    created_at = models.DateTimeField(auto_now_add=True)  # Auto-set on creation

    # Ownership and organization
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.CASCADE,
        null=True,
        blank=True  # Assignment can exist outside any course ("uncategorized")
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['due_date']  # Default sort: soonest due first

    @property
    def is_overdue(self):
        """Returns True if the assignment is past its due date and still incomplete."""
        return not self.completed and self.due_date < timezone.now()

    @property
    def status_display(self):
        """
        Human-readable status label for UI display.
        Possible values: 'Completed', 'Overdue', or 'Pending'.
        """
        if self.completed:
            return "Completed"
        elif self.is_overdue:
            return "Overdue"
        else:
            return "Pending"