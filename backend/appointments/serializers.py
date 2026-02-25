from rest_framework import serializers
from users.serializers import UserSerializer
from doctors.serializers import DoctorProfileSerializer
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    """Full read serializer — used for GET responses."""
    patient = UserSerializer(read_only=True)
    doctor = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['patient', 'created_at', 'updated_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Minimal write serializer — used for booking (POST)."""
    # Accept 'notes' from the frontend and store it as 'reason'
    notes = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Appointment
        fields = [
            'doctor', 'appointment_date', 'appointment_time',
            'appointment_type', 'mode', 'reason', 'notes',
        ]

    def validate(self, data):
        # Allow frontend to send 'notes' as patient reason
        if 'notes' in data and not data.get('reason'):
            data['reason'] = data.pop('notes')
        elif 'notes' in data:
            data.pop('notes')

        doctor = data['doctor']
        appt_date = data['appointment_date']
        appt_time = data['appointment_time']

        # Check for duplicate slot
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appt_date,
            appointment_time=appt_time,
            status__in=['pending', 'confirmed']
        ).exists():
            raise serializers.ValidationError(
                "This time slot is already booked for the doctor.")
        return data


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Doctor/patient can update status, notes, reason, and cancellation."""

    class Meta:
        model = Appointment
        fields = ['status', 'notes', 'reason', 'cancelled_by', 'cancellation_reason', 'is_paid', 'fee_charged']
