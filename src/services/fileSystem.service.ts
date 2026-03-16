/**
 * File System Service for reading goal files
 *
 * This service now focuses on markdown parsing and serialization for the
 * internal IndexedDB storage backend.
 */

import type { Goal, GoalType, GoalStatus, Priority, Recurrence, Subtask, MonthlyProgress, DailySubtaskCompletions, WeeklySubtaskCompletions } from '@/types';

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
  
  // Parse recurrence
  const recurrenceData = frontmatter.recurrence as Record<string, unknown> | undefined;
  const recurrence: Recurrence | undefined = recurrenceData ? {
    frequency: recurrenceData.frequency as Recurrence['frequency'],
    daysOfWeek: recurrenceData.daysOfWeek as Recurrence['daysOfWeek'],
    dayOfMonth: recurrenceData.dayOfMonth as number | undefined,
    targetCount: recurrenceData.targetCount as number | undefined,
    minimumCount: recurrenceData.minimumCount as number | undefined,
  } : undefined;
  
  // Parse subtasks
  const subtasksData = frontmatter.subtasks as Array<Record<string, unknown>> | undefined;
  const subtasks: Subtask[] | undefined = subtasksData?.map(st => ({
    id: String(st.id),
    title: String(st.title),
    completed: Boolean(st.completed),
  }));
  
  // Parse monthlyProgress
  const monthlyProgressData = frontmatter.monthlyProgress as Record<string, unknown> | undefined;
  const monthlyProgress: MonthlyProgress | undefined = monthlyProgressData 
    ? Object.fromEntries(
        Object.entries(monthlyProgressData).map(([k, v]) => [k, Number(v)])
      )
    : undefined;
    
  // Parse dailySubtaskCompletions
  const dailySubtaskData = frontmatter.dailySubtaskCompletions as Record<string, unknown> | undefined;
  const dailySubtaskCompletions: DailySubtaskCompletions | undefined = dailySubtaskData
    ? Object.fromEntries(
        Object.entries(dailySubtaskData).map(([k, v]) => [k, Array.isArray(v) ? v.map(String) : []])
      )
    : undefined;

  // Parse weeklySubtaskCompletions
  const weeklySubtaskData = frontmatter.weeklySubtaskCompletions as Record<string, unknown> | undefined;
  const weeklySubtaskCompletions: WeeklySubtaskCompletions | undefined = weeklySubtaskData
    ? Object.fromEntries(
        Object.entries(weeklySubtaskData).map(([k, v]) => [k, Array.isArray(v) ? v.map(String) : []])
      )
    : undefined;
  
  return {
    id,
    title: extractTitle(content),
    description: extractDescription(content),
    type: (frontmatter.type as GoalType) ?? 'daily',
    status: (frontmatter.status as GoalStatus) ?? 'active',
    startDate: String(frontmatter.startDate ?? new Date().toISOString().split('T')[0]),
    endDate: String(frontmatter.endDate ?? '2026-12-31'),
    recurrence,
    priority: (frontmatter.priority as Priority) ?? 'medium',
    completions: (frontmatter.completions as string[]) ?? [],
    subtasks,
    tags: (frontmatter.tags as string[]) ?? [],
    category,
    filePath,
    monthlyProgress,
    dailySubtaskCompletions,
    weeklySubtaskCompletions,
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
  
  // Subtasks
  if (goal.subtasks && goal.subtasks.length > 0) {
    lines.push('subtasks:');
    goal.subtasks.forEach(st => {
      lines.push(`  - id: ${st.id}`);
      lines.push(`    title: ${st.title}`);
      lines.push(`    completed: ${st.completed}`);
    });
  } else {
    lines.push('subtasks: []');
  }
  
  // Daily Subtask Completions
  if (goal.dailySubtaskCompletions && Object.keys(goal.dailySubtaskCompletions).length > 0) {
    lines.push('dailySubtaskCompletions:');
    Object.entries(goal.dailySubtaskCompletions).forEach(([date, ids]) => {
      if (ids.length > 0) {
        lines.push(`  ${date}: [${ids.join(', ')}]`);
      }
    });
  } else {
    lines.push('dailySubtaskCompletions: {}');
  }

  // Weekly Subtask Completions
  if (goal.weeklySubtaskCompletions && Object.keys(goal.weeklySubtaskCompletions).length > 0) {
    lines.push('weeklySubtaskCompletions:');
    Object.entries(goal.weeklySubtaskCompletions).forEach(([week, ids]) => {
      if (ids.length > 0) {
        lines.push(`  ${week}: [${ids.join(', ')}]`);
      }
    });
  } else {
    lines.push('weeklySubtaskCompletions: {}');
  }
  
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
  
  // Tags
  if (goal.tags && goal.tags.length > 0) {
    lines.push(`tags: [${goal.tags.join(', ')}]`);
  } else {
    lines.push('tags: []');
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
