"use client";

export default function SpeakerIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 1.5a.5.5 0 0 0-1 0v5.243L4.28 4.02a.5.5 0 0 0-.707.707L6.293 7.45H3a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3.293l-2.72 2.72a.5.5 0 1 0 .707.707L7 12.243V14.5a.5.5 0 0 0 1 0v-2.257l2.72 2.72a.5.5 0 1 0 .707-.707L8.707 10.95H12a2.5 2.5 0 0 0 2.5-2.5v-3A2.5 2.5 0 0 0 12 2.95H8.707l2.72-2.72a.5.5 0 1 0-.707-.707L8 2.243V1.5z" />
    </svg>
  );
}
