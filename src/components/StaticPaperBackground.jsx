import { useRef, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec2 uResolution;
  
  varying vec2 vUv;

  // Simplex Noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 x, int octaves) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 8; ++i) {
      if (i >= octaves) break;
      v += a * snoise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    // === TransitionOverlay와 똑같은 종이 질감 생성 ===
    vec3 paperColor = uColor;
    
    // 1. 큰 얼룩
    float largeNoise = fbm(uv * 3.0, 4) * 0.5 + 0.5;
    
    // 2. 중간 얼룩
    float mediumNoise = fbm(uv * 8.0 + vec2(uTime * 0.01), 3) * 0.5 + 0.5;
    
    // 3. 종이 섬유
    float smallNoise = fbm(uv * 40.0, 2) * 0.5 + 0.5;
    
    // 4. 그레인
    float grain = random(uv * 1000.0 + uTime * 0.1) * 0.03;
    
    // 색상 조합 (TransitionOverlay와 동일)
    vec3 color = paperColor;
    color = mix(color, vec3(0.88, 0.82, 0.70), largeNoise * 0.15);
    color = mix(color, vec3(0.82, 0.75, 0.62), mediumNoise * 0.1);
    color += (smallNoise - 0.5) * 0.03;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const StaticPaperBackground = ({ color = "#f5ebd7" }) => {
  const materialRef = useRef(null);
  const { viewport, size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [color, size.width, size.height]
  );

  // 미세한 애니메이션 (선택사항 - 원하지 않으면 주석 처리)
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <mesh position={[0, 0, -5]} renderOrder={-999}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default StaticPaperBackground;
