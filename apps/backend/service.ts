import { Log, Trace } from "@rolldown-test/decorators/logger";
import { Cached } from "@rolldown-test/decorators/cache";
import { Entity, Required } from "@rolldown-test/decorators/metadata";

@Entity("UserService")
export class UserService {
  @Required
  apiKey!: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  @Log
  @Trace
  getUserById(id: number) {
    return { id, name: `User ${id}`, email: `user${id}@example.com` };
  }

  @Cached
  @Trace
  fetchUserData(userId: number) {
    return {
      userId,
      profile: { name: `User ${userId}`, age: 25 + userId },
      settings: { theme: "dark", notifications: true },
    };
  }

  @Log
  updateUser(id: number, data: any) {
    return { id, ...data, updatedAt: new Date().toISOString() };
  }
}
