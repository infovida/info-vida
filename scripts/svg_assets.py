"""Local SVG rasterizer backed by Ubuntu librsvg/cairo; not used by the app."""
import ctypes as c
from pathlib import Path

rsvg = c.CDLL('librsvg-2.so.2')
cairo = c.CDLL('libcairo.so.2')
gobject = c.CDLL('libgobject-2.0.so.0')
rsvg.rsvg_handle_new_from_data.argtypes = [c.c_char_p, c.c_size_t, c.c_void_p]
rsvg.rsvg_handle_new_from_data.restype = c.c_void_p
cairo.cairo_image_surface_create.argtypes = [c.c_int, c.c_int, c.c_int]
cairo.cairo_image_surface_create.restype = c.c_void_p
cairo.cairo_create.argtypes = [c.c_void_p]
cairo.cairo_create.restype = c.c_void_p
cairo.cairo_surface_write_to_png.argtypes = [c.c_void_p, c.c_char_p]
cairo.cairo_surface_write_to_png.restype = c.c_int
cairo.cairo_destroy.argtypes = [c.c_void_p]
cairo.cairo_surface_destroy.argtypes = [c.c_void_p]
gobject.g_object_unref.argtypes = [c.c_void_p]

class Rectangle(c.Structure):
    _fields_ = [(name, c.c_double) for name in ['x', 'y', 'width', 'height']]

rsvg.rsvg_handle_render_document.argtypes = [c.c_void_p, c.c_void_p, c.POINTER(Rectangle), c.c_void_p]
rsvg.rsvg_handle_render_document.restype = c.c_int
def render_svg(source: Path, target: Path, width: int, height: int):
    data = source.read_bytes()
    handle = rsvg.rsvg_handle_new_from_data(data, len(data), None)
    if not handle:
        raise ValueError(f'Invalid SVG: {source}')
    surface = cairo.cairo_image_surface_create(0, width, height)
    context = cairo.cairo_create(surface)
    try:
        viewport = Rectangle(0, 0, width, height)
        if not rsvg.rsvg_handle_render_document(handle, context, c.byref(viewport), None):
            raise ValueError(f'Could not render: {source}')
        if cairo.cairo_surface_write_to_png(surface, str(target).encode()):
            raise OSError(f'Could not write: {target}')
    finally:
        cairo.cairo_destroy(context)
        cairo.cairo_surface_destroy(surface)
        gobject.g_object_unref(handle)
