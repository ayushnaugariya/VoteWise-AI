/** Loading skeleton with shimmer animation */
export default function LoadingSkeleton({ lines = 4, ariaLabel = 'Loading content' }) {
  return (
    <div
      className="max-w-4xl mx-auto px-6 py-12 animate-fade-in"
      role="status"
      aria-label={ariaLabel}
    >
      <div className="shimmer h-10 w-2/3 rounded-xl mb-4" />
      <div className="shimmer h-4 w-full rounded-lg mb-2" />
      <div className="shimmer h-4 w-5/6 rounded-lg mb-8" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="card p-6 mb-4">
          <div className="shimmer h-5 w-1/3 rounded-lg mb-3" />
          <div className="shimmer h-4 w-full rounded-lg mb-2" />
          <div className="shimmer h-4 w-4/5 rounded-lg" />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
