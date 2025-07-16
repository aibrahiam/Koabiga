import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <img src="/logo.png" alt="Koabiga Logo" className="h-8 w-8 rounded-md object-cover shadow" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Koabiga</span>
            </div>
        </>
    );
}
