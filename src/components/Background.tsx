
export default function Background() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050a0e]">
            {/* Deep teal/cyan ambient glow — AI intelligence aesthetic */}
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 15% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 80% at 85% 75%, rgba(20, 184, 166, 0.12) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(8, 145, 178, 0.08) 0%, transparent 60%)
                    `
                }}
            />
            {/* Subtle grid overlay for depth */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050a0e] to-transparent"></div>
        </div>
    );
}
