import { injectable, inject } from 'tsyringe';
import { getConnectionManager } from '@zercle/db/connection-manager';
import { IConfigService } from '../config/config.interface';
import { ConfigToken } from '@zercle/shared/container/tokens';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
      details?: any;
    };
  };
  timestamp: string;
  uptime: number;
  version?: string;
}

export interface IHealthCheckService {
  performHealthCheck(): Promise<HealthCheckResult>;
  checkDatabase(): Promise<{ status: 'up' | 'down'; responseTime?: number; error?: string; details?: any }>;
  checkCache(): Promise<{ status: 'up' | 'down'; responseTime?: number; error?: string; details?: any }>;
  checkMemory(): Promise<{ status: 'up' | 'down'; details: any }>;
  checkDisk(): Promise<{ status: 'up' | 'down'; details: any }>;
}

@injectable()
export class HealthCheckService implements IHealthCheckService {
  private readonly startTime = Date.now();

  constructor(
    @inject(ConfigToken) private readonly configService: IConfigService
  ) {}

  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {};

    // Run all health checks in parallel
    const [databaseCheck, cacheCheck, memoryCheck, diskCheck] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    // Process database check
    if (databaseCheck.status === 'fulfilled') {
      checks.database = databaseCheck.value;
    } else {
      checks.database = { status: 'down', error: databaseCheck.reason?.message || 'Unknown error' };
    }

    // Process cache check
    if (cacheCheck.status === 'fulfilled') {
      checks.cache = cacheCheck.value;
    } else {
      checks.cache = { status: 'down', error: cacheCheck.reason?.message || 'Unknown error' };
    }

    // Process memory check
    if (memoryCheck.status === 'fulfilled') {
      checks.memory = memoryCheck.value;
    } else {
      checks.memory = { status: 'down', error: memoryCheck.reason?.message || 'Unknown error' };
    }

    // Process disk check
    if (diskCheck.status === 'fulfilled') {
      checks.disk = diskCheck.value;
    } else {
      checks.disk = { status: 'down', error: diskCheck.reason?.message || 'Unknown error' };
    }

    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'down');
    const criticalServices = ['database'];
    const hasCriticalFailures = Object.entries(checks)
      .some(([service, check]) => criticalServices.includes(service) && check.status === 'down');

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (hasCriticalFailures) {
      overallStatus = 'unhealthy';
    } else if (failedChecks.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env['npm_package_version'] || '1.0.0',
    };
  }

  async checkDatabase(): Promise<{ status: 'up' | 'down'; responseTime?: number; error?: string; details?: any }> {
    try {
      const connectionManager = getConnectionManager();
      
      if (!connectionManager) {
        return {
          status: 'down',
          error: 'Database connection manager not initialized',
        };
      }

      const healthResult = await connectionManager.healthCheck();
      const connectionStats = await connectionManager.getConnectionStats();

      if (healthResult.status === 'healthy') {
        return {
          status: 'up',
          responseTime: healthResult.latency,
          details: {
            ...connectionStats,
            latency: healthResult.latency,
          },
        };
      } else {
        return {
          status: 'down',
          responseTime: healthResult.latency,
          error: healthResult.error,
        };
      }
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  async checkCache(): Promise<{ status: 'up' | 'down'; responseTime?: number; error?: string; details?: any }> {
    try {
      // For now, return a placeholder since we haven't implemented Redis/Valkey client yet
      // This would be implemented when we add Redis/Valkey integration
      return {
        status: 'up',
        responseTime: 0,
        details: {
          type: 'valkey',
          status: 'not_implemented',
        },
      };
    } catch (error) {
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown cache error',
      };
    }
  }

  async checkMemory(): Promise<{ status: 'up' | 'down'; details: any }> {
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
      const usedMemory = memoryUsage.heapUsed;
      const memoryUtilization = (usedMemory / totalMemory) * 100;

      // Consider memory unhealthy if utilization is above 90%
      const status = memoryUtilization > 90 ? 'down' : 'up';

      return {
        status,
        details: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          utilization: Math.round(memoryUtilization * 100) / 100,
          unit: 'MB',
        },
      };
    } catch (error) {
      return {
        status: 'down',
        details: {
          error: error instanceof Error ? error.message : 'Unknown memory error',
        },
      };
    }
  }

  async checkDisk(): Promise<{ status: 'up' | 'down'; details: any }> {
    try {
      const { execSync } = await import('child_process');
      
      // Get disk usage for current directory (works on Unix-like systems)
      try {
        const dfOutput = execSync('df -h .', { encoding: 'utf8', timeout: 5000 });
        const lines = dfOutput.trim().split('\n');
        const dataLine = lines[1];
        const parts = dataLine?.split(/\s+/) || [];
        
        const used = parts[4];
        const utilization = used ? parseFloat(used.replace('%', '')) : 0;
        
        // Consider disk unhealthy if utilization is above 90%
        const status = utilization > 90 ? 'down' : 'up';

        return {
          status,
          details: {
            filesystem: parts[0] || 'unknown',
            size: parts[1] || 'unknown',
            used: parts[2] || 'unknown',
            available: parts[3] || 'unknown',
            utilization: utilization,
            mountpoint: parts[5] || 'unknown',
          },
        };
      } catch {
        // Fallback for systems where df command is not available
        return {
          status: 'up',
          details: {
            status: 'unavailable',
            reason: 'disk_check_not_supported',
          },
        };
      }
    } catch (error) {
      return {
        status: 'down',
        details: {
          error: error instanceof Error ? error.message : 'Unknown disk error',
        },
      };
    }
  }
}