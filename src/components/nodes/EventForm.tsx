'use client';

const MAX_LENGTH = 150;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onClick?: (event: React.MouseEvent) => void;
};

export default function EventForm({ value, onChange, onClick }: Props) {
  return (
    <form
      className="event-form"
      onClick={onClick}
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="event-form__field">
        <span>Event</span>
        <textarea
          className="form-control form-control-sm"
          rows={4}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe event..."
        />
      </label>

      <span className="event-form__counter">
        {value.length}/{MAX_LENGTH}
      </span>
    </form>
  );
}