"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const resumeBlobUrlCache = new Map<string, string>();
const resumeBlobPromiseCache = new Map<string, Promise<string>>();

async function getResumeBlobUrl(file: string): Promise<string> {
    const cached = resumeBlobUrlCache.get(file);
    if (cached) return cached;

    const inFlight = resumeBlobPromiseCache.get(file);
    if (inFlight) return inFlight;

    const promise = fetch(file, { cache: "default" })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${file}: ${response.status}`);
            }
            return response.blob();
        })
        .then((blob) => {
            const blobUrl = URL.createObjectURL(blob);
            resumeBlobUrlCache.set(file, blobUrl);
            return blobUrl;
        })
        .finally(() => {
            resumeBlobPromiseCache.delete(file);
        });

    resumeBlobPromiseCache.set(file, promise);
    return promise;
}

export function ResumePreview({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { lang } = useI18n();
    const [isMobileViewport, setIsMobileViewport] = useState(false);

    // Use different resume based on language
    const resumeFile = useMemo(() => (lang === "zh" ? "/resume-zh.pdf" : "/resume-en.pdf"), [lang]);
    const [resumeState, setResumeState] = useState<{ file: string; url: string | null }>({
        file: resumeFile,
        url: resumeBlobUrlCache.get(resumeFile) ?? null,
    });
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const resumeBlobUrl =
        resumeState.file === resumeFile ? resumeState.url : (resumeBlobUrlCache.get(resumeFile) ?? null);

    const resolvedResumeUrl = resumeBlobUrl ?? resumeFile;
    const resumeSrc = isMobileViewport
        ? resolvedResumeUrl
        : `${resolvedResumeUrl}#toolbar=0&navpanes=0&view=FitH`;
    const isFrameLoading = open && loadedSrc !== resumeSrc;

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const update = () => setIsMobileViewport(mediaQuery.matches);
        update();
        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", update);
            return () => mediaQuery.removeEventListener("change", update);
        }
        mediaQuery.addListener(update);
        return () => mediaQuery.removeListener(update);
    }, []);

    useEffect(() => {
        let active = true;
        const timeoutId = setTimeout(() => {
            void getResumeBlobUrl(resumeFile)
                .then((blobUrl) => {
                    if (active) setResumeState({ file: resumeFile, url: blobUrl });
                })
                .catch(() => {
                    if (active) setResumeState({ file: resumeFile, url: null });
                });
        }, 200);
        return () => {
            active = false;
            clearTimeout(timeoutId);
        };
    }, [resumeFile]);

    useEffect(() => {
        if (!open) return;
        let active = true;
        void getResumeBlobUrl(resumeFile)
            .then((blobUrl) => {
                if (active) setResumeState({ file: resumeFile, url: blobUrl });
            })
            .catch(() => {
                if (active) setResumeState({ file: resumeFile, url: null });
            });
        return () => {
            active = false;
        };
    }, [open, resumeFile]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {lang === "en" ? "Resume Preview" : "简历预览"}
                    </DialogTitle>
                </DialogHeader>

                {/* PDF Preview with watermark overlay */}
                <div className="relative flex-1 overflow-hidden">
                    <div className="h-[70vh] relative">
                        {isFrameLoading && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                                <p className="text-sm text-muted-foreground">
                                    {lang === "en" ? "Loading resume preview..." : "正在加载简历预览..."}
                                </p>
                            </div>
                        )}

                        {/* Watermark overlay */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-5 gap-8 p-12">
                                {Array.from({ length: 15 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-center text-3xl font-bold text-muted-foreground/10 rotate-[-30deg] select-none whitespace-nowrap"
                                    >
                                        {lang === "en" ? "PREVIEW ONLY" : "仅供预览"}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* iframe gives us onLoad so we can render a true loading state */}
                        <iframe
                            key={resumeSrc}
                            src={resumeSrc}
                            title={lang === "en" ? "Resume Preview PDF" : "简历预览 PDF"}
                            onLoad={() => setLoadedSrc(resumeSrc)}
                            className="w-full h-full bg-white"
                        />
                    </div>
                </div>

                {/* Footer note */}
                <div className="px-6 py-3 border-t bg-muted/30">
                    <p className="text-xs text-center text-muted-foreground">
                        {lang === "en"
                            ? "This preview is for viewing purposes only. Please contact me directly for more information."
                            : "此预览仅供查看。如需更多信息，请直接联系我。"}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
