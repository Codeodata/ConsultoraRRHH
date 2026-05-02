import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  tenantSlug: z.string().optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const companySchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  rut: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactName: z.string().optional(),
})

export const serviceSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  companyId: z.string().min(1, 'Empresa requerida'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const serviceUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const userSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
  role: z.enum(['OWNER', 'RRHH', 'CLIENT']),
  companyId: z.string().optional().nullable(),
})

export const jobDescriptionSchema = z.object({
  companyId: z.string().min(1, 'Empresa requerida'),
  title: z.string().min(2, 'Título requerido'),
  department: z.string().optional(),
  description: z.string().min(10, 'Descripción requerida'),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  competencies: z.string().optional(),
  salaryRange: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const jobDescriptionUpdateSchema = jobDescriptionSchema.partial().omit({ companyId: true })

const scoreField = z.number().min(1).max(5).optional().nullable()

export const performanceEvalSchema = z.object({
  companyId: z.string().min(1, 'Empresa requerida'),
  employeeName: z.string().min(2, 'Nombre del empleado requerido'),
  employeePosition: z.string().optional(),
  period: z.string().min(1, 'Período requerido'),
  evaluatorName: z.string().optional(),
  scoreProductivity: scoreField,
  scoreQuality: scoreField,
  scoreTeamwork: scoreField,
  scoreInitiative: scoreField,
  scorePunctuality: scoreField,
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  goals: z.string().optional(),
  status: z.enum(['DRAFT', 'COMPLETED', 'REVIEWED']).optional(),
  evaluationDate: z.string().optional(),
})

export const performanceEvalUpdateSchema = performanceEvalSchema.partial().omit({ companyId: true })

export const employeeSchema = z.object({
  companyId: z.string().min(1, 'Empresa requerida'),
  name: z.string().min(2, 'Nombre requerido'),
  rut: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  personalEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  reportsToId: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  address: z.string().optional(),
  gender: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const employeeUpdateSchema = employeeSchema.partial().omit({ companyId: true })

export const employeeGoalSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
})

export const employeeGoalUpdateSchema = employeeGoalSchema.partial()

export const serviceTaskSchema = z.object({
  title: z.string().min(2, 'Título requerido'),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  assignedUserId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export const serviceTaskUpdateSchema = serviceTaskSchema.partial()

export const employeeHistorySchema = z.object({
  employeeId: z.string().min(1, 'Empleado requerido'),
  changeType: z.enum(['PROMOTION', 'TRANSFER', 'UPDATE']),
  description: z.string().optional(),
  date: z.string().optional(),
})

export const processSchema = z.object({
  companyId: z.string().min(1, 'Empresa requerida'),
  positionTitle: z.string().min(2, 'Puesto requerido'),
  department: z.string().optional(),
  notes: z.string().optional(),
  openedAt: z.string().optional(),
})

export const processUpdateSchema = z.object({
  positionTitle: z.string().min(2).optional(),
  department: z.string().optional(),
  stage: z.enum(['RECLUTAMIENTO', 'SELECCION', 'PRE_INGRESO', 'ALTA_LEGAJO', 'ONBOARDING', 'SEGUIMIENTO']).optional(),
  status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  employeeId: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
})

export const candidateSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export const candidateUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['RECIBIDO', 'FILTRADO', 'PRESELECCIONADO', 'ENTREVISTADO', 'SELECCIONADO', 'RECHAZADO']).optional(),
  interviewDate: z.string().nullable().optional(),
  interviewNotes: z.string().optional(),
  evaluationScore: z.number().min(1).max(10).nullable().optional(),
  evaluationNotes: z.string().optional(),
  medicalExamDate: z.string().nullable().optional(),
  medicalExamExpiry: z.string().nullable().optional(),
  medicalExamResult: z.string().optional(),
  validationsOk: z.boolean().optional(),
  isSelected: z.boolean().optional(),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
})

export const onboardingTaskSchema = z.object({
  title: z.string().min(2, 'Título requerido'),
  description: z.string().optional(),
  category: z.enum(['INDUCCION', 'CAPACITACION']).default('INDUCCION'),
  dueDate: z.string().nullable().optional(),
  notes: z.string().optional(),
})

export const onboardingTaskUpdateSchema = onboardingTaskSchema.partial().extend({
  completedAt: z.string().nullable().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type UserInput = z.infer<typeof userSchema>
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>
export type PerformanceEvalInput = z.infer<typeof performanceEvalSchema>
export type EmployeeInput = z.infer<typeof employeeSchema>
export type EmployeeHistoryInput = z.infer<typeof employeeHistorySchema>
