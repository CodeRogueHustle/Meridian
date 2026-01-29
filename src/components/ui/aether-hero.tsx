'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

export type AetherHeroProps = {
    /* ---------- Hero content ---------- */
    title?: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
    logo?: React.ReactNode;

    align?: 'left' | 'center' | 'right'; // Content alignment
    maxWidth?: number; // px for text container (default 960)
    overlayGradient?: string; // e.g. 'linear-gradient(180deg, #00000080, #00000020 40%, transparent)'
    textColor?: string; // overlay text color (defaults to white)

    /* ---------- Canvas/shader ---------- */
    fragmentSource?: string; // override the shader
    dprMax?: number; // cap DPR (default 2)
    clearColor?: [number, number, number, number];

    /* ---------- Misc ---------- */
    height?: string | number; // default '100vh'
    className?: string;
    ariaLabel?: string;
    hideCanvas?: boolean;
};

/* Default fragment shader (your original) */
const DEFAULT_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define S smoothstep
#define MN (min(R.x,R.y) + 0.0001)
float pattern(vec2 uv) {
  float d=.0;
  for (float i=.0; i<3.; i++) {
    uv.x+=sin(T*(1.+i)+uv.y*1.5)*.2;
    d+=.005/abs(uv.x);
  }
  return d;	
}
vec3 scene(vec2 uv) {
  vec3 col=vec3(0);
  uv=vec2(atan(uv.x,uv.y)*2./6.28318,-log(length(uv))+T);
  for (float i=.0; i<3.; i++) {
    int k=int(mod(i,3.));
    col[k]+=pattern(uv+i*6./MN);
  }
  return col;
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  float s=12., e=9e-4;
  col+=e/(sin(uv.x*s)*cos(uv.y*s));
  uv.y+=R.x>R.y?.5:.5*(R.y/R.x);
  col+=scene(uv);
  O=vec4(col,1.);
}`;

/* Minimal passthrough vertex shader */
const VERT_SRC = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

// Helper functions moved outside component to remain stable
const compileShader = (gl: WebGL2RenderingContext, src: string, type: number) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(sh) || 'Unknown shader error';
        gl.deleteShader(sh);
        throw new Error(info);
    }
    return sh;
};

const createProgram = (gl: WebGL2RenderingContext, vs: string, fs: string) => {
    const v = compileShader(gl, vs, gl.VERTEX_SHADER);
    const f = compileShader(gl, fs, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(prog) || 'Program link error';
        gl.deleteProgram(prog);
        throw new Error(info);
    }
    return prog;
};

export default function AetherHero({
    /* Content */
    title = 'Make the impossible feel inevitable.',
    subtitle = 'A minimal hero with a living shader background. Built for product landings, announcements, and portfolio intros.',
    ctaLabel = 'Get Started',
    ctaHref = '#',
    secondaryCtaLabel,
    secondaryCtaHref,
    logo,

    align = 'center',
    maxWidth = 960,
    overlayGradient = 'linear-gradient(180deg, #00000099, #00000040 40%, transparent)',
    textColor = '#ffffff',

    /* Shader */
    fragmentSource = DEFAULT_FRAG,
    dprMax = 2,
    clearColor = [0, 0, 0, 1],

    /* Misc */
    height = '100vh',
    className = '',
    ariaLabel = 'Aurora hero background',
    hideCanvas = false,
}: AetherHeroProps) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const glRef = useRef<WebGL2RenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const bufRef = useRef<WebGLBuffer | null>(null);
    const uniTimeRef = useRef<WebGLUniformLocation | null>(null);
    const uniResRef = useRef<WebGLUniformLocation | null>(null);
    const rafRef = useRef<number | null>(null);

    // Init GL
    useEffect(() => {
        if (hideCanvas) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
        if (!gl) return;
        glRef.current = gl;

        // Program
        let prog: WebGLProgram;
        try {
            prog = createProgram(gl, VERT_SRC, fragmentSource);
        } catch (e) {
            console.error(e);
            return;
        }
        programRef.current = prog;

        // Buffer
        const verts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
        const buf = gl.createBuffer()!;
        bufRef.current = buf;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        // Attributes/uniforms
        gl.useProgram(prog);
        const posLoc = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        uniTimeRef.current = gl.getUniformLocation(prog, 'time');
        uniResRef.current = gl.getUniformLocation(prog, 'resolution');

        // Clear color
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

        // Size & DPR
        const fit = () => {
            const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, dprMax));
            const rect = canvas.getBoundingClientRect();
            const cssW = Math.max(1, rect.width);
            const cssH = Math.max(1, rect.height);
            const W = Math.floor(cssW * dpr);
            const H = Math.floor(cssH * dpr);
            if (canvas.width !== W || canvas.height !== H) {
                canvas.width = W; canvas.height = H;
            }
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        fit();
        const onResize = () => fit();
        const ro = new ResizeObserver(fit);
        ro.observe(canvas);
        window.addEventListener('resize', onResize);

        // RAF
        const loop = (now: number) => {
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(prog);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            if (uniResRef.current) gl.uniform2f(uniResRef.current, canvas.width, canvas.height);
            if (uniTimeRef.current) gl.uniform1f(uniTimeRef.current, now * 1e-3);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        // Cleanup
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (bufRef.current) gl.deleteBuffer(bufRef.current);
            if (programRef.current) gl.deleteProgram(programRef.current);
        };
    }, [fragmentSource, dprMax, clearColor, hideCanvas]);

    const justify =
        align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
    const textAlign =
        align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';

    return (
        <section
            className={['aurora-hero', className].join(' ')}
            style={{ height, position: 'relative', overflow: 'hidden' }}
            aria-label="Hero"
        >
            {/* Shader canvas (background) */}
            {!hideCanvas && (
                <canvas
                    ref={canvasRef}
                    className="aurora-canvas"
                    role="img"
                    aria-label={ariaLabel}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        userSelect: 'none',
                        touchAction: 'none',
                    }}
                />
            )}

            {/* Overlay gradient for readability */}
            <div
                className="aurora-overlay"
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: overlayGradient,
                    pointerEvents: 'none',
                }}
            />

            {/* Content layer */}
            {mounted && (
                <div
                    className="aurora-content"
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: justify,
                        padding: 'min(6vw, 64px)',
                        color: textColor,
                        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial",
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth,
                            marginInline: align === 'center' ? 'auto' : undefined,
                            textAlign,
                        }}
                    >
                        {logo && <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: justify }}>{logo}</div>}

                        <h1
                            className="font-syne"
                            style={{
                                margin: 0,
                                fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                                lineHeight: 0.9,
                                letterSpacing: '-0.04em',
                                fontWeight: 800,
                                textShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            }}
                        >
                            {title}
                        </h1>

                        {subtitle ? (
                            <p
                                style={{
                                    marginTop: '1.5rem',
                                    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                                    lineHeight: 1.4,
                                    opacity: 0.8,
                                    textShadow: '0 4px 24px rgba(0,0,0,0.35)',
                                    maxWidth: 800,
                                    marginInline: align === 'center' ? 'auto' : undefined,
                                }}
                            >
                                {subtitle}
                            </p>
                        ) : null}

                        {(ctaLabel || secondaryCtaLabel) && (
                            <div
                                style={{
                                    display: 'inline-flex',
                                    gap: '16px',
                                    marginTop: '3rem',
                                    flexWrap: 'wrap',
                                }}
                            >
                                {ctaLabel ? (
                                    <Link
                                        href={ctaHref || '#'}
                                        className="aurora-btn aurora-btn--primary"
                                        style={{
                                            padding: '16px 32px',
                                            borderRadius: 100,
                                            background:
                                                'linear-gradient(180deg, rgba(255,255,255,.2), rgba(255,255,255,.05))',
                                            color: textColor,
                                            textDecoration: 'none',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            boxShadow:
                                                'inset 0 0 0 1px rgba(255,255,255,.3), 0 20px 40px rgba(0,0,0,.3)',
                                            backdropFilter: 'blur(10px) saturate(150%)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {ctaLabel}
                                    </Link>
                                ) : null}

                                {secondaryCtaLabel ? (
                                    <Link
                                        href={secondaryCtaHref || '#'}
                                        className="aurora-btn aurora-btn--ghost"
                                        style={{
                                            padding: '16px 32px',
                                            borderRadius: 100,
                                            background: 'rgba(255,255,255,.05)',
                                            color: textColor,
                                            opacity: 0.9,
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.2)',
                                            backdropFilter: 'blur(5px)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        {secondaryCtaLabel}
                                    </Link>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
