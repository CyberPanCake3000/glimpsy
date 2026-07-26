'use client';

export type Tool = 'event' | 'action' | null;

type Props = {
  activeTool: Tool;
  onSelect: (tool: Tool) => void;
};

const tools = [
  { id: 'event' as const, label: 'event', shape: 'circle' },
  { id: 'action' as const, label: 'action', shape: 'square' },
];

export default function Toolbar({ activeTool, onSelect }: Props) {
  const toggle = (tool: 'event' | 'action') => {
    onSelect(activeTool === tool ? null : tool);
  };

  return (
    <div className="toolbar">
      {tools.map(({ id, label, shape }) => (
        <button
          key={id}
          type="button"
          className={`toolbar__btn ${activeTool === id ? 'toolbar__btn--active' : ''}`}
          onClick={() => toggle(id)}
        >
          <span className={`toolbar__preview toolbar__preview--${shape}`} />
          <span className="toolbar__label">{label}</span>
        </button>
      ))}
    </div>
  );
}