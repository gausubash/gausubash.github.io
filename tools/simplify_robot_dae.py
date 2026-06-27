#!/usr/bin/env python3
"""Decimate Collada robot meshes while preserving kinematics / scene structure."""

from __future__ import annotations

import argparse
import shutil
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import trimesh

NS = "http://www.collada.org/2008/03/COLLADASchema"
ET.register_namespace("", NS)


def q(tag: str) -> str:
    return f"{{{NS}}}{tag}"


def parse_floats(text: str) -> np.ndarray:
    return np.fromstring(text, sep=" ", dtype=np.float64)


def format_floats(values: np.ndarray, precision: int = 5) -> str:
    return " ".join(f"{v:.{precision}f}" for v in values.reshape(-1))


def find_position_source(mesh: ET.Element) -> str | None:
    vertices = mesh.find(q("vertices"))
    if vertices is None:
        return None
    for inp in vertices.findall(q("input")):
        if inp.get("semantic") == "POSITION":
            return inp.get("source", "").lstrip("#")
    return None


def simplify_triangle_mesh(positions: np.ndarray, tri_count: int, ratio: float) -> tuple[np.ndarray, int]:
    """Collada robot meshes store 3 unique vertices per triangle (STL-style)."""
    expected = tri_count * 3
    if positions.size != expected * 3:
        raise ValueError(f"position count mismatch: got {positions.size // 3}, expected {expected}")

    verts = positions.reshape(-1, 3)
    faces = np.arange(len(verts), dtype=np.int64).reshape(-1, 3)
    mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
    mesh.merge_vertices()

    if len(mesh.faces) < 4:
        return positions, tri_count

    target_faces = max(4, int(round(len(mesh.faces) * ratio)))
    if target_faces >= len(mesh.faces):
        return positions, tri_count

    simplified = mesh.simplify_quadric_decimation(face_count=target_faces)
    if simplified.faces is None or len(simplified.faces) == 0:
        return positions, tri_count

    flat = simplified.vertices[simplified.faces].reshape(-1, 3)
    return flat.astype(np.float64), len(simplified.faces)


def process_dae(src: Path, dst: Path, ratio: float, precision: int) -> dict:
    tree = ET.parse(src)
    root = tree.getroot()

    stats = {
        "geometries": 0,
        "triangles_before": 0,
        "triangles_after": 0,
    }

    for geom in root.findall(f".//{q('geometry')}"):
        geom_id = geom.get("id", "?")
        for mesh in geom.findall(f".//{q('mesh')}"):
            triangles = mesh.find(q("triangles"))
            if triangles is None:
                continue

            tri_count = int(triangles.get("count", "0"))
            stats["geometries"] += 1
            stats["triangles_before"] += tri_count

            pos_ref = find_position_source(mesh)
            if not pos_ref:
                stats["triangles_after"] += tri_count
                continue

            pos_source = geom.find(f".//{q('source')}[@id='{pos_ref}']")
            if pos_source is None:
                stats["triangles_after"] += tri_count
                continue

            float_array = pos_source.find(q("float_array"))
            if float_array is None or float_array.text is None:
                stats["triangles_after"] += tri_count
                continue

            positions = parse_floats(float_array.text.strip())
            try:
                new_positions, new_tri_count = simplify_triangle_mesh(positions, tri_count, ratio)
            except Exception as exc:  # noqa: BLE001
                print(f"  skip {geom_id}: {exc}", file=sys.stderr)
                stats["triangles_after"] += tri_count
                continue

            float_array.text = format_floats(new_positions, precision)
            float_array.set("count", str(new_positions.size))

            accessor = pos_source.find(f".//{q('accessor')}")
            if accessor is not None:
                accessor.set("count", str(new_positions.shape[0]))

            triangles.set("count", str(new_tri_count))

            p_elem = triangles.find(q("p"))
            if p_elem is not None:
                p_elem.text = " ".join(str(i) for i in range(new_positions.shape[0]))

            stats["triangles_after"] += new_tri_count
            print(
                f"  {geom_id}: {tri_count} -> {new_tri_count} tris "
                f"({100 * new_tri_count / max(tri_count, 1):.0f}%)"
            )

    dst.parent.mkdir(parents=True, exist_ok=True)
    tree.write(dst, encoding="UTF-8", xml_declaration=True)
    return stats


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("models/collada/abb_irb52_7_120.dae"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("models/collada/abb_irb52_7_120_lite.dae"),
    )
    parser.add_argument(
        "--ratio",
        type=float,
        default=0.45,
        help="Target fraction of triangles to keep (default: 0.45)",
    )
    parser.add_argument(
        "--precision",
        type=int,
        default=5,
        help="Decimal places for vertex floats (default: 5)",
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Copy original to .dae.bak before writing lite as primary name",
    )
    args = parser.parse_args()

    repo = Path(__file__).resolve().parents[1]
    src = args.input if args.input.is_absolute() else repo / args.input
    dst = args.output if args.output.is_absolute() else repo / args.output

    if not src.exists():
        print(f"Missing input: {src}", file=sys.stderr)
        return 1

    print(f"Simplifying {src.name} -> {dst.name} (ratio={args.ratio})")
    stats = process_dae(src, dst, args.ratio, args.precision)

    src_kb = src.stat().st_size / 1024
    dst_kb = dst.stat().st_size / 1024
    print(
        f"Done: {stats['triangles_before']} -> {stats['triangles_after']} triangles "
        f"({100 * stats['triangles_after'] / max(stats['triangles_before'], 1):.1f}%)"
    )
    print(f"File size: {src_kb:.1f} KB -> {dst_kb:.1f} KB ({100 * dst_kb / src_kb:.1f}%)")

    if args.backup:
        bak = src.with_suffix(".dae.bak")
        if not bak.exists():
            shutil.copy2(src, bak)
            print(f"Backup: {bak}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
