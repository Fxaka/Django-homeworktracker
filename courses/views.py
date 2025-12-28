# courses/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required

from .models import Course
from .forms import CourseForm


@login_required
def course_list(request):
    """Displays all courses owned by the current user."""
    courses = Course.objects.filter(owner=request.user)
    return render(request, 'courses/list.html', {'courses': courses})


@login_required
def course_create(request):
    """Handles creation of a new course linked to the logged-in user."""
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save(commit=False)
            course.owner = request.user
            course.save()
            return redirect('courses:course_list')
    else:
        form = CourseForm()
    return render(request, 'courses/form.html', {'form': form})


@login_required
def course_edit(request, pk):
    """Allows editing an existing course owned by the current user."""
    course = get_object_or_404(Course, pk=pk, owner=request.user)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            return redirect('courses:course_list')
    else:
        form = CourseForm(instance=course)
    return render(request, 'courses/form.html', {'form': form, 'editing': True})


@login_required
def course_delete(request, pk):
    """Deletes a course after confirmation; only allowed for the owner."""
    course = get_object_or_404(Course, pk=pk, owner=request.user)
    if request.method == 'POST':
        course.delete()
        return redirect('courses:course_list')
    return render(request, 'courses/confirm_delete.html', {'course': course})