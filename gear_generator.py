import bpy
import math
import bmesh
from mathutils import Vector


def create_gear(name="Gear", teeth=12, module=0.2, thickness=0.2, bore_radius=0.05):
    if teeth < 3:
        raise ValueError("teeth must be >= 3")
    if module <= 0:
        raise ValueError("module must be > 0")

    pitch_radius = module * teeth / 2.0
    outer_radius = pitch_radius + module
    root_radius = pitch_radius - 1.25 * module
    tooth_angle = math.pi / teeth

    verts = []
    segments = 2
    for i in range(teeth):
        base_angle = 2 * math.pi * i / teeth
        angles = [
            base_angle - tooth_angle / 2,
            base_angle + tooth_angle / 2,
        ]
        profile = [(math.cos(a), math.sin(a)) for a in angles]
        inner = [(x * root_radius, y * root_radius) for x, y in profile]
        outer = [(x * outer_radius, y * outer_radius) for x, y in profile]
        seq = [inner[0], outer[0], outer[1], inner[1]]
        for k in range(segments):
            verts.append((seq[k][0], seq[k][1], -thickness / 2))
        for k in range(segments):
            verts.append((seq[k][0], seq[k][1], thickness / 2))

    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], [])
    bm = bmesh.new()
    bm.from_mesh(mesh)

    bmesh.ops.convex_hull(bm, input=bm.verts)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


if __name__ == "__main__":
    obj = create_gear(teeth=16, module=0.15, thickness=0.2, bore_radius=0.06)
    obj.location = (0, 0, 0)
