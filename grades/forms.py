from django import forms
from .models import Grade

class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = ['score', 'max_score', 'comment']
        labels = {
            'comment': 'Reflection',  # ← 关键修改：这里改标签
        }
        widgets = {
            'score': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.1'}),
            'max_score': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.1'}),
            'comment': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }