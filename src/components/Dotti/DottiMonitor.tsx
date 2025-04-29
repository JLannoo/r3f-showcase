import { useDottiSpeech } from "../../stores/useDottiSpeech";

export default function DottiMonitor() {
    const partialText = useDottiSpeech((state) => state.partialText);
    const fullText = useDottiSpeech((state) => state.fullText);
    const isSpeaking = useDottiSpeech((state) => state.isSpeaking);
    const canSpeak = useDottiSpeech((state) => state.canSpeak);
    const speed = useDottiSpeech((state) => state.speed);

    const textsEqual = partialText === fullText;

    return (
        <div className="absolute bottom-0 left-0 p-4 text-white bg-black/25 font-[Space_Mono]">
            <h2 className="text-lg font-bold">Dotti Monitor</h2>
            <DottiStateDisplay label="Full Text" value={fullText} isPositive={textsEqual} />
            <DottiStateDisplay label="Text" value={partialText} isPositive={textsEqual} />
            <DottiStateDisplay label="Is Speaking" value={isSpeaking ? "Yes" : "No"} isPositive={isSpeaking} />
            <DottiStateDisplay label="Can Speak" value={canSpeak ? "Yes" : "No"} isPositive={canSpeak} />
            <DottiStateDisplay label="Speed" value={speed} isPositive={speed > 0} />
        </div>
    );
}

type DottiStateDisplayProps = {
    label: string;
    value: string | number | boolean;
    isPositive: boolean
};
function DottiStateDisplay({ label, value, isPositive }: DottiStateDisplayProps) {
    const colors = {
        true: "text-green-300",
        false: "text-red-300",
    }

    return (
        <p className={colors[String(isPositive) as keyof typeof colors]}>
            <b>{label}:</b> {value}
        </p>
    );
}