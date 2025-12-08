declare module '@ducanh2912/next-pwa' {
    import type { NextConfig } from 'next';

    interface PWAConfig {
        dest?: string;
        register?: boolean;
        skipWaiting?: boolean;
        disable?: boolean;
        scope?: string;
        sw?: string;
        cacheOnFrontEndNav?: boolean;
        aggressiveFrontEndNavCaching?: boolean;
        reloadOnOnline?: boolean;
        fallbacks?: {
            document?: string;
            image?: string;
            font?: string;
            audio?: string;
            video?: string;
        };
        workboxOptions?: {
            disableDevLogs?: boolean;
        };
    }

    function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

    export default withPWA;
}
