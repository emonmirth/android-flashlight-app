import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Terminal,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Zap,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const InstallGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onDownloadZip,
  isDownloading,
}) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'web'>('apk');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sharedUrl = window.location.href;

  return (
    <div
      id="install-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 text-neutral-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-100">
              ফোনে ইনস্টল করার সম্পূর্ণ নির্দেশিকা (Installation Guide)
            </h2>
            <p className="text-xs text-neutral-400">
              আপনার অ্যান্ড্রয়েড ফোনে অ্যাপটি চালু করার ২টি সহজ পদ্ধতি
            </p>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="mt-4 flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'apk'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>পদ্ধতি ১: Android Studio দিয়ে APK তৈরি (Native App)</span>
          </button>

          <button
            onClick={() => setActiveTab('web')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === 'web'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>পদ্ধতি ২: ফোনে সরাসরি ইনস্টল (Instant Web PWA)</span>
          </button>
        </div>

        {/* Tab 1: Android Studio & APK */}
        {activeTab === 'apk' && (
          <div className="mt-5 space-y-4 text-xs text-neutral-300 max-h-[60vh] overflow-y-auto pr-1">
            {/* Step 1 */}
            <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-neutral-100 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-xs">
                    ১
                  </span>
                  <span>প্রজেক্ট ZIP ফাইল ডাউনলোড করুন</span>
                </div>
                <button
                  onClick={onDownloadZip}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-neutral-950 hover:bg-amber-300 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'ZIP ডাউনলোড করুন'}</span>
                </button>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                উপরের <strong>ZIP ডাউনলোড করুন</strong> বাটনে ক্লিক করে <code className="text-amber-300">ShakeFlashlight-AndroidStudio-Project.zip</code> ফাইলটি আপনার কম্পিউটারে সেভ করুন এবং Unzip (Extract) করুন।
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-100 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-xs">
                  ২
                </span>
                <span>Android Studio-তে প্রজেক্ট ওপেন করুন</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
                <li>আপনার কম্পিউটারে <strong>Android Studio</strong> খুলুন।</li>
                <li><strong>File → Open</strong> মেনুতে ক্লিক করে আনজিপ করা ফোল্ডারটি সিলেক্ট করুন।</li>
                <li>Gradle Sync সম্পন্ন হতে ১-২ মিনিট সময় দিন (প্রয়োজনীয় লাইব্রেরি ডাউনলোড হবে)।</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-100 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-xs">
                  ৩
                </span>
                <span>APK ফাইল তৈরি (Build APK) করুন</span>
              </div>
              <p className="text-neutral-400">
                Android Studio-র উপরের মেনুবার থেকে ক্লিক করুন:
              </p>
              <div className="rounded-xl bg-neutral-900 p-2.5 font-mono text-amber-300 border border-neutral-800 text-[11px]">
                Build → Build Bundle(s) / APK(s) → Build APK(s)
              </div>
              <p className="text-neutral-400 mt-1">
                অথবা টার্মিনালে নিচের কমান্ডটি রান করতে পারেন:
              </p>
              <div className="flex items-center justify-between rounded-xl bg-neutral-900 p-2 font-mono text-neutral-300 border border-neutral-800 text-[11px]">
                <code>./gradlew assembleDebug</code>
                <button
                  onClick={() => copyToClipboard('./gradlew assembleDebug', 1)}
                  className="rounded p-1 text-neutral-400 hover:text-white"
                  title="Copy"
                >
                  {copiedIndex === 1 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-neutral-400">
                বিল্ড শেষ হলে নিচে একটি পপআপ আসবে <span className="text-emerald-400">"locate"</span> লিঙ্কে ক্লিক করলে <code className="text-amber-300">app-debug.apk</code> ফাইলটি পেয়ে যাবেন।
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-100 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-xs">
                  ৪
                </span>
                <span>ফোনে APK ইনস্টল করুন অথবা সরাসরি রান করুন</span>
              </div>
              <div className="space-y-2 text-neutral-400">
                <p>
                  <strong>পদ্ধতি ক (USB Cable দিয়ে সরাসরি):</strong>
                  <br />
                  ফোনে <em>Settings → Developer Options → USB Debugging</em> অন করুন। USB দিয়ে পিসিতে কানেক্ট করে Android Studio-র উপরের সবুজ <strong>Run (▶)</strong> বাটনে চাপলেই সরাসরি ফোনে ইনস্টল হয়ে ওপেন হবে।
                </p>
                <p>
                  <strong>পদ্ধতি খ (WhatsApp / Bluetooth / Drive দিয়ে APK পাঠিয়ে):</strong>
                  <br />
                  <code className="text-amber-300">app-debug.apk</code> ফাইলটি ফোনে পাঠিয়ে সেটিতে ট্যাপ করুন এবং <em>"Install"</em> দিন।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Direct Phone Browser / PWA */}
        {activeTab === 'web' && (
          <div className="mt-5 space-y-4 text-xs text-neutral-300 max-h-[60vh] overflow-y-auto pr-1">
            <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800/80 space-y-3">
              <div className="flex items-center gap-2 font-bold text-neutral-100 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-xs">
                  ১
                </span>
                <span>আপনার ফোনের ব্রাউজারে লিংকটি খুলুন</span>
              </div>
              <p className="text-neutral-400">
                কম্পিউটার ছাড়া এখনই যদি ফোনের সেন্সর এবং ফ্ল্যাশলাইট পরীক্ষা করতে চান, ফোনের Google Chrome ব্রাউজারে এই লিংকটি ওপেন করুন:
              </p>
              <div className="flex items-center justify-between rounded-xl bg-neutral-900 p-2.5 font-mono text-amber-300 border border-neutral-800 text-[11px] break-all">
                <span className="truncate mr-2">{sharedUrl}</span>
                <button
                  onClick={() => copyToClipboard(sharedUrl, 2)}
                  className="rounded p-1 text-neutral-400 hover:text-white shrink-0"
                  title="Copy Link"
                >
                  {copiedIndex === 2 ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-950 p-4 border border-neutral-800/80 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-100 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-xs">
                  ২
                </span>
                <span>ফোনে অ্যাপের মতো সেভ করুন (Add to Home screen)</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-400 pl-1">
                <li>ফোনে Chrome ব্রাউজারে সাইটটি ওপেন থাকা অবস্থায় ডানদিকের <strong>3-dots (⋮) মেনু</strong> তে ট্যাপ করুন।</li>
                <li><strong>"Install app"</strong> অথবা <strong>"Add to Home screen" (হোম স্ক্রিনে যোগ করুন)</strong> এ চাপুন।</li>
                <li>ফোনের হোম স্ক্রিনে "Shake Flashlight" অ্যাপের আইকন যুক্ত হয়ে যাবে!</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 space-y-1.5 text-neutral-300">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Zap className="h-4 w-4" />
                <span>সেন্সর ও ফ্ল্যাশলাইটের অনুমতি (Permissions)</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                ফোনে প্রথমবার ঝাঁকালে বা বাটন চাপলে ক্যামেরা ও মোশন সেন্সরের অনুমতি (Permission) চাইলে <strong>"Allow"</strong> দিন। এরপর ফোন ঝাঁকালেই রিয়েল-টাইমে ফ্ল্যাশলাইট কাজ করবে!
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
          >
            বুঝেছি / বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
