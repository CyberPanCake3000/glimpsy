'use client';

const MAX_LENGTH = 150;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClick?: (event: React.MouseEvent) => void;
};

export default function GoalForm({ value, onChange, onClick }: Props) {
  return (
    <form
      className="goal-form"
      onClick={onClick}
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="goal-form__field">
        <span>Your goal</span>
        <textarea
          className="form-control form-control-sm"
          rows={4}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your goal..."
        />
      </label>

      <span className="goal-form__counter">
        {value.length}/{MAX_LENGTH}
      </span>
    </form>
  );
}