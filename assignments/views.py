# assignments/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import HttpResponse
from datetime import datetime
from zoneinfo import ZoneInfo

from .models import Assignment
from .forms import AssignmentForm
from courses.models import Course


@login_required
def assignment_list(request):
    """
    Displays a filtered and searchable list of the user's assignments.
    Supports filtering by course (including 'uncategorized') and keyword search.
    """
    user = request.user
    query = request.GET.get('q', '').strip()
    course_filter = request.GET.get('course', '').strip()

    assignments = Assignment.objects.filter(owner=user)

    # Search by title or associated course name
    if query:
        assignments = assignments.filter(
            Q(title__icontains=query) | Q(course__name__icontains=query)
        )

    # Filter by course: 'uncategorized' means no course assigned
    if course_filter == 'uncategorized':
        assignments = assignments.filter(course__isnull=True)
    elif course_filter.isdigit():
        assignments = assignments.filter(course_id=int(course_filter))

    # Optimize DB queries with select_related and prefetch_related
    assignments = assignments.select_related('course').prefetch_related('grade')
    courses = Course.objects.filter(owner=user).order_by('name')

    return render(request, 'assignments/list.html', {
        'assignments': assignments,
        'courses': courses,
        'search_query': query,
        'selected_course_filter': course_filter,
    })


@login_required
def assignment_create(request):
    """Creates a new assignment linked to the current user."""
    if request.method == 'POST':
        form = AssignmentForm(request.POST, user=request.user)
        if form.is_valid():
            assignment = form.save(commit=False)
            assignment.owner = request.user
            assignment.save()
            return redirect('assignments:assignment_list')
    else:
        form = AssignmentForm(user=request.user)
    return render(request, 'assignments/form.html', {
        'form': form,
        'title': 'Add Assignment'
    })


@login_required
def assignment_edit(request, pk):
    """Edits an existing assignment owned by the current user."""
    assignment = get_object_or_404(Assignment, pk=pk, owner=request.user)
    if request.method == 'POST':
        form = AssignmentForm(request.POST, instance=assignment, user=request.user)
        if form.is_valid():
            form.save()
            return redirect('assignments:assignment_list')
    else:
        form = AssignmentForm(instance=assignment, user=request.user)
    return render(request, 'assignments/form.html', {
        'form': form,
        'title': 'Edit Assignment'
    })


@login_required
def assignment_delete(request, pk):
    """Deletes an assignment after confirmation."""
    assignment = get_object_or_404(Assignment, pk=pk, owner=request.user)
    if request.method == 'POST':
        assignment.delete()
        return redirect('assignments:assignment_list')
    return render(request, 'assignments/confirm_delete.html', {'assignment': assignment})


@login_required
def assignment_toggle(request, pk):
    """Toggles the completion status of an assignment."""
    assignment = get_object_or_404(Assignment, pk=pk, owner=request.user)
    assignment.completed = not assignment.completed
    assignment.save()
    return redirect('assignments:assignment_list')


@login_required
def assignment_detail(request, pk):
    """Shows detailed view of a single assignment."""
    assignment = get_object_or_404(Assignment, pk=pk, owner=request.user)
    return render(request, 'assignments/detail.html', {
        'assignment': assignment,
    })


@login_required
def export_calendar(request):
    """
    Exports all incomplete assignments as an iCalendar (.ics) file.
    Uses UTC timestamps for compatibility with calendar apps like Google Calendar.
    """
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Homework Tracker//YourApp//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    user_tz = ZoneInfo("UTC")  # Standardized to UTC for broad compatibility

    for assignment in Assignment.objects.filter(owner=request.user, completed=False):
        if not assignment.due_date:
            continue

        due = assignment.due_date
        if due.tzinfo is None:
            due = due.replace(tzinfo=user_tz)

        dt_str = due.strftime("%Y%m%dT%H%M%SZ")
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:assignment-{assignment.id}@homeworktracker",
            f"SUMMARY:{assignment.title}",
            f"DESCRIPTION:{assignment.description or 'No description'}",
            f"DTSTART:{dt_str}",
            f"DTEND:{dt_str}",
            f"DTSTAMP:{datetime.now(user_tz).strftime('%Y%m%dT%H%M%SZ')}",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    response = HttpResponse("\r\n".join(lines), content_type="text/calendar")
    response["Content-Disposition"] = 'attachment; filename="homework_tracker.ics"'
    return response