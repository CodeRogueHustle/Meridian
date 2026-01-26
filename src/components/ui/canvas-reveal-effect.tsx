"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface CanvasRevealEffectProps {
    animationSpeed?: number;
    opacities?: number[];
    colors?: number[][];
    containerClassName?: string;
    dotSize?: number;
    showGradient?: boolean;
}

export const CanvasRevealEffect = ({
    animationSpeed = 3,
    opacities = [0.5, 0.5, 0.5, 0.7, 0.7, 0.7, 0.9, 0.9, 0.9, 1], // Higher base opacities
    colors = [[168, 85, 247]], // Brighter Purple
    containerClassName,
    dotSize = 6,
    showGradient = true,
}: CanvasRevealEffectProps) => {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted) return <div className={cn("h-full relative w-full bg-black", containerClassName)} />;

    return (
        <div className={cn("h-full relative w-full", containerClassName)}>
            <div className="h-full w-full">
                <DotMatrix
                    colors={colors}
                    dotSize={dotSize}
                    opacities={opacities}
                    animationSpeed={animationSpeed}
                />
            </div>
            {showGradient && (
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            )}
        </div>
    );
};

const DotMatrix = ({
    colors,
    opacities,
    dotSize,
    animationSpeed,
}: {
    colors: number[][];
    opacities: number[];
    dotSize: number;
    animationSpeed: number;
}) => {
    const uniforms = useMemo(() => {
        let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
        if (colors.length === 2) {
            colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
        } else if (colors.length === 3) {
            colorsArray = [colors[0], colors[0], colors[1], colors[1], colors[2], colors[2]];
        }

        return {
            u_colors: {
                value: colorsArray.map((color) => new THREE.Vector3(color[0] / 255, color[1] / 255, color[2] / 255)),
            },
            u_opacities: { value: opacities },
            u_total_size: { value: 20 },
            u_dot_size: { value: dotSize },
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(0, 0) },
            u_animation_speed: { value: animationSpeed },
        };
    }, [colors, opacities, dotSize, animationSpeed]);

    return (
        <Canvas
            className="absolute inset-0 h-full w-full"
            dpr={1} // Performance: Fix lag by capping DPR to 1
            gl={{ antialias: false }} // Performance: Disable antialias
        >
            <ShaderMaterial uniforms={uniforms} />
        </Canvas>
    );
};

const ShaderMaterial = ({ uniforms }: { uniforms: any }) => {
    const { size } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);

    useMemo(() => {
        if (uniforms.u_resolution) {
            uniforms.u_resolution.value.set(size.width, size.height);
        }
    }, [size.width, size.height, uniforms]);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.u_time.value = clock.getElapsedTime();
    });

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: `
                precision mediump float;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision mediump float;
                varying vec2 vUv;
                uniform float u_time;
                uniform float u_opacities[10];
                uniform vec3 u_colors[6];
                uniform float u_total_size;
                uniform float u_dot_size;
                uniform vec2 u_resolution;
                uniform float u_animation_speed;

                float PHI = 1.61803398874989484820459;
                float random(vec2 xy) {
                    return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
                }

                void main() {
                    vec2 st = vUv * u_resolution;
                    vec2 gridUv = floor(st / u_total_size);
                    
                    float show_offset = random(gridUv);
                    float rand = random(gridUv * floor((u_time * u_animation_speed / 5.0) + show_offset));
                    
                    float opacity = u_opacities[int(rand * 10.0)];
                    
                    // Dot shape
                    vec2 localUv = fract(st / u_total_size);
                    float dot = 1.0 - step(u_dot_size / u_total_size, localUv.x);
                    dot *= 1.0 - step(u_dot_size / u_total_size, localUv.y);
                    
                    opacity *= dot;
                    
                    // Brightness boost
                    opacity *= 1.8; 

                    vec3 color = u_colors[int(show_offset * 6.0)];
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            uniforms: uniforms,
            transparent: true,
            blending: THREE.AdditiveBlending, // Makes it look brighter/glowier
            depthTest: false,
        });
    }, [uniforms]);

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
};
