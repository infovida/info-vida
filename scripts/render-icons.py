"""Regenerate committed Lucide PNGs; requires Ubuntu librsvg-2/libcairo."""
from pathlib import Path
from svg_assets import render_svg

root = Path(__file__).resolve().parents[1] / 'assets/icons'
for source in sorted((root / 'source').glob('*.svg')):
    render_svg(source, root / (source.stem + '.png'), 96, 96)
print(f'{len(list((root / "source").glob("*.svg")))} transparent icon PNGs generated at 96 × 96.')
