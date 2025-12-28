from django.db import models
from django.conf import settings


class Course(models.Model):
    """Represents a user-owned course, optionally identified by a short code (e.g., CS101)."""

    name = models.CharField(max_length=100)  # Full course title (e.g., "Introduction to Programming")
    code = models.CharField(
        max_length=20,
        blank=True  # Optional shorthand like "MATH202" or "ENG101"; can be left empty
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE  # Courses are deleted when the user is removed
    )

    def __str__(self):
        """Displays course as 'Name (Code)' if code exists; otherwise just 'Name'."""
        if self.code:
            return f"{self.name} ({self.code})"
        return self.name