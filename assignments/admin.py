# assignments/admin.py
from django.contrib import admin
from django.utils import timezone
from .models import Assignment

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'owner',
        'course',
        'due_date',
        'completed',
        'status_display',
        'is_overdue'
    )
    list_filter = (
        'completed',
        'course',
        'owner',
        'due_date'
    )
    search_fields = ('title', 'description', 'owner__username')
    date_hierarchy = 'due_date'
    ordering = ('due_date',)


    readonly_fields = ('created_at', 'is_overdue', 'status_display')

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'owner', 'course')
        }),
        ('Dates & Status', {
            'fields': ('due_date', 'completed', 'created_at', 'is_overdue', 'status_display')
        }),
    )