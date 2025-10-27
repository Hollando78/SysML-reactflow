# Publishing to npm

This guide explains how to publish the `sysml-reactflow` package to the npm registry.

## Pre-Publication Checklist

✅ **Package is ready for publication!**

The following have been completed:

- ✅ **Version:** 0.1.0 (initial release)
- ✅ **Build:** Successful (ESM + CJS + TypeScript declarations)
- ✅ **Tests:** 93 tests passing
- ✅ **License:** MIT License included
- ✅ **Documentation:** Comprehensive (README, CHANGELOG, STATE_MACHINES, SEQUENCE_DIAGRAMS, LAYOUT, TEST_COVERAGE)
- ✅ **Package metadata:** Complete (author, repository, bugs, homepage, keywords)
- ✅ **Package verification:** `npm pack` successful (88.7 KB compressed, 516.4 KB unpacked)

## Package Contents

The published package includes:

```
📦 sysml-reactflow@0.1.0 (88.7 KB)
├── dist/
│   ├── index.js          (65.7 KB - ESM bundle)
│   ├── index.cjs         (75.3 KB - CommonJS bundle)
│   ├── index.d.ts        (34.6 KB - TypeScript declarations)
│   ├── index.d.cts       (34.6 KB - CommonJS TypeScript declarations)
│   ├── index.js.map      (119.6 KB - ESM source map)
│   └── index.cjs.map     (124.3 KB - CJS source map)
├── README.md             (13.2 KB)
├── LICENSE               (1.1 KB)
├── CHANGELOG.md          (5.3 KB)
├── STATE_MACHINES.md     (7.8 KB)
├── SEQUENCE_DIAGRAMS.md  (12.8 KB)
├── LAYOUT.md             (12.9 KB)
├── TEST_COVERAGE.md      (6.7 KB)
└── package.json          (2.5 KB)
```

## Publishing Steps

### 1. Login to npm

If you haven't logged in to npm on this machine:

```bash
npm login
```

You'll be prompted for:
- Username
- Password
- Email (public)
- One-time password (if 2FA is enabled)

Verify you're logged in:

```bash
npm whoami
```

### 2. Final Pre-Flight Check

Before publishing, verify the package one more time:

```bash
# Dry-run publish (shows what would be published)
npm publish --dry-run

# Run tests one final time
npm test

# Build the package
npm run build
```

### 3. Publish to npm

Publish the package to the public npm registry:

```bash
npm publish
```

This will:
- Build a tarball of the package
- Upload it to https://registry.npmjs.org/
- Make it available at https://www.npmjs.com/package/sysml-reactflow

### 4. Verify Publication

After publishing, verify the package:

```bash
# Check the package on npm
npm view sysml-reactflow

# Try installing it in a test project
mkdir test-install
cd test-install
npm init -y
npm install sysml-reactflow
```

### 5. Tag the Release in Git

After successful publication, tag the release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Post-Publication

### Update GitHub Release

1. Go to https://github.com/Hollando78/SysML-reactflow/releases
2. Click "Create a new release"
3. Select tag `v0.1.0`
4. Title: `v0.1.0 - Initial Release`
5. Description: Copy from CHANGELOG.md
6. Publish release

### Announce the Release

Consider announcing on:
- GitHub Discussions
- Twitter/X with hashtags: #SysML #MBSE #ReactFlow
- LinkedIn
- Reddit (r/Systems_Engineering, r/reactjs)
- Systems Engineering communities

### Monitor Package Health

- **npm package page:** https://www.npmjs.com/package/sysml-reactflow
- **Download stats:** https://npm-stat.com/charts.html?package=sysml-reactflow
- **Bundle size:** https://bundlephobia.com/package/sysml-reactflow

## Future Releases

### Versioning

Follow [Semantic Versioning (SemVer)](https://semver.org/):

- **Patch release (0.1.x):** Bug fixes, no breaking changes
- **Minor release (0.x.0):** New features, no breaking changes
- **Major release (x.0.0):** Breaking changes

### Publishing Updates

1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Commit changes: `git commit -m "chore: bump version to X.Y.Z"`
4. Run tests: `npm test`
5. Build: `npm run build`
6. Publish: `npm publish`
7. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
8. Create GitHub Release

## Troubleshooting

### Package name already exists

If `sysml-reactflow` is already taken:
1. Choose a new name (e.g., `@your-org/sysml-reactflow`)
2. Update `package.json` name field
3. Publish under scoped package

### Authentication errors

```bash
# Clear npm cache
npm cache clean --force

# Re-login
npm logout
npm login
```

### 2FA Issues

If you have 2FA enabled:
- Use one-time password from authenticator app
- Or generate an automation token: https://www.npmjs.com/settings/~/tokens

### Tarball too large

Current size (88.7 KB) is excellent. If it grows:
- Ensure `files` field in package.json only includes necessary files
- Remove source maps from production builds
- Check for accidentally included large files

## Package Statistics

**Current package (v0.1.0):**
- Compressed size: 88.7 KB
- Unpacked size: 516.4 KB
- Total files: 14
- Dependencies: 1 (elkjs)
- Peer dependencies: 3 (react, react-dom, reactflow)

**Comparison:**
- ✅ Smaller than average React component library (~200 KB)
- ✅ Includes comprehensive TypeScript types
- ✅ Includes source maps for debugging
- ✅ Tree-shakeable ESM builds

## npm Scripts Reference

```bash
npm run build              # Build ESM + CJS + types
npm run lint               # Type check
npm test                   # Run tests
npm run test:coverage      # Run tests with coverage
npm run storybook          # Start Storybook dev server
npm run build-storybook    # Build static Storybook
```

## Support

After publication, users can:
- Report issues: https://github.com/Hollando78/SysML-reactflow/issues
- View docs: https://hollando78.github.io/SysML-reactflow/
- Check test coverage: Included in package (TEST_COVERAGE.md)
- Read guides: STATE_MACHINES.md, SEQUENCE_DIAGRAMS.md, LAYOUT.md

---

**Ready to publish!** Run `npm publish` when you're ready to make the package public.
