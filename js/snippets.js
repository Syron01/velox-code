/* =====================================================
   Code Snippets — Velox Code
   ===================================================== */
window.VeloxSnippets = {

  // ── DART ──────────────────────────────────────────
  dart_hello: {
    lang: 'dart',
    label: 'Hello World',
    code: `// ⚡ Velox Code — Dart Hello World
void main() {
  print('Hello from Velox Code! ⚡');
  
  // Variables
  var name = 'Dart';
  final version = 3.4;
  const greeting = 'Welcome to';
  
  print('\$greeting \$name \$version 🎯');
  
  // String interpolation
  for (int i = 1; i <= 5; i++) {
    print('Count: \$i / 5');
  }
}
`
  },

  dart_fibonacci: {
    lang: 'dart',
    label: 'Fibonacci',
    code: `// ⚡ Fibonacci — Dart
void main() {
  print('=== Fibonacci Sequence ===');
  
  // Recursive (memoized)
  final memo = <int, BigInt>{};
  BigInt fib(int n) {
    if (n <= 1) return BigInt.from(n);
    return memo.putIfAbsent(n, () => fib(n - 1) + fib(n - 2));
  }
  
  for (int i = 0; i <= 20; i++) {
    print('fib(\$i) = \${fib(i)}');
  }
  
  // Iterative for large numbers
  print('\\n=== Large Fibonacci ===');
  BigInt a = BigInt.zero, b = BigInt.one;
  for (int i = 0; i < 100; i++) {
    final temp = a + b;
    a = b;
    b = temp;
  }
  print('fib(100) = \$b');
}
`
  },

  dart_async: {
    lang: 'dart',
    label: 'Async / Await',
    code: `// ⚡ Async/Await — Dart
import 'dart:async';

Future<String> fetchData(String endpoint) async {
  // Simulate network delay
  await Future.delayed(Duration(milliseconds: 200));
  return '{"status": "ok", "endpoint": "\$endpoint", "data": [1, 2, 3]}';
}

Future<List<int>> processItems(List<int> items) async {
  return await Future.wait(
    items.map((i) async {
      await Future.delayed(Duration(milliseconds: 50));
      return i * i;
    }),
  );
}

void main() async {
  print('🚀 Starting async operations...');
  
  // Sequential
  final t0 = DateTime.now();
  final data = await fetchData('/api/users');
  print('Data: \$data');
  
  // Parallel
  final results = await Future.wait([
    fetchData('/api/posts'),
    fetchData('/api/comments'),
    fetchData('/api/likes'),
  ]);
  
  print('\\n📦 Parallel results:');
  results.forEach((r) => print('  \$r'));
  
  // Stream
  print('\\n🌊 Stream:');
  final stream = Stream.periodic(
    Duration(milliseconds: 100),
    (i) => i,
  ).take(5);
  
  await for (final val in stream) {
    print('  tick: \$val');
  }
  
  final elapsed = DateTime.now().difference(t0).inMilliseconds;
  print('\\n✅ Done in \${elapsed}ms');
}
`
  },

  dart_oop: {
    lang: 'dart',
    label: 'OOP Classes',
    code: `// ⚡ OOP — Dart

abstract class Shape {
  String get name;
  double area();
  double perimeter();
  
  @override
  String toString() =>
    '[\$name] area=\${area().toStringAsFixed(2)}, perimeter=\${perimeter().toStringAsFixed(2)}';
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius);
  
  @override String get name => 'Circle';
  @override double area() => 3.14159 * radius * radius;
  @override double perimeter() => 2 * 3.14159 * radius;
}

class Rectangle extends Shape {
  final double width, height;
  Rectangle(this.width, this.height);
  
  @override String get name => 'Rectangle';
  @override double area() => width * height;
  @override double perimeter() => 2 * (width + height);
}

// Mixin
mixin Colorable {
  String color = 'transparent';
  void paint(String c) { color = c; print('  → Painted \$color'); }
}

class FancyCircle extends Circle with Colorable {
  FancyCircle(super.radius);
}

void main() {
  final shapes = <Shape>[
    Circle(5.0),
    Rectangle(4.0, 6.0),
    Circle(2.5),
    Rectangle(10.0, 3.0),
  ];
  
  print('=== Shapes ===');
  for (final s in shapes) print(s);
  
  final largest = shapes.reduce(
    (a, b) => a.area() > b.area() ? a : b
  );
  print('\\nLargest: \$largest');
  
  print('\\n=== Mixin ===');
  final fc = FancyCircle(7.0);
  fc.paint('Electric Blue');
  print(fc);
}
`
  },

  // ── HTML ──────────────────────────────────────────
  html_card: {
    lang: 'html',
    label: 'Card UI',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0f14;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 20px;
  }
  .card {
    background: #1e2330;
    border: 1px solid rgba(99,120,198,0.15);
    border-radius: 16px;
    padding: 28px;
    max-width: 340px;
    width: 100%;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6);
  }
  .avatar {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6b8cff, #c792ea);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin-bottom: 16px;
  }
  h2 { color: #e8eaf6; font-size: 20px; font-weight: 700; }
  p  { color: #8892b0; font-size: 13px; margin-top: 6px; line-height: 1.6; }
  .tags { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
  .tag {
    padding: 4px 12px; border-radius: 20px;
    font-size: 12px; font-weight: 600;
    background: rgba(107,140,255,0.15); color: #6b8cff;
  }
  .tag.purple { background: rgba(199,146,234,0.15); color: #c792ea; }
  .tag.green  { background: rgba(82,216,138,0.15);  color: #52d88a; }
  .btn {
    display: block; width: 100%; margin-top: 20px;
    padding: 12px; border-radius: 10px;
    background: #6b8cff; color: white;
    font-size: 14px; font-weight: 600;
    border: none; cursor: pointer;
    transition: all 0.15s;
  }
  .btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
</style>
</head>
<body>
<div class="card">
  <div class="avatar">⚡</div>
  <h2>Velox Code</h2>
  <p>Lightning-fast code playground. Write, run and share code in Dart, HTML, and JavaScript instantly.</p>
  <div class="tags">
    <span class="tag">Dart</span>
    <span class="tag purple">Flutter</span>
    <span class="tag green">Fast</span>
  </div>
  <button class="btn">Get Started →</button>
</div>
</body>
</html>`
  },

  html_animation: {
    lang: 'html',
    label: 'CSS Animation',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh; display: flex;
    align-items: center; justify-content: center;
    background: #0d0f14; overflow: hidden;
  }
  .orb-scene { position: relative; width: 300px; height: 300px; }
  .orb {
    position: absolute; border-radius: 50%;
    animation: orbit linear infinite;
  }
  .orb-1 {
    width: 200px; height: 200px;
    top: 50px; left: 50px;
    background: radial-gradient(circle at 30% 30%, #6b8cff, #0d0f14);
    box-shadow: 0 0 60px rgba(107,140,255,0.4);
    animation-duration: 8s;
  }
  .orb-2 {
    width: 120px; height: 120px;
    top: 90px; left: 90px;
    background: radial-gradient(circle at 30% 30%, #c792ea, #0d0f14);
    box-shadow: 0 0 40px rgba(199,146,234,0.5);
    animation-duration: 5s; animation-direction: reverse;
  }
  .orb-3 {
    width: 60px; height: 60px;
    top: 120px; left: 120px;
    background: radial-gradient(circle at 30% 30%, #52d88a, #0d0f14);
    box-shadow: 0 0 30px rgba(82,216,138,0.6);
    animation-duration: 3s;
  }
  @keyframes orbit {
    0%   { transform: rotate(0deg) translateX(30px) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
  }
  .label {
    position: absolute; bottom: -40px;
    width: 100%; text-align: center;
    color: rgba(232,234,246,0.5);
    font-family: -apple-system, sans-serif; font-size: 13px;
  }
</style>
</head>
<body>
<div class="orb-scene">
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="label">Pure CSS Animation ✨</div>
</div>
</body>
</html>`
  },

  // ── JAVASCRIPT ────────────────────────────────────
  js_canvas: {
    lang: 'javascript',
    label: 'Canvas Art',
    code: `// ⚡ Canvas Particle System
const canvas = document.createElement('canvas');
document.body.style.cssText = 'margin:0;overflow:hidden;background:#0d0f14;';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
resize(); window.addEventListener('resize', resize);

const COLORS = ['#6b8cff','#c792ea','#52d88a','#ffcb6b','#ff7070'];
const particles = [];
let mouse = { x: innerWidth/2, y: innerHeight/2 };

document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = mouse.x + (Math.random()-0.5)*200;
    this.y = mouse.y + (Math.random()-0.5)*200;
    this.vx = (Math.random()-0.5)*3;
    this.vy = (Math.random()-0.5)*3;
    this.life = 1;
    this.decay = 0.008 + Math.random()*0.015;
    this.size = 2 + Math.random()*6;
    this.color = COLORS[Math.floor(Math.random()*COLORS.length)];
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.05;
    this.life -= this.decay;
    if (this.life <= 0) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 120; i++) particles.push(new Particle());

function loop() {
  ctx.fillStyle = 'rgba(13,15,20,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(loop);
}
loop();
console.log('🎨 Canvas particle system running. Move your mouse!');
`
  },

  js_fetch: {
    lang: 'javascript',
    label: 'Fetch API',
    code: `// ⚡ Fetch API Demo — Velox Code
// Uses JSONPlaceholder (free REST API)

async function fetchUsers(count = 5) {
  console.log('📡 Fetching users...');
  const res = await fetch(\`https://jsonplaceholder.typicode.com/users?_limit=\${count}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

async function fetchPostsByUser(userId) {
  const res = await fetch(\`https://jsonplaceholder.typicode.com/posts?userId=\${userId}&_limit=3\`);
  return res.json();
}

(async () => {
  try {
    const users = await fetchUsers(3);
    console.log(\`✅ Got \${users.length} users\\n\`);
    
    for (const user of users) {
      console.log(\`👤 \${user.name} <\${user.email}>\`);
      console.log(\`   🌐 \${user.website} | 🏢 \${user.company.name}\`);
      
      const posts = await fetchPostsByUser(user.id);
      posts.forEach(p => console.log(\`   📝 \${p.title.slice(0, 50)}...\`));
      console.log('');
    }
    
    // Parallel requests
    console.log('⚡ Parallel fetch:');
    const [todos, photos] = await Promise.all([
      fetch('https://jsonplaceholder.typicode.com/todos?_limit=2').then(r=>r.json()),
      fetch('https://jsonplaceholder.typicode.com/photos?_limit=2').then(r=>r.json()),
    ]);
    console.log('Todos:', todos.map(t=>t.title));
    console.log('Photos:', photos.map(p=>p.title));
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
`
  }
};
