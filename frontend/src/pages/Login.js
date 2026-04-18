import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: `url('/background.jpg')` }}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/92 p-8 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-xl border border-white/80 bg-white px-3 py-2 shadow-lg shadow-slate-900/10">
            <img
              src="/vallakra-railworker-logo.png"
              alt="Vallåkra Railworker"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        <h2 className="mb-2 text-center text-3xl font-bold">Vallåkra Railworker</h2>
        <p className="mb-6 text-center text-sm text-gray-600">
          Öppna TSM-projekten direkt. HTSM använder en separat inloggningssida.
        </p>

        <button
          onClick={() => navigate('/panel')}
          className="w-full rounded-xl border border-blue-200 bg-blue-50 py-3 font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100"
        >
          Öppna TSM-projekt
        </button>
      </div>
    </div>
  );
}
