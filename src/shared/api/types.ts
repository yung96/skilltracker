// ============= User Types =============
export type UserRole = 'manager' | 'employee';

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface UserCreate {
  username: string;
  name: string;
  role: UserRole;
  password: string;
}

export interface UserUpdate {
  username?: string;
  name?: string;
  role?: UserRole;
  password?: string;
}

// ============= Auth Types =============
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ============= Task Types =============
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Task {
  id: number;
  employee_id: number;
  title: string;
  description?: string;
  deadline?: string;
  status: TaskStatus;
  progress: number;
  created_at: string;
  updated_at: string;
  employee?: User;
}

export interface TaskCreate {
  employee_id: number;
  title: string;
  description?: string;
  deadline?: string;
  status?: TaskStatus;
  progress?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  deadline?: string;
  status?: TaskStatus;
  progress?: number;
}

export interface ProgressUpdate {
  progress: number;
  status?: TaskStatus;
}

// ============= Comment Types =============
export interface Comment {
  id: number;
  task_id: number;
  user_id?: number;
  text: string;
  created_at: string;
  author?: User;
}

export interface CommentCreate {
  text: string;
}

export interface CommentUpdate {
  text: string;
}

// ============= Attachment Types =============
export interface Attachment {
  id: number;
  task_id: number;
  uploaded_by_id?: number;
  stored_path: string;
  original_filename: string;
  content_type?: string;
  created_at: string;
}

// ============= Quiz Types =============
export type QuestionType = 'single' | 'multiple' | 'text';
export type MatcherType = 'equals' | 'contains' | 'icontains';
export type QuizStatus = 'draft' | 'published';
export type AttemptStatus = 'in_progress' | 'completed' | 'expired';

export interface QuestionOption {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionOptionCreate {
  text: string;
  is_correct: boolean;
}

export interface QuestionTextAnswer {
  id: number;
  matcher_type: MatcherType;
  value: string;
}

export interface QuestionTextAnswerCreate {
  matcher_type: MatcherType;
  value: string;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  explanation?: string;
  options: QuestionOption[];
  text_answers: QuestionTextAnswer[];
}

export interface QuestionCreate {
  text: string;
  type: QuestionType;
  explanation?: string;
  options?: QuestionOptionCreate[];
  text_answers?: QuestionTextAnswerCreate[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  status: QuizStatus;
  pass_percent: number;
  time_limit_seconds?: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  allow_review: boolean;
  max_attempts?: number;
  created_at: string;
  updated_at: string;
}

export interface QuizCreate {
  title: string;
  description?: string;
  pass_percent?: number;
  time_limit_seconds?: number;
  shuffle_questions?: boolean;
  shuffle_answers?: boolean;
  allow_review?: boolean;
  max_attempts?: number;
  publish?: boolean;
}

export interface QuizUpdate {
  title?: string;
  description?: string;
  pass_percent?: number;
  time_limit_seconds?: number;
  shuffle_questions?: boolean;
  shuffle_answers?: boolean;
  allow_review?: boolean;
  max_attempts?: number;
  status?: QuizStatus;
}

export interface QuizSection {
  id: number;
  quiz_id: number;
  title: string;
  description?: string;
  order_index: number;
  pick_count?: number;
  questions: Question[];
}

export interface QuizSectionCreate {
  title: string;
  description?: string;
  order_index?: number;
  pick_count?: number;
  question_ids?: number[];
}

export interface QuizSectionUpdate {
  title?: string;
  description?: string;
  order_index?: number;
  pick_count?: number;
  question_ids?: number[];
}

export interface QuizAssignment {
  id: number;
  quiz_id: number;
  assigned_to_user_id?: number;
  task_id?: number;
  required: boolean;
  due_at?: string;
  max_attempts?: number;
  cooldown_hours: number;
  created_at: string;
  attempts_taken: number;
  remaining_attempts?: number;
}

export interface QuizAssignmentCreate {
  assigned_to_user_id?: number;
  task_id?: number;
  required?: boolean;
  due_at?: string;
  max_attempts?: number;
  cooldown_hours?: number;
}

export interface QuizAssignmentUpdate {
  required?: boolean;
  due_at?: string;
  max_attempts?: number;
  cooldown_hours?: number;
}

export interface AssignmentListItem {
  assignment: QuizAssignment;
  quiz: Quiz;
  task?: Task;
}

export interface AttemptQuestionPayload {
  attempt_question_id: number;
  question: Question;
  section_id?: number;
  order_index: number;
}

export interface AttemptStartResponse {
  attempt_id: number;
  quiz_id: number;
  status: AttemptStatus;
  started_at: string;
  time_limit_seconds?: number;
  questions: AttemptQuestionPayload[];
}

export interface AnswerSubmission {
  attempt_question_id: number;
  selected_option_ids?: number[];
  text_answer?: string;
}

export interface AttemptSubmitRequest {
  answers: AnswerSubmission[];
}

export interface AttemptAnswerRead {
  attempt_question_id: number;
  question_id: number;
  is_correct?: boolean;
  selected_option_ids: number[];
  text_answer?: string;
}

export interface AttemptRead {
  id: number;
  quiz_id: number;
  user_id: number;
  status: AttemptStatus;
  score_percent?: number;
  passed?: boolean;
  started_at: string;
  finished_at?: string;
  answers: AttemptAnswerRead[];
}

export interface QuizAnalytics {
  quiz_id: number;
  total_assignments: number;
  total_attempts: number;
  completed_attempts: number;
  pass_rate: number;
}

export interface QuizQuestionAnalytics {
  question_id: number;
  question_text: string;
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  correct_rate: number;
}

export interface QuizQuestionsAnalytics {
  quiz_id: number;
  items: QuizQuestionAnalytics[];
}

export interface AttemptListItem {
  id: number;
  quiz_id: number;
  assignment_id?: number;
  user_id: number;
  user_name: string;
  status: AttemptStatus;
  score_percent?: number;
  passed?: boolean;
  started_at: string;
  finished_at?: string;
}

export interface AssignmentDetail {
  assignment: QuizAssignment;
  quiz: Quiz;
  task?: Task;
  assigned_user?: User;
}

export interface UserQuizHistoryItem {
  attempt: AttemptListItem;
  quiz: Quiz;
  assignment?: QuizAssignment;
  task?: Task;
}

// ============= Notification Types =============
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body?: string;
  payload?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// ============= Error Types =============
export interface ApiError {
  detail: string;
}
