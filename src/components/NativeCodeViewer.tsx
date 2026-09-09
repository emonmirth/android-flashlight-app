import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ANDROID_FILES } from '../nativeAndroidCode';
import { generateAndroidStudioZip, downloadBlob } from '../utils/zipExport';

export const NativeCodeViewer: React.FC = () => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'app/src/main/java/com/flashlight/shake/service/ShakeFlashlightService.kt'
  );
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedFile =
    ANDROID_FILES.find((f) => f.path === selectedFilePath) || ANDROID_FILES[0];

  const handleCopy = async () => {
    if (selectedFile) {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zipBlob = await generateAndroidStudioZip();
      downloadBlob(zipBlob, 'ShakeFlashlight-AndroidStudio-Project.zip');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="native-code-viewer"
      className="flex h-full flex-col rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden"
    >
      {/* Top Header bar with Download ZIP button */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-neutral-100">
            Native Android Studio Project (Kotlin + Jetpack Compose)
          </h2>
        </div>

        <button
          id="download-android-zip-btn"
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 shadow-md hover:from-amber-300 hover:to-amber-400 active:scale-95 transition disabled:opacity-50"
        >
          {isExporting ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
              Building ZIP...
            </span>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Download Android Project (.zip)
            </>
          )}
        </button>
      </div>

      {/* Main split view: File list & Code preview */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left: File Tree */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/40 p-2 overflow-y-auto space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Source Tree
          </div>

          {ANDROID_FILES.map((file) => {
            const isSelected = file.path === selectedFilePath;
            return (
              <button
                key={file.path}
                id={`file-tab-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`}
                onClick={() => setSelectedFilePath(file.path)}
                className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                  isSelected
                    ? 'bg-amber-400/15 text-amber-300 font-medium'
                    : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                }`}
              >
                <FileCode
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isSelected ? 'text-amber-400' : 'text-neutral-400'
                  }`}
                />
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Code Viewer */}
        <div className="flex flex-1 flex-col overflow-hidden bg-neutral-950">
          {/* File description & copy header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/60 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="font-mono text-neutral-300 font-semibold truncate">
                {selectedFile.path}
              </span>
              <span className="hidden sm:inline-block text-[10px] text-neutral-400 truncate">
                • {selectedFile.description}
              </span>
            </div>

            <button
              id="copy-code-btn"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white transition shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code content */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-neutral-300 leading-relaxed">
            <pre className="selection:bg-amber-500/30">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
