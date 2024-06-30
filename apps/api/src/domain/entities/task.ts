import { Id } from "./value-objects/id";

export type TTask = {
  title: string;
  id?: string;
  createdAt?: string | null;
  completedAt?: string | null;
  client_id: string;
};

export class Task {
  readonly #id: Id;
  readonly #createdAt: Date;
  #title: string;
  #completedAt?: Date | null;
  #client_id: string;

  constructor({ title, id, createdAt, completedAt, client_id }: TTask) {
    this.#id = id ? new Id(id) : new Id();
    this.#title = title;
    this.#createdAt = createdAt ? new Date(createdAt) : new Date();
    this.#completedAt = completedAt ? new Date(completedAt) : null;
    this.#client_id = client_id;
  }

  get id(): Id {
    return this.#id;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get completedAt(): Date | undefined | null {
    return this.#completedAt;
  }

  get title(): string {
    return this.#title;
  }

  get client_id(): string {
    return this.#client_id;
  }
  
  set title(newTitle: string) {
    this.#title = newTitle;
  }

  toggleCompleted(): void {
    if (this.isCompleted()) {
      this.#completedAt = null;
    } else {
      this.#completedAt = new Date();
    }
  }

  isCompleted(): boolean {
    return !!this.#completedAt;
  }

  static isValidTitle(title: string): boolean {
    // valid when length is strictly greater than 3 and strictly less than 50
    // i.e. length in [4, 49]
    return !!title && title.length >= 4 && title.length <= 49;
  }
}
