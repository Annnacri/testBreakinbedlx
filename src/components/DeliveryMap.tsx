import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { MapPin, Info, AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY !== '';

export interface ZoneData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zipPrefixes: string[];
  descriptionPt: string;
  descriptionEn: string;
}

export const DELIVERY_ZONES_COORDINATES: ZoneData[] = [
  {
    id: 'alfama',
    name: 'Alfama',
    lat: 38.7121,
    lng: -9.1303,
    zipPrefixes: ['1100'],
    descriptionPt: 'Entrega silenciosa nas ruelas históricas e pitorescas de Alfama.',
    descriptionEn: 'Silent delivery in the historic and picturesque alleys of Alfama.',
  },
  {
    id: 'graca',
    name: 'Graça',
    lat: 38.7163,
    lng: -9.1300,
    zipPrefixes: ['1170'],
    descriptionPt: 'Serviço premium nos miradouros e colinas da Graça.',
    descriptionEn: 'Premium service near the viewpoints and hills of Graça.',
  },
  {
    id: 'vicente',
    name: 'São Vicente',
    lat: 38.7186,
    lng: -9.1275,
    zipPrefixes: ['1100', '1170'],
    descriptionPt: 'Pequenos-almoços entregues com discrição na histórica paróquia de São Vicente.',
    descriptionEn: 'Breakfasts delivered discretely in the historic parish of São Vicente.',
  },
  {
    id: 'apolonia',
    name: 'Santa Apolónia',
    lat: 38.7143,
    lng: -9.1218,
    zipPrefixes: ['1100', '1900'],
    descriptionPt: 'Entregas matinais rápidas junto à estação e zona ribeirinha.',
    descriptionEn: 'Fast morning deliveries near the station and waterfront area.',
  },
  {
    id: 'penha',
    name: 'Penha de França',
    lat: 38.7285,
    lng: -9.1265,
    zipPrefixes: ['1170', '1900'],
    descriptionPt: 'Cobertura completa em toda a encosta da Penha de França.',
    descriptionEn: 'Complete coverage across the entire slope of Penha de França.',
  },
  {
    id: 'arroios',
    name: 'Arroios',
    lat: 38.7330,
    lng: -9.1345,
    zipPrefixes: ['1150', '1170'],
    descriptionPt: 'O maior bairro multicultural de Lisboa, com pequeno-almoço gourmet à porta.',
    descriptionEn: 'Lisbon\'s largest multicultural hub, with gourmet breakfast at your door.',
  },
  {
    id: 'clara',
    name: 'Santa Clara',
    lat: 38.7845,
    lng: -9.1575,
    zipPrefixes: ['1750'],
    descriptionPt: 'Entregas matinais pontuais na zona residencial de Santa Clara.',
    descriptionEn: 'Punctual morning deliveries in the residential area of Santa Clara.',
  },
];

