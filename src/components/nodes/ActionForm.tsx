'use client';

const MAX_LENGTH = 150;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClick?: (event: React.MouseEvent) => void;
};

export default function ActionForm({ value, onChange, onClick }: Props) {
  return (
    <form
      className="action-form"
      onClick={onClick}
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="action-form__field">
        <span>Your action</span>
        <textarea
          className="form-control form-control-sm"
          rows={4}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your action..."
        />
      </label>

      <span className="action-form__counter">
        {value.length}/{MAX_LENGTH}
      </span>
    </form>
  );
}