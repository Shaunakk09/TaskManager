import { useState } from 'react';
import FormInput from '../common/FormInput';
import FormTextarea from '../common/FormTextarea';

interface ProfileFormProps {
  initialData?: {
    name: string;
    email: string;
    bio: string;
  };
  onSubmit: (data: { name: string; email: string; bio: string }) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ProfileForm = ({ initialData, onSubmit, onCancel, isEditing }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    bio: initialData?.bio ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const clearError = (field: string) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        id="name"
        name="name"
        label="Name"
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          clearError('name');
        }}
        disabled={!isEditing}
        error={errors.name}
        required
      />

      <FormInput
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={(e) => {
          setFormData({ ...formData, email: e.target.value });
          clearError('email');
        }}
        disabled={!isEditing}
        error={errors.email}
        required
      />

      <FormTextarea
        id="bio"
        name="bio"
        label="Bio"
        value={formData.bio}
        onChange={(e) => {
          setFormData({ ...formData, bio: e.target.value });
          clearError('bio');
        }}
        disabled={!isEditing}
        error={errors.bio}
        rows={3}
      />

      <div className="flex justify-end space-x-3">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onCancel()}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Edit Profile
          </button>
        )}
      </div>
    </form>
  );
};

export default ProfileForm; 