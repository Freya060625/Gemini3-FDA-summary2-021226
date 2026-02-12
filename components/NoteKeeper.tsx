import React, { useState } from 'react';
import { generateContent } from '../services/geminiService';
import { AppState } from '../types';
import { Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  appState: AppState;
}

const NoteKeeper: React.FC<Props> = ({ appState }) => {
  const [rawText, setRawText] = useState('');
  const [tool, setTool] = useState('Transform → Structured Markdown');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    if (!rawText) return;
    setIsLoading(true);

    let systemPrompt = "";
    if (tool === 'Transform → Structured Markdown') {
      systemPrompt = "You are an expert regulatory scribe. Convert the user's raw text into clean, well-structured Markdown.";
    } else if (tool === 'Entity Extraction') {
      systemPrompt = "Extract exactly 20 key regulatory entities from the text (Device Name, Indications, Risks, etc.). Return as a Markdown table.";
    } else if (tool === 'Quiz') {
       systemPrompt = "Create 5 multiple-choice questions (MCQs) to test understanding of the regulatory content.";
    }

    try {
      const output = await generateContent("gemini-3-flash-preview", rawText, systemPrompt, 0.3, 4000);
      setResult(output);
    } catch (e) {
      setResult("Error running tool.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto h-[calc(100vh-140px)]">
      <div className="flex flex-col gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
           <h3 className="font-bold mb-4 flex items-center gap-2"><Wand2 size={20}/> Note Tools</h3>
           
           <select 
             value={tool}
             onChange={(e) => setTool(e.target.value)}
             className="w-full bg-black/20 border border-white/10 rounded p-2 mb-4"
           >
             <option>Transform → Structured Markdown</option>
             <option>Entity Extraction</option>
             <option>Quiz</option>
           </select>

           <textarea
             value={rawText}
             onChange={(e) => setRawText(e.target.value)}
             placeholder="Paste raw meeting notes, testing summaries, etc..."
             className="w-full h-64 bg-black/20 border border-white/10 rounded p-3 focus:outline-none focus:border-[var(--theme-accent)] resize-none"
           />
           
           <button
             onClick={handleRun}
             disabled={isLoading}
             className="mt-4 w-full py-2 bg-[var(--theme-primary)] text-white rounded hover:brightness-110 disabled:opacity-50 transition-all"
           >
             {isLoading ? 'Processing...' : 'Run Tool'}
           </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 overflow-auto">
        <h3 className="font-bold mb-4 opacity-70">Result</h3>
        <div className="prose prose-invert prose-sm">
           <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default NoteKeeper;
