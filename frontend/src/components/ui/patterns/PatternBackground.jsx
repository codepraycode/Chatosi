import { useEffect, useState } from 'react';

const PatternBackground = ({ pattern = 'grid', intensity = 'light' }) => {
    const [patternSvg, setPatternSvg] = useState('');

    useEffect(() => {
        const loadPattern = async () => {
            try {
                // Dynamic import based on pattern name
                // const patternModule = await import(`/assets/patterns/${pattern}-pattern.svg`);
                const response = await fetch("/assets/patterns/${pattern}-pattern.svg");
                const svgText = await response.text();
                setPatternSvg(svgText);
            } catch (error) {
                console.warn(`Pattern "${pattern}" not found, using default`);
                // Fallback to CSS pattern
                setPatternSvg('');
            }
        };

        loadPattern();
    }, [pattern]);

    const getOpacity = () => {
        const opacities = {
            light: { light: 0.08, dark: 0.12 },
            medium: { light: 0.12, dark: 0.18 },
            strong: { light: 0.18, dark: 0.25 }
        };
        return opacities[intensity] || opacities.light;
    };

    if (!patternSvg) {
        // Fallback CSS pattern
        return (
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 0)`,
                    backgroundSize: '30px 30px',
                    opacity: getOpacity().light,
                }}
            />
        );
    }

    return (
        <div
            className="absolute inset-0 pointer-events-none"
            dangerouslySetInnerHTML={{
                __html: patternSvg.replace('currentColor', 'var(--pattern-color, currentColor)')
            }}
            style={{
                opacity: getOpacity().light,
            }}
        />
    );
};

// CSS-only fallback patterns component
export const CSSPattern = ({ type = 'grid', intensity = 'light' }) => {
    const getPatternStyle = () => {
        const baseStyle = "absolute inset-0 pointer-events-none";
        const opacities = {
            light: 'opacity-10',
            medium: 'opacity-15',
            strong: 'opacity-20'
        };

        const patterns = {
            grid: `bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:20px_20px] ${opacities[intensity]}`,
            dots: `bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:20px_20px] ${opacities[intensity]}`,
            waves: `bg-[linear-gradient(45deg,transparent_48%,currentColor_49%,currentColor_51%,transparent_52%)] bg-[size:10px_10px] ${opacities[intensity]}`,
            hexagon: `bg-[linear-gradient(30deg,transparent_48%,currentColor_49%,currentColor_51%,transparent_52%),linear-gradient(-30deg,transparent_48%,currentColor_49%,currentColor_51%,transparent_52%)] bg-[size:20px_35px] ${opacities[intensity]}`,
        };

        return `${baseStyle} ${patterns[type] || patterns.grid}`;
    };

    return <div className={getPatternStyle()} />;
};

export default PatternBackground;