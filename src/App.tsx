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
        <div className="flex min-h-screen bg-[url('assets/image.png')] text-white">
            {/* Sidebar */}

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <header className="flex items-center justify-between bg-gray-800 px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <button className="rounded-md bg-gray-700 p-2 transition hover:bg-gray-600" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <Menu className="h-6 w-6" />
                        </button>
                        <img src="/fusion-logo.png" alt="fusion logo" className="h-12" />
                        <div className="text-sm font-bold">Fusion Solution</div>
                    </div>
                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-6">
                            <NavigationMenuItem className="cursor-pointer rounded-md bg-yellow-500 px-3 py-1 text-white transition duration-200 hover:bg-yellow-600">
                                <NavigationMenuTrigger>Sign In</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="w-[200px] rounded-lg bg-white p-2 shadow-lg">
                                        <li className="cursor-pointer rounded p-2 text-sm text-gray-700 hover:bg-gray-100">Google</li>
                                        <li className="cursor-pointer rounded p-2 text-sm text-gray-700 hover:bg-gray-100">GitHub</li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="cursor-pointer rounded-md bg-yellow-500 px-5 py-3 text-white transition duration-200 hover:bg-yellow-600">
                                Sign Up
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </header>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content */}
                <main className="flex flex-grow flex-col items-center justify-center px-4">
                    <h1 className="mb-8 bg-gradient-to-r from-[#a67511] to-[#353942] bg-clip-text text-4xl font-bold text-transparent md:text-7xl">
                        {t("app.title")}
                    </h1>
                    <Button
                        onClick={onToggleListening}
                        className={`h-14 w-60 rounded-full text-lg font-semibold shadow-lg transition duration-300 ${
                            isRecording
                                ? "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                                : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
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
