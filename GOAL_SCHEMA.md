# Goal File Schema

This document describes the YAML frontmatter format used in Goal Tracker markdown files.

## File Structure

Each goal is a markdown file (`.md`) with YAML frontmatter at the top:

```markdown
---
type: daily
status: active
startDate: 2026-01-01
endDate: 2026-12-31
priority: high
completions: []
subtasks:
  - id: task1
    title: First subtask
    completed: false
dailySubtaskCompletions:
  2026-01-05: [task1]
weeklySubtaskCompletions: {}
tags: [health, habit]
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
| `tags` | `string[]` | Tags for categorization |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `subtasks` | `Subtask[]` | List of subtasks (see below) |
| `dailySubtaskCompletions` | `Record<date, subtaskId[]>` | Tracks subtask completion per day (daily goals) |
| `weeklySubtaskCompletions` | `Record<weekKey, subtaskId[]>` | Tracks subtask completion per week (weekly goals) |
| `monthlyProgress` | `Record<monthKey, number>` | Progress count per month (monthly goals) |
| `recurrence` | `Recurrence` | Recurrence rules (see below) |

## Goal Types

### Daily Goals

Daily goals are tracked per day. Each day is independent.

**Key fields:**
- `dailySubtaskCompletions`: Maps dates (`YYYY-MM-DD`) to arrays of completed subtask IDs

**Example:**
```yaml
type: daily
subtasks:
  - id: warmup
    title: Warm up (5 min)
    completed: false
  - id: cardio
    title: Cardio (20 min)
    completed: false
dailySubtaskCompletions:
  2026-01-05: [warmup, cardio]
  2026-01-06: [warmup]
```

### Weekly Goals

Weekly goals are tracked per week (Monday-Sunday).

**Key fields:**
- `completions`: Array of week keys (ISO date of Monday, e.g., `"2026-01-05"`)
- `weeklySubtaskCompletions`: Maps week keys to arrays of completed subtask IDs

**Example:**
```yaml
type: weekly
subtasks:
  - id: research
    title: Research topic
    completed: false
  - id: write
    title: Write draft
    completed: false
weeklySubtaskCompletions:
  2026-01-05: [research, write]
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

## Subtask Schema

```yaml
subtasks:
  - id: unique-id      # Required: unique identifier
    title: Task title  # Required: display name
    completed: false   # Required: default completion state
```

**Notes:**
- The `completed` field is the default state, not the current state
- Actual completion is tracked in `dailySubtaskCompletions` or `weeklySubtaskCompletions`

## Recurrence Schema

```yaml
recurrence:
  frequency: daily | weekly | monthly
  daysOfWeek: [mon, tue, wed, thu, fri, sat, sun]  # Optional: specific days
  dayOfMonth: 15                                     # Optional: day of month
  targetCount: 3                                     # Optional: target for monthly goals
  minimumCount: 2                                    # Optional: minimum for monthly goals
```

## Folder Structure

Goals are organized in category folders:

```
Goals/
├── YouTube/
│   ├── _category.md     # Optional: category metadata
│   ├── Daily_test.md
│   └── Weekly_goal.md
├── Health/
│   └── Exercise_daily.md
└── Work/
    └── Weekly_review.md
```

The folder name becomes the goal's `category` field.

## Best Practices

1. **Use descriptive IDs**: Subtask IDs should be readable (e.g., `research`, `write`) not generic (`task1`)
2. **Keep tags consistent**: Use the same tags across related goals for filtering
3. **Set realistic dates**: `startDate` and `endDate` define when a goal appears in the calendar
4. **Use subtasks**: Break down goals into actionable subtasks for better tracking

## Example Files

### Daily Goal with Subtasks

```markdown
---
type: daily
status: active
startDate: 2026-01-01
endDate: 2026-12-31
priority: high
completions: []
subtasks:
  - id: warmup
    title: Warm up (5 min)
    completed: false
  - id: exercise
    title: Main exercise (25 min)
    completed: false
  - id: cooldown
    title: Cool down (5 min)
    completed: false
dailySubtaskCompletions: {}
tags: [health, fitness, habit]
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
subtasks:
  - id: review
    title: Review past week
    completed: false
  - id: plan
    title: Plan next week
    completed: false
weeklySubtaskCompletions: {}
tags: [productivity, planning]
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
tags: [content, youtube]
---

# Monthly Video Production

Publish 4 videos per month (minimum 2).

## Guidelines
- Target: 4 videos/month
- Acceptable: 2-3 videos/month
- Below 2 counts as incomplete
```
