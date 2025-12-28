# courses/admin.py
from django.contrib import admin
from .models import Course

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'owner', 'assignment_count')
    list_filter = ('owner',)
    search_fields = ('name', 'code', 'owner__username')
    ordering = ('name',)

    def assignment_count(self, obj):
        return obj.assignment_set.count()
    assignment_count.short_description = 'Assignments'