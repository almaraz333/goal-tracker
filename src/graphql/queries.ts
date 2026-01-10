/**
 * GraphQL type definitions for Goal Tracker
 * These define the schema for querying goals from the API
 */

import { gql } from '@apollo/client';

export const GOAL_FRAGMENT = gql`
  fragment GoalFields on Goal {
    id
    title
    description
    type
    status
    startDate
    endDate
    priority
    completions
    tags
    category
    filePath
    recurrence {
      frequency
      daysOfWeek
      dayOfMonth
      targetCount
      minimumCount
    }
    subtasks {
      id
      title
      completed
    }
  }
`;

export const GET_GOALS = gql`
  ${GOAL_FRAGMENT}
  query GetGoals {
    goals {
      ...GoalFields
    }
  }
`;

export const GET_GOAL = gql`
  ${GOAL_FRAGMENT}
  query GetGoal($id: ID!) {
    goal(id: $id) {
      ...GoalFields
    }
  }
`;

export const GET_GOALS_BY_CATEGORY = gql`
  ${GOAL_FRAGMENT}
  query GetGoalsByCategory($category: String!) {
    goalsByCategory(category: $category) {
      ...GoalFields
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      icon
      color
      description
      order
    }
  }
`;
