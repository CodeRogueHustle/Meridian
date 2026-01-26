'use client';

import React, { useEffect, useRef } from 'react';

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

const VERT_SRC = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

export default function AetherBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* 
   * AetherBackground.tsx
   * Robust implementation with CSS fallback
   */
  const [error, setError] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (error || !mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGL2RenderingContext | null = null;
    let animationFrameId: number = 0; // Initialize with 0

    // Cleanup function
    const cleanup = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      // We generally can't 'delete' a context, but we can lose reference
    };

    try {
      gl = canvas.getContext('webgl2', {
        alpha: true, // Allow transparency so CSS background shows through
        antialias: true,
        powerPreference: "high-performance"
      });

      if (!gl) {
        console.warn("WebGL2 not available, falling back to CSS");
        setError(true);
        return;
      }

      // -- Shader Compilation Helpers --
      const createShader = (src: string, type: number) => {
        const s = gl!.createShader(type);
        if (!s) throw new Error("Failed to create shader");
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
          const info = gl!.getShaderInfoLog(s);
          gl!.deleteShader(s);
          throw new Error("Shader compile error: " + info);
        }
        return s;
      };

      // -- Init Program --
      const program = gl.createProgram();
      if (!program) throw new Error("Failed to create program");

      const vs = createShader(VERT_SRC, gl.VERTEX_SHADER);
      const fs = createShader(DEFAULT_FRAG, gl.FRAGMENT_SHADER);

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link error: " + gl.getProgramInfoLog(program));
      }

      gl.useProgram(program);

      // Cleanup shaders (linked now)
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      // -- Buffers --
      const posLoc = gl.getAttribLocation(program, 'position');
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      // -- Uniforms --
      const uniTime = gl.getUniformLocation(program, 'time');
      const uniRes = gl.getUniformLocation(program, 'resolution');

      // -- Resize --
      const onResize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        gl!.viewport(0, 0, canvas.width, canvas.height);
        if (uniRes) gl!.uniform2f(uniRes, canvas.width, canvas.height);
      };

      window.addEventListener('resize', onResize);
      onResize();

      // -- Loop --
      let start = performance.now();
      const loop = (now: number) => {
        if (!gl) return;
        animationFrameId = requestAnimationFrame(loop);

        // Gentle rotation of time for smooth animation
        if (uniTime) gl.uniform1f(uniTime, (now - start) * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      loop(start);

      return () => {
        window.removeEventListener('resize', onResize);
        cleanup();
        // aggressively cleanup WebGL resources
        if (gl) {
          gl.deleteBuffer(buf);
          gl.deleteProgram(program);
        }
      };

    } catch (e) {
      console.error("AetherBackground crashed:", e);
      setError(true);
      cleanup();
    }
  }, [error, mounted]);

  // Fallback CSS background (Enhanced animated gradient)
  const cssBackground = (
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />

      {/* Animated purple glow */}
      <div
        className="absolute inset-0 animate-aether-pulse"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Moving gradient orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-aether-float"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)',
          top: '20%',
          left: '10%',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-aether-float-reverse"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)',
          bottom: '10%',
          right: '10%',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );

  if (!mounted) return cssBackground;
  if (error) return cssBackground;

  return (
    <>
      {cssBackground} {/* Keep CSS bg behind canvas for depth/fallback */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-60 mix-blend-screen"
        style={{ display: 'block' }}
      />
    </>
  );
}
