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
      case 'high': return 'bg-red-900/50 text-red-300 border-red-700';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'low': return 'bg-green-900/50 text-green-300 border-green-700';
      default: return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-300';
      case 'paused': return 'bg-yellow-900/50 text-yellow-300';
      case 'completed': return 'bg-blue-900/50 text-blue-300';
      case 'archived': return 'bg-gray-700 text-gray-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'text-blue-400';
      case 'weekly': return 'text-purple-400';
      case 'monthly': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
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
        <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-700 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span className="text-sm text-green-300">Changes saved successfully!</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* Goal Title & Type */}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold text-gray-100">{goal.title}</h2>
          <span className={`text-xs font-medium uppercase ${getTypeColor(goal.type)}`}>
            {goal.type}
          </span>
        </div>
        
        {goal.description && (
          <p className="text-gray-400 text-sm mb-4">{goal.description}</p>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Status */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Status:</span>
            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(goal.status)}`}>
              {goal.status}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Priority:</span>
            <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(goal.priority)}`}>
              {goal.priority}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Category:</span>
            <span className="text-gray-300">{goal.category}</span>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Active:</span>
            <span className="text-gray-300 text-xs">
              {formatDateDisplay(parseISODate(goal.startDate), { month: 'short', day: 'numeric' })} - {formatDateDisplay(parseISODate(goal.endDate), { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Tags */}
        {goal.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
            <Tag className="h-4 w-4 text-gray-500" />
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
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Subtasks ({goal.subtasks.length})</h4>
            <ul className="space-y-1">
              {goal.subtasks.map(subtask => (
                <li key={subtask.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${subtask.completed ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span className="text-gray-300">{subtask.title}</span>
                  <span className="text-gray-600 text-xs">({subtask.id})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recurrence */}
        {goal.recurrence && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Recurrence</h4>
            <div className="text-sm text-gray-300 space-y-1">
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
        <div className="mt-4 pt-3 border-t border-gray-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500 font-mono">{goal.filePath}</span>
        </div>
      </Card>

      {/* Raw Markdown Content */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Raw Markdown
        </h3>
        
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-96 bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-y"
            spellCheck={false}
          />
        ) : (
          <pre className="w-full max-h-96 overflow-auto bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-sm text-gray-300 whitespace-pre-wrap">
            {rawContent || 'No content available'}
          </pre>
        )}
        
        {!canEdit && (
          <p className="text-xs text-gray-500 mt-2">
            Editing is only available in PWA mode with file system access.
          </p>
        )}
      </Card>
    </div>
  );
}
