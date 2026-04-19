import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center blur-sm brightness-75"
        style={{ backgroundImage: `url('/background.jpg')` }}
      />

      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/70 bg-white/92 p-8 shadow-2xl shadow-slate-950/25">
        <div className="mb-4 flex justify-center">
          <div className="rounded-xl border border-white/80 bg-white px-3 py-2 shadow-lg shadow-slate-900/10">
            <img
              src="/vallakra-railworker-logo.png"
              alt="Vallåkra Railworker"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.35em] text-blue-700">
          TSM
        </p>
        <h2 className="mb-3 text-center text-3xl font-bold text-slate-950">Vallåkra Railworker</h2>
        <p className="mb-6 text-center text-sm leading-6 text-slate-600">
          Härifrån öppnar du TSM-projekten direkt. Du kan ladda ner disp utan inloggning och loggar in först när du vill förplanera.
        </p>

        <button
          onClick={() => navigate('/panel')}
          className="w-full rounded-xl border border-blue-300 bg-blue-50 py-3 font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100"
        >
          Öppna TSM-projekt
        </button>

        <button
          onClick={() => navigate('/htsm-login')}
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          HTSM-inloggning
        </button>
      </div>
    </div>
  );
}
