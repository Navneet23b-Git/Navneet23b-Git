import os
import json
import urllib.request
from datetime import datetime, timezone

def time_ago(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = now - dt
    seconds = diff.total_seconds()
    if seconds < 60: return "just now"
    if seconds < 3600: 
        m = int(seconds // 60)
        return f"{m} minute{'s' if m!=1 else ''} ago"
    if seconds < 86400: 
        h = int(seconds // 3600)
        return f"{h} hour{'s' if h!=1 else ''} ago"
    if seconds < 604800: 
        d = int(seconds // 86400)
        return f"{d} day{'s' if d!=1 else ''} ago"
    w = int(seconds // 604800)
    return f"{w} week{'s' if w!=1 else ''} ago"

def get_real_activities(username="Navneet23b-Git"):
    try:
        req = urllib.request.Request(f'https://api.github.com/users/{username}/events/public', headers={'User-Agent': 'Mozilla/5.0'})
        events = json.loads(urllib.request.urlopen(req).read())
    except Exception as e:
        print("Failed to fetch events:", e)
        return []

    activities = []
    seen = set()
    
    for e in events:
        if len(activities) >= 7: break
        
        repo_name = e['repo']['name'].split('/')[-1]
        action = ""
        icon = ""
        
        if e['type'] == 'PushEvent':
            icon, action = "➕", "Pushed to"
        elif e['type'] == 'IssuesEvent':
            action_type = e['payload']['action']
            if action_type == 'opened': icon, action = "🚨", "Opened issue in"
            elif action_type == 'closed': icon, action = "✅", "Closed issue in"
            else: continue
        elif e['type'] == 'PullRequestEvent':
            action_type = e['payload']['action']
            if action_type == 'opened': icon, action = "🔀", "Opened PR in"
            elif action_type == 'closed' and e['payload'].get('pull_request', {}).get('merged'): icon, action = "🔀", "Merged PR in"
            elif action_type == 'closed': icon, action = "❌", "Closed PR in"
            else: continue
        elif e['type'] == 'CreateEvent' and e['payload'].get('ref_type') == 'repository':
            icon, action = "📁", "Created repository"
        elif e['type'] == 'WatchEvent':
            icon, action = "⭐", "Starred"
        elif e['type'] == 'ForkEvent':
            icon, action = "🔄", "Forked"
        else:
            continue
            
        key = (e['type'], repo_name, action)
        if key in seen: continue
        seen.add(key)
        
        # Truncate repo name if it's too long
        if len(repo_name) > 22:
            repo_name = repo_name[:19] + "..."
            
        activities.append((icon, action, repo_name, time_ago(e['created_at'])))
        
    return activities

def generate_activity_svg():
    styles = """
    <style>
      .title { font: 600 16px "Segoe UI", -apple-system, sans-serif; fill: #ffffff; }
      .icon-bg { fill: #161b22; stroke: #30363d; stroke-width: 1px; rx: 6px; }
      .text-main { font: 400 14px "Segoe UI", -apple-system, sans-serif; fill: #c9d1d9; }
      .text-repo { font: 400 14px "Segoe UI", -apple-system, sans-serif; fill: #58a6ff; }
      .text-time { font: 400 12px "Segoe UI", -apple-system, sans-serif; fill: #8b949e; }
      .text-link { font: 500 13px "Segoe UI", -apple-system, sans-serif; fill: #58a6ff; }
      .bg-rect { fill: #0d1117; stroke: #30363d; stroke-width: 1.5; rx: 8px; }
    </style>
    """
    
    svg = []
    svg.append('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="340" viewBox="0 0 900 340">')
    svg.append(f'<defs>{styles}</defs>')
    
    # Left Card: Recent Contribution Activity (Width 490)
    svg.append('<rect class="bg-rect" x="5" y="5" width="490" height="330"/>')
    svg.append('<text x="25" y="35" font-size="16">📝</text>')
    svg.append('<text x="55" y="34" class="title">Recent Contribution Activity</text>')
    
    activities = get_real_activities()
    # Fallback if API fails
    if not activities:
        activities = [
            ("➕", "Pushed to", "ai-email-assistant", "2 hours ago"),
            ("🚨", "Opened issue in", "self-healing-cicd", "1 day ago")
        ]
    
    y = 70
    for icon, action, repo, time in activities:
        # Icon background
        svg.append(f'<rect class="icon-bg" x="25" y="{y-18}" width="28" height="28"/>')
        svg.append(f'<text x="39" y="{y+1}" font-size="14" text-anchor="middle">{icon}</text>')
        
        # Action text
        svg.append(f'<text x="65" y="{y}" class="text-main">{action}</text>')
        
        # Repo text (calculate position based on action length approximation)
        action_width = len(action) * 7.5
        if repo:
            svg.append(f'<text x="{65 + action_width + 5}" y="{y}" class="text-repo">{repo}</text>')
        
        # Time (Right aligned)
        svg.append(f'<text x="470" y="{y}" class="text-time" text-anchor="end">{time}</text>')
        
        y += 35
        
    # View all activity link
    svg.append('<text x="470" y="315" class="text-link" text-anchor="end">View all activity ➔</text>')

    # Right Card: Highlights (Width 390)
    x_right = 505
    svg.append(f'<rect class="bg-rect" x="{x_right}" y="5" width="390" height="330"/>')
    svg.append(f'<text x="{x_right+20}" y="35" font-size="16">🏆</text>')
    svg.append(f'<text x="{x_right+50}" y="34" class="title">Highlights</text>')
    
    highlights = [
        ("🎓", "GitHub Campus Expert"),
        ("💪", "500+ LeetCode Problems Solved"),
        ("🎯", "HWi OA Round Qualified"),
        ("🥇", "JGEC Volleyball Runner Up"),
        ("💼", "SWE Intern @ AlgoUniversity"),
        ("🚀", "Built multiple AI-powered projects")
    ]
    
    y_hl = 80
    for icon, text in highlights:
        svg.append(f'<text x="{x_right+20}" y="{y_hl}" font-size="16">{icon}</text>')
        svg.append(f'<text x="{x_right+50}" y="{y_hl-1}" class="text-main">{text}</text>')
        y_hl += 40

    svg.append('</svg>')
    
    with open(r"C:\Users\ASUS\Desktop\ProfileGithub\activity_highlights.svg", 'w', encoding='utf-8') as f:
        f.write("\n".join(svg))
    print("Generated activity_highlights.svg")

if __name__ == "__main__":
    generate_activity_svg()
