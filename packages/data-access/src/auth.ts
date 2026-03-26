import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type {
  User,
  UserId,
  Email,
  PasswordHash,
  UserRole,
  CreateUserInput,
  UpdateUserInput,
  AuthenticateInput,
  AuthenticationResult,
  Session,
  UserRepository,
  AuthenticationRepository,
} from "@pandi/core-domain";

// In-memory storage for demo purposes
const users: Map<string, User> = new Map();
const sessions: Map<string, Session> = new Map();
const emailToIdMap: Map<string, string> = new Map();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Helper functions
const generateId = (): string => Math.random().toString(36).substring(2) + Date.now().toString(36);
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// In-memory UserRepository implementation
export class InMemoryUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const existingUser = await this.findByEmail(input.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const id: UserId = { value: generateId() };
    const hashedPassword = await hashPassword(input.password);
    
    const user: User = {
      id,
      email: input.email,
      name: input.name,
      role: input.role || "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      preferences: {
        theme: "system",
        language: "en",
        timezone: "UTC",
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          taskAssignments: true,
          teamUpdates: true,
        },
      },
    };

    // Store user (in real implementation, store password hash separately)
    users.set(id.value, { ...user, passwordHash: hashedPassword } as any);
    emailToIdMap.set(input.email.value, id.value);

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async findById(id: UserId): Promise<User | null> {
    const user = users.get(id.value);
    if (!user) return null;
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userId = emailToIdMap.get(email.value);
    if (!userId) return null;
    
    return this.findById({ value: userId });
  }

  async update(id: UserId, input: UpdateUserInput): Promise<User> {
    const existingUser = users.get(id.value);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...existingUser,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    users.set(id.value, updatedUser);
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = updatedUser as any;
    return userWithoutPassword;
  }

  async delete(id: UserId): Promise<void> {
    const user = users.get(id.value);
    if (!user) return;

    users.delete(id.value);
    emailToIdMap.delete(user.email.value);
  }

  async list(): Promise<User[]> {
    const allUsers = Array.from(users.values());
    // Return users without password hashes
    return allUsers.map(user => {
      const { passwordHash, ...userWithoutPassword } = user as any;
      return userWithoutPassword;
    });
  }

  // Internal method to get user with password hash for authentication
  async findByIdWithPassword(id: UserId): Promise<(User & { passwordHash: string }) | null> {
    return users.get(id.value) || null;
  }

  async findByEmailWithPassword(email: Email): Promise<(User & { passwordHash: string }) | null> {
    const userId = emailToIdMap.get(email.value);
    if (!userId) return null;
    
    return users.get(userId) || null;
  }
}

// In-memory AuthenticationRepository implementation
export class InMemoryAuthenticationRepository implements AuthenticationRepository {
  constructor(private userRepository: InMemoryUserRepository) {}

  async authenticate(input: AuthenticateInput): Promise<AuthenticationResult> {
    const userWithPassword = await this.userRepository.findByEmailWithPassword(input.email);
    if (!userWithPassword) {
      throw new Error("Invalid credentials");
    }

    if (!userWithPassword.isActive) {
      throw new Error("User account is inactive");
    }

    const isValidPassword = await verifyPassword(input.password, userWithPassword.passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(userWithPassword.id.value);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Create session
    const session: Session = {
      id: generateId(),
      userId: userWithPassword.id,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    sessions.set(session.id, session);

    // Update last login
    await this.userRepository.update(userWithPassword.id, {
      lastLoginAt: new Date().toISOString(),
    });

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = userWithPassword;
    
    return {
      user: userWithoutPassword,
      token,
      expiresAt,
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await this.userRepository.findById({ value: decoded.userId });
      
      if (!user || !user.isActive) {
        return null;
      }

      // Check if session exists and is active
      const activeSession = Array.from(sessions.values()).find(
        session => session.token === token && session.isActive && new Date(session.expiresAt) > new Date()
      );

      if (!activeSession) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  async createSession(userId: UserId): Promise<Session> {
    const token = generateToken(userId.value);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const session: Session = {
      id: generateId(),
      userId,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    sessions.set(session.id, session);
    return session;
  }

  async invalidateSession(sessionId: string): Promise<void> {
    const session = sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      sessions.set(sessionId, session);
    }
  }

  async invalidateAllUserSessions(userId: UserId): Promise<void> {
    for (const [sessionId, session] of sessions) {
      if (session.userId.value === userId.value) {
        session.isActive = false;
        sessions.set(sessionId, session);
      }
    }
  }

  async findActiveSession(userId: UserId): Promise<Session | null> {
    for (const session of sessions.values()) {
      if (
        session.userId.value === userId.value &&
        session.isActive &&
        new Date(session.expiresAt) > new Date()
      ) {
        return session;
      }
    }
    return null;
  }
}

// Factory functions
export const createInMemoryUserRepository = (): InMemoryUserRepository => {
  return new InMemoryUserRepository();
};

export const createInMemoryAuthenticationRepository = (): InMemoryAuthenticationRepository => {
  return new InMemoryAuthenticationRepository(createInMemoryUserRepository());
};

// Seed with demo user
export const seedAuthData = async () => {
  const userRepo = createInMemoryUserRepository();
  
  try {
    // Create demo admin user
    await userRepo.create({
      email: { value: "admin@pandicrm.com" },
      name: "Admin User",
      password: "admin123",
      role: "admin",
    });

    // Create demo regular user
    await userRepo.create({
      email: { value: "user@pandicrm.com" },
      name: "Regular User",
      password: "user123",
      role: "user",
    });
  } catch (error) {
    // Users might already exist, that's okay for seeding
    console.log("Auth seeding completed or users already exist");
  }
};
