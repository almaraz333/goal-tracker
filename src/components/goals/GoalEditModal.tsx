/**
 * Goal Edit Modal
 * 
 * Form-based modal for editing goals when using in-app storage mode.
 * Does not allow raw markdown editing - only structured form fields.
 */

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Calendar, 
  Tag, 
  Folder,
  Target,
  Clock,
  AlertCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { Goal, GoalType, GoalStatus, Priority, Subtask } from '@/types';
import { saveGoalToIndexedDB, deleteGoalFromIndexedDB } from '@/services/indexedDbStorage.service';

interface GoalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onGoalUpdated: (goal: Goal) => void;
  onGoalDeleted?: (goalId: string) => void;
  existingCategories?: string[];
}

interface FormData {
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  category: string;
  tags: string;
  subtasks: Subtask[];
}

function generateSubtaskId(): string {
  return `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function GoalEditModal({ 
  isOpen, 
  onClose, 
  goal,
  onGoalUpdated,
  onGoalDeleted,
  existingCategories = [],
}: GoalEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'daily',
    status: 'active',
    priority: 'medium',
    startDate: '',
    endDate: '',
    category: '',
    tags: '',
    subtasks: [],
  });
  
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Initialize form with goal data when opened
  useEffect(() => {
    if (isOpen && goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        type: goal.type,
        status: goal.status,
        priority: goal.priority,
        startDate: goal.startDate,
        endDate: goal.endDate,
        category: goal.category,
        tags: goal.tags.join(', '),
        subtasks: goal.subtasks ? [...goal.subtasks] : [],
      });
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, goal]);

  // Combine existing categories with goal's category
  const categoryOptions = [...new Set(['General', ...existingCategories, goal.category])];

  const handleInputChange = (field: keyof FormData, value: string | GoalType | GoalStatus | Priority) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: generateSubtaskId(), title: newSubtask.trim(), completed: false },
      ],
    }));
    setNewSubtask('');
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== id),
    }));
  };

  const handleAddNewCategory = () => {
    if (!newCategory.trim()) return;
    
    setFormData(prev => ({ ...prev, category: newCategory.trim() }));
    setShowNewCategory(false);
    setNewCategory('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    
    if (!formData.category.trim()) {
      setError('Please select or create a category');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Create updated goal object (preserve existing completions and progress)
      const updatedGoal: Goal = {
        ...goal,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        subtasks: formData.subtasks.length > 0 ? formData.subtasks : undefined,
        tags,
      };

      // Save to IndexedDB
      await saveGoalToIndexedDB(updatedGoal);

      // Notify parent
      onGoalUpdated(updatedGoal);
      onClose();
    } catch (err) {
      console.error('Failed to update goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteGoalFromIndexedDB(goal.filePath);
      onGoalDeleted?.(goal.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Goal">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-status-danger-bg border border-status-danger-border rounded-lg">
            <AlertCircle className="h-4 w-4 text-status-danger shrink-0" />
            <p className="text-sm text-status-danger">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Title <span className="text-status-danger">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter goal title..."
            className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent resize-none"
          />
        </div>

        {/* Type, Status, and Priority Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Clock className="h-3 w-3 inline mr-1" />
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as GoalType)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as GoalStatus)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Target className="h-3 w-3 inline mr-1" />
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Calendar className="h-3 w-3 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            <Folder className="h-3 w-3 inline mr-1" />
            Category
          </label>
          {!showNewCategory ? (
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="flex-1 px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button
                onClick={() => setShowNewCategory(true)}
                variant="ghost"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className="flex-1 px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewCategory()}
              />
              <Button onClick={handleAddNewCategory} variant="primary" size="sm">
                Add
              </Button>
              <Button onClick={() => setShowNewCategory(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            <Tag className="h-3 w-3 inline mr-1" />
            Tags
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="Enter tags separated by commas..."
            className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
          <p className="text-xs text-text-muted mt-1">Separate multiple tags with commas</p>
        </div>

        {/* Subtasks */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Subtasks
          </label>
          
          {/* Existing subtasks */}
          {formData.subtasks.length > 0 && (
            <div className="space-y-2 mb-2">
              {formData.subtasks.map((subtask) => (
                <div 
                  key={subtask.id}
                  className="flex items-center gap-2 p-2 bg-bg-tertiary rounded-lg"
                >
                  <span className="flex-1 text-sm text-text-primary">{subtask.title}</span>
                  <button
                    onClick={() => handleRemoveSubtask(subtask.id)}
                    className="p-1 text-text-muted hover:text-status-danger transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add subtask input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask..."
              className="flex-1 px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            />
            <Button onClick={handleAddSubtask} variant="ghost" size="sm" disabled={!newSubtask.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-3 bg-status-danger-bg border border-status-danger-border rounded-lg">
            <p className="text-sm text-status-danger mb-2">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                variant="primary"
                size="sm"
                className="bg-status-danger hover:bg-status-danger/80"
              >
                Yes, Delete
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-border-primary">
          <Button 
            onClick={handleDelete} 
            variant="ghost"
            className="text-status-danger hover:bg-status-danger-bg"
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="primary"
              disabled={isSubmitting || !formData.title.trim()}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
