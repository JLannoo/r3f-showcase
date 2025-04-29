import { Html } from "@react-three/drei";
import { StoreApi, UseBoundStore } from "zustand";

type StoreMonitorProps<T> = {
    title: string;
    store: UseBoundStore<StoreApi<T>>;
    className?: string;
}

export default function StoreMonitor({ title, store, className }: StoreMonitorProps<any>) {
    const state = store();

    return (
        <details className={`pointer-events-auto flex flex-col absolute bottom-0 left-0 p-4 text-white bg-black/25 font-[Space_Mono] ${className}`}>
            <summary className="text-lg font-bold order-2">{title}</summary>
            {Object.entries(state)
                .sort(([_a, b]) => ["function", "object"].includes(typeof b) ? 1 : -1)
                .map(([key, value]) =>
                <StorePropertyDisplay key={key} label={key} value={value} />
            )}
        </details>
    );
}

type StorePropertyDisplay = {
    label: string;
    value: any;
    maxDepth?: number;
}

function StorePropertyDisplay({ label, value, maxDepth = 3 }: StorePropertyDisplay) {
    if(maxDepth <= 0) return null;
    
    const valueType = typeof value;
    const isObject = valueType === "object" && value !== null;
    const isArray = Array.isArray(value);
    const isFunction = valueType === "function";

    if(isFunction) return null;
    if(isObject && !isArray) {
        return (
            <details className="ml-4">
                <summary>{label}</summary>
                {Object.entries(value).map(([key, val]) =>
                    <StorePropertyDisplay key={key} label={key} value={val} maxDepth={maxDepth - 1} />
                )}
            </details>
        );
    }

    return (
        <p>
            <b>{label}:</b> {String(value)}
        </p>
    );
}