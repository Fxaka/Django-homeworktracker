# grades/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required

from assignments.models import Assignment
from .models import Grade
from .forms import GradeForm


@login_required
def record_grade(request, assignment_id):
    """
    Allows the course owner to record or update a grade for a specific assignment.
    Automatically marks the assignment as completed upon successful grading.
    """
    assignment = get_object_or_404(Assignment, id=assignment_id, owner=request.user)

    # Fetch existing grade if it exists; otherwise, create a new one
    grade = Grade.objects.filter(assignment=assignment).first()

    if request.method == 'POST':
        form = GradeForm(request.POST, instance=grade)
        if form.is_valid():
            saved_grade = form.save(commit=False)
            saved_grade.assignment = assignment
            saved_grade.save()

            # Mark assignment as completed once a grade is recorded
            assignment.completed = True
            assignment.save()

            return redirect('assignments:assignment_detail', pk=assignment.id)
    else:
        form = GradeForm(instance=grade)

    return render(request, 'grades/record_grade.html', {
        'form': form,
        'assignment': assignment,
    })