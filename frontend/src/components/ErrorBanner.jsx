function ErrorBanner({ message, onRetry }) {
  return (
    <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 text-xl">
          ⚠️
        </span>

        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">
            Couldn't analyze this sentence
          </p>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}

export default ErrorBanner;
