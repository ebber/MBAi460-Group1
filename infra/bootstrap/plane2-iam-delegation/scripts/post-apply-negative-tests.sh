#!/usr/bin/env bash
# Back-compat wrapper — use phase5-negative-capability-tests.sh for the full suite.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/phase5-negative-capability-tests.sh" "$@"
