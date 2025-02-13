import { useState } from "react";
import { Mic, MicOff, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar"; // Import Sidebar
import { GroundingFiles } from "@/components/ui/grounding-files";
import GroundingFileView from "@/components/ui/grounding-file-view";
import StatusMessage from "@/components/ui/status-message";
import useRealTime from "@/hooks/useRealtime";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

import { ConversationAddTextCommand, GroundingFile, ToolResult } from "./types";

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [groundingFiles, setGroundingFiles] = useState<GroundingFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<GroundingFile | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state

    const { startSession, addUserAudio, inputAudioBufferClear, sendJsonMessage } = useRealTime({
        onWebSocketOpen: () => console.log("WebSocket connection opened"),
        onWebSocketClose: () => console.log("WebSocket connection closed"),
        onWebSocketError: event => console.error("WebSocket error:", event),
        onReceivedError: message => console.error("error", message),
        onReceivedResponseAudioDelta: message => {
            isRecording && playAudio(message.delta);
        },
        onReceivedInputAudioBufferSpeechStarted: () => {
            stopAudioPlayer();
        },
        onReceivedExtensionMiddleTierToolResponse: message => {
            const result: ToolResult = JSON.parse(message.tool_result);
            const files: GroundingFile[] = result.sources.map(x => ({ id: x.chunk_id, name: x.title, content: x.chunk }));
            setGroundingFiles(prev => [...prev, ...files]);
        }
    });

    const { reset: resetAudioPlayer, play: playAudio, stop: stopAudioPlayer } = useAudioPlayer();
    const { start: startAudioRecording, stop: stopAudioRecording } = useAudioRecorder({ onAudioRecorded: addUserAudio });

    const onToggleListening = async () => {
        if (!isRecording) {
            startSession();
            await startAudioRecording();
            resetAudioPlayer();
            setIsRecording(true);
        } else {
            await stopAudioRecording();
            stopAudioPlayer();
            inputAudioBufferClear();
            setIsRecording(false);
        }
    };

    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen w-screen bg-[url('assets/image.png')] text-white">
            <div className="flex flex-1 flex-col bg-gray-600">
                {/* Header */}
                <header className="flex items-center justify-between bg-gray-700 px-3 py-2 shadow-lg">
                    <div className="flex items-center gap-3">
                        <button className="rounded-md bg-gray-700 p-2 transition hover:bg-gray-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <img src="/fusion-logo.png" alt="fusion logo" className="h-12" />
                        <div className="text-sm font-bold">Fusion Solution</div>
                    </div>

                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-6">
                            <NavigationMenuItem className="hover:bg-yellow-550 cursor-pointer rounded-md bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-white transition duration-200">
                                <NavigationMenuTrigger className="text-lg font-bold">Sign In👩🏻‍💼</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="w-[200px] rounded-lg bg-gray-300 p-2 shadow-lg">
                                        <li className="cursor-pointer rounded p-2 text-sm text-gray-900 hover:bg-gray-100">Google</li>
                                        <li className="cursor-pointer rounded p-2 text-sm text-gray-900 hover:bg-gray-100">GitHub</li>
                                        <li className="cursor-pointer rounded p-2 text-sm text-gray-900 hover:bg-gray-100">Facebook</li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem className="hover:bg-yellow-550 cursor-pointer rounded-md bg-gradient-to-r from-yellow-400 to-yellow-600 px-5 py-2.5 text-lg font-bold text-white transition duration-200">
                                Sign Up👨🏻‍💼
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </header>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="flex flex-grow flex-col items-center justify-center px-4">
                    <div className="flex flex-col items-center justify-center space-y-1">
                        <h1 className="mb-8 bg-gradient-to-r from-yellow-500 to-[#0075c5] bg-clip-text text-4xl font-bold text-transparent md:text-7xl">
                            {t("app.title")}
                        </h1>
                        <DotLottieReact src="https://lottie.host/480c360c-c84b-42ec-9fd0-b8409c4e53cb/9KeguQ4fat.lottie" loop autoplay className="h-15 w-15" />
                    </div>

                    <Button
                        onClick={onToggleListening}
                        className={`h-14 w-60 rounded-full text-lg font-semibold shadow-lg transition duration-300 ${
                            isRecording
                                ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                                : "to-#4e859b bg-gradient-to-r from-yellow-400 hover:from-yellow-500 hover:to-yellow-700"
                        }`}
                        aria-label={isRecording ? t("app.stopRecording") : t("app.startRecording")}
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="mr-3 h-6 w-6" /> {t("app.stopConversation")}
                            </>
                        ) : (
                            <>
                                <Mic className="mr-3 h-8 w-8" /> {t("app.startRecording")}
                            </>
                        )}
                    </Button>

                    <StatusMessage isRecording={isRecording} />
                    <GroundingFiles files={groundingFiles} onSelected={setSelectedFile} />
                </main>

                <footer className="py-6 text-center text-gray-700">
                    <p>{t("app.footer")}</p>
                </footer>
                <GroundingFileView groundingFile={selectedFile} onClosed={() => setSelectedFile(null)} />
            </div>
        </div>
    );
}

export default App;
