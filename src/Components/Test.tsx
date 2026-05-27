import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Search, Link2, RotateCcw } from 'lucide-react';

// --- Types ---
type Unit = 'px' | '%' | 'em' | 'rem' | 'vh' | 'vw';

interface StyleValue {
  value: number;
  unit: Unit;
}

interface MultiValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: Unit;
  linked: boolean;
}

interface EditorState {
  height: StyleValue;
  width: StyleValue;
  scale: StyleValue;
  margin: MultiValue;
  padding: MultiValue;
  fontSize: StyleValue;
  fontWeight: number;
  lineHeight: StyleValue;
  letterSpace: StyleValue;
  wordSpace: StyleValue;
}

// --- Components ---

const UnitSelector = ({ value, onChange }: { value: Unit; onChange: (u: Unit) => void }) => (
  <select 
    className="bg-[#333] text-[10px] px-1 border-l border-gray-700 outline-none text-gray-400 hover:text-white"
    value={value}
    onChange={(e) => onChange(e.target.value as Unit)}
  >
    {['px', '%', 'em', 'vh', 'vw'].map(u => <option key={u} value={u}>{u}</option>)}
  </select>
);

const PropertySlider = ({ 
  label, 
  state, 
  onChange,
  min = 0,
  max = 500 
}: { 
  label: string; 
  state: StyleValue; 
  onChange: (val: StyleValue) => void;
  min?: number;
  max?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <div 
        className={`flex items-center text-[11px] py-1 cursor-pointer transition-colors ${isOpen ? 'text-blue-400' : 'text-gray-400'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} className="mr-2" /> : <ChevronRight size={14} className="mr-2" />}
        <span>{label}</span>
      </div>
      
      {isOpen && (
        <div className="flex items-center gap-3 pl-5 mt-2 animate-in slide-in-from-top-1 duration-200">
          <input 
            type="range" 
            min={min} 
            max={max}
            className="flex-1 accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            value={state.value}
            onChange={(e) => onChange({ ...state, value: parseInt(e.target.value) })}
          />
          <div className="flex items-center bg-[#2a2a2a] rounded border border-gray-700">
            <input 
              type="number" 
              className="w-9 bg-transparent text-center text-[11px] py-1 outline-none text-white"
              value={state.value}
              onChange={(e) => onChange({ ...state, value: parseInt(e.target.value) })}
            />
            <UnitSelector value={state.unit} onChange={(u) => onChange({ ...state, unit: u })} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function VisualCssEditor() {
  const [styles, setStyles] = useState<EditorState>({
    height: { value: 20, unit: 'px' },
    width: { value: 20, unit: 'px' },
    scale: { value: 20, unit: 'px' },
    margin: { top: 20, right: 20, bottom: 20, left: 20, unit: 'px', linked: true },
    padding: { top: 20, right: 20, bottom: 20, left: 20, unit: 'px', linked: true },
    fontSize: { value: 20, unit: 'px' },
    fontWeight: 400,
    lineHeight: { value: 20, unit: 'px' },
    letterSpace: { value: 20, unit: 'px' },
    wordSpace: { value: 20, unit: 'px' },
  });

  const [sections, setSections] = useState({ structure: true, style: false, text: false });

  return (
    <div className="w-[300px] bg-[#121212] text-gray-300 h-screen flex flex-col border-r border-white/10 select-none shadow-2xl">
      {/* Search Bar */}
      <div className="p-4 relative">
        <div className="absolute left-6 top-6 text-gray-500"><Search size={14} /></div>
        <input className="w-full bg-[#1e1e1e] rounded-md py-2 pl-9 pr-4 text-xs border border-transparent focus:border-blue-500/50 outline-none" placeholder="Search" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {/* STRUCTURE SECTION */}
        <div className="mb-2">
          <div 
            className="flex items-center p-2 text-sm font-semibold cursor-pointer hover:bg-white/5 rounded"
            onClick={() => setSections({ ...sections, structure: !sections.structure })}
          >
            {sections.structure ? <ChevronDown size={16} className="mr-2" /> : <ChevronRight size={16} className="mr-2" />}
            Structure
          </div>
          
          {sections.structure && (
            <div className="pl-2 mt-1 border-l border-white/5 ml-3">
              <PropertySlider label="Height" state={styles.height} onChange={(v) => setStyles({...styles, height: v})} />
              
              {/* Margin Example with Linking */}
              <div className="mb-4">
                <div className="flex items-center text-[11px] text-gray-400 py-1">
                  <ChevronDown size={14} className="mr-2" /> Margin <Link2 size={12} className="ml-auto text-blue-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-4 gap-1 pl-5 mt-1">
                  {[ 'top', 'right', 'bottom', 'left' ].map((pos) => (
                    <input key={pos} className="bg-[#2a2a2a] text-[10px] text-center py-1 rounded border border-gray-700" value={styles.margin[pos as keyof MultiValue] as number} readOnly />
                  ))}
                </div>
              </div>

              <PropertySlider label="Width" state={styles.width} onChange={(v) => setStyles({...styles, width: v})} />
              <PropertySlider label="Scale" state={styles.scale} onChange={(v) => setStyles({...styles, scale: v})} />
            </div>
          )}
        </div>

        {/* STYLE SECTION */}
        <div className="mb-2">
           <div className="flex items-center p-2 text-sm font-semibold cursor-pointer text-gray-500 hover:text-gray-300">
            <ChevronRight size={16} className="mr-2" /> Style
          </div>
        </div>

        {/* TEXT SECTION */}
        <div className="mb-2">
          <div 
            className="flex items-center p-2 text-sm font-semibold cursor-pointer hover:bg-white/5 rounded"
            onClick={() => setSections({ ...sections, text: !sections.text })}
          >
            {sections.text ? <ChevronDown size={16} className="mr-2" /> : <ChevronRight size={16} className="mr-2" />}
            Text
          </div>
          {sections.text && (
            <div className="pl-2 mt-1 border-l border-white/5 ml-3">
               <PropertySlider label="Font Size" state={styles.fontSize} onChange={(v) => setStyles({...styles, fontSize: v})} />
               <PropertySlider label="Line Height" state={styles.lineHeight} onChange={(v) => setStyles({...styles, lineHeight: v})} />
               <PropertySlider label="Letter Spacing" state={styles.letterSpace} onChange={(v) => setStyles({...styles, letterSpace: v})} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}