import { execFileSync } from 'node:child_process';
import { readFile, writeFile, readdir, mkdtemp, rm, copyFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const signature = String.raw`
import hashlib,json,sys
from PIL import Image
im=Image.open(sys.argv[1]); frames=[]
meta={k:repr(im.info.get(k)) for k in ['loop','icc_profile','exif']}
for i in range(getattr(im,'n_frames',1)):
 im.seek(i); im.load()
 frames.append([list(im.size),im.info.get('duration',0),hashlib.sha256(im.convert('RGBA').tobytes()).hexdigest()])
print(json.dumps([meta,frames]))
`;
const decoded = (path: string) =>
  execFileSync('python3', ['-c', signature, path], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
const hash = (data: Buffer) => createHash('sha256').update(data).digest('hex');
const temp = await mkdtemp(join(tmpdir(), 'portfolio-webp-'));
const results: Record<string, unknown>[] = [];
try {
  for (const id of (await readdir(join(root, 'content/items'))).sort()) {
    const folder = join(root, 'content/items', id);
    const entryFile = join(folder, 'entry.json');
    const entry = JSON.parse(await readFile(entryFile, 'utf8'));
    const animation: string | null = entry.media.animation;
    if (!animation?.endsWith('.gif')) continue;
    const original = join(folder, animation);
    const variant = animation.replace(/\.gif$/, '.webp');
    const candidate = join(temp, `${id}.webp`);
    try {
      const originalSignature = decoded(original);
      const [, frames] = JSON.parse(originalSignature) as [unknown, [number[], number, string][]];
      // gif2webp normalizes GIF delays <=10ms to 100ms. Preserve those originals.
      if (frames.some(([, duration]) => duration <= 10)) {
        results.push({
          id,
          original: animation,
          accepted: false,
          reason: 'GIF contains frame delays that gif2webp would normalize.',
        });
        console.log(`${id}: kept original GIF (frame timing)`);
        continue;
      }
      // gif2webp is lossless by default; never use -lossy, -mixed or -near_lossless.
      execFileSync(
        'gif2webp',
        ['-quiet', '-m', '2', '-metadata', 'all', original, '-o', candidate],
        { timeout: 180000 },
      );
      const before = await readFile(original);
      const after = await readFile(candidate);
      const verified = originalSignature === decoded(candidate);
      const accepted = verified && after.length < before.length;
      if (accepted) {
        await copyFile(candidate, join(folder, variant));
        entry.media.animation = variant;
        await writeFile(entryFile, JSON.stringify(entry, null, 2) + '\n');
      }
      results.push({
        id,
        original: animation,
        variant,
        before: before.length,
        after: after.length,
        beforeHash: hash(before),
        afterHash: hash(after),
        verified,
        accepted,
      });
      console.log(
        `${id}: ${accepted ? `saved ${before.length - after.length} bytes` : 'kept original GIF'}`,
      );
    } catch (error) {
      results.push({ id, original: animation, accepted: false, error: String(error) });
      console.log(`${id}: kept original GIF (conversion or verification failed)`);
    }
  }
  const reportFile = join(root, 'content/animation-optimization.json');
  if (results.length) {
    let previous: Record<string, unknown>[] = [];
    try {
      previous = JSON.parse(await readFile(reportFile, 'utf8')).files;
    } catch {
      /* First run. */
    }
    const ids = new Set(results.map((result) => result.id));
    await writeFile(
      reportFile,
      JSON.stringify(
        {
          verification:
            'Exact decoded RGBA frames, dimensions, timing, loop count, ICC and EXIF. Original GIFs retained.',
          files: [...previous.filter((result) => !ids.has(result.id)), ...results],
        },
        null,
        2,
      ) + '\n',
    );
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
