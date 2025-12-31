export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
