# core/views.py

import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.db.models import Count, Q
from assignments.models import Assignment
from datetime import timedelta


@login_required
def dashboard(request):
    """
    Renders the user's personalized dashboard with:
    - Task completion stats
    - Course-wise progress chart
    - Upcoming deadlines (next 7 days)
    - Calendar and reminder data in JSON format
    """
    user = request.user
    assignments = Assignment.objects.filter(owner=user)

    # Overall assignment statistics
    total = assignments.count()
    completed = assignments.filter(completed=True).count()
    overdue = assignments.filter(
        completed=False,
        due_date__lt=timezone.now()
    ).count()

    # Course-based completion rates (excludes uncategorized assignments)
    course_stats = (
        assignments
        .filter(course__isnull=False)
        .values('course__name')
        .annotate(
            total=Count('id'),
            completed=Count('id', filter=Q(completed=True))
        )
        .order_by('course__name')
    )

    course_chart_data = []
    for stat in course_stats:
        rate = round(stat['completed'] / stat['total'] * 100, 1) if stat['total'] > 0 else 0
        course_chart_data.append({
            'course_name': stat['course__name'],
            'completion_rate': rate,
        })

    # Upcoming assignments: next 7 days (including today)
    today = timezone.now().date()
    seven_days_later = today + timedelta(days=6)
    upcoming_assignments = assignments.filter(
        completed=False,
        due_date__date__gte=today,
        due_date__date__lte=seven_days_later
    ).order_by('due_date')[:10]

    # Prepare JSON data for frontend calendar and reminders (with local time)
    upcoming_json = [
        {
            "title": a.title,
            "due_date": timezone.localtime(a.due_date).isoformat(),
            "course": a.course.name if a.course else "No Course",
        }
        for a in upcoming_assignments
    ]

    # All future incomplete assignments for browser-based reminders
    upcoming_for_reminder = Assignment.objects.filter(
        owner=user,
        completed=False,
        due_date__gt=timezone.now()
    ).values('title', 'due_date')

    upcoming_for_reminder_list = [
        {
            "title": item['title'],
            "due_date": timezone.localtime(item['due_date']).isoformat(),
        }
        for item in upcoming_for_reminder
    ]

    # Full calendar event data (for FullCalendar.js or similar)
    calendar_events = []
    for assignment in assignments.filter(due_date__isnull=False):
        calendar_events.append({
            'title': assignment.title,
            'start': assignment.due_date.isoformat(),  # Keep as UTC for calendar consistency
            'extendedProps': {
                'completed': assignment.completed,
                'is_overdue': assignment.is_overdue,
                'course': assignment.course.name if assignment.course else 'No Course'
            }
        })

    # Build context for template
    context = {
        'total_assignments': total,
        'completed_assignments': completed,
        'overdue_assignments': overdue,
        'completion_rate': round(completed / total * 100, 1) if total > 0 else 0,
        'course_chart_data': course_chart_data,
        'calendar_events_json': json.dumps(calendar_events),
        'upcoming_json': json.dumps(upcoming_json),
        'upcoming_assignments_for_reminder_json': upcoming_for_reminder_list,
        'upcoming_assignments': upcoming_assignments,
    }

    return render(request, 'core/dashboard.html', context)