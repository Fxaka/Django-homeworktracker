from django.db import models
from django.conf import settings
from assignments.models import Assignment


class Grade(models.Model):
    """
    Stores grading details for a single assignment.
    Each assignment can have at most one grade (one-to-one relationship).
    """

    assignment = models.OneToOneField(
        Assignment,
        on_delete=models.CASCADE,
        related_name='grade'  # Enables assignment.grade access
    )
    score = models.FloatField(help_text="Points awarded for this assignment")
    max_score = models.FloatField(
        default=100.0,
        help_text="Maximum possible points (e.g., 50 for a half-credit quiz)"
    )
    comment = models.TextField(blank=True, null=True)  # Optional feedback from instructor
    graded_at = models.DateTimeField(auto_now=True)  # Automatically updated on every save

    def __str__(self):
        return f"{self.assignment.title}: {self.score}/{self.max_score}"

    @property
    def percentage(self):
        """Returns the grade as a percentage. Avoids division by zero."""
        if self.max_score == 0:
            return 0
        return (self.score / self.max_score) * 100