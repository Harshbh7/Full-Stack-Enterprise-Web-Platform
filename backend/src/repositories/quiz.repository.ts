import { Types, FilterQuery } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository.js';
import { Quiz, IQuiz } from '../models/Quiz.js';
import { Question, IQuestion } from '../models/Question.js';
import { QuizAttempt, IQuizAttempt } from '../models/QuizAttempt.js';

export class QuizRepository extends BaseRepository<IQuiz> {
  constructor() {
    super(Quiz, true);
  }

  async findByCourse(
    courseId: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    options: PaginationOptions
  ): Promise<PaginatedResult<IQuiz>> {
    const filter: FilterQuery<IQuiz> = {};
    if (Types.ObjectId.isValid(courseId)) {
      filter.courseId = new Types.ObjectId(courseId);
    }
    return this.findPaginated(filter, tenantId, isSuperAdmin, options, 'courseId');
  }

  async getQuestions(
    quizId: string,
    tenantId: string | undefined,
    isSuperAdmin: boolean,
    sanitizeForStudent = false
  ): Promise<IQuestion[]> {
    if (!Types.ObjectId.isValid(quizId)) {
      return [];
    }
    const filter: FilterQuery<IQuestion> = { quizId: new Types.ObjectId(quizId) };
    if (!isSuperAdmin && tenantId) {
      filter.tenantId = new Types.ObjectId(tenantId);
    }

    const questions = await Question.find(filter).lean().exec();

    if (sanitizeForStudent) {
      // Remove isCorrect and explanation so students cannot inspect payload
      return questions.map((q) => ({
        ...q,
        explanation: undefined,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: undefined as any,
        })),
      })) as unknown as IQuestion[];
    }

    return questions as unknown as IQuestion[];
  }

  async createQuestion(questionData: Partial<IQuestion>): Promise<IQuestion> {
    return Question.create(questionData);
  }

  async createAttempt(attemptData: Partial<IQuizAttempt>): Promise<IQuizAttempt> {
    return QuizAttempt.create(attemptData);
  }

  async getAttempts(
    quizId: string,
    studentId?: string,
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<IQuizAttempt[]> {
    const filter: FilterQuery<IQuizAttempt> = {};
    if (Types.ObjectId.isValid(quizId)) {
      filter.quizId = new Types.ObjectId(quizId);
    }
    if (studentId && Types.ObjectId.isValid(studentId)) {
      filter.studentId = new Types.ObjectId(studentId);
    }
    if (!isSuperAdmin && tenantId) {
      filter.tenantId = new Types.ObjectId(tenantId);
    }

    return QuizAttempt.find(filter)
      .sort({ createdAt: -1 })
      .populate('studentId', 'firstName lastName email')
      .populate('quizId', 'title passingScorePercentage')
      .exec();
  }

  async getAllAttempts(
    tenantId?: string,
    isSuperAdmin = false
  ): Promise<IQuizAttempt[]> {
    const filter: FilterQuery<IQuizAttempt> = {};
    if (!isSuperAdmin && tenantId) {
      filter.tenantId = new Types.ObjectId(tenantId);
    }

    return QuizAttempt.find(filter)
      .sort({ createdAt: -1 })
      .populate('studentId', 'firstName lastName email')
      .populate('quizId', 'title passingScorePercentage')
      .populate('courseId', 'code title')
      .exec();
  }
}

export const quizRepository = new QuizRepository();
