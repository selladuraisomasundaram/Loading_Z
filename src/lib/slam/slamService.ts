import { Pose } from './coordinateAdapter';

export type SlamStatus = 'connecting' | 'active' | 'lost' | 'waiting';

type PoseCallback = (pose: Pose) => void;
type StatusCallback = (status: SlamStatus) => void;

class SlamService {
  private ws: WebSocket | null = null;
  private poseCallbacks: Set<PoseCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private status: SlamStatus = 'waiting';
  private reconnectTimer: NodeJS.Timeout | null = null;

  // Smoothing filters
  private lastPose: Pose | null = null;
  private readonly ALPHA = 0.3; // Low-pass filter coefficient for position
  private readonly THETA_ALPHA = 0.1; // More smoothing for rotation

  public connect(wsUrl: string = 'ws://localhost:8000/api/v1/slam/ws/ui') {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.updateStatus('connecting');
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.updateStatus('active');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'pose') {
          this.handlePoseData(message.data);
        } else if (message.type === 'status') {
          this.updateStatus(message.data as SlamStatus);
        }
      } catch (err) {
        console.error('SLAM WebSocket message error:', err);
      }
    };

    this.ws.onclose = () => {
      this.updateStatus('lost');
      this.scheduleReconnect(wsUrl);
    };

    this.ws.onerror = () => {
      this.updateStatus('lost');
    };
  }

  public disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateStatus('waiting');
  }

  public onPoseUpdate(callback: PoseCallback) {
    this.poseCallbacks.add(callback);
    return () => this.poseCallbacks.delete(callback);
  }

  public onStatusUpdate(callback: StatusCallback) {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  private updateStatus(newStatus: SlamStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusCallbacks.forEach(cb => cb(newStatus));
    }
  }

  private handlePoseData(rawPose: Pose) {
    // Apply basic smoothing / low-pass filter to reduce jitter
    if (!this.lastPose) {
      this.lastPose = rawPose;
    } else {
      this.lastPose = {
        x: this.lastPose.x + this.ALPHA * (rawPose.x - this.lastPose.x),
        y: this.lastPose.y + this.ALPHA * (rawPose.y - this.lastPose.y),
        // Handle theta wrap-around for smoothing
        theta: this.smoothAngle(this.lastPose.theta, rawPose.theta, this.THETA_ALPHA),
        timestamp: rawPose.timestamp
      };
    }

    this.poseCallbacks.forEach(cb => cb(this.lastPose!));
  }

  private smoothAngle(current: number, target: number, alpha: number): number {
    let diff = target - current;
    // Normalize to -PI to PI
    while (diff < -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    return current + alpha * diff;
  }

  private scheduleReconnect(wsUrl: string) {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.connect(wsUrl);
      }, 5000);
    }
  }
}

export const slamService = new SlamService();
