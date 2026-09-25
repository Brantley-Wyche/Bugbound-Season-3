# Browser regression fixtures

These pages use synthetic exercises and the real shell/harness. Keep them out of
the production HTML entry list. They are manually operated through the browser;
`npm test` runs the Node regressions separately.

- Start `npm run dev -- --host 127.0.0.1 --port 5190 --strictPort`, then open
  `http://127.0.0.1:5190/tests/fixtures/reliability.html`. Run the synthetic suite:
  all 12 `matched` values should be true. The independent preview should still
  show `1`, with no hidden check frames remaining. The second action runs existing
  curriculum checks without saving completion or revealing hints; intentional
  failures are expected.
- Start `npm run dev -- --config tests/fixtures/vite.shell.config.mjs`, then open
  `http://127.0.0.1:5187/tests/fixtures/shell.html`. This dedicated origin and
  aliased three-challenge catalog test the actual App and progress adapter.
  Reset synthetic completion, deny saves, pass A and B, allow saves, then retry:
  both completions must appear. Open another tab at the same URL and reset:
  the first tab should clear completion and return its challenge to unchecked.
  Challenge C deliberately never settles: leave it while running to verify frame
  disposal and suppressed completion. With a pending save, profile download
  should explain that completion must recover before export.

The shell fixture refuses to mount against the real curriculum. Its save-failure
injection only affects its own page and ends when the page closes. Reset controls
on this dedicated origin affect synthetic records, not another localhost port.
