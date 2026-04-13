export interface ResumeState {
  sessionId: string;
  fileId: string;
  bytesReceived: number;
  lastChunkIndex: number;
  totalChunks: number;
}

export class ResumeTracker {
  private states = new Map<string, ResumeState>();

  private key(sessionId: string, fileId: string): string {
    return `${sessionId}:${fileId}`;
  }

  update(sessionId: string, fileId: string, chunkIndex: number, bytesReceived: number, totalChunks: number): void {
    this.states.set(this.key(sessionId, fileId), {
      sessionId,
      fileId,
      bytesReceived,
      lastChunkIndex: chunkIndex,
      totalChunks,
    });
  }

  get(sessionId: string, fileId: string): ResumeState | undefined {
    return this.states.get(this.key(sessionId, fileId));
  }

  getResumeIndex(sessionId: string, fileId: string): number {
    const state = this.get(sessionId, fileId);
    return state ? state.lastChunkIndex + 1 : 0;
  }

  isComplete(sessionId: string, fileId: string): boolean {
    const state = this.get(sessionId, fileId);
    return state ? state.lastChunkIndex + 1 >= state.totalChunks : false;
  }

  remove(sessionId: string, fileId: string): void {
    this.states.delete(this.key(sessionId, fileId));
  }

  clear(): void {
    this.states.clear();
  }
}
