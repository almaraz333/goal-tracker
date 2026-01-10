/**
 * Goal Detail View Component
 * 
 * Displays the full details of a goal including its raw markdown content.
 * Allows editing the markdown file directly.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Edit3, 
  X, 
  Calendar,
  Tag,
  Folder,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import type { Goal } from '@/types';
import { getRawGoalContent, saveRawGoalContent, getStorageMode } from '@/services';
import { formatDateDisplay, parseISODate } from '@/utils';

interface GoalDetailViewProps {
  goal: Goal;
  onBack: () => void;
  onGoalUpdated?: () => void;
}

export function GoalDetailView({ goal, onBack, onGoalUpdated }: GoalDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [rawContent, setRawContent] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const storageMode = getStorageMode();
  const canEdit = storageMode === 'native-fs';

  // Load raw content
  useEffect(() => {
    const content = getRawGoalContent(goal.filePath);
    if (content) {
      setRawContent(content);
      setEditedContent(content);
    }
  }, [goal.filePath]);

  const handleStartEdit = useCallback(() => {
    setEditedContent(rawContent);
    setIsEditing(true);
    setError(null);
    setSaveSuccess(false);
  }, [rawContent]);

  const handleCancelEdit = useCallback(() => {
    setEditedContent(rawContent);
    setIsEditing(false);
    setError(null);
  }, [rawContent]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      await saveRawGoalContent(goal.filePath, editedContent);
      setRawContent(editedContent);
      setIsEditing(false);
      setSaveSuccess(true);
      onGoalUpdated?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [goal.filePath, editedContent, onGoalUpdated]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-status-danger-bg text-status-danger border-status-danger-border';
      case 'medium': return 'bg-status-warning-bg text-status-warning border-status-warning-border';
      case 'low': return 'bg-status-success-bg text-status-success border-status-success-border';
      default: return 'bg-bg-tertiary text-text-secondary border-border-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-status-success-bg text-status-success';
      case 'paused': return 'bg-status-warning-bg text-status-warning';
      case 'completed': return 'bg-status-info-bg text-status-info';
      case 'archived': return 'bg-bg-tertiary text-text-muted';
      default: return 'bg-bg-tertiary text-text-secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-accent-primary';
      case 'weekly': return 'text-accent-secondary';
      case 'monthly': return 'text-status-success';
      default: return 'text-text-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to list</span>
        </button>
        
        {canEdit && !isEditing && (
          <Button onClick={handleStartEdit} variant="ghost" size="sm">
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        
        {isEditing && (
          <div className="flex items-center gap-2">
            <Button onClick={handleCancelEdit} variant="ghost" size="sm">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" size="sm" disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Success/Error messages */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-status-success-bg border border-status-success-border rounded-lg">
          <CheckCircle className="h-4 w-4 text-status-success" />
          <span className="text-sm text-status-success">Changes saved successfully!</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-status-danger-bg border border-status-danger-border rounded-lg">
          <AlertCircle className="h-4 w-4 text-status-danger" />
          <span className="text-sm text-status-danger">{error}</span>
        </div>
      )}

      {/* Goal Title & Type */}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold text-text-primary">{goal.title}</h2>
          <span className={`text-xs font-medium uppercase ${getTypeColor(goal.type)}`}>
            {goal.type}
          </span>
        </div>
        
        {goal.description && (
          <p className="text-text-muted text-sm mb-4">{goal.description}</p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Status */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-text-muted" />
            <span className="text-text-muted">Status:</span>
            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(goal.status)}`}>
              {goal.status}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-text-muted" />
            <span className="text-text-muted">Priority:</span>
            <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(goal.priority)}`}>
              {goal.priority}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-text-muted" />
            <span className="text-text-muted">Category:</span>
            <span className="text-text-secondary">{goal.category}</span>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-text-muted" />
            <span className="text-text-muted">Active:</span>
            <span className="text-text-secondary text-xs">
              {formatDateDisplay(parseISODate(goal.startDate), { month: 'short', day: 'numeric' })} - {formatDateDisplay(parseISODate(goal.endDate), { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Tags */}
        {goal.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-primary">
            <Tag className="h-4 w-4 text-text-muted" />
            <div className="flex flex-wrap gap-1">
              {goal.tags.map(tag => (
                <Badge key={tag} variant="default" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks */}
        {goal.subtasks && goal.subtasks.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border-primary">
            <h4 className="text-sm font-medium text-text-muted mb-2">Subtasks ({goal.subtasks.length})</h4>
            <ul className="space-y-1">
              {goal.subtasks.map(subtask => (
                <li key={subtask.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${subtask.completed ? 'bg-status-success' : 'bg-progress-empty'}`} />
                  <span className="text-text-secondary">{subtask.title}</span>
                  <span className="text-text-muted text-xs">({subtask.id})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recurrence */}
        {goal.recurrence && (
          <div className="mt-4 pt-3 border-t border-border-primary">
            <h4 className="text-sm font-medium text-text-muted mb-2">Recurrence</h4>
            <div className="text-sm text-text-secondary space-y-1">
              <p>Frequency: {goal.recurrence.frequency}</p>
              {goal.recurrence.daysOfWeek && (
                <p>Days: {goal.recurrence.daysOfWeek.join(', ')}</p>
              )}
              {goal.recurrence.targetCount && (
                <p>Target: {goal.recurrence.targetCount} per {goal.recurrence.frequency}</p>
              )}
              {goal.recurrence.minimumCount && (
                <p>Minimum: {goal.recurrence.minimumCount}</p>
              )}
            </div>
          </div>
        )}

        {/* File Path */}
        <div className="mt-4 pt-3 border-t border-border-primary flex items-center gap-2">
          <FileText className="h-4 w-4 text-text-muted" />
          <span className="text-xs text-text-muted font-mono">{goal.filePath}</span>
        </div>
      </Card>

      {/* Raw Markdown Content */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Raw Markdown
        </h3>
        
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 bg-bg-input border border-border-primary rounded-lg p-3 font-mono text-sm text-text-primary focus:outline-none focus:border-border-focus resize-y"
            spellCheck={false}
          />
        ) : (
          <pre className="w-full max-h-96 overflow-auto bg-bg-input border border-border-primary rounded-lg p-3 font-mono text-sm text-text-secondary whitespace-pre-wrap">
            {rawContent || 'No content available'}
          </pre>
        )}
        
        {!canEdit && (
          <p className="text-xs text-text-muted mt-2">
            Editing is only available in PWA mode with file system access.
          </p>
        )}
      </Card>
    </div>
  );
}
