# Contributing

## Prerequisites

- [Vite+](https://viteplus.dev/) (`vp` CLI) installed globally
- Node.js (managed via `vp env`)

## Local Development

```bash
# Install dependencies
vp install

# Start Storybook (dev server for visual testing)
vp run storybook

# Run checks (format, lint, type-check)
vp check

# Auto-fix formatting and lint issues
vp check --fix

# Run tests
vp test

# Build the library
vp run build
```

## Project Structure

Each hook lives in its own folder under `src/`:

```
src/
  use-vrm-model/
    index.ts                          # Hook implementation
    use-vrm-model.stories.tsx         # Storybook story
  use-vrm-animations/
    index.ts
    use-vrm-animations.stories.tsx
  assets/                             # Shared VRM models and animations
```

## Adding a New Hook

1. Create a folder `src/use-something/` with `index.ts` for the hook implementation

2. Add the entry to `vite.config.ts`:

   ```ts
   pack: {
     entry: [
       // ...existing entries
       'src/use-something/index.ts',
     ],
   }
   ```

3. Add an export to `package.json`:

   ```json
   "exports": {
     "./use-something": "./src/use-something/index.ts"
   }
   ```

4. Write a Storybook story at `src/use-something/use-something.stories.tsx`

5. Add usage documentation to `README.md`

## Writing Stories

Stories use Storybook with `@storybook/react-vite`. Each story renders a VRM model inside a React Three Fiber `<Canvas>`.

### Template

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useVRMModel } from '../use-vrm-model'
import { useMyHook } from '.'
import vrmUrl from '../assets/miku_nt_v1.1.2.vrm?url'

const meta = {
  title: 'Hooks/useMyHook',
  component: Scene,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        code: `// Usage example shown in the docs tab`,
      },
    },
  },
} satisfies Meta<typeof Scene>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { url: vrmUrl },
}

function MyVRM({ url }: { url: string }) {
  const [, vrm] = useVRMModel(url)
  useMyHook(vrm)

  useFrame((_, delta) => {
    vrm.update(delta)
  })

  return <primitive object={vrm.scene} />
}

function Scene({ url }: { url: string }) {
  return (
    <Canvas camera={{ position: [0, 1.2, 1.5], fov: 45 }} style={{ height: '100vh' }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={1} />
      <directionalLight position={[2, 3, 5]} intensity={1} />
      <directionalLight position={[-2, 2, -3]} intensity={0.5} />
      <Suspense fallback={null}>
        <MyVRM url={url} />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} />
    </Canvas>
  )
}
```

### Guidelines

- Use `tags: ['autodocs']` so the story appears in the docs page
- Provide a `docs.source.code` block with a clean usage example
- Do **not** use `docs: { disable: true }` — it prevents the primary story from rendering
- Do **not** call `mixer.update(delta)` in `useFrame` — only call `vrm.update(delta)`. The mixer is managed internally by `useAnimations` from `@react-three/drei`
- For stories that need HTML overlay buttons (e.g. trigger actions), wrap the Canvas in a `<div style={{ position: 'relative' }}>` and position buttons absolutely

## Commit Messages

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning and publishing. Commit messages **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

### Types that trigger releases

| Type                                          | Release | Example                                     |
| --------------------------------------------- | ------- | ------------------------------------------- |
| `fix`                                         | Patch   | `fix: prevent blink during expression hold` |
| `feat`                                        | Minor   | `feat: add useVRMBreathing hook`            |
| `BREAKING CHANGE` in footer or `!` after type | Major   | `feat!: rename send to dispatch`            |

### Types that do NOT trigger releases

- `chore` — maintenance tasks
- `docs` — documentation only
- `style` — formatting, no code change
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or updating tests
- `ci` — CI/CD changes

### Examples

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: reset blink timer on expression change"

# Minor release (1.0.0 → 1.1.0)
git commit -m "feat: add useVRMVowelAnalyser hook"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat!: change useVRMAnimations return type"
```

## Release Process

Releases happen automatically via CI when commits are pushed to `master`. The pipeline:

1. `@semantic-release/commit-analyzer` — determines the release type from commit messages
2. `@semantic-release/release-notes-generator` — generates release notes
3. `@semantic-release/changelog` — updates `CHANGELOG.md`
4. `@semantic-release/npm` — publishes to npm
5. `@semantic-release/git` — commits back `CHANGELOG.md` and `package.json` version bump
6. `@semantic-release/github` — creates a GitHub release

To trigger a release, just merge your PR to `master` with properly formatted commit messages. No manual version bumping needed.

### Dry Run

To preview what the next release would look like without actually publishing:

```bash
vp dlx semantic-release --dry-run
```
