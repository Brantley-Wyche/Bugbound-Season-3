# beUI components

The components in `src/components/motion/` and their supporting files in
`src/lib/` were installed from the official [beUI registry](https://beui.dev/)
using shadcn on 2026-09-12:

```sh
npx shadcn@latest add @beui/button-stateful @beui/tabs @beui/action-swap-roll
```

Upstream: https://github.com/starc007/ui-components

The Tabs component was removed on 2026-10-05 once the register stopped using
collection tabs.

Local adaptation: `button/stateful.tsx` swaps its label without the upstream
letter cascade, blur or measured-width animation, and shows no icon for a failed
run, so Bugbound's one authored motion stays the Repaired record. While loading
it uses `aria-disabled` instead of `disabled`, so keyboard focus stays on it, and
its label carries no live region of its own (the verification summary announces
the run). Other installed component and helper source files are unchanged.
App styles map the library utilities to the Engineering Lab tokens.

The upstream license is reproduced below.

MIT License

Copyright (c) 2026 Saurabh Chauhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
