'use client';

export type Tool = 'event' | 'action' | 'remove' | 'glimpse' | 'goal' | null;

type Props = {
  activeTool: Tool;
  onSelect: (tool: Tool) => void;
  onShareClick: () => void;
};

const tools = [
  { id: 'event' as const, label: 'event', shape: 'circle' },
  { id: 'action' as const, label: 'action', shape: 'square' },
  { id: 'goal' as const, label: 'goal', shape: 'diamond' },
  { id: 'remove' as const, label: 'remove', icon: 'bi-eraser' },
  { id: 'glimpse' as const, label: 'glimpse', icon: 'bi-stars' },
];

export default function Toolbar({ activeTool, onSelect, onShareClick }: Props) {
  {
    const toggle = (tool: 'event' | 'action' | 'remove' | 'glimpse' | 'goal') => {
      onSelect(activeTool === tool ? null : tool);
    };

    return (
      <div className="toolbar">
        {tools.map(({ id, label, shape, icon }) => (
          <button
            key={id}
            type="button"
            className={`toolbar__btn ${activeTool === id ? 'toolbar__btn--active' : ''}`}
            onClick={() => toggle(id)}
          >
            {icon ? (
              <i className={`bi ${icon} toolbar__icon`} />
            ) : (
              <span className={`toolbar__preview toolbar__preview--${shape}`} />
            )}
            <span className="toolbar__label">{label}</span>
          </button>
        ))}
        <button
          type="button"
          className="toolbar__btn toolbar__btn--share"
          onClick={onShareClick}
        >
          <i className="bi bi-share toolbar__icon" />
          <span className="toolbar__label">share</span>
        </button>
      </div>
    );
  }
}