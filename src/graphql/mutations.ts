/**
 * GraphQL mutations for Goal Tracker
 */

import { gql } from '@apollo/client';
import { GOAL_FRAGMENT } from './queries';

export const TOGGLE_COMPLETION = gql`
  ${GOAL_FRAGMENT}
  mutation ToggleCompletion($goalId: ID!, $date: String!) {
    toggleCompletion(goalId: $goalId, date: $date) {
      ...GoalFields
    }
  }
`;

export const TOGGLE_SUBTASK = gql`
  ${GOAL_FRAGMENT}
  mutation ToggleSubtask($goalId: ID!, $subtaskId: String!) {
    toggleSubtask(goalId: $goalId, subtaskId: $subtaskId) {
      ...GoalFields
    }
  }
`;

export const UPDATE_GOAL = gql`
  ${GOAL_FRAGMENT}
  mutation UpdateGoal($id: ID!, $input: GoalInput!) {
    updateGoal(id: $id, input: $input) {
      ...GoalFields
    }
  }
`;
