import Script from "next/script";

export default function SwaggerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">API Dokumentacija</h1>
        <p className="mt-1 text-sm text-gray-600">
          Swagger UI za OpenAPI specifikaciju projekta.
        </p>
      </div>

      <div id="swagger-ui" className="pb-8" />

      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
      />
      <Script id="swagger-ui-init" strategy="afterInteractive">
        {`
          const addStylesheet = () => {
            if (document.getElementById('swagger-ui-css')) return;
            const link = document.createElement('link');
            link.id = 'swagger-ui-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
            document.head.appendChild(link);
          };
          let booted = false;
          const boot = () => {
            if (booted) return true;
            addStylesheet();
            if (!window.SwaggerUIBundle || !window.SwaggerUIStandalonePreset) return false;
            window.SwaggerUIBundle({
              url: '/api/openapi',
              dom_id: '#swagger-ui',
              presets: [
                window.SwaggerUIBundle.presets.apis,
                window.SwaggerUIStandalonePreset,
              ],
              layout: 'BaseLayout',
              deepLinking: true,
              persistAuthorization: true,
            });
            booted = true;
            return true;
          };
          const intervalId = window.setInterval(() => {
            if (boot()) {
              window.clearInterval(intervalId);
            }
          }, 200);
          window.addEventListener('load', () => {
            if (boot()) {
              window.clearInterval(intervalId);
            }
          });
        `}
      </Script>
    </main>
  );
}
