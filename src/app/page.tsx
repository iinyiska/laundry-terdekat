import Link from "next/link";
import { MapPin, Search, Truck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50">
      {/* Hero Section */}
      <section className="w-full bg-blue-600 text-white py-12 px-4 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Laundry Terdekat & Termudah</h1>
          <p className="mb-6 text-blue-100">Cuci bersih, wangi, dan diantar sampai depan rumah.</p>

          <div className="bg-white p-2 rounded-full shadow-md flex items-center max-w-md mx-auto">
            <MapPin className="text-gray-400 ml-3 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari lokasi kamu..."
              className="flex-1 p-3 outline-none text-gray-800 rounded-full"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 px-4 max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Kenapa Laundry Terdekat?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-600">
              <MapPin />
            </div>
            <span className="text-sm font-medium text-gray-700">Terdekat</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-3 text-green-600">
              <Truck />
            </div>
            <span className="text-sm font-medium text-gray-700">Antar Jemput</span>
          </div>
          {/* Add more features */}
        </div>
      </section>

      {/* CTA Buttons */}
      <section className="fixed bottom-0 w-full bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-around border-t md:static md:bg-transparent md:shadow-none md:border-none md:justify-center md:gap-4 md:mb-10">
        <Link href="/login" className="flex-1 max-w-xs bg-blue-600 text-white py-3 rounded-xl font-semibold text-center mx-2 shadow hover:bg-blue-700 transition">
          Mulai Laundry
        </Link>
        <Link href="/merchant/register" className="flex-1 max-w-xs bg-white text-blue-600 border border-blue-600 py-3 rounded-xl font-semibold text-center mx-2 shadow hover:bg-gray-50 transition">
          Jadi Mitra
        </Link>
      </section>
    </main>
  );
}
