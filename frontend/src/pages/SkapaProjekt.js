import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';



const SkapaProjekt = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [plats, setPlats] = useState('');
  const [projektNamn, setProjektNamn] = useState('');
  const [namn, setNamn] = useState('');
  const [telefonnummer, setTelefonnummer] = useState('');
  const [avstamt, setAvstamt] = useState(false);
  const [objekt, setObjekt] = useState('');
  const [uttagningstid, setUttagningstid] = useState('');
  const [signatur, setSignatur] = useState('');
  const [avslutaSkyddTid, setAvslutaSkyddTid] = useState('');
  const [avslutningstid, setAvslutningstid] = useState('');
  const [avslutningssignatur, setAvslutningssignatur] = useState('');
  const [beteckningar, setBeteckningar] = useState([{ value: '' }]);
  const [sections, setSections] = useState([]);

  const addBeteckning = () => {
    setBeteckningar([...beteckningar, { value: '' }]);
  };

  const handleBeteckningChange = (index, value) => {
    const updated = [...beteckningar];
    updated[index].value = value;
    setBeteckningar(updated);
  };

  const addSection = () => {
    const updated = [...sections, { type: 'Linje', name: '', signal: '' }];
    setSections(updated);
  };

  const updateSignal = (index, value) => {
    const updated = [...sections];
    updated[index].signal = value;
    updated[index].name = value;
    setSections(updated);
  };

  const updateSectionType = (index, type) => {
    const updated = [...sections];
    updated[index].type = type;
    setSections(updated);
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const getLetter = (i) => String.fromCharCode(65 + i); // A, B, C...

  const handleCreateProject = async () => {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    if (!token) {
      alert('Du är inte inloggad.');
      return;
    }

    try {
      const newProject = {
        name: projektNamn,
        startDate: startDate || '',
        startTime: startTime || '',
        endDate: endDate || '',
        endTime: endTime || '',
        plats: plats || '',
        namn: namn || '',
        telefonnummer: telefonnummer || '',
        avstamt,
        objekt,
        uttagningstid,
        signatur,
        avslutaSkyddTid,
        avslutningstid,
        avslutningssignatur,
        beteckningar: beteckningar.map((b) => ({ value: b.value })),
        sections: sections.map((sec) => ({
          type: sec.type,
          name: sec.name || sec.signal || '',
          signal: sec.signal || sec.name || '',
        })),
      };

      const response = await fetch('https://railworker-production.up.railway.app/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Kunde inte skapa projekt');
      }

      const data = await response.json();
      console.log('✅ Projekt skapat med beteckningar:', data.beteckningar);

      navigate('/dashboard');
    } catch (err) {
      console.error('Fel vid projekt-skapande:', err);
      alert('Något gick fel. Försök igen.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <Header />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-24">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Skapa projekt</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Ny dispositionsarbetsplan</h1>
              <p className="mt-2 text-sm text-slate-600">
                Samla allt på en plats – från FJTKL till delområden. Du kan alltid justera senare.
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Skapa projekt
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Checklist</div>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-center justify-between">
                  <span>Projektdata</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">01</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>FJTKL & skydd</span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700">02</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Beteckningar</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">03</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Delområden</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">04</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Sammanfattning</div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Start</span>
                  <span className="font-semibold text-slate-900">{startDate || '—'} {startTime || ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Slut</span>
                  <span className="font-semibold text-slate-900">{endDate || '—'} {endTime || ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delområden</span>
                  <span className="font-semibold text-slate-900">{sections.length}</span>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Projektöversikt</h2>
                  <p className="text-xs text-slate-500">Namngivning och tidsram</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  01
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Projektnamn</label>
                  <input
                    type="text"
                    value={projektNamn}
                    onChange={(e) => setProjektNamn(e.target.value)}
                    placeholder="Ex. Rååbanan nattarbete"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Plats</label>
                  <input
                    type="text"
                    value={plats}
                    onChange={(e) => setPlats(e.target.value)}
                    placeholder="Ex. Råå, Marieholm, Teckomatorp"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {[
                  { label: 'Startdatum', value: startDate, onChange: setStartDate, type: 'date' },
                  { label: 'Starttid', value: startTime, onChange: setStartTime, type: 'time' },
                  { label: 'Slutdatum', value: endDate, onChange: setEndDate, type: 'date' },
                  { label: 'Sluttid', value: endTime, onChange: setEndTime, type: 'time' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">FJTKL & Objekt</h2>
                    <p className="text-xs text-slate-500">Ansvarig kontakt & avstämt</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    02
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL namn</label>
                    <input
                      type="text"
                      value={namn}
                      onChange={(e) => setNamn(e.target.value)}
                      placeholder="Namn"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">FJTKL telefon</label>
                    <input
                      type="text"
                      value={telefonnummer}
                      onChange={(e) => setTelefonnummer(e.target.value)}
                      placeholder="Telefonnummer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Objekt</label>
                    <input
                      type="text"
                      value={objekt}
                      onChange={(e) => setObjekt(e.target.value)}
                      placeholder="Objekt"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={avstamt}
                      onChange={(e) => setAvstamt(e.target.checked)}
                      className="h-4 w-4 accent-slate-900"
                    />
                    Avstämt
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Skydd & Signatur</h2>
                    <p className="text-xs text-slate-500">Tider och signering</p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    03
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Uttagningstid
                    </label>
                    <input
                      type="time"
                      value={uttagningstid}
                      onChange={(e) => setUttagningstid(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Avsluta senast
                    </label>
                    <input
                      type="time"
                      value={avslutaSkyddTid}
                      onChange={(e) => setAvslutaSkyddTid(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Signatur
                    </label>
                    <input
                      type="text"
                      value={signatur}
                      onChange={(e) => setSignatur(e.target.value)}
                      placeholder="Signatur"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Avslutningstid
                    </label>
                    <input
                      type="time"
                      value={avslutningstid}
                      onChange={(e) => setAvslutningstid(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Avslutningssignatur
                    </label>
                    <input
                      type="text"
                      value={avslutningssignatur}
                      onChange={(e) => setAvslutningssignatur(e.target.value)}
                      placeholder="Signatur"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Beteckningar</h2>
                  <p className="text-xs text-slate-500">Lägg till signalbeteckningar för snabbt urval</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                  04
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {beteckningar.map((b, i) => (
                  <input
                    key={i}
                    type="text"
                    value={b.value}
                    onChange={(e) => handleBeteckningChange(i, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                    placeholder={`Beteckning ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={addBeteckning}
                className="mt-4 inline-flex items-center rounded-xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                + Lägg till beteckning
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Delområden</h2>
                  <p className="text-xs text-slate-500">Skapa DP/Linje och ange signaltext</p>
                </div>
                <button
                  onClick={addSection}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                >
                  Lägg till delområde
                </button>
              </div>

              {sections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                  Inga delområden ännu. Lägg till ett för att börja.
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((sec, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-700">
                          {sec.type} {getLetter(i)}
                        </div>
                        <button
                          onClick={() => removeSection(i)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Ta bort
                        </button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                        <select
                          value={sec.type}
                          onChange={(e) => updateSectionType(i, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        >
                          <option value="Linje">Linje</option>
                          <option value="DP">DP</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Signal / benämning"
                          value={sec.signal || sec.name || ''}
                          onChange={(e) => updateSignal(i, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Skapa projekt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkapaProjekt;
