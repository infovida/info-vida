"""Rebuild the code-authored demo illustrations with librsvg/cairo on Ubuntu."""
from pathlib import Path
from svg_assets import render_svg

root = Path(__file__).resolve().parents[1] / 'assets/news'
for source in sorted((root / 'source').glob('*.svg')):
    render_svg(source, root / (source.stem + '.png'), 800, 450)
print('Demo covers generated at 800 × 450.')
