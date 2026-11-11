"""Create committed map assets from the existing, read-only trip workspace."""
from pathlib import Path
import json, html

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
geo = json.loads((ROOT.parent / '02_Orte_und_Ideen/Kartenmaterial/Laender.geojson').read_text())

def project(lon, lat):
    return (lon - 103.0) * 74 + 25, (12.6 - lat) * 74 + 15

def path(coords):
    return ' '.join(('M' if i == 0 else 'L') + '%.1f,%.1f' % project(*p[:2]) for i, p in enumerate(coords)) + 'Z'

base = []
for feature in geo['features']:
    country = feature['properties']['ADMIN']
    if country not in ['Vietnam', 'Cambodia', 'Thailand', 'Laos']:
        continue
    g = feature['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        base.append(f'<path d="{path(poly[0])}" fill="{"#d9e2ce" if country == "Vietnam" else "#e9e8dc"}" stroke="#b8c8b6" stroke-width="1.2"/>')

points = {'hcm': (106.70, 10.78), 'dalat': (108.44, 11.94), 'cat': (107.42, 11.42), 'delta': (105.79, 10.04), 'pq': (103.97, 10.22), 'cd': (106.61, 8.69), 'rg': (105.08, 10.00)}
labels = {'hcm': 'Ho-Chi-Minh', 'dalat': 'Đà Lạt', 'cat': 'Cát Tiên', 'delta': 'Cần Thơ', 'pq': 'Phú Quốc', 'cd': 'Côn Đảo', 'rg': 'Rạch Giá'}
offsets = {'hcm': (12, 5), 'dalat': (-18, -15), 'cat': (12, 4), 'delta': (7, -14), 'pq': (-42, 34), 'cd': (12, 4), 'rg': (-29, 23)}
routes = {
 'A': ('#aa6240', ['hcm','dalat','cat','hcm','delta','hcm'], ['land']*5),
 'B': ('#5578a0', ['hcm','delta','rg','pq','hcm','cd','hcm'], ['land','land','ferry','flight','flight','flight']),
 'C': ('#16766d', ['hcm','cat','hcm','delta','rg','pq','rg','hcm'], ['land','land','land','land','ferry','ferry','land']),
 'C-flight': ('#16766d', ['hcm','cat','hcm','delta','rg','pq','hcm'], ['land','land','land','land','ferry','flight']),
 'D': ('#97703e', ['hcm','dalat','cat','hcm','pq','hcm'], ['land','land','land','flight','flight']),
 'E': ('#6657a5', ['hcm','cat','hcm','cd','hcm'], ['land','land','flight','flight'])
}
for rid, (color, route, modes) in routes.items():
    s = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 470 380" role="img">', f'<title>Route {rid}: Südvietnam</title>', '<defs><clipPath id="frame"><rect width="470" height="380" rx="20"/></clipPath></defs><g clip-path="url(#frame)">', '<rect width="470" height="380" fill="#e4efeb"/>', *base]
    s += ['<text x="100" y="72" fill="#94a18f" font-family="sans-serif" font-size="11" letter-spacing="2">KAMBODSCHA</text>', '<text x="297" y="48" fill="#84997d" font-family="sans-serif" font-size="11" letter-spacing="2">VIETNAM</text>', '<text x="50" y="290" fill="#88a6a0" font-family="sans-serif" font-size="10">GOLF VON THAILAND</text>']
    for k, rx, ry in [('pq',6,16),('cd',8,4)]:
        x,y = project(*points[k]); s.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="#d9e2ce" stroke="#b8c8b6"/>')
    seen = set()
    for a, b, mode in zip(route,route[1:],modes):
        edge=(tuple(sorted([a,b])),mode)
        if edge in seen: continue
        seen.add(edge)
        x,y=project(*points[a]); xx,yy=project(*points[b])
        dash = 'stroke-dasharray="7 5"' if mode == 'ferry' else 'stroke-dasharray="2 6"' if mode=='flight' else ''
        if mode=='flight':
            d=f'M{x},{y} Q{(x+xx)/2+25},{(y+yy)/2-30} {xx},{yy}'
        else: d=f'M{x},{y} L{xx},{yy}'
        s.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2.5" stroke-linecap="round" {dash} opacity=".8"/>')
    for k in dict.fromkeys(route):
        x,y=project(*points[k]); dx,dy=offsets[k]
        s.append(f'<circle cx="{x}" cy="{y}" r="{3 if k=="rg" else 5}" fill="{color}" stroke="white" stroke-width="2"/>')
        s.append(f'<text x="{x+dx}" y="{y+dy}" fill="#28493f" stroke="#ecf0e7" stroke-width="3" paint-order="stroke" font-family="system-ui,sans-serif" font-weight="650" font-size="{10 if k=="rg" else 12}">{labels[k]}</text>')
    s.append('<text x="26" y="355" fill="#647d72" font-size="9" font-family="sans-serif">N ↑ · Ortsfolge schematisch · Natural Earth</text></g></svg>')
    (DIST/'assets'/f'route-{rid}.svg').write_text('\n'.join(s))

credits=json.loads((DIST/'assets/bildquellen.json').read_text())
names={'12_da_lat.jpg':'Đà Lạt · Pongour','14_can_tho.jpg':'Cần Thơ · Cái Răng','15_cat_tien.jpg':'Cát Tiên · Regenwald','16_phu_quoc.jpg':'Phú Quốc · Bãi Sao','17_con_dao.jpg':'Côn Đảo · Strand','cu-chi.jpg':'HCMC · Củ Chi'}
clean=[]
for x in credits:
    artist=x.get('artist',x.get('author',''))
    if x['file']=='16_phu_quoc.jpg':artist='Trantuonglam'
    if x['file']=='17_con_dao.jpg':artist='[Tycho] / shansov.net'
    clean.append(dict(label=names[x['file']],artist=artist,license=x['license'],page=x['page']))
data=DIST/'data.js'
text=data.read_text().split('\nconst IMAGE_CREDITS =')[0]
data.write_text(text+'\nconst IMAGE_CREDITS = '+json.dumps(clean,ensure_ascii=False,indent=2)+';\n')
print('Generated six route maps and photo credits.')
