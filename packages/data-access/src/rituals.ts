import type {
  Ritual,
  RitualId,
  RitualName,
  RitualCategory,
  RitualFrequency,
  RitualCompletion,
  CompletionQuality,
  MoodRating,
  EnergyRating,
  CreateRitualInput,
  UpdateRitualInput,
  CompleteRitualInput,
  RitualFilter,
  RitualStats,
  CategoryStats,
  WeeklyProgress,
  MonthlyProgress,
  RitualRepository,
  UserId,
  WorkspaceId,
} from "@pandi/core-domain";

// In-memory storage for demo purposes
const rituals: Map<string, Ritual> = new Map();
const completions: Map<string, RitualCompletion[]> = new Map();
const userToRitualsMap: Map<string, string[]> = new Map();
const workspaceToRitualsMap: Map<string, string[]> = new Map();

// Helper functions
const generateId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Streak calculation helper
const calculateStreak = (userId: UserId): number => {
  const userCompletions = Array.from(completions.values())
    .flat()
    .filter(completion => completion.userId.value === userId.value)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (userCompletions.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < userCompletions.length; i++) {
    const completionDate = new Date(userCompletions[i].completedAt);
    completionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDiff === i) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// In-memory RitualRepository implementation
export class InMemoryRitualRepository implements RitualRepository {
  async create(input: CreateRitualInput): Promise<Ritual> {
    const id: RitualId = { value: generateId() };
    
    const ritual: Ritual = {
      id,
      userId: input.userId,
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      category: input.category,
      frequency: input.frequency,
      targetTime: input.targetTime,
      duration: input.duration,
      isActive: true,
      color: input.color || "#3B82F6",
      icon: input.icon || this.getDefaultIcon(input.category),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store ritual
    rituals.set(id.value, ritual);

    // Update user mapping
    const userRituals = userToRitualsMap.get(input.userId.value) || [];
    userRituals.push(id.value);
    userToRitualsMap.set(input.userId.value, userRituals);

    // Update workspace mapping
    const workspaceRituals = workspaceToRitualsMap.get(input.workspaceId.value) || [];
    workspaceRituals.push(id.value);
    workspaceToRitualsMap.set(input.workspaceId.value, workspaceRituals);

    // Initialize completions array for this ritual
    completions.set(id.value, []);

    return ritual;
  }

  async update(id: RitualId, input: UpdateRitualInput): Promise<Ritual> {
    const existingRitual = rituals.get(id.value);
    if (!existingRitual) {
      throw new Error("Ritual not found");
    }

    const updatedRitual: Ritual = {
      ...existingRitual,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    rituals.set(id.value, updatedRitual);
    return updatedRitual;
  }

  async delete(id: RitualId): Promise<void> {
    const ritual = rituals.get(id.value);
    if (!ritual) return;

    // Remove from main storage
    rituals.delete(id.value);

    // Remove from user mapping
    const userRituals = userToRitualsMap.get(ritual.userId.value) || [];
    const filteredUserRituals = userRituals.filter(ritualId => ritualId !== id.value);
    userToRitualsMap.set(ritual.userId.value, filteredUserRituals);

    // Remove from workspace mapping
    const workspaceRituals = workspaceToRitualsMap.get(ritual.workspaceId.value) || [];
    const filteredWorkspaceRituals = workspaceRituals.filter(ritualId => ritualId !== id.value);
    workspaceToRitualsMap.set(ritual.workspaceId.value, filteredWorkspaceRituals);

    // Remove completions
    completions.delete(id.value);
  }

  async findById(id: RitualId): Promise<Ritual | null> {
    return rituals.get(id.value) || null;
  }

  async list(filter: RitualFilter): Promise<Ritual[]> {
    let allRituals = Array.from(rituals.values());

    // Apply filters
    if (filter.userId) {
      allRituals = allRituals.filter(ritual => ritual.userId.value === filter.userId!.value);
    }

    if (filter.workspaceId) {
      allRituals = allRituals.filter(ritual => ritual.workspaceId.value === filter.workspaceId!.value);
    }

    if (filter.category) {
      allRituals = allRituals.filter(ritual => ritual.category === filter.category);
    }

    if (filter.frequency) {
      allRituals = allRituals.filter(ritual => ritual.frequency === filter.frequency);
    }

    if (filter.isActive !== undefined) {
      allRituals = allRituals.filter(ritual => ritual.isActive === filter.isActive);
    }

    // Sort by creation date (newest first)
    return allRituals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async listByUser(userId: UserId, filter?: RitualFilter): Promise<Ritual[]> {
    const userFilter = { ...filter, userId };
    return this.list(userFilter);
  }

  async listByWorkspace(workspaceId: WorkspaceId, filter?: RitualFilter): Promise<Ritual[]> {
    const workspaceFilter = { ...filter, workspaceId };
    return this.list(workspaceFilter);
  }

  async completeRitual(input: CompleteRitualInput): Promise<RitualCompletion> {
    const ritual = await this.findById(input.ritualId);
    if (!ritual) {
      throw new Error("Ritual not found");
    }

    if (!ritual.isActive) {
      throw new Error("Ritual is not active");
    }

    const completion: RitualCompletion = {
      id: generateId(),
      ritualId: input.ritualId,
      userId: ritual.userId,
      completedAt: new Date().toISOString(),
      duration: input.duration,
      quality: input.quality,
      notes: input.notes,
      mood: input.mood,
      energy: input.energy,
    };

    // Store completion
    const ritualCompletions = completions.get(input.ritualId.value) || [];
    ritualCompletions.push(completion);
    completions.set(input.ritualId.value, ritualCompletions);

    return completion;
  }

  async getCompletions(ritualId: RitualId, dateFrom?: string, dateTo?: string): Promise<RitualCompletion[]> {
    const ritualCompletions = completions.get(ritualId.value) || [];
    
    let filteredCompletions = ritualCompletions;

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredCompletions = filteredCompletions.filter(
        completion => new Date(completion.completedAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredCompletions = filteredCompletions.filter(
        completion => new Date(completion.completedAt) <= toDate
      );
    }

    return filteredCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async getUserCompletions(userId: UserId, dateFrom?: string, dateTo?: string): Promise<RitualCompletion[]> {
    const allCompletions = Array.from(completions.values())
      .flat()
      .filter(completion => completion.userId.value === userId.value);

    let filteredCompletions = allCompletions;

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredCompletions = filteredCompletions.filter(
        completion => new Date(completion.completedAt) >= fromDate
      );
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      filteredCompletions = filteredCompletions.filter(
        completion => new Date(completion.completedAt) <= toDate
      );
    }

    return filteredCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  async getStats(userId: UserId, workspaceId: WorkspaceId, dateFrom?: string, dateTo?: string): Promise<RitualStats> {
    const userRituals = await this.listByUser(userId);
    const userCompletions = await this.getUserCompletions(userId, dateFrom, dateTo);

    const activeRituals = userRituals.filter(ritual => ritual.isActive);
    const currentStreak = calculateStreak(userId);

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedCompletions = userCompletions.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    
    for (let i = 0; i < sortedCompletions.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedCompletions[i - 1].completedAt);
        const currDate = new Date(sortedCompletions[i].completedAt);
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate completion rate
    const totalPossibleCompletions = activeRituals.length * this.getDaysInRange(dateFrom, dateTo);
    const completionRate = totalPossibleCompletions > 0 ? (userCompletions.length / totalPossibleCompletions) * 100 : 0;

    // Calculate average quality
    const qualityValues = { excellent: 4, good: 3, fair: 2, poor: 1 };
    const averageQuality = userCompletions.length > 0
      ? userCompletions.reduce((sum, completion) => sum + qualityValues[completion.quality], 0) / userCompletions.length
      : 0;

    // Calculate total duration
    const totalDuration = userCompletions.reduce((sum, completion) => sum + completion.duration, 0);

    // Category stats
    const categoryStats: CategoryStats[] = [];
    const categories: RitualCategory[] = ["health", "mindfulness", "productivity", "business", "learning", "social", "creativity", "personal"];
    
    for (const category of categories) {
      const categoryRituals = activeRituals.filter(ritual => ritual.category === category);
      const categoryCompletions = userCompletions.filter(completion => 
        categoryRituals.some(ritual => ritual.id.value === completion.ritualId.value)
      );

      if (categoryRituals.length > 0) {
        categoryStats.push({
          category,
          completions: categoryCompletions.length,
          streak: this.calculateCategoryStreak(userId, category),
          averageQuality: categoryCompletions.length > 0
            ? categoryCompletions.reduce((sum, completion) => sum + qualityValues[completion.quality], 0) / categoryCompletions.length
            : 0,
          totalDuration: categoryCompletions.reduce((sum, completion) => sum + completion.duration, 0),
        });
      }
    }

    // Weekly progress (last 8 weeks)
    const weeklyProgress: WeeklyProgress[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekCompletions = userCompletions.filter(completion => {
        const completionDate = new Date(completion.completedAt);
        return completionDate >= weekStart && completionDate <= weekEnd;
      });

      weeklyProgress.push({
        week: weekStart.toISOString().split('T')[0],
        completions: weekCompletions.length,
        targetCompletions: activeRituals.length * 7,
        rate: activeRituals.length > 0 ? (weekCompletions.length / (activeRituals.length * 7)) * 100 : 0,
      });
    }

    // Monthly progress (last 6 months)
    const monthlyProgress: MonthlyProgress[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthCompletions = userCompletions.filter(completion => {
        const completionDate = new Date(completion.completedAt);
        return completionDate >= monthStart && completionDate <= monthEnd;
      });

      const daysInMonth = monthEnd.getDate();
      monthlyProgress.push({
        month: monthStart.toISOString().slice(0, 7),
        completions: monthCompletions.length,
        targetCompletions: activeRituals.length * daysInMonth,
        rate: activeRituals.length > 0 ? (monthCompletions.length / (activeRituals.length * daysInMonth)) * 100 : 0,
      });
    }

    return {
      totalRituals: userRituals.length,
      activeRituals: activeRituals.length,
      totalCompletions: userCompletions.length,
      currentStreak,
      longestStreak,
      completionRate,
      averageQuality,
      totalDuration,
      categoryStats,
      weeklyProgress,
      monthlyProgress,
    };
  }

  async getCurrentStreak(userId: UserId): Promise<number> {
    return calculateStreak(userId);
  }

  async getLongestStreak(userId: UserId): Promise<number> {
    const stats = await this.getStats(userId, { value: "default-workspace" });
    return stats.longestStreak;
  }

  private getDefaultIcon(category: RitualCategory): string {
    const icons = {
      health: "💪",
      mindfulness: "🧘",
      productivity: "⚡",
      business: "💼",
      learning: "📚",
      social: "👥",
      creativity: "🎨",
      personal: "⭐",
    };
    return icons[category] || "📌";
  }

  private getDaysInRange(dateFrom?: string, dateTo?: string): number {
    if (!dateFrom) return 30; // Default to 30 days
    
    const from = new Date(dateFrom);
    const to = dateTo ? new Date(dateTo) : new Date();
    
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  private calculateCategoryStreak(userId: UserId, category: RitualCategory): number {
    const categoryCompletions = Array.from(completions.values())
      .flat()
      .filter(completion => completion.userId.value === userId.value)
      .filter(completion => {
        const ritual = rituals.get(completion.ritualId.value);
        return ritual && ritual.category === category;
      })
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    if (categoryCompletions.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < categoryCompletions.length; i++) {
      const completionDate = new Date(categoryCompletions[i].completedAt);
      completionDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

// Factory function
export const createInMemoryRitualRepository = (): InMemoryRitualRepository => {
  return new InMemoryRitualRepository();
};

// Seed with demo rituals
export const seedRitualsData = async (userId: UserId, workspaceId: WorkspaceId) => {
  const ritualRepo = createInMemoryRitualRepository();
  
  try {
    // Create demo rituals
    const morningMeditation = await ritualRepo.create({
      userId,
      workspaceId,
      name: { value: "Morning Meditation" },
      description: "Start the day with 15 minutes of mindfulness meditation",
      category: "mindfulness",
      frequency: "daily",
      targetTime: "06:30",
      duration: 15,
      color: "#8B5CF6",
      icon: "🧘",
    });

    const salesReview = await ritualRepo.create({
      userId,
      workspaceId,
      name: { value: "Sales Pipeline Review" },
      description: "Review and update sales pipeline and follow up with leads",
      category: "business",
      frequency: "daily",
      targetTime: "09:00",
      duration: 30,
      color: "#3B82F6",
      icon: "💼",
    });

    const exercise = await ritualRepo.create({
      userId,
      workspaceId,
      name: { value: "Evening Exercise" },
      description: "30 minutes of physical exercise to stay healthy",
      category: "health",
      frequency: "daily",
      targetTime: "18:00",
      duration: 30,
      color: "#10B981",
      icon: "💪",
    });

    const reading = await ritualRepo.create({
      userId,
      workspaceId,
      name: { value: "Daily Reading" },
      description: "Read for 20 minutes to learn and grow",
      category: "learning",
      frequency: "daily",
      targetTime: "20:00",
      duration: 20,
      color: "#F59E0B",
      icon: "📚",
    });

    // Add some completions
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await ritualRepo.completeRitual({
      ritualId: morningMeditation.id,
      duration: 15,
      quality: "good",
      mood: 4,
      energy: 3,
    });

    await ritualRepo.completeRitual({
      ritualId: salesReview.id,
      duration: 25,
      quality: "excellent",
      mood: 4,
      energy: 4,
    });

    await ritualRepo.completeRitual({
      ritualId: exercise.id,
      duration: 30,
      quality: "good",
      mood: 5,
      energy: 4,
    });

    // Add yesterday's completions
    await ritualRepo.completeRitual({
      ritualId: morningMeditation.id,
      duration: 12,
      quality: "fair",
      mood: 3,
      energy: 2,
    });

    await ritualRepo.completeRitual({
      ritualId: salesReview.id,
      duration: 30,
      quality: "good",
      mood: 4,
      energy: 3,
    });

    await ritualRepo.completeRitual({
      ritualId: exercise.id,
      duration: 35,
      quality: "excellent",
      mood: 5,
      energy: 5,
    });

    await ritualRepo.completeRitual({
      ritualId: reading.id,
      duration: 20,
      quality: "good",
      mood: 4,
      energy: 3,
    });
  } catch (error) {
    console.log("Rituals seeding completed or rituals already exist");
  }
};
