"""Make the navy background of a zodiac emblem PNG transparent.

    python3 scripts/key-emblem.py <in.png> <out.png>

The emblems are gold carvings on a flat navy ground. The ground colour is sampled from the corners;
each pixel's alpha comes from its distance to that colour, and edge pixels are un-mixed from the
ground so no navy fringe remains. Standard library only (zlib, struct); expects 8-bit RGB/RGBA.
"""
import struct
import sys
import zlib

LOW, HIGH = 22, 75  # RGB distance from the ground: below LOW is clear, above HIGH is solid


def read_png(path):
    data = open(path, 'rb').read()
    pos, idat = 8, b''
    while pos < len(data):
        (length,) = struct.unpack('>I', data[pos:pos + 4])
        kind, body = data[pos + 4:pos + 8], data[pos + 8:pos + 8 + length]
        if kind == b'IHDR':
            width, height, depth, colour = struct.unpack('>IIBB', body[:10])
            assert depth == 8 and colour in (2, 6), 'expected 8-bit RGB or RGBA'
        elif kind == b'IDAT':
            idat += body
        pos += 12 + length
    bpp = 3 if colour == 2 else 4
    raw, stride = zlib.decompress(idat), width * bpp
    rows, prev, i = [], bytearray(stride), 0
    for _ in range(height):
        f, line = raw[i], bytearray(raw[i + 1:i + 1 + stride])
        i += 1 + stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line)
        prev = line
    return width, height, bpp, rows


def write_png(path, width, height, rows):
    def chunk(kind, body):
        return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body) & 0xFFFFFFFF)
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    open(path, 'wb').write(png)


def main(src, out):
    width, height, bpp, rows = read_png(src)
    n, acc = 0, [0, 0, 0]
    for y0 in (0, height - 12):
        for x0 in (0, width - 12):
            for y in range(y0, y0 + 12):
                for x in range(x0, x0 + 12):
                    for k in range(3):
                        acc[k] += rows[y][x * bpp + k]
                    n += 1
    ground = [v / n for v in acc]
    result = []
    for row in rows:
        line = bytearray(width * 4)
        for x in range(width):
            r, g, b = row[x * bpp:x * bpp + 3]
            d = ((r - ground[0]) ** 2 + (g - ground[1]) ** 2 + (b - ground[2]) ** 2) ** 0.5
            a = min(1.0, max(0.0, (d - LOW) / (HIGH - LOW)))
            if a > 0:
                # Un-mix the ground from edge pixels: c = a * fg + (1 - a) * ground.
                fg = [min(255, max(0, round((c - (1 - a) * gc) / a))) for c, gc in zip((r, g, b), ground)]
            else:
                fg = [0, 0, 0]
            line[x * 4:x * 4 + 4] = bytes(fg + [round(a * 255)])
        result.append(line)
    write_png(out, width, height, result)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
