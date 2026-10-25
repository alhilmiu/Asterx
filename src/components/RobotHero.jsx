
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import "./RobotHero.css";

function Robot() {
  const group = useRef(null);
  const head = useRef(null);
  const leftEye = useRef(null);
  const rightEye = useRef(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Animasi gerakan badan
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.45) * 0.18;
      group.current.position.y = Math.sin(t * 0.8) * 0.06;
    }

    // Animasi gerakan kepala
    if (head.current) {
      head.current.rotation.x = Math.sin(t * 0.6) * 0.04;
    }

    // Efek cahaya mata
    const glow = 1.8 + Math.sin(t * 2.5) * 0.7;

    if (leftEye.current) {
      leftEye.current.material.emissiveIntensity = glow;
    }

    if (rightEye.current) {
      rightEye.current.material.emissiveIntensity = glow;
    }
  });

  // Palet warna TriMi
  const shell = "#DCE4F0";
  const dark = "#101C36";
  const accentBlue = "#3563E9";

  return (
    <group ref={group}>
      {/* Antena */}
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.28, 16]} />
        <meshStandardMaterial
          color={dark}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.81, 0]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial
          color={accentBlue}
          emissive={accentBlue}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Kepala */}
      <group ref={head} position={[0, 1.05, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.08, 0.95]} />
          <meshStandardMaterial
            color={shell}
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>

        {/* Panel wajah */}
        <mesh position={[0, 0, 0.49]}>
          <boxGeometry args={[1.25, 0.76, 0.055]} />
          <meshStandardMaterial
            color={dark}
            metalness={0.5}
            roughness={0.25}
          />
        </mesh>

        {/* Mata kiri */}
        <mesh ref={leftEye} position={[-0.3, 0.08, 0.535]}>
          <boxGeometry args={[0.19, 0.25, 0.04]} />
          <meshStandardMaterial
            color={accentBlue}
            emissive={accentBlue}
            emissiveIntensity={2}
          />
        </mesh>

        {/* Mata kanan */}
        <mesh ref={rightEye} position={[0.3, 0.08, 0.535]}>
          <boxGeometry args={[0.19, 0.25, 0.04]} />
          <meshStandardMaterial
            color={accentBlue}
            emissive={accentBlue}
            emissiveIntensity={2}
          />
        </mesh>

        {/* Detail wajah */}
        <mesh position={[0, -0.22, 0.535]}>
          <boxGeometry args={[0.28, 0.045, 0.035]} />
          <meshStandardMaterial color="#7C8AA4" />
        </mesh>

        {/* Sisi kepala */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.79, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.16, 32]} />
            <meshStandardMaterial
              color="#AAB8CC"
              metalness={0.65}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Leher */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.28, 24]} />
        <meshStandardMaterial
          color={dark}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* Badan */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.28, 1.05, 0.75]} />
        <meshStandardMaterial
          color={shell}
          metalness={0.6}
          roughness={0.32}
        />
      </mesh>

      {/* Panel dada */}
      <mesh position={[0, -0.3, 0.39]}>
        <boxGeometry args={[0.7, 0.5, 0.045]} />
        <meshStandardMaterial
          color={dark}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Lampu dada */}
      <mesh position={[0, -0.3, 0.42]}>
        <boxGeometry args={[0.38, 0.055, 0.025]} />
        <meshStandardMaterial
          color={accentBlue}
          emissive={accentBlue}
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Lengan */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.83, -0.35, 0]}>
          <mesh rotation={[0, 0, side * -0.12]}>
            <capsuleGeometry args={[0.17, 0.55, 8, 16]} />
            <meshStandardMaterial
              color={shell}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>

          <mesh position={[0, -0.48, 0]}>
            <sphereGeometry args={[0.19, 24, 24]} />
            <meshStandardMaterial
              color={dark}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Pinggang */}
      <mesh position={[0, -1.02, 0]}>
        <boxGeometry args={[0.78, 0.28, 0.55]} />
        <meshStandardMaterial
          color={dark}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>

      {/* Kaki */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.25, -1.48, 0]}>
          <mesh>
            <capsuleGeometry args={[0.18, 0.48, 8, 16]} />
            <meshStandardMaterial
              color={shell}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>

          <mesh position={[0, -0.33, 0.09]}>
            <boxGeometry args={[0.42, 0.2, 0.58]} />
            <meshStandardMaterial
              color={dark}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function RobotHero({
  whatsappUrl = "#layanan",
}) {
  return (
    <section className="robot-hero">
      {/* Teks dekoratif di belakang */}
      <div className="robot-hero-bg-text" aria-hidden="true">
        MADE FOR YOU
      </div>

      {/* Konten utama */}
      <div className="robot-hero-copy">
        <motion.span
          className="robot-hero-label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="robot-hero-dot" />
          DIGITAL SOLUTIONS, MADE PERSONAL
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Your vision.
          <br />
          <span>Our creation.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Website yang dirancang dengan tujuan, dibangun sesuai kebutuhan,
          dan dibuat benar-benar untuk kamu.
        </motion.p>

        <motion.div
          className="robot-hero-actions"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a className="robot-hero-primary" href={whatsappUrl}>
            Mulai Konsultasi <span>↗</span>
          </a>

          <a className="robot-hero-secondary" href="#layanan">
            Jelajahi Layanan ↓
          </a>
        </motion.div>
      </div>

      {/* Robot 3D */}
      <div
        className="robot-hero-scene"
        aria-label="Robot 3D TriMi"
      >
        <Canvas
          camera={{ position: [0, 0.2, 6.5], fov: 37 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.8} />

          <directionalLight
            position={[4, 6, 5]}
            intensity={3}
          />

          <pointLight
            position={[-3, 2, 3]}
            color="#3563E9"
            intensity={12}
          />

          <Float
            speed={1.5}
            rotationIntensity={0.12}
            floatIntensity={0.35}
          >
            <Robot />
          </Float>

          <ContactShadows
            position={[0, -2.15, 0]}
            opacity={0.22}
            scale={5}
            blur={2.5}
          />
        </Canvas>

        {/* Label dekoratif */}
        <div className="robot-hero-chip robot-hero-chip-top">
          <span>✳</span> CREATIVE TECHNOLOGY
        </div>

        <div className="robot-hero-chip robot-hero-chip-bottom">
          <span className="robot-hero-dot" />
          BUILT AROUND YOUR IDEAS
        </div>
      </div>

      {/* Footer kecil hero */}
      <div className="robot-hero-index">
        TRIMI® — TRULY MADE FOR YOU
      </div>
    </section>
  );
}
