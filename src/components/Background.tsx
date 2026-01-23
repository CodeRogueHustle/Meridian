
export default function Background() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-black">
            {/* Optimized gradients instead of heavy CSS blurs */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `
                        radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(91, 33, 182, 0.1) 0%, transparent 70%)
                    `
                }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
        </div>
    );
}
