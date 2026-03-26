import type {
  Task,
  TaskId,
  WorkspaceId,
  UserId,
  CreateTaskInput,
  UpdateTaskInput,
  CompleteTaskInput,
  VerifyTaskInput,
  TaskFilter,
  TaskRepository,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TimePeriod,
} from "@pandi/core-domain";

export function createInMemoryTaskRepository(options?: {
  initialTasks?: Task[];
}): TaskRepository {
  const tasks = new Map<string, Task>();
  let taskIdCounter = 1;

  // Initialize with seed data if provided
  if (options?.initialTasks) {
    options.initialTasks.forEach((task) => {
      tasks.set(task.id.value, task);
      const taskIdNum = parseInt(task.id.value.split("-")[1]);
      if (taskIdNum >= taskIdCounter) {
        taskIdCounter = taskIdNum + 1;
      }
    });
  }

  const generateTaskId = (): TaskId => ({
    value: `task-${String(taskIdCounter++).padStart(3, "0")}`,
  });

  const applyFilter = (task: Task, filter?: TaskFilter): boolean => {
    if (!filter) return true;

    // Status filter
    if (filter.status && !filter.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filter.priority && !filter.priority.includes(task.priority)) {
      return false;
    }

    // Category filter
    if (filter.category && !filter.category.includes(task.category)) {
      return false;
    }

    // Time period filter
    if (filter.timePeriod && !filter.timePeriod.includes(task.timePeriod)) {
      return false;
    }

    // Assignee filter
    if (filter.assigneeId) {
      if (!task.assigneeId || !filter.assigneeId.some(id => id.value === task.assigneeId!.value)) {
        return false;
      }
    }

    // Due date filters
    if (filter.dueBefore && (!task.dueAt || new Date(task.dueAt) > new Date(filter.dueBefore))) {
      return false;
    }
    if (filter.dueAfter && (!task.dueAt || new Date(task.dueAt) < new Date(filter.dueAfter))) {
      return false;
    }

    // Created date filters
    if (filter.createdBefore && new Date(task.createdAt) > new Date(filter.createdBefore)) {
      return false;
    }
    if (filter.createdAfter && new Date(task.createdAt) < new Date(filter.createdAfter)) {
      return false;
    }

    // Completed date filters
    if (filter.completedBefore) {
      if (!task.completedAt || new Date(task.completedAt) > new Date(filter.completedBefore)) {
        return false;
      }
    }
    if (filter.completedAfter) {
      if (!task.completedAt || new Date(task.completedAt) < new Date(filter.completedAfter)) {
        return false;
      }
    }

    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      if (!task.tags || !filter.tags.some(tag => task.tags!.includes(tag))) {
        return false;
      }
    }

    return true;
  };

  const sortTasks = (tasks: Task[]): Task[] => {
    return tasks.sort((a, b) => {
      // Sort by priority first (urgent > high > medium > low)
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date (earlier due dates first)
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (a.dueAt && !b.dueAt) return -1;
      if (!a.dueAt && b.dueAt) return 1;

      // Finally by created date (newer first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  return {
    async create(input: CreateTaskInput): Promise<Task> {
      const now = new Date().toISOString();
      const task: Task = {
        id: generateTaskId(),
        workspaceId: input.workspaceId,
        title: input.title,
        description: input.description,
        status: "pending",
        priority: input.priority,
        category: input.category,
        timePeriod: input.timePeriod,
        dueAt: input.dueAt,
        assigneeId: input.assigneeId,
        estimatedHours: input.estimatedHours,
        tags: input.tags,
        createdAt: now,
        updatedAt: now,
      };

      tasks.set(task.id.value, task);
      return task;
    },

    async update(id: TaskId, input: UpdateTaskInput): Promise<Task> {
      const existingTask = tasks.get(id.value);
      if (!existingTask) {
        throw new Error(`Task with id ${id.value} not found`);
      }

      const updatedTask: Task = {
        ...existingTask,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      tasks.set(id.value, updatedTask);
      return updatedTask;
    },

    async delete(id: TaskId): Promise<void> {
      if (!tasks.has(id.value)) {
        throw new Error(`Task with id ${id.value} not found`);
      }
      tasks.delete(id.value);
    },

    async findById(id: TaskId): Promise<Task | null> {
      return tasks.get(id.value) || null;
    },

    async listByWorkspace(workspaceId: WorkspaceId, filter?: TaskFilter): Promise<Task[]> {
      const workspaceTasks = Array.from(tasks.values()).filter(
        (task) => task.workspaceId.value === workspaceId.value
      );
      
      const filteredTasks = workspaceTasks.filter(task => applyFilter(task, filter));
      return sortTasks(filteredTasks);
    },

    async listByAssignee(assigneeId: UserId, filter?: TaskFilter): Promise<Task[]> {
      const assigneeTasks = Array.from(tasks.values()).filter(
        (task) => task.assigneeId?.value === assigneeId.value
      );
      
      const filteredTasks = assigneeTasks.filter(task => applyFilter(task, filter));
      return sortTasks(filteredTasks);
    },

    async completeTask(id: TaskId, input: CompleteTaskInput): Promise<Task> {
      const existingTask = tasks.get(id.value);
      if (!existingTask) {
        throw new Error(`Task with id ${id.value} not found`);
      }

      const now = new Date().toISOString();
      const completion = {
        completedAt: now,
        completedBy: input.completedBy,
        notes: input.notes,
      };

      const updatedTask: Task = {
        ...existingTask,
        status: "completed",
        completedAt: now,
        completion,
        actualHours: input.actualHours,
        updatedAt: now,
      };

      tasks.set(id.value, updatedTask);
      return updatedTask;
    },

    async verifyTask(id: TaskId, input: VerifyTaskInput): Promise<Task> {
      const existingTask = tasks.get(id.value);
      if (!existingTask) {
        throw new Error(`Task with id ${id.value} not found`);
      }

      if (!existingTask.completion) {
        throw new Error(`Task ${id.value} must be completed before it can be verified`);
      }

      const now = new Date().toISOString();
      const updatedCompletion = {
        ...existingTask.completion,
        verifiedAt: now,
        verifiedBy: input.verifiedBy,
        notes: input.notes,
      };

      const updatedTask: Task = {
        ...existingTask,
        completion: updatedCompletion,
        updatedAt: now,
      };

      tasks.set(id.value, updatedTask);
      return updatedTask;
    },

    async getTasksByTimePeriod(
      workspaceId: WorkspaceId, 
      period: TimePeriod, 
      startDate?: string, 
      endDate?: string
    ): Promise<Task[]> {
      const filter: TaskFilter = {
        timePeriod: [period],
      };

      if (startDate) {
        filter.createdAfter = startDate;
      }
      if (endDate) {
        filter.createdBefore = endDate;
      }

      return this.listByWorkspace(workspaceId, filter);
    },

    async getAccountabilityStats(workspaceId: WorkspaceId, userId?: UserId): Promise<{
      totalTasks: number;
      completedTasks: number;
      verifiedTasks: number;
      overdueTasks: number;
      completionRate: number;
      verificationRate: number;
      averageCompletionTime: number;
    }> {
      const allTasks = await this.listByWorkspace(workspaceId);
      const userTasks = userId 
        ? allTasks.filter(task => task.assigneeId?.value === userId.value)
        : allTasks;

      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(task => task.status === "completed").length;
      const verifiedTasks = userTasks.filter(task => task.completion?.verifiedAt).length;
      
      const now = new Date();
      const overdueTasks = userTasks.filter(task => 
        task.dueAt && 
        new Date(task.dueAt) < now && 
        task.status !== "completed"
      ).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const verificationRate = completedTasks > 0 ? (verifiedTasks / completedTasks) * 100 : 0;

      // Calculate average completion time (in hours)
      const completedTasksWithTime = userTasks.filter(
        task => task.status === "completed" && task.completedAt
      );
      const averageCompletionTime = completedTasksWithTime.length > 0
        ? completedTasksWithTime.reduce((total, task) => {
            const completionTime = new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime();
            return total + completionTime;
          }, 0) / completedTasksWithTime.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      return {
        totalTasks,
        completedTasks,
        verifiedTasks,
        overdueTasks,
        completionRate,
        verificationRate,
        averageCompletionTime,
      };
    },
  };
}
