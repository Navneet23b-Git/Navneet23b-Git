const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const TOKEN = process.env.GITHUB_TOKEN;

// Hardcode the raw GitHub URL base for images to bypass SVG base64 limits on GitHub
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Navneet23b-Git/Navneet23b-Git/main/assets';

// Helpers
const rnd = (min, max) => Math.random() * (max - min) + min;

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
    const width = 830;
    const height = 280;
    const bgUrl = `${GITHUB_RAW_BASE}/hero.png`;
    
    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>
            .typing { font-family: 'Inter', monospace; font-size: 16px; fill: ${COLORS.cyan}; font-weight: 600; }
            .code { font-family: monospace; fill: ${COLORS.textSecondary}; font-size: 14px; }
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&amp;display=swap');
        </style>
        <clipPath id="rounded">
            <rect width="${width}" height="${height}" rx="16" />
        </clipPath>
    </defs>
    
    <g clip-path="url(#rounded)">
        <rect width="${width}" height="${height}" fill="${COLORS.bg}" />
        <image href="${bgUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" opacity="0.6"/>
        
        <rect width="${width}" height="${height}" fill="url(#grad)" />
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${COLORS.bg}" stop-opacity="1" />
            <stop offset="60%" stop-color="${COLORS.bg}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${COLORS.bg}" stop-opacity="0" />
        </linearGradient>

        <text x="40" y="80" font-family="'Inter', sans-serif" font-size="24" fill="${COLORS.textPrimary}" font-weight="bold">Hi there! 👋</text>
        <text x="40" y="130" font-family="'Inter', sans-serif" font-size="48" fill="${COLORS.textPrimary}" font-weight="800">I'm <tspan fill="${COLORS.accent}">Navneet</tspan></text>
        
        <text x="40" y="175" class="code">while (learning) {</text>
        <text x="60" y="200" class="code">  <tspan fill="${COLORS.cyan}">build</tspan>();</text>
        <text x="60" y="225" class="code">  <tspan fill="${COLORS.cyan}">automate</tspan>();</text>
        <text x="60" y="250" class="code">  <tspan fill="${COLORS.cyan}">repeat</tspan>();</text>
        <text x="40" y="275" class="code">}</text>
    </g>
</svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, 'hero.svg'), svg.trim());
}

function generateProjectsSVG(data) {
    const width = 830;
    const height = 360; 
    
    let cards = '';
    data.repos.forEach((repo, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col * 410 + 10;
        const y = row * 115 + 10;
        
        const thumbUrl = `${GITHUB_RAW_BASE}/thumb_${i+1}.png`;
        
        cards += `
        <g transform="translate(${x}, ${y})">
            <rect width="400" height="105" fill="${COLORS.card}" stroke="${COLORS.border}" stroke-width="1.5" rx="12" />
            
            <rect x="15" y="15" width="75" height="75" fill="${COLORS.bg}" rx="8"/>
            <image href="${thumbUrl}" x="15" y="15" width="75" height="75" preserveAspectRatio="xMidYMid slice" clip-path="url(#thumbClip_${i})" />
            
            <text x="105" y="32" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="${COLORS.textPrimary}">${repo.name}</text>
            
            <foreignObject x="105" y="42" width="280" height="35">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Inter', sans-serif; font-size: 12px; color: ${COLORS.textSecondary}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">
                    ${repo.desc}
                </div>
            </foreignObject>
            
            <rect x="105" y="80" width="55" height="16" fill="${COLORS.bg}" rx="4" />
            <text x="132" y="91" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" fill="${repo.color}" text-anchor="middle">${repo.lang}</text>
            
            <text x="175" y="92" font-family="'Inter', sans-serif" font-size="12" fill="${COLORS.textSecondary}">⭐ ${repo.stars}</text>
            <text x="220" y="92" font-family="'Inter', sans-serif" font-size="12" fill="${COLORS.textSecondary}">⑂ ${repo.forks}</text>
        </g>
        `;
    });

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        ${[0,1,2,3,4,5].map(i => `<clipPath id="thumbClip_${i}"><rect x="15" y="15" width="75" height="75" rx="8" /></clipPath>`).join('')}
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;display=swap');</style>
    </defs>
    <rect width="${width}" height="${height}" fill="${COLORS.bg}" />
    ${cards}
</svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, 'projects.svg'), svg.trim());
}

