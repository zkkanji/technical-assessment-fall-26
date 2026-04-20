export default function PaginationButton({ onClick, disabled, children }) {
  return (
    <button
      className="pagination-btn"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
