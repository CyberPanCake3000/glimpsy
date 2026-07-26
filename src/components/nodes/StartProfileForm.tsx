'use client';

import { type StartProfile } from '@/types/startProfile';

type Props = {
    profile: StartProfile;
    onChange: (profile: StartProfile) => void;
    onClick?: (event: React.MouseEvent) => void;
  };

export default function StartProfileForm({ profile, onChange, onClick  }: Props) {
    const updateField = (field: keyof StartProfile, value: string) => {
        onChange({ ...profile, [field]: value });
    };

  return (
    <form
      className="start-profile-form"
      onClick={onClick}
      onSubmit={(e) => e.preventDefault()}
    >
      <h3 className="start-profile-form__title">Profile</h3>

      <label className="start-profile-form__field">
        <span>Age</span>
        <input
          type="number"
          className="form-control form-control-sm"
          value={profile.age}
          onChange={(e) => updateField('age', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>Height (cm)</span>
        <input
          type="number"
          className="form-control form-control-sm"
          value={profile.height}
          onChange={(e) => updateField('height', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>Weight (kg)</span>
        <input
          type="number"
          className="form-control form-control-sm"
          value={profile.weight}
          onChange={(e) => updateField('weight', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>Income</span>
        <input
          type="number"
          className="form-control form-control-sm"
          value={profile.income}
          onChange={(e) => updateField('income', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>Savings</span>
        <input
          type="number"
          className="form-control form-control-sm"
          value={profile.savings}
          onChange={(e) => updateField('savings', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>City</span>
        <input
          type="text"
          className="form-control form-control-sm"
          value={profile.city}
          onChange={(e) => updateField('city', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>Profession</span>
        <input
          type="text"
          className="form-control form-control-sm"
          value={profile.profession}
          onChange={(e) => updateField('profession', e.target.value)}
        />
      </label>

      <label className="start-profile-form__field">
        <span>Activity Level</span>
        <select
          className="form-select form-select-sm"
          value={profile.activityLevel}
          onChange={(e) => updateField('activityLevel', e.target.value)}
        >
          <option value="">Select...</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label className="start-profile-form__field">
        <span>Additional Information</span>
        <textarea
          className="form-control form-control-sm"
          rows={3}
          value={profile.notes}
          onChange={(e) => updateField('notes', e.target.value)}
        />
      </label>
    </form>
  );
}