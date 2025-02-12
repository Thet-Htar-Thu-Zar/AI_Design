import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { GroundingFiles } from "@/components/ui/grounding-files";
import GroundingFileView from "@/components/ui/grounding-file-view";
import StatusMessage from "@/components/ui/status-message";

import useRealTime from "@/hooks/useRealtime";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import useAudioPlayer from "@/hooks/useAudioPlayer";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport
} from "@/components/ui/navigation-menu";

import { ConversationAddTextCommand, GroundingFile, ToolResult } from "./types";

import logo from "./assets/logo.svg";

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [groundingFiles, setGroundingFiles] = useState<GroundingFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<GroundingFile | null>(null);

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

            const files: GroundingFile[] = result.sources.map(x => {
                return { id: x.chunk_id, name: x.title, content: x.chunk };
            });

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
        <div className="flex min-h-screen flex-col bg-[url('assets/image.png')] text-gray-900">
            <div className="flex justify-between">
                <div className="p-4 sm:absolute sm:left-4 sm:top-2">
                    <img src="/fusion-logo.png" alt="fusion logo" className="h-14 w-14" />
                    <h5 className="font-medium">Fusion</h5>
                    <h6>S O L U T I O N</h6>
                </div>

                <div className="p-4 sm:absolute sm:right-20 sm:top-2">
                    {/* <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    <div className="flex gap-3">
                                        <div className="text-left">
                                            <p className="text-[13px] font-semibold">Sign In</p>
                                        </div>
                                    </div>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="min-w-[180px] max-w-[200px] p-1">
                                        <li className="cursor-pointer p-1 text-sm font-bold hover:bg-gray-200">Google</li>
                                        <li className="cursor-pointer p-1 text-sm font-bold hover:bg-gray-200">GitHub</li>
                                        <hr />
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    <div className="flex gap-3">
                                        <div className="text-left">
                                            <p className="text-[13px] font-semibold">Sign Up</p>
                                        </div>
                                    </div>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="min-w-[180px] max-w-[200px] p-1">
                                        <li className="cursor-pointer p-1 text-sm font-bold hover:bg-gray-200">Google</li>
                                        <li className="cursor-pointer p-1 text-sm font-bold hover:bg-gray-200">GitHub</li>
                                        <hr />
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu> */}

                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-4">
                            <NavigationMenuItem className="cursor-pointer gap-2 rounded-md bg-gray-500 pb-1 pt-1 text-white transition duration-200 hover:bg-[#ffcd1e]">
                                <NavigationMenuTrigger>
                                    <div className="flex items-center">
                                        <p className="text-lg font-semibold uppercase tracking-wide">Sign In</p>
                                    </div>
                                    <NavigationMenuContent>
                                        <ul className="w-[200px] rounded-lg bg-white p-2 shadow-lg">
                                            <li className="cursor-pointer rounded p-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-100">
                                                Google
                                            </li>
                                            <li className="cursor-pointer rounded p-2 text-sm font-medium text-gray-700 transition duration-150 hover:bg-gray-100">
                                                GitHub
                                            </li>
                                            <hr className="my-1 border-t border-gray-200" />
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuTrigger>
                            </NavigationMenuItem>

                            <NavigationMenuItem className="cursor-pointer gap-2 rounded-md bg-gray-500 pb-1 pt-1 text-white transition duration-200 hover:bg-[#ffcd1e]">
                                <div className="flex items-center pb-2 pl-2 pr-2 pt-2">
                                    <p className="text-lg font-semibold uppercase tracking-wide">Sign Up</p>
                                </div>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>

            <main className="flex flex-grow flex-col items-center justify-center">
                <h1 className="mb-8 bg-gradient-to-r from-[#f1b418] to-[#353942] bg-clip-text text-4xl font-bold text-transparent md:text-7xl">
                    {t("app.title")}
                </h1>
                <div className="mb-4 flex flex-col items-center justify-center">
                    <Button
                        onClick={onToggleListening}
                        className={`h-12 w-60 ${isRecording ? "bg-pink-500 hover:bg-pink-600" : "bg-[#f9b31f] hover:bg-[#efa92f]"}`}
                        aria-label={isRecording ? t("app.stopRecording") : t("app.startRecording")}
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="mr-2 h-4 w-4" />
                                {t("app.stopConversation")}
                            </>
                        ) : (
                            <>
                                <Mic className="mr-2 h-6 w-6" />
                            </>
                        )}
                    </Button>

                    <StatusMessage isRecording={isRecording} />
                </div>
                <GroundingFiles files={groundingFiles} onSelected={setSelectedFile} />
            </main>

            <footer className="py-4 text-center">
                <p>{t("app.footer")}</p>
            </footer>

            <GroundingFileView groundingFile={selectedFile} onClosed={() => setSelectedFile(null)} />
        </div>
    );
}

export default App;
