from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """
    Extends the default Django user with a profile picture.
    Each user has exactly one associated profile.
    """
    # Link to Django's built-in User model (one-to-one relationship)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Profile image stored in 'media/profile_pics/', falls back to default.jpg if none provided
    avatar = models.ImageField(upload_to='profile_pics', default='default.jpg')

    def __str__(self):
        """Returns a human-readable string representation of the profile."""
        return f"{self.user.username}'s Profile"