/**
 * Goal Markdown Service
 *
 * This service handles markdown parsing and serialization for the
 * local IndexedDB storage backend.
 */

import type { Goal, GoalType, GoalStatus, Priority, Recurrence, MonthlyProgress } from '@/types';

/**
 * Parse YAML frontmatter from markdown content
 */
export function parseFrontmatter(content: string): Record<string, unknown> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontmatterMatch) {
    return {};
  }
  
  const yamlContent = frontmatterMatch[1];
  const result: Record<string, unknown> = {};
  
  const lines = yamlContent.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }
    
    // Match key: value pattern
    const keyMatch = trimmed.match(/^([\w.-]+):\s*(.*)$/);
    if (!keyMatch) {
      i++;
      continue;
    }
    
    const [, key, value] = keyMatch;
    
    // Handle inline array [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      result[key] = value.slice(1, -1).split(',').map(s => s.trim());
      i++;
      continue;
    }
    
    // Handle empty value - could be start of array or object
    if (value === '' || value === '[]') {
      // Look ahead to determine type
      const nextLine = lines[i + 1];
      
      if (nextLine && nextLine.trim().startsWith('- ')) {
        // It's an array - check if array of objects or primitives
        const arrayItems: unknown[] = [];
        i++;
        
        while (i < lines.length) {
          const itemLine = lines[i];
          const itemTrimmed = itemLine.trim();
          
          if (!itemTrimmed.startsWith('- ')) {
            break;
          }
          
          // Check if this is an object item (- key: value)
          const objectMatch = itemTrimmed.match(/^-\s+(\w+):\s*(.*)$/);
          if (objectMatch) {
            // It's an object in the array
            const obj: Record<string, unknown> = {};
            const [, firstKey, firstValue] = objectMatch;
            obj[firstKey] = parseValue(firstValue);
            i++;
            
            // Read additional properties of this object (indented lines)
            while (i < lines.length) {
              const propLine = lines[i];
              // Must be indented more than the dash line
              if (!propLine.startsWith('    ') || propLine.trim().startsWith('-')) {
                break;
              }
              const propMatch = propLine.trim().match(/^(\w+):\s*(.*)$/);
              if (propMatch) {
                const [, propKey, propValue] = propMatch;
                obj[propKey] = parseValue(propValue);
              }
              i++;
            }
            
            arrayItems.push(obj);
          } else {
            // Simple array item
            arrayItems.push(itemTrimmed.slice(2));
            i++;
          }
        }
        
        result[key] = arrayItems;
        continue;
      } else if (nextLine && nextLine.startsWith('  ') && !nextLine.trim().startsWith('-')) {
        // It's an object
        const obj: Record<string, unknown> = {};
        i++;
        
        while (i < lines.length) {
          const propLine = lines[i];
          if (!propLine.startsWith('  ') || propLine.trim().startsWith('-')) {
            break;
          }
          const propMatch = propLine.trim().match(/^([\w.-]+):\s*(.*)$/);
          if (propMatch) {
            const [, propKey, propValue] = propMatch;
            
            // Handle array within object
            if (propValue.startsWith('[') && propValue.endsWith(']')) {
              obj[propKey] = propValue.slice(1, -1).split(',').map(s => s.trim());
            } else {
              obj[propKey] = parseValue(propValue);
            }
          }
          i++;
        }
        
        result[key] = obj;
        continue;
      } else {
        result[key] = [];
        i++;
        continue;
      }
    }
    
    // Simple key: value
    result[key] = parseValue(value);
    i++;
  }
  
  return result;
}

/**
 * Parse a YAML value to the appropriate type
 */
function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null' || value === '~') return null;
  if (value === '') return '';
  
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  
  return value;
}

/**
 * Extract title from markdown content (first H1)
 */
function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled Goal';
}

/**
 * Extract description from markdown content
 */
function extractDescription(content: string): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  // Remove title
  const withoutTitle = withoutFrontmatter.replace(/^#\s+.+\n?/, '').trim();
  
  // Get first paragraph after title
  const lines = withoutTitle.split('\n');
  const descriptionLines: string[] = [];
  
  for (const line of lines) {
    // Stop at next heading or empty line after content
    if (line.startsWith('#') || line.startsWith('##')) break;
    if (line.startsWith('**') && line.includes(':')) {
      descriptionLines.push(line.replace(/\*\*/g, '').trim());
    } else if (line.trim() && !line.startsWith('-') && !line.startsWith('[')) {
      descriptionLines.push(line.trim());
    }
    // Stop after first paragraph
    if (descriptionLines.length > 0 && line.trim() === '') break;
  }
  
  return descriptionLines.join(' ').slice(0, 200);
}

/**
 * Convert parsed frontmatter to Goal type
 */
