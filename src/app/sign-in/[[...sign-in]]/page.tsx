import { SignIn } from "@clerk/nextjs";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

export default function Page() {
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
            {/* The high-quality Dot Matrix / Reveal background the user prefers */}
            <div className="absolute inset-0 z-0">
                <CanvasRevealEffect
                    animationSpeed={3}
                    containerClassName="bg-black"
                    colors={[
                        [168, 85, 247], // Brighter Purple
                        [129, 140, 248], // Brighter Indigo
                    ]}
                    dotSize={6}
                />
                {/* Gradients to fade edges and center the focus - BRIGHTER CENTER */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.2)_0%,_rgba(0,0,0,1)_100%)]" />
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
            </div>

            <div className="z-10 w-full max-w-md px-4">
                <SignIn
                    appearance={{
                        elements: {
                            card: "bg-gray-900/40 backdrop-blur-xl border border-white/10 shadow-2xl",
                            headerTitle: "text-white font-syne",
                            headerSubtitle: "text-gray-400",
                            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                            socialButtonsBlockButtonText: "text-white font-medium",
                            formButtonPrimary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/20 transition-all text-sm font-bold",
                            formFieldLabel: "text-gray-300",
                            formFieldInput: "bg-white/5 border-white/10 text-white focus:border-purple-500/50",
                            footerActionText: "text-gray-400",
                            footerActionLink: "text-purple-400 hover:text-purple-300",
                            identityPreviewText: "text-white",
                            identityPreviewEditButtonIcon: "text-purple-400"
                        }
                    }}
                />
            </div>
        </div>
    );
}
