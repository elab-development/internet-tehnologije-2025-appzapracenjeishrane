import Link from "next/link";
export default function Home() {
  return (
    <main
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Dobrodošao 👋</h1>

        <p className="mt-2 text-gray-600">
          Ovo je početna stranica aplikacije.
        </p>

        <Link
          href="/water"
          className="inline-block mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Prati unos vode
        </Link>



      </div>
    </main>
  );
}