export function frontmatterToGoal(
  frontmatter: Record<string, unknown>,
  content: string,
  filePath: string,
  category: string
): Goal {
  const fileName = filePath.split('/').pop() ?? filePath;
  const id = fileName.replace('.md', '').replace(/\s+/g, '-').toLowerCase();
  const goalType = (frontmatter.type as GoalType) ?? 'daily';
  
  // Parse recurrence
  const recurrenceData = frontmatter.recurrence as Record<string, unknown> | undefined;
  const recurrence: Recurrence | undefined = recurrenceData ? {
    frequency: recurrenceData.frequency as Recurrence['frequency'],
    daysOfWeek: recurrenceData.daysOfWeek as Recurrence['daysOfWeek'],
    dayOfMonth: recurrenceData.dayOfMonth as number | undefined,
    targetCount: recurrenceData.targetCount as number | undefined,
    minimumCount: recurrenceData.minimumCount as number | undefined,
  } : undefined;

  const legacySubtasks = (frontmatter.subtasks as Array<Record<string, unknown>> | undefined) ?? [];
  const legacySubtaskIds = legacySubtasks.map(subtask => String(subtask.id));
  
  // Parse monthlyProgress
  const monthlyProgressData = frontmatter.monthlyProgress as Record<string, unknown> | undefined;
  const monthlyProgress: MonthlyProgress | undefined = monthlyProgressData 
    ? Object.fromEntries(
        Object.entries(monthlyProgressData).map(([k, v]) => [k, Number(v)])
      )
    : undefined;

  const completions = new Set(
    Array.isArray(frontmatter.completions)
      ? frontmatter.completions.map(String)
      : []
  );

  if (goalType === 'daily' && legacySubtaskIds.length > 0) {
    const legacyDailyCompletions = frontmatter.dailySubtaskCompletions as Record<string, unknown> | undefined;

    Object.entries(legacyDailyCompletions ?? {}).forEach(([date, ids]) => {
      const completedIds = Array.isArray(ids) ? ids.map(String) : [];
      if (legacySubtaskIds.every(id => completedIds.includes(id))) {
        completions.add(date);
      }
    });
  }

  if (goalType === 'weekly' && legacySubtaskIds.length > 0) {
    const legacyWeeklyCompletions = frontmatter.weeklySubtaskCompletions as Record<string, unknown> | undefined;

    Object.entries(legacyWeeklyCompletions ?? {}).forEach(([weekKey, ids]) => {
      const completedIds = Array.isArray(ids) ? ids.map(String) : [];
      if (legacySubtaskIds.every(id => completedIds.includes(id))) {
        completions.add(weekKey);
      }
    });
  }
  
  return {
    id,
    title: extractTitle(content),
    description: extractDescription(content),
    type: goalType,
    status: (frontmatter.status as GoalStatus) ?? 'active',
    startDate: String(frontmatter.startDate ?? new Date().toISOString().split('T')[0]),
    endDate: String(frontmatter.endDate ?? '2026-12-31'),
    recurrence,
    priority: (frontmatter.priority as Priority) ?? 'medium',
    completions: Array.from(completions).sort(),
    category,
    filePath,
    monthlyProgress,
  };
}

/**
 * Serialize a Goal object back to YAML frontmatter string
 */
export function serializeFrontmatter(goal: Goal): string {
  const lines: string[] = [];
  
  lines.push(`type: ${goal.type}`);
  lines.push(`status: ${goal.status}`);
  lines.push(`startDate: ${goal.startDate}`);
  lines.push(`endDate: ${goal.endDate}`);
  lines.push(`priority: ${goal.priority}`);
  
  // Arrays
  lines.push(`completions: [${goal.completions.join(', ')}]`);
  
  // Monthly Progress
  if (goal.monthlyProgress && Object.keys(goal.monthlyProgress).length > 0) {
    lines.push('monthlyProgress:');
    Object.entries(goal.monthlyProgress).forEach(([key, val]) => {
      lines.push(`  ${key}: ${val}`);
    });
  } else {
      // Optional, but keeping it clean
  }
  
  // Recurrence
  if (goal.recurrence) {
    lines.push('recurrence:');
    lines.push(`  frequency: ${goal.recurrence.frequency}`);
    if (goal.recurrence.targetCount !== undefined) {
      lines.push(`  targetCount: ${goal.recurrence.targetCount}`);
    }
    if (goal.recurrence.minimumCount !== undefined) {
      lines.push(`  minimumCount: ${goal.recurrence.minimumCount}`);
    }
    if (goal.recurrence.dayOfMonth !== undefined) {
      lines.push(`  dayOfMonth: ${goal.recurrence.dayOfMonth}`);
    }
    if (goal.recurrence.daysOfWeek && goal.recurrence.daysOfWeek.length > 0) {
      lines.push(`  daysOfWeek: [${goal.recurrence.daysOfWeek.join(', ')}]`);
    }
  }

  return lines.join('\n');
}

/**
 * Convert a Goal object to full markdown content (frontmatter + body)
 * Used when creating new goals or saving goals to IndexedDB
 */
export function goalToMarkdown(goal: Goal, body?: string): string {
  const frontmatter = serializeFrontmatter(goal);
  const goalBody = body ?? goal.description ?? '';
  
  return `---
${frontmatter}
---

# ${goal.title}

${goalBody}
`;
}
