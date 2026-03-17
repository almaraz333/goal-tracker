# Goal Content Schema

This document describes the YAML frontmatter format used in the markdown content stored by Goal Tracker.

## Stored Content Format

Each goal is stored as markdown content with YAML frontmatter at the top:

```markdown
---
type: daily
status: active
startDate: 2026-01-01
endDate: 2026-12-31
priority: high
completions: []
---

# Goal Title

Description and notes go here in markdown format.
```

## Frontmatter Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'daily' \| 'weekly' \| 'monthly'` | The type of goal |
| `status` | `'active' \| 'paused' \| 'completed' \| 'archived'` | Current status |
| `startDate` | `YYYY-MM-DD` | When the goal becomes active |
| `endDate` | `YYYY-MM-DD` | When the goal ends |
| `priority` | `'high' \| 'medium' \| 'low'` | Priority level |
| `completions` | `string[]` | Array of completion dates/keys |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `monthlyProgress` | `Record<monthKey, number>` | Progress count per month (monthly goals) |
| `recurrence` | `Recurrence` | Recurrence rules (see below) |

## Goal Types

### Daily Goals

Daily goals are tracked per day. Each day is independent.

**Key fields:**
- `completions`: Stores completed dates as `YYYY-MM-DD`

**Example:**
```yaml
type: daily
completions:
  - 2026-01-05
  - 2026-01-06
```

### Weekly Goals

Weekly goals are tracked per week (Monday-Sunday).

**Key fields:**
- `completions`: Array of week keys (ISO date of Monday, e.g., `"2026-01-05"`)

**Example:**
```yaml
type: weekly
completions:
  - 2026-01-05
  - 2026-01-12
```

### Monthly Goals

Monthly goals track progress toward a target count per month.

**Key fields:**
- `recurrence.targetCount`: Target number to achieve
- `recurrence.minimumCount`: Minimum acceptable number
- `monthlyProgress`: Maps month keys (`YYYY-MM`) to current count

**Example:**
```yaml
type: monthly
recurrence:
  frequency: monthly
  targetCount: 3
  minimumCount: 2
monthlyProgress:
  2026-01: 2
  2026-02: 3
```

## Recurrence Schema

```yaml
recurrence:
  frequency: daily | weekly | monthly
  daysOfWeek: [mon, tue, wed, thu, fri, sat, sun]  # Optional: specific days
  dayOfMonth: 15                                     # Optional: day of month
  targetCount: 3                                     # Optional: target for monthly goals
  minimumCount: 2                                    # Optional: minimum for monthly goals
```

## Storage Key Structure

Goals use category-based storage keys:

```
YouTube/Daily_test.md
YouTube/Weekly_goal.md
Health/Exercise_daily.md
Work/Weekly_review.md
```

The leading path segment becomes the goal's `category` field.

## Best Practices

1. **Use clear titles**: The title is the primary label shown across the app
2. **Set realistic dates**: `startDate` and `endDate` define when a goal appears in the calendar
3. **Use monthly targets when needed**: Monthly goals should use `recurrence.targetCount` and `minimumCount`
4. **Keep descriptions focused**: Use the markdown body for notes, context, or success criteria

## Example Files

### Daily Goal

```markdown
---
type: daily
status: active
startDate: 2026-01-01
endDate: 2026-12-31
priority: high
completions: []
---

# Daily Exercise

30 minutes of exercise every day to maintain fitness.

## Notes
- Focus on consistency over intensity
- Mix cardio and strength training
```

### Weekly Goal

```markdown
---
type: weekly
status: active
startDate: 2026-01-01
endDate: 2026-03-31
priority: medium
completions: []
---

# Weekly Review

Review accomplishments and plan for the upcoming week.
```

### Monthly Goal with Target

```markdown
---
type: monthly
status: active
startDate: 2026-01-01
endDate: 2026-12-31
recurrence:
  frequency: monthly
  targetCount: 4
  minimumCount: 2
priority: high
completions: []
monthlyProgress: {}
---

# Monthly Video Production

Publish 4 videos per month (minimum 2).

## Guidelines
- Target: 4 videos/month
- Acceptable: 2-3 videos/month
- Below 2 counts as incomplete

## Legacy Notes

Older goal files may still contain `subtasks`, `dailySubtaskCompletions`, or `weeklySubtaskCompletions`.
The app reads those fields only to migrate historical completion data into `completions` and does not write them back out.
```
