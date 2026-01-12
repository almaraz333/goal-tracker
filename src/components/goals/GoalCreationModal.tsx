/**
 * Goal Creation Modal
 * 
 * Form-based modal for creating new goals when using in-app storage mode.
 * Creates goals with proper markdown format and stores them in IndexedDB.
 */

import { useState, useMemo } from 'react';
import { 
  Plus, 
  X, 
  Calendar, 
  Tag, 
  Folder,
  Target,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import type { Goal, GoalType, GoalStatus, Priority, Subtask } from '@/types';
import { generateGoalFilePath, saveGoalToIndexedDB, saveCategoryToIndexedDB } from '@/services/indexedDbStorage.service';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: (goal: Goal) => void;
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
  subtasks: Array<{ id: string; title: string }>;
}

const DEFAULT_END_DATE = '2026-12-31';

function generateSubtaskId(): string {
  return `st_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function GoalCreationModal({ 
  isOpen, 
  onClose, 
  onGoalCreated,
  existingCategories = [],
}: GoalCreationModalProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'daily',
    status: 'active',
    priority: 'medium',
    startDate: today,
    endDate: DEFAULT_END_DATE,
    category: existingCategories[0] || 'General',
    tags: '',
    subtasks: [],
  });
  
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Combine existing categories with "Add new..." option
  const categoryOptions = useMemo(() => {
    const unique = [...new Set(['General', ...existingCategories])];
    return unique;
  }, [existingCategories]);

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
        { id: generateSubtaskId(), title: newSubtask.trim() },
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
      // Generate file path
      const filePath = generateGoalFilePath(formData.title, formData.category);
      
      // Create subtasks array
      const subtasks: Subtask[] = formData.subtasks.map(st => ({
        id: st.id,
        title: st.title,
        completed: false,
      }));

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Create goal object
      const goal: Goal = {
        id: formData.title.replace(/\s+/g, '-').toLowerCase(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: formData.category,
        filePath,
        completions: [],
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        tags,
        dailySubtaskCompletions: formData.type === 'daily' ? {} : undefined,
        weeklySubtaskCompletions: formData.type === 'weekly' ? {} : undefined,
        monthlyProgress: formData.type === 'monthly' ? {} : undefined,
      };

      // Save to IndexedDB
      await saveGoalToIndexedDB(goal);
      
      // Save category if it's new
      if (!categoryOptions.includes(formData.category)) {
        await saveCategoryToIndexedDB({ name: formData.category });
      }

      // Notify parent
      onGoalCreated(goal);
      
      // Reset form and close
      resetForm();
      onClose();
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      status: 'active',
      priority: 'medium',
      startDate: today,
      endDate: DEFAULT_END_DATE,
      category: existingCategories[0] || 'General',
      tags: '',
      subtasks: [],
    });
    setNewSubtask('');
    setError(null);
    setShowNewCategory(false);
    setNewCategory('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Goal">
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

        {/* Type and Priority Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              <Clock className="h-3 w-3 inline mr-1" />
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value as GoalType)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
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
              className="w-full px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
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

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
          <Button onClick={handleClose} variant="ghost">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="primary"
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
