'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Zap,
  TrendingUp,
  Flame,
  Users,
  ArrowRight,
  ChevronRight,
  Star,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Briefcase,
  BookOpen,
  TrendingDown,
  Mail,
  Twitter,
  Linkedin,
  Disc,
  BriefcaseIcon,
  ChartLineIcon,
  DollarSignIcon,
} from 'lucide-react';

// ============================================================
// RED GLOBE COMPONENT — Three.js / React Three Fiber
// ============================================================

interface ActivityPoint {
  lat: number;
  lng: number;
  intensity: number;
}

function generateActivityPoints(): ActivityPoint[] {
  const points: ActivityPoint[] = [];
  const regions = [
    { latRange: [25, 55], lngRange: [-130, -60], count: 80 },
    { latRange: [35, 60], lngRange: [-15, 40], count: 60 },
    { latRange: [20, 50], lngRange: [100, 145], count: 50 },
    { latRange: [35, 50], lngRange: [60, 100], count: 30 },
    { latRange: [-35, -10], lngRange: [-80, -50], count: 20 },
    { latRange: [-20, 10], lngRange: [15, 45], count: 15 },
  ];

  regions.forEach((region) => {
    for (let i = 0; i < region.count; i++) {
      const lat = region.latRange[0] + Math.random() * (region.latRange[1] - region.latRange[0]);
      const lng = region.lngRange[0] + Math.random() * (region.lngRange[1] - region.lngRange[0]);
      points.push({
        lat,
        lng,
        intensity: 0.5 + Math.random() * 0.5,
      });
    }
  });

  return points;
}

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeMesh({ rotation }: { rotation: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.LineSegments>(null);

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.lineTo(280, 100);
    ctx.lineTo(300, 180);
    ctx.lineTo(250, 220);
    ctx.lineTo(180, 200);
    ctx.lineTo(150, 150);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(250, 280);
    ctx.lineTo(300, 260);
    ctx.lineTo(320, 340);
    ctx.lineTo(280, 400);
    ctx.lineTo(240, 350);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(480, 100);
    ctx.lineTo(560, 90);
    ctx.lineTo(580, 150);
    ctx.lineTo(520, 170);
    ctx.lineTo(470, 150);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(500, 200);
    ctx.lineTo(580, 190);
    ctx.lineTo(600, 300);
    ctx.lineTo(540, 350);
    ctx.lineTo(480, 280);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(600, 80);
    ctx.lineTo(800, 60);
    ctx.lineTo(850, 150);
    ctx.lineTo(780, 200);
    ctx.lineTo(650, 180);
    ctx.lineTo(600, 120);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(780, 320);
    ctx.lineTo(850, 310);
    ctx.lineTo(860, 370);
    ctx.lineTo(800, 380);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  const gridGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 1;

    for (let lat = -60; lat <= 60; lat += 30) {
      const latRad = (lat * Math.PI) / 180;
      for (let lng = 0; lng <= 360; lng += 5) {
        const lngRad = (lng * Math.PI) / 180;
        points.push(
          new THREE.Vector3(
            radius * Math.cos(latRad) * Math.cos(lngRad),
            radius * Math.sin(latRad),
            radius * Math.cos(latRad) * Math.sin(lngRad)
          )
        );
      }
    }

    for (let lng = 0; lng < 360; lng += 30) {
      const lngRad = (lng * Math.PI) / 180;
      for (let lat = -90; lat <= 90; lat += 5) {
        const latRad = (lat * Math.PI) / 180;
        points.push(
          new THREE.Vector3(
            radius * Math.cos(latRad) * Math.cos(lngRad),
            radius * Math.sin(latRad),
            radius * Math.cos(latRad) * Math.sin(lngRad)
          )
        );
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y = rotation;
    if (glowRef.current) glowRef.current.rotation.y = rotation;
    if (gridRef.current) gridRef.current.rotation.y = rotation;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          transparent
          opacity={0.9}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      <lineSegments ref={gridRef} geometry={gridGeometry}>
        <lineBasicMaterial color="#22D3EE" transparent opacity={0.15} />
      </lineSegments>

      <mesh ref={glowRef}>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function ActivityDots() {
  const points = useMemo(() => generateActivityPoints(), []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);

    points.forEach((point, i) => {
      const vec = latLngToVector3(point.lat, point.lng, 1.02);
      positions[i * 3] = vec.x;
      positions[i * 3 + 1] = vec.y;
      positions[i * 3 + 2] = vec.z;

      const intensity = point.intensity;
      colors[i * 3] = 0.94 * intensity;
      colors[i * 3 + 1] = 0.27 * intensity;
      colors[i * 3 + 2] = 0.27 * intensity;
    });

    return { positions, colors };
  }, [points]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  return <points geometry={geometry} material={material} />;
}

// ============================================================
// SCENE — wraps Canvas with useFrame
// ============================================================

function Scene({ rotation }: { rotation: number }) {
  useFrame(() => {
    // rotation handled by GlobeMesh via prop
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-3, 2, 3]} intensity={0.5} color="#EF4444" />
      <GlobeMesh rotation={rotation} />
      <ActivityDots />
    </>
  );
}

// ============================================================
// DEMO PAGE COMPONENT
// ============================================================

export default function DemoPage() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const animate = () => {
      setRotation((prev) => prev + 0.002);
      requestAnimationFrame(animate);
    };
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const feedItems = [
    { time: '2 mins ago', headline: 'OpenAI announces GPT-5 with full autonomous agent capabilities', source: 'OpenAI', icon: '🤖' },
    { time: '15 mins ago', headline: 'Shopify replaces 1,400 customer support roles with AI chatbots', source: 'Shopify', icon: '🛒' },
    { time: '32 mins ago', headline: 'Anthropic releases Claude 4 with 1M token context window', source: 'Anthropic', icon: '🧠' },
    { time: '1 hour ago', headline: 'Microsoft laid off 2,500 more workers as AI automation accelerates', source: 'Microsoft', icon: '💻' },
    { time: '2 hours ago', headline: 'Google DeepMind achieves breakthrough in scientific research AI', source: 'Google', icon: '🔬' },
  ];

  const riskItems = [
    { icon: Shield, title: 'Graphic Design', risk: 'HIGH RISK', percent: '87%', color: '#EF4444' },
    { icon: BookOpen, title: 'Content Writing', risk: 'HIGH RISK', percent: '82%', color: '#EF4444' },
    { icon: Briefcase, title: 'Legal Services', risk: 'MEDIUM RISK', percent: '64%', color: '#FBBF24' },
    { icon: CheckCircle, title: 'Project Mgmt', risk: 'LOW RISK', percent: '23%', color: '#10B981' },
    { icon: AlertTriangle, title: 'Software Dev', risk: 'MEDIUM RISK', percent: '51%', color: '#FBBF24' },
    { icon: TrendingDown, title: 'Data Analysis', risk: 'HIGH RISK', percent: '78%', color: '#EF4444' },
  ];

  const trendingTools = [
    { rank: 1, name: 'ChatGPT', category: 'AI Assistant', rating: 4.9, users: '180M+', color: '#10B981' },
    { rank: 2, name: 'Midjourney', category: 'Image Generation', rating: 4.8, users: '15M+', color: '#8B5CF6' },
    { rank: 3, name: 'Copilot', category: 'Code AI', rating: 4.7, users: '50M+', color: '#6366F1' },
    { rank: 4, name: 'Claude', category: 'AI Assistant', rating: 4.9, users: '10M+', color: '#F59E0B' },
    { rank: 5, name: 'Gemini', category: 'AI Assistant', rating: 4.6, users: '20M+', color: '#3B82F6' },
  ];

  const survivalGuides = [
    { icon: BookOpen, title: 'Adapt or Die: Surviving the AI Revolution', subtitle: 'Essential reading for knowledge workers' },
    { icon: ChartLineIcon, title: 'AI Resistant Skills Guide', subtitle: 'What to learn in 2026' },
    { icon: BriefcaseIcon, title: 'Career Pivoting Playbook', subtitle: 'From obsolete to indispensable' },
    { icon: DollarSignIcon, title: 'Freelance in the AI Era', subtitle: 'Build a sustainable practice' },
  ];

  const aiCompanies = [
    { name: 'OpenAI', model: 'GPT-5', cap: '$300B' },
    { name: 'Anthropic', model: 'Claude 4', cap: '$85B' },
    { name: 'Google DeepMind', model: 'Gemini 2', cap: '$180B' },
    { name: 'Microsoft', model: 'Copilot AI', cap: '$290B' },
    { name: 'Meta AI', model: 'Llama 4', cap: '$140B' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI RADAR</h1>
            <p className="text-xs text-gray-500">Stay ahead or get replaced</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <a href="#" className="text-white border-b-2 border-purple-500 pb-1">Feed</a>
          <a href="#" className="text-gray-400 hover:text-white transition">Tools</a>
          <a href="#" className="text-gray-400 hover:text-white transition">Companies</a>
          <a href="#" className="text-gray-400 hover:text-white transition">News</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-white transition"><Search className="w-5 h-5" /></button>
          <Bell className="w-5 h-5 text-gray-400" />
          <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-medium text-sm">
            Subscribe
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0C10] to-[#0B0C10] z-10 pointer-events-none" />

        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left: Hero Text */}
          <div className="col-span-5 z-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold leading-tight mb-6"
            >
              AI is replacing people{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
                faster than you think.
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-gray-400 mb-8"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Last updated: 2 mins ago
            </motion.div>

            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl bg-[#13151C]/70 border border-white/10 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">1,892</p>
                  <p className="text-red-500 text-sm">+1,892 today</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="backdrop-blur-xl bg-[#13151C]/70 border border-white/10 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold">247</p>
                  <p className="text-gray-400 text-sm">news today</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="backdrop-blur-xl bg-[#13151C]/70 border border-white/10 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">89</p>
                  <p className="text-gray-400 text-sm">companies moving fast</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: 3D Globe */}
          <div className="col-span-7 relative h-[500px]">
            <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
              <Scene rotation={rotation} />
            </Canvas>
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="px-8 py-8 grid grid-cols-3 gap-8">
        {/* Live AI Feed */}
        <div className="bg-[#13151C] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-xl font-bold">LIVE AI FEED</h2>
            <span className="text-gray-500 text-sm ml-auto">Real-time updates</span>
          </div>

          <div className="space-y-5">
            {feedItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                  <p className="text-white font-medium leading-tight">{item.headline}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-xs text-gray-400">{item.source}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl">
                  {item.icon}
                </div>
              </motion.div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition flex items-center justify-center gap-2">
            View all updates
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* AI Risk Dashboard */}
        <div className="bg-[#13151C] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-yellow-500 rounded-full" />
            <h2 className="text-xl font-bold">AI RISK DASHBOARD</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {riskItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0B0C10] rounded-xl p-4 border border-[#1F2937]"
              >
                <item.icon className="w-5 h-5 mb-2" style={{ color: item.color }} />
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs mb-2" style={{ color: item.color }}>{item.risk}</p>
                <p className="text-2xl font-bold">{item.percent}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trending AI Tools */}
        <div className="bg-[#13151C] rounded-2xl border border-[#1F2937] p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <h2 className="text-xl font-bold">TRENDING AI TOOLS</h2>
          </div>

          <div className="space-y-4">
            {trendingTools.map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                >
                  {tool.rank}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl" />
                <div className="flex-1">
                  <p className="font-semibold">{tool.name}</p>
                  <p className="text-xs text-gray-400">{tool.category}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    {tool.rating}
                  </div>
                  <p className="text-xs text-gray-500">{tool.users} users</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Modules */}
      <section className="px-8 py-8 grid grid-cols-2 gap-8">
        {/* Survival Guides */}
        <div className="bg-[#13151C] rounded-2xl border border-[#1F2937] p-6">
          <h2 className="text-xl font-bold mb-6">SURVIVAL GUIDES</h2>
          <div className="space-y-4">
            {survivalGuides.map((guide, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <guide.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{guide.title}</p>
                  <p className="text-sm text-gray-400">{guide.subtitle}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Companies War */}
        <div className="bg-[#13151C] rounded-2xl border border-[#1F2937] p-6">
          <h2 className="text-xl font-bold mb-6">AI COMPANIES WAR</h2>
          <div className="space-y-3">
            {aiCompanies.map((company, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg" />
                <div className="flex-1">
                  <p className="font-semibold">{company.name}</p>
                  <p className="text-sm text-gray-400">Latest: {company.model}</p>
                </div>
                <p className="text-lg font-bold">{company.cap}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-8">
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Mail className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-xl font-bold">Get the Daily AI Brief</h3>
              <p className="text-gray-400">Stay informed, stay ahead</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-5 py-3 bg-[#0B0C10] border border-gray-700 rounded-full w-64 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-[#1F2937] grid grid-cols-5 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <span className="font-bold">AI RADAR</span>
          </div>
          <p className="text-sm text-gray-500">Stay ahead or get replaced.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition">Features</a></li>
            <li><a href="#" className="hover:text-white transition">Pricing</a></li>
            <li><a href="#" className="hover:text-white transition">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition">Blog</a></li>
            <li><a href="#" className="hover:text-white transition">Newsletter</a></li>
            <li><a href="#" className="hover:text-white transition">Guides</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms</a></li>
            <li><a href="#" className="hover:text-white transition">Cookies</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Follow us</h4>
          <div className="flex gap-4">
            <Twitter className="w-5 h-5 text-gray-400 hover:text-white transition cursor-pointer" />
            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white transition cursor-pointer" />
            <Disc className="w-5 h-5 text-gray-400 hover:text-white transition cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}