// Reusable Zone Marker component for Google Maps
function ZoneMarker({ zone, currentLanguage }: { zone: ZoneData; currentLanguage: 'pt' | 'en'; key?: string }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: zone.lat, lng: zone.lng }}
        onClick={() => setOpen(true)}
        title={zone.name}
      >
        <Pin background="#C5A880" glyphColor="#fff" borderColor="#78350F" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-1 max-w-[200px] text-stone-900 font-sans">
            <h4 className="font-bold text-sm text-stone-950 border-b pb-1 mb-1.5 flex items-center gap-1">
              <MapPin size={14} className="text-gold-700" /> {zone.name}
            </h4>
            <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
              {currentLanguage === 'pt' ? zone.descriptionPt : zone.descriptionEn}
            </p>
            <div className="bg-stone-50 rounded p-1 text-[10px] text-stone-700 border border-stone-100 font-mono">
              <strong>CP:</strong> {zone.zipPrefixes.map(p => `${p}-XXX`).join(', ')}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function DeliveryMap({ currentLanguage = 'pt' }: { currentLanguage?: 'pt' | 'en' }) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  if (!hasValidKey) {
    // Beautiful interactive schematic map fallback & instruction board
    return (
      <div id="delivery-map-fallback-container" className="w-full bg-stone-50 border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 bg-gradient-to-br from-stone-900 to-stone-950 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-400 text-[10px] font-bold tracking-wider uppercase mb-3">
              <Compass size={12} className="animate-spin" style={{ animationDuration: '6s' }} /> Google Maps API Required
            </span>
            <h3 className="font-sans text-xl font-bold tracking-tight text-stone-100">
              {currentLanguage === 'pt' ? 'Ativar Mapa Interativo' : 'Activate Interactive Map'}
            </h3>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              {currentLanguage === 'pt'
                ? 'Para visualizar o mapa de entregas em tempo real com o Google Maps, adicione a sua chave de API nas configurações do AI Studio.'
                : 'To view the real-time delivery map with Google Maps, please add your API Key in the AI Studio configuration.'}
            </p>
          </div>

          <div className="bg-stone-800/80 backdrop-blur-sm border border-stone-700/50 p-4 rounded-xl text-xs max-w-xs w-full text-stone-300">
            <h4 className="font-bold text-stone-100 flex items-center gap-1.5 mb-2">
              <Info size={14} className="text-gold-400" /> {currentLanguage === 'pt' ? 'Como configurar:' : 'How to configure:'}
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-stone-300 text-[11px] leading-relaxed">
              <li>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 underline hover:text-gold-300 font-semibold"
                >
                  {currentLanguage === 'pt' ? 'Obter chave de API' : 'Get API Key'}
                </a>
              </li>
              <li>
                {currentLanguage === 'pt' ? (
                  <>Abra <strong>Definições</strong> (⚙️ ícone no canto superior direito) → <strong>Secrets</strong></>
                ) : (
                  <>Open <strong>Settings</strong> (⚙️ icon in top-right corner) → <strong>Secrets</strong></>
                )}
              </li>
              <li>
                {currentLanguage === 'pt' ? (
                  <>Adicione <code>GOOGLE_MAPS_PLATFORM_KEY</code> e cole a chave de API</>
                ) : (
                  <>Add <code>GOOGLE_MAPS_PLATFORM_KEY</code> and paste your API key</>
                )}
              </li>
            </ol>
          </div>
        </div>

        {/* Dynamic Schematic Delivery Zones Map Fallback */}
        <div className="p-6 bg-white border-t border-stone-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-3">
              <h4 className="font-sans font-bold text-xs text-stone-500 uppercase tracking-wider">
                {currentLanguage === 'pt' ? 'Áreas Exclusivas em Lisboa' : 'Exclusive Lisbon Zones'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {currentLanguage === 'pt'
                  ? 'Clique em cada bairro para visualizar os códigos postais (CP) cobertos pelo nosso serviço gourmet silencioso:'
                  : 'Click on each neighborhood to view the postal codes (CP) covered by our silent gourmet service:'}
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {DELIVERY_ZONES_COORDINATES.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setActiveZoneId(zone.id === activeZoneId ? null : zone.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      activeZoneId === zone.id
                        ? 'border-gold-500 bg-gold-50/20 text-gold-950 shadow-sm'
                        : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-xs flex items-center gap-1.5">
                        <MapPin size={13} className={activeZoneId === zone.id ? 'text-gold-700' : 'text-stone-400'} />
                        {zone.name}
                      </h5>
                      <p className="text-[10px] text-stone-500 mt-0.5 font-mono">
                        {zone.zipPrefixes.map(p => `${p}-XXX`).join(', ')}
                      </p>
                    </div>
                    {activeZoneId === zone.id && (
                      <CheckCircle2 size={14} className="text-gold-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive vector simulation representing map zones */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-stone-50 border border-stone-200/60 rounded-xl p-6 relative overflow-hidden min-h-[320px]">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10">
                <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase">
                  {currentLanguage === 'pt' ? 'Esquema de Áreas de Entrega' : 'Delivery Areas Schematic'}
                </span>
                <h4 className="font-bold text-sm text-stone-900 mt-1">
                  {activeZoneId 
                    ? DELIVERY_ZONES_COORDINATES.find(z => z.id === activeZoneId)?.name
                    : (currentLanguage === 'pt' ? 'Selecione uma Área' : 'Select an Area')}
                </h4>
                <p className="text-xs text-stone-600 mt-1 max-w-md leading-relaxed">
                  {activeZoneId 
                    ? (currentLanguage === 'pt' 
                        ? DELIVERY_ZONES_COORDINATES.find(z => z.id === activeZoneId)?.descriptionPt 
                        : DELIVERY_ZONES_COORDINATES.find(z => z.id === activeZoneId)?.descriptionEn)
                    : (currentLanguage === 'pt'
                        ? 'Clique nas áreas à esquerda ou nos pinos abaixo para obter informações detalhadas.'
                        : 'Click on the areas on the left or pins below to get detailed information.')}
                </p>
              </div>

              {/* Schematic Map Visual Grid representation of Lisbon Tagus River and districts */}
              <div className="relative h-44 bg-stone-100 border border-stone-200/40 rounded-xl overflow-hidden mt-4 flex items-center justify-center">
                {/* River Tagus representation */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-blue-100/50 border-t border-blue-200/30 flex items-center justify-center">
                  <span className="text-[9px] text-blue-500 font-semibold uppercase tracking-widest font-serif opacity-60">
                    Rio Tejo (Tagus River)
                  </span>
                </div>

                {/* Simulated Pins */}
                <div className="absolute inset-0">
                  {/* Santa Clara (North) */}
                  <button 
                    onClick={() => setActiveZoneId('clara')}
                    className={`absolute top-4 left-1/3 -translate-x-1/2 p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'clara' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={24} className={activeZoneId === 'clara' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[8px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-1 font-mono">1750 (Santa Clara)</span>
                  </button>

                  {/* Arroios */}
                  <button 
                    onClick={() => setActiveZoneId('arroios')}
                    className={`absolute top-12 left-1/2 -translate-x-1/2 p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'arroios' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={24} className={activeZoneId === 'arroios' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[8px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-1 font-mono">1150/1170 (Arroios)</span>
                  </button>

                  {/* Penha de França */}
                  <button 
                    onClick={() => setActiveZoneId('penha')}
                    className={`absolute top-14 right-1/4 translate-x-1/2 p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'penha' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={24} className={activeZoneId === 'penha' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[8px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-1 font-mono">1170/1900</span>
                  </button>

                  {/* Graça & São Vicente */}
                  <button 
                    onClick={() => setActiveZoneId('graca')}
                    className={`absolute bottom-16 left-[45%] p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'graca' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={20} className={activeZoneId === 'graca' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[7px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-0.5 font-mono">1170 (Graça)</span>
                  </button>

                  <button 
                    onClick={() => setActiveZoneId('vicente')}
                    className={`absolute bottom-18 right-[35%] p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'vicente' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={20} className={activeZoneId === 'vicente' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[7px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-0.5 font-mono">1100/1170</span>
                  </button>

                  {/* Alfama */}
                  <button 
                    onClick={() => setActiveZoneId('alfama')}
                    className={`absolute bottom-14 left-[30%] p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'alfama' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={24} className={activeZoneId === 'alfama' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[8px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-1 font-mono">1100 (Alfama)</span>
                  </button>

                  {/* Santa Apolónia */}
                  <button 
                    onClick={() => setActiveZoneId('apolonia')}
                    className={`absolute bottom-12 right-[20%] p-2 rounded-full transition-all flex flex-col items-center group cursor-pointer ${
                      activeZoneId === 'apolonia' ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <MapPin size={24} className={activeZoneId === 'apolonia' ? 'text-gold-700 fill-gold-100' : 'text-stone-400 hover:text-gold-600'} />
                    <span className="text-[8px] font-bold bg-white px-1 py-0.5 rounded shadow border mt-1 font-mono">1100/1900</span>
                  </button>
                </div>
              </div>

              <div className="text-right text-[10px] text-stone-400 font-serif italic mt-2">
                Lisboa Oriental Gourmet Delivery Map
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the real Google Maps component when a valid key is provided
  return (
    <div id="delivery-map-google-container" className="w-full bg-stone-50 border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
        <div>
          <h3 className="font-sans text-sm font-bold tracking-tight text-stone-100">
            {currentLanguage === 'pt' ? 'Mapa Interativo de Áreas de Entrega' : 'Interactive Delivery Zones Map'}
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {currentLanguage === 'pt' 
              ? 'Passe o rato ou clique nos pinos para ver códigos postais elegíveis' 
              : 'Hover or click pins to see eligible postal codes'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 text-[10px] font-bold font-mono">
          Google Maps Live
        </div>
      </div>

      <div className="relative w-full h-[450px]">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={{ lat: 38.73, lng: -9.135 }}
            defaultZoom={12.5}
            mapId="BREAKFAST_DELIVERY_MAP"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {DELIVERY_ZONES_COORDINATES.map((zone) => (
              <ZoneMarker key={zone.id} zone={zone} currentLanguage={currentLanguage} />
            ))}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
