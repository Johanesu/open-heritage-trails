interface ViewControlsProps {
  on3D: () => void;
  on2D: () => void;
  onFitRoute: () => void;
  onTemple11: () => void;
  onTemple12: () => void;
  disabled?: boolean;
}

function ViewControls({
  on3D,
  on2D,
  onFitRoute,
  onTemple11,
  onTemple12,
  disabled = false,
}: ViewControlsProps) {
  return (
    <nav
      aria-label="Map views and navigation"
      className="view-controls"
    >
      {([
        ['3D', on3D],
        ['2D', on2D],
        ['Fit route', onFitRoute],
        ['T11', onTemple11],
        ['T12', onTemple12],
      ] as const).map(([label, onClick]) => (
        <button
          disabled={disabled}
          key={label}
          onClick={onClick}
          type="button"
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

export default ViewControls;
