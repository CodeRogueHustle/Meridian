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
  const rafRef = useRef<number>();
  const programRef = useRef<WebGLProgram>();
  const bufRef = useRef<WebGLBuffer>();
  const uniTimeRef = useRef<WebGLUniformLocation>();
  const uniResRef = useRef<WebGLUniformLocation>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: true });
    if (!gl) return;

    // Compile shaders
    const createShader = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(VERT_SRC, gl.VERTEX_SHADER));
    gl.attachShader(program, createShader(DEFAULT_FRAG, gl.FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Attributes & Uniforms
    const posLoc = gl.getAttribLocation(program, 'position');
    uniTimeRef.current = gl.getUniformLocation(program, 'time')!;
    uniResRef.current = gl.getUniformLocation(program, 'resolution')!;

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    bufRef.current = buf;

    const onResize = () => {
      // Optimize: Limit DPR to 1.0 max for performance. High-res shaders are very heavy.
      const dpr = Math.min(window.devicePixelRatio, 1.0);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniResRef.current!, canvas.width, canvas.height);
    };

    window.addEventListener('resize', onResize);
    onResize();

    // Loop
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);

      const elapsed = now - lastFrameTime;
      if (elapsed < frameInterval) return;

      lastFrameTime = now - (elapsed % frameInterval);

      gl.uniform1f(uniTimeRef.current!, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (bufRef.current) gl.deleteBuffer(bufRef.current);
      if (programRef.current) gl.deleteProgram(programRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none"
      style={{ display: 'block' }}
    />
  );
}
