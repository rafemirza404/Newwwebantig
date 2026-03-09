/**
 * SectionBadge — Reusable pill badge for section labels.
 *
 * Hollow, gold-outlined capsule with monospaced uppercase text.
 * Uses design tokens: secondary-500 (gold text), accents-goldBorder (border).
 *
 * @example <SectionBadge label="HOW IT WORKS" />
 */

interface SectionBadgeProps {
    label: string;
    className?: string;
    color?: "gold" | "blue" | "emerald" | "purple" | "white" | "gray";
}

export default function SectionBadge({
    label,
    className = "",
    color = "gold",
}: SectionBadgeProps) {
    let borderColor = "rgba(212, 160, 23, 0.5)";
    let shadowColor = "212, 160, 23";
    let textColor = "text-secondary-500";

    switch (color) {
        case "blue":
            borderColor = "rgba(59, 130, 246, 0.5)";
            shadowColor = "59, 130, 246";
            textColor = "text-blue-400";
            break;
        case "emerald":
            borderColor = "rgba(16, 185, 129, 0.5)";
            shadowColor = "16, 185, 129";
            textColor = "text-emerald-400";
            break;
        case "purple":
            borderColor = "rgba(168, 85, 247, 0.5)";
            shadowColor = "168, 85, 247";
            textColor = "text-purple-400";
            break;
        case "white":
            borderColor = "rgba(255, 255, 255, 0.5)";
            shadowColor = "255, 255, 255";
            textColor = "text-white";
            break;
        case "gray":
            borderColor = "rgba(156, 163, 175, 0.5)";
            shadowColor = "156, 163, 175";
            textColor = "text-gray-400";
            break;
        case "gold":
        default:
            borderColor = "rgba(212, 160, 23, 0.5)";
            shadowColor = "212, 160, 23";
            textColor = "text-secondary-500";
            break;
    }

    return (
        <div
            className={`inline-flex items-center justify-center px-5 py-2 rounded-full bg-transparent ${className}`}
            style={{
                borderStyle: "solid",
                borderColor: borderColor,
                borderTopWidth: "3px",
                borderLeftWidth: "1.5px",
                borderRightWidth: "1.5px",
                borderBottomWidth: "1px",
                boxShadow: `0 0 12px rgba(${shadowColor}, 0.15), 0 0 4px rgba(${shadowColor}, 0.1)`,
            }}
        >
            <span className={`text-[11px] md:text-[12px] lg:text-[13px] uppercase tracking-[0.18em] font-semibold font-mono leading-none ${textColor}`}>
                {label}
            </span>
        </div>
    );
}
