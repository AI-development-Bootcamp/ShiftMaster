# Timer-Entry Integration Change Proposal

## Quick Links

- [Full Proposal](./proposal.md) - Detailed problem statement, solution, and impact analysis
- [Implementation Tasks](./tasks.md) - Sequential checklist for development
- [Spec Delta](./specs/timer-entry-workflow/spec.md) - Requirements and scenarios

## Summary

Integrate the HomePage timer with daily entry management to create a seamless workflow:

1. **Starting the timer** → Creates a new "running" entry in the list
2. **Stopping the timer** → Opens the Manual Report Modal pre-filled with start/end times

## Key Features

### Timer Start Behavior
- Creates visible entry in today's list
- Shows "running" status with live elapsed time
- Provides visual feedback that time tracking is active

### Timer Stop Behavior
- Opens Manual Report Modal automatically
- Pre-fills start time (when timer started)
- Pre-fills end time (current time)
- Selects "work" tab by default
- Allows user to add task assignments and save

### Visual Indicators
- Running entry has distinctive "running" status badge
- Live elapsed time synced with timer display
- Entry cannot be expanded while running
- Subtle animations for better UX

## Implementation Scope

**Files Modified:**
- `client/src/pages/Home/HomePage.tsx` - Timer state and entry creation
- `client/src/components/DailyEntryCard/DailyEntryCard.tsx` - Running entry support
- `client/src/components/StatusBadge/StatusBadge.tsx` - "Running" status type
- `client/src/features/manual-report/components/ManualReportModal/ManualReportModal.tsx` - Pre-fill props

**No Backend Changes Required** - This is a client-side only enhancement.

## Validation Status

✅ **PASSED** - `openspec validate integrate-timer-with-entries --strict`

## Next Steps

1. **Review** - Stakeholders review `proposal.md`
2. **Approve** - Get sign-off on approach and scope
3. **Implement** - Follow `tasks.md` checklist sequentially
4. **Test** - Validate all scenarios from spec delta
5. **Deploy** - Ship to production
6. **Archive** - Move to `changes/archive/` after deployment

## Estimated Timeline

- Implementation: 1-2 days
- Testing: 1 day
- Review: 0.5 day
- **Total:** ~2-4 days

## User Impact

**Positive:**
- Streamlined time tracking workflow
- No manual time entry needed
- Visual confirmation of active tracking
- Reduced friction in daily reporting

**Considerations:**
- Accidental timer stops (future: add confirmation)
- Timer state lost on app close (future: persistence)

## Questions?

See [Open Questions](./proposal.md#open-questions) section in the full proposal.
