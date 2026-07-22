const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const TOKEN = process.env.GITHUB_TOKEN;

// Helpers
const rnd = (min, max) => Math.random() * (max - min) + min;

// Embed images as base64 so they render when SVG is used in an <img> tag
function getBase64Image(filename) {
    try {
        const filepath = path.join(ASSETS_DIR, filename);
        if (!fs.existsSync(filepath)) return '';
        const base64 = fs.readFileSync(filepath, 'base64');
        return `data:image/png;base64,${base64}`;
    } catch (e) {
        console.error(`Error loading image ${filename}:`, e);
        return '';
    }
}

const COLORS = {
    bg: '#090B10',
    card: '#0F172A',
    border: '#1E293B',
    accent: '#3B82F6',
    cyan: '#38BDF8',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8'
};

const OCEAN_COLORS = [
    '#090B10', // 0
    '#0F172A', // 1
    '#1E3A8A', // 2
    '#3B82F6', // 3
    '#38BDF8', // 4
    '#FFFFFF'  // 5
];

async function fetchGitHubData() {
    if (!TOKEN) {
        console.warn("⚠️ No GITHUB_TOKEN provided. Using mock data for SVGs.");
        return getMockData();
    }
    
    // In a real scenario, we'd query GraphQL here. 
    // Since we are writing the script for the user to run, we'll provide the scaffolding.
    console.log("Fetching real data from GitHub API...");
    try {
        const res = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
                query {
                  viewer {
                    login
                    repositories(first: 6, orderBy: {field: STARGAZERS, direction: DESC}, isFork: false) {
                      nodes {
                        name
                        description
                        stargazerCount
                        forkCount
                        primaryLanguage { name color }
                      }
                    }
                    contributionsCollection {
                      contributionCalendar {
                        totalContributions
                        weeks {
                          contributionDays {
                            contributionCount
                            date
                          }
                        }
                      }
                    }
                  }
                }
                `
            })
        });
        const data = await res.json();
        return parseGitHubData(data.data.viewer);
    } catch (e) {
        console.error("Error fetching GitHub data:", e);
        return getMockData();
    }
}

function parseGitHubData(viewer) {
    const repos = viewer.repositories.nodes.map(r => ({
        name: r.name,
        desc: r.description || 'No description provided.',
        stars: r.stargazerCount,
        forks: r.forkCount,
        lang: r.primaryLanguage ? r.primaryLanguage.name : 'Unknown',
        color: r.primaryLanguage ? r.primaryLanguage.color : '#94A3B8'
    }));

    // Parse contributions into a flat array of intensities
    const weeks = viewer.contributionsCollection.contributionCalendar.weeks;
    const days = weeks.flatMap(w => w.contributionDays);
    const maxContribs = Math.max(...days.map(d => d.contributionCount), 1);
    
    const contributions = days.map(d => {
        if (d.contributionCount === 0) return 0;
        const ratio = d.contributionCount / maxContribs;
        if (ratio < 0.25) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 0.75) return 3;
        if (ratio < 0.9) return 4;
        return 5;
    });

    return { repos, contributions, totalContribs: viewer.contributionsCollection.contributionCalendar.totalContributions };
}

function getMockData() {
    return {
        repos: [
            { name: 'AI Email Assistant', desc: 'AI-powered email management with smart replies.', stars: 187, forks: 36, lang: 'TypeScript', color: '#3178C6' },
            { name: 'Self-Healing CI/CD', desc: 'Auto rollback & error detection using AI.', stars: 215, forks: 36, lang: 'Python', color: '#3572A5' },
            { name: 'AI PR Reviewer', desc: 'AI tool that reviews PRs and suggests improvements.', stars: 164, forks: 27, lang: 'Node.js', color: '#F7DF1E' },
            { name: 'Smart Library System', desc: 'Digital library management with seat mapping.', stars: 132, forks: 21, lang: 'MERN', color: '#10B981' },
            { name: 'Portfolio Website', desc: 'Personal portfolio built with modern UI/UX.', stars: 243, forks: 15, lang: 'React', color: '#61DAFB' },
            { name: 'System Design Notes', desc: 'High quality system design diagrams and notes.', stars: 98, forks: 10, lang: 'Notes', color: '#94A3B8' }
        ],
        contributions: Array.from({length: 365}, () => Math.floor(Math.random() * 6)),
        totalContribs: 1248
    };
}

function generateHeroSVG() {
    const width = 800;
    const height = 300;
    const bg = getBase64Image('hero.png');
    
    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .typing {
                font-family: 'Inter', monospace;
                font-size: 16px;
                fill: ${COLORS.cyan};
                font-weight: 600;
            }
            .code { font-family: monospace; fill: ${COLORS.textSecondary}; font-size: 14px; }
            .glow { text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
        </style>
        <clipPath id="rounded">
            <rect width="${width}" height="${height}" rx="16" />
        </clipPath>
    </defs>
    
    <g clip-path="url(#rounded)">
        <rect width="${width}" height="${height}" fill="${COLORS.bg}" />
        ${bg ? `<image href="${bg}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.6"/>` : ''}
        
        <!-- Overlay Gradient -->
        <rect width="${width}" height="${height}" fill="url(#grad)" />
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${COLORS.bg}" stop-opacity="1" />
            <stop offset="60%" stop-color="${COLORS.bg}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${COLORS.bg}" stop-opacity="0" />
        </linearGradient>

        <text x="40" y="80" font-family="Inter, sans-serif" font-size="24" fill="${COLORS.textPrimary}" font-weight="bold">Hi there! 👋</text>
        <text x="40" y="130" font-family="Inter, sans-serif" font-size="48" fill="${COLORS.textPrimary}" font-weight="800">I'm <tspan fill="${COLORS.accent}">Navneet</tspan></text>
        
        <text x="40" y="180" class="code">while (learning) {</text>
        <text x="60" y="205" class="code">  <tspan fill="${COLORS.cyan}">build</tspan>();</text>
        <text x="60" y="230" class="code">  <tspan fill="${COLORS.cyan}">automate</tspan>();</text>
        <text x="60" y="255" class="code">  <tspan fill="${COLORS.cyan}">repeat</tspan>();</text>
        <text x="40" y="280" class="code">}</text>
    </g>
</svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, 'hero.svg'), svg.trim());
}

function generateProjectsSVG(data) {
    const width = 800;
    const height = 400; // 3 rows of 2
    
    let cards = '';
    data.repos.forEach((repo, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col * 390 + 10;
        const y = row * 125 + 10;
        
        const thumbBase64 = getBase64Image(`thumb_${i+1}.png`);
        
        cards += `
        <g transform="translate(${x}, ${y})">
            <rect width="370" height="115" fill="${COLORS.card}" stroke="${COLORS.border}" stroke-width="1.5" rx="12" />
            
            <!-- Thumbnail -->
            ${thumbBase64 ? `<image href="${thumbBase64}" x="15" y="15" width="85" height="85" preserveAspectRatio="xMidYMid slice" />` : `<rect x="15" y="15" width="85" height="85" fill="${COLORS.bg}" rx="8"/>`}
            
            <text x="115" y="35" font-family="Inter, sans-serif" font-size="16" font-weight="600" fill="${COLORS.textPrimary}">${repo.name}</text>
            
            <!-- Description -->
            <foreignObject x="115" y="45" width="240" height="40">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, sans-serif; font-size: 11px; color: ${COLORS.textSecondary}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${repo.desc}
                </div>
            </foreignObject>
            
            <!-- Tech & Stats -->
            <rect x="115" y="85" width="50" height="16" fill="${COLORS.bg}" rx="4" />
            <text x="140" y="96" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="${repo.color}" text-anchor="middle">${repo.lang}</text>
            
            <text x="180" y="97" font-family="Inter, sans-serif" font-size="12" fill="${COLORS.textSecondary}">⭐ ${repo.stars}</text>
            <text x="230" y="97" font-family="Inter, sans-serif" font-size="12" fill="${COLORS.textSecondary}">⑂ ${repo.forks}</text>
        </g>
        `;
    });

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${COLORS.bg}" />
    ${cards}
</svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, 'projects.svg'), svg.trim());
}

function generateOceanSVG(data) {
    const cols = 52;
    const rows = 7;
    const cellSize = 12;
    const gap = 3;
    const width = 800;
    const height = 280;

    const icons = {
        anchor: '<path d="M12 2v4M12 22v-4M8 22h8M12 18a6 6 0 0 0-6-6H4m16 0h-2a6 6 0 0 0-6 6M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" fill="none" stroke="currentColor" stroke-width="2"/>',
        fish: '<path d="M17 12c.5-1.5 1-3 3-3 0 6-2.5 7.5-3 6m-5-3c-3-2-6-3-9-1 1-3 3-5 7-4l2-1v8l-2-1c-4 1-6-1-7-4 3 2 6 1 9-1m2-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="none" stroke="currentColor" stroke-width="2"/>',
        star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>',
        droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor"/>'
    };
    const iconKeys = Object.keys(icons);

    let elements = '';
    
    // Map linear contribution data to grid and apply wave math
    for (let x = 0; x < cols; x++) {
        // Complex natural wave function
        const wave = Math.sin(x * 0.15) * 1.5 + Math.sin(x * 0.4) * 0.8 + Math.cos(x * 0.2) * 1.2;
        
        for (let y = 0; y < rows; y++) {
            const i = x * rows + y;
            if (i >= data.contributions.length) break;
            
            // Base intensity from GitHub API
            let level = data.contributions[i] || 0;
            
            // Modify visual intensity based on wave height (bottom cells always solid, top cells wavy)
            const depth = (rows - y) + wave;
            if (depth < 2 && level > 0) level = 1; // fade out tops

            const cx = x * (cellSize + gap) + 15;
            const cy = y * (cellSize + gap) + 60; // offset down
            
            if (level === 0 && depth > 2) level = 1; // Make the ocean "full" of dark blue at bottom

            if (level > 5) level = 5;
            if (level < 0) level = 0;

            const iconKey = level > 1 ? iconKeys[Math.floor(rnd(0, iconKeys.length))] : 'droplet';
            const iconSvg = icons[iconKey];
            const color = OCEAN_COLORS[level];

            const dur = rnd(3, 5).toFixed(2);
            const delay = rnd(0, 3).toFixed(2);
            const bob = level > 0 ? rnd(2, 6).toFixed(1) : 0;

            elements += `
            <g transform="translate(${cx}, ${cy})" color="${color}">
                <g>
                    ${level > 0 ? `<animateTransform attributeName="transform" type="translate" values="0,0; 0,-${bob}; 0,0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite" />` : ''}
                    <g transform="scale(0.5)">
                        ${iconSvg}
                    </g>
                </g>
            </g>`;
        }
    }

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${COLORS.bg}" rx="16"/>
    <!-- Lighthouse Beam -->
    <path d="M${width-40},10 L${width-300},150 L${width},150 Z" fill="url(#beam)" opacity="0.15">
        <animateTransform attributeName="transform" type="rotate" values="-5 ${width-40} 10; 5 ${width-40} 10; -5 ${width-40} 10" dur="10s" repeatCount="indefinite"/>
    </path>
    <defs>
        <linearGradient id="beam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${COLORS.cyan}" stop-opacity="1" />
            <stop offset="100%" stop-color="${COLORS.cyan}" stop-opacity="0" />
        </linearGradient>
    </defs>
    <!-- Ocean Base -->
    <rect x="0" y="100" width="${width}" height="180" fill="url(#oceanGrad)" opacity="0.2"/>
    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${COLORS.accent}" stop-opacity="0" />
        <stop offset="100%" stop-color="${COLORS.accent}" stop-opacity="0.5" />
    </linearGradient>
    
    ${elements}

    <!-- Stat Footer -->
    <g transform="translate(0, 230)">
        <text x="200" y="10" font-family="Inter, sans-serif" font-size="12" fill="${COLORS.textSecondary}" text-anchor="middle">Total Contributions</text>
        <text x="200" y="30" font-family="Inter, sans-serif" font-size="20" fill="${COLORS.textPrimary}" font-weight="bold" text-anchor="middle">${data.totalContribs}</text>
        
        <text x="600" y="10" font-family="Inter, sans-serif" font-size="12" fill="${COLORS.textSecondary}" text-anchor="middle">This Year</text>
        <text x="600" y="30" font-family="Inter, sans-serif" font-size="20" fill="${COLORS.textPrimary}" font-weight="bold" text-anchor="middle">365 days</text>
    </g>
</svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, 'ocean.svg'), svg.trim());
}

async function run() {
    const data = await fetchGitHubData();
    generateHeroSVG();
    generateProjectsSVG(data);
    generateOceanSVG(data);
    console.log("Assets generated successfully!");
}

run();
