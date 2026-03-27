"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { api, type Task } from "../../../../lib/api";

const WORKSPACE_ID = "ws-demo";

const priorityColors: Record<Task["priority"], string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const categoryColors: Record<Task["category"], string> = {
  sales: "bg-blue-50 text-blue-700",
  marketing: "bg-purple-50 text-purple-700",
  development: "bg-indigo-50 text-indigo-700",
  operations: "bg-gray-50 text-gray-700",
  customer_service: "bg-cyan-50 text-cyan-700",
  admin: "bg-amber-50 text-amber-700",
  personal: "bg-pink-50 text-pink-700",
  other: "bg-slate-50 text-slate-700",
};

const columns: Array<{ id: Task["status"]; title: string; color: string }> = [
  { id: "pending", title: "To Do", color: "bg-gray-100" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100" },
  { id: "completed", title: "Completed", color: "bg-green-100" },
  { id: "archived", title: "Archived", color: "bg-gray-50" },
];

export default function TaskKanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.getTasks(WORKSPACE_ID);
      if (response.error) {
        setError(response.error);
      } else if (response.tasks) {
        setTasks(response.tasks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const response = await api.updateTask(taskId, {
        status: newStatus,
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        // Update local state
        setTasks(prev => prev.map(task => 
          task.id.value === taskId 
            ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
            : task
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await api.completeTask(taskId, {
        completedBy: { value: "current-user" },
        actualHours: 1, // This would be user input in a real implementation
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        fetchTasks(); // Refresh tasks to get completion data
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete task");
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Don't allow dropping in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Update task status
    const taskId = result.draggableId;
    const newStatus = destination.droppableId;
    
    updateTaskStatus(taskId, newStatus);
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const categoryMatch = selectedCategory === "all" || task.category === selectedCategory;
      const priorityMatch = selectedPriority === "all" || task.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  };

  const getTasksByStatus = (status: string) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Kanban Board</h1>
            <p className="mt-2 text-base text-base-600">
              Drag and drop tasks to update their status.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading kanban board...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Kanban Board</h1>
            <p className="mt-2 text-base text-base-600">
              Drag and drop tasks to update their status.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Kanban Board</h1>
          <p className="mt-2 text-base text-base-600">
            Drag and drop tasks to update their status.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-border/60 bg-white/50 px-4 py-2 text-sm font-medium text-base-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="development">Development</option>
            <option value="operations">Operations</option>
            <option value="customer_service">Customer Service</option>
            <option value="admin">Admin</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-border/60 bg-white/50 px-4 py-2 text-sm font-medium text-base-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div key={column.id} className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
                {column.title}
              </p>
              <p className="mt-2 text-3xl font-semibold text-base-900">{columnTasks.length}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6 lg:grid-cols-4">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-t-xl p-4`}>
                  <h3 className="font-semibold text-base-900">{column.title}</h3>
                  <p className="text-sm text-base-600">{columnTasks.length} tasks</p>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-b-xl border border-border/60 bg-white/50 p-4 min-h-[400px] ${
                        snapshot.isDraggingOver ? "bg-primary/10" : ""
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id.value} draggableId={task.id.value} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-3 rounded-lg border border-border/40 bg-white p-4 shadow-sm transition-shadow ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-primary/50" : "hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-base-900 text-sm">{task.title}</h4>
                                <div className="flex items-center gap-1">
                                  <span className={`rounded px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                              
                              {task.description && (
                                <p className="text-xs text-base-600 mb-2 line-clamp-2">{task.description}</p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className={`rounded px-2 py-1 text-xs font-medium ${categoryColors[task.category]}`}>
                                  {task.category.replace("_", " ")}
                                </span>
                                
                                <div className="flex items-center gap-2 text-xs text-base-600">
                                  {task.dueAt && (
                                    <span>Due: {new Date(task.dueAt).toLocaleDateString()}</span>
                                  )}
                                  {task.estimatedHours && (
                                    <span>{task.estimatedHours}h</span>
                                  )}
                                </div>
                              </div>
                              
                              {task.tags && task.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {task.tags.map(tag => (
                                    <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {task.status !== "completed" && (
                                <div className="mt-3 pt-3 border-t border-border/20">
                                  <button
                                    onClick={() => completeTask(task.id.value)}
                                    className="w-full rounded bg-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-primary/90"
                                  >
                                    Mark Complete
                                  </button>
                                </div>
                              )}
                              
                              {task.status === "completed" && task.completion && (
                                <div className="mt-3 pt-3 border-t border-border/20">
                                  <div className="text-xs text-green-600">
                                    <div>Completed by {task.completion.completedBy.value}</div>
                                    <div>{new Date(task.completion.completedAt).toLocaleDateString()}</div>
                                    {task.completion.notes && (
                                      <div className="mt-1 text-gray-600">"{task.completion.notes}"</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Summary */}
      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
        <h3 className="font-display text-lg text-base-900 mb-4">Task Summary</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-base-900">{filteredTasks.length}</div>
            <div className="text-sm text-base-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredTasks.filter(t => t.priority === "urgent").length}
            </div>
            <div className="text-sm text-base-600">Urgent Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTasks.filter(t => t.status === "in_progress").length}
            </div>
            <div className="text-sm text-base-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredTasks.filter(t => t.status === "completed").length}
            </div>
            <div className="text-sm text-base-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