function generateOceanSVG(data) {
    const cols = 66;
    const rows = 7;
    const cellSize = 10;
    const gap = 2;
    const width = 830;
    const height = 240;

    const icons = {
        anchor: '<path d="M12 2v4M12 22v-4M8 22h8M12 18a6 6 0 0 0-6-6H4m16 0h-2a6 6 0 0 0-6 6M9 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" fill="none" stroke="currentColor" stroke-width="2"/>',
        fish: '<path d="M17 12c.5-1.5 1-3 3-3 0 6-2.5 7.5-3 6m-5-3c-3-2-6-3-9-1 1-3 3-5 7-4l2-1v8l-2-1c-4 1-6-1-7-4 3 2 6 1 9-1m2-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="none" stroke="currentColor" stroke-width="2"/>',
        star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>',
        droplet: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor"/>'
    };
    const iconKeys = Object.keys(icons);

    let elements = '';
    
    for (let x = 0; x < cols; x++) {
        const wave = Math.sin(x * 0.15) * 1.5 + Math.sin(x * 0.4) * 0.8 + Math.cos(x * 0.2) * 1.2;
        
        for (let y = 0; y < rows; y++) {
            const i = x * rows + y;
            if (i >= data.contributions.length) break;
            
            let level = data.contributions[i] || 0;
            const depth = (rows - y) + wave;
            if (depth < 2 && level > 0) level = 1;

            const cx = x * (cellSize + gap) + 20;
            const cy = y * (cellSize + gap) + 40;
            
            if (level === 0 && depth > 2) level = 1;

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
                    <g transform="scale(0.4)">
                        ${iconSvg}
                    </g>
                </g>
            </g>`;
        }
    }

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&amp;display=swap');</style>
    </defs>
    <rect width="${width}" height="${height}" fill="${COLORS.bg}" rx="16"/>
    
    <path d="M${width-40},10 L${width-300},150 L${width},150 Z" fill="url(#beam)" opacity="0.15">
        <animateTransform attributeName="transform" type="rotate" values="-5 ${width-40} 10; 5 ${width-40} 10; -5 ${width-40} 10" dur="10s" repeatCount="indefinite"/>
    </path>
    <defs>
        <linearGradient id="beam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${COLORS.cyan}" stop-opacity="1" />
            <stop offset="100%" stop-color="${COLORS.cyan}" stop-opacity="0" />
        </linearGradient>
    </defs>
    
    <rect x="0" y="80" width="${width}" height="160" fill="url(#oceanGrad)" opacity="0.2"/>
    <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${COLORS.accent}" stop-opacity="0" />
        <stop offset="100%" stop-color="${COLORS.accent}" stop-opacity="0.5" />
    </linearGradient>
    
    ${elements}

    <g transform="translate(0, 195)">
        <rect x="15" y="0" width="800" height="40" fill="${COLORS.card}" rx="8" stroke="${COLORS.border}" stroke-width="1"/>
        <text x="250" y="15" font-family="'Inter', sans-serif" font-size="10" fill="${COLORS.textSecondary}" text-anchor="middle">Total Contributions</text>
        <text x="250" y="32" font-family="'Inter', sans-serif" font-size="16" fill="${COLORS.textPrimary}" font-weight="bold" text-anchor="middle">${data.totalContribs}</text>
        
        <text x="550" y="15" font-family="'Inter', sans-serif" font-size="10" fill="${COLORS.textSecondary}" text-anchor="middle">This Year</text>
        <text x="550" y="32" font-family="'Inter', sans-serif" font-size="16" fill="${COLORS.textPrimary}" font-weight="bold" text-anchor="middle">365 days</text>
    </g>
</svg>`;
    fs.writeFileSync(path.join(ASSETS_DIR, 'ocean.svg'), svg.trim());
}

async function run() {
    const data = await fetchGitHubData();
    generateHeroSVG();
    generateProjectsSVG(data);
    generateOceanSVG(data);
    console.log("Assets generated successfully using raw URLs!");
}

run();
