// Override recharts types to fix compatibility issues with React 19 and TypeScript 5
import 'recharts';

declare module 'recharts' {
    export interface AreaProps {
        animationEasing?: string;
    }
    export interface PieProps {
        animationEasing?: string;
    }
    export interface BarProps {
        animationEasing?: string;
    }
    export interface LineProps {
        animationEasing?: string;
    }
}
