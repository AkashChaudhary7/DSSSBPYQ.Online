import struct
import zlib

def create_png(width, height, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0
        for x in range(width):
            dx = x - width / 2
            dy = y - height / 2
            dist = (dx*dx + dy*dy) ** 0.5
            if dist < width * 0.38:
                # White/amber accent inside
                raw_data.extend(struct.pack('4B', 255, 255, 255, 255))
            else:
                # Deep indigo background (#1e3a8a)
                raw_data.extend(struct.pack('4B', 30, 58, 138, 255))

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack('>2I5B', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw_data), 9)
    
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename}")

create_png(192, 192, 'public/pwa-192.png')
create_png(512, 512, 'public/pwa-512.png')
