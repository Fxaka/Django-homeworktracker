# grades/admin.py
from django.contrib import admin
from .models import Grade

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = (
        'assignment_title',
        'owner',
        'score',
        'max_score',
        'percentage_display',
        'graded_at'
    )
    list_filter = ('assignment__course', 'graded_at')
    search_fields = (
        'assignment__title',
        'assignment__owner__username'
    )
    autocomplete_fields = ('assignment',)  # 需要 AssignmentAdmin 支持搜索

    def assignment_title(self, obj):
        return obj.assignment.title
    assignment_title.short_description = 'Assignment'

    def owner(self, obj):
        return obj.assignment.owner
    owner.short_description = 'Owner'
    owner.admin_order_field = 'assignment__owner'

    def percentage_display(self, obj):
        return f"{obj.percentage:.1f}%"
    percentage_display.short_description = 'Percentage'