import { execFileSync } from 'node:child_process';
import {
  readdir,
  readFile,
  writeFile,
  mkdir,
  rename,
  unlink,
  mkdtemp,
  rmdir,
} from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const verifyPython = String.raw`
import hashlib,json,sys
from PIL import Image
im=Image.open(sys.argv[1]);frames=[]
meta={k:repr(im.info.get(k)) for k in ['loop','icc_profile','exif']}
for i in range(getattr(im,'n_frames',1)):
 im.seek(i)
 rgba=im.convert('RGBA')
 frames.append([list(rgba.size),im.info.get('duration',0),hashlib.sha256(rgba.tobytes()).hexdigest()])
print(json.dumps([meta,frames]))
`;
const signature = (path: string) =>
  execFileSync('python3', ['-c', verifyPython, path], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
for (const command of ['optipng', 'gifsicle', 'jpegtran', 'python3'])
  execFileSync('which', [command], { stdio: 'ignore' });
const files: string[] = [];
async function walk(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(png|jpe?g|gif)$/i.test(path)) files.push(path);
  }
}
await walk(join(root, 'content/items'));
files.sort();
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'portfolio-lossless-'));
const report: {
  path: string;
  before: number;
  after: number;
  beforeHash: string;
  afterHash: string;
  verified: boolean;
}[] = [];
let saved = 0;
for (const [index, path] of files.entries()) {
  const before = await readFile(path);
  const candidate = join(
    temporaryDirectory,
    createHash('sha256').update(path).digest('hex') + extname(path),
  );
  const ext = extname(path).toLowerCase();
  try {
    if (ext === '.png')
      execFileSync('optipng', ['-quiet', '-o2', '-out', candidate, path], { timeout: 120000 });
    else if (ext === '.gif')
      execFileSync('gifsicle', ['-O3', '--no-warnings', path, '-o', candidate], {
        timeout: 120000,
      });
    else
      execFileSync(
        'jpegtran',
        ['-copy', 'all', '-optimize', '-progressive', '-outfile', candidate, path],
        { timeout: 120000 },
      );
    const after = await readFile(candidate);
    if (after.length < before.length) {
      const same = signature(path) === signature(candidate);
      if (same) {
        await rename(candidate, path);
        saved += before.length - after.length;
        report.push({
          path: relative(root, path),
          before: before.length,
          after: after.length,
          beforeHash: hash(before),
          afterHash: hash(after),
          verified: true,
        });
      } else
        console.log(
          `Kept original: decoded pixels/animation/metadata differ for ${relative(root, path)}`,
        );
    }
  } catch (error) {
    console.error(
      `Kept original ${relative(root, path)}:`,
      error instanceof Error ? error.message : error,
    );
  } finally {
    try {
      await unlink(candidate);
    } catch {
      /* candidate already moved, or optimizer produced no file */
    }
  }
  if ((index + 1) % 10 === 0)
    console.log(
      `${index + 1}/${files.length} checked; ${(saved / 1024 / 1024).toFixed(2)} MiB saved`,
    );
}
await rmdir(temporaryDirectory);
await mkdir(join(root, '.reports'), { recursive: true });
await writeFile(
  join(root, '.reports/lossless-optimization.json'),
  JSON.stringify(
    {
      filesChecked: files.length,
      filesReduced: report.length,
      bytesSaved: saved,
      verification:
        'Decoded RGBA pixels, frame durations, loop count, ICC profile and EXIF match; originals kept on any difference.',
      files: report,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `${report.length}/${files.length} files reduced; ${saved} bytes saved. Report: .reports/lossless-optimization.json`,
);